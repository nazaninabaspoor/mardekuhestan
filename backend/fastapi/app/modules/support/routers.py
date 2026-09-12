"""Support chat REST + WebSocket routers."""

from __future__ import annotations

import json
import logging
from uuid import UUID

from fastapi import APIRouter, Depends, Header, Query, WebSocket, WebSocketDisconnect, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import SessionLocal, get_db_session
from app.core.security import AuthUser, decode_access_token, get_current_user
from app.modules.support import services
from app.modules.support.constants import (
    EVENT_ERROR,
    WS_ACTION_CLOSE,
    WS_ACTION_PING,
    WS_ACTION_SEND,
)
from app.modules.support.hub import support_hub
from app.modules.support.schemas import (
    BroadcastIn,
    ConversationOut,
    MessageOut,
    SendMessageIn,
    StaffReplyIn,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/support", tags=["support"])


@router.get("/conversation", response_model=ConversationOut)
async def get_conversation(
    user: AuthUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
):
    """تاریخچه چت فعال کاربر لاگین‌شده."""
    return await services.get_my_conversation(session, user)


@router.post("/messages", response_model=MessageOut)
async def post_message(
    payload: SendMessageIn,
    user: AuthUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
):
    """ارسال پیام مشتری (REST؛ همان کار WebSocket)."""
    return await services.customer_send(
        session,
        user,
        body=payload.body,
        client_message_id=payload.client_message_id,
    )


@router.post("/session/close")
async def close_session(
    user: AuthUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
):
    """با logout فرانت صدا زده می‌شود تا گفتگوی فعال بسته شود."""
    return await services.close_my_session(session, user)


@router.post("/staff/reply", response_model=MessageOut)
async def staff_reply(
    payload: StaffReplyIn,
    user: AuthUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
):
    """پاسخ ادمین از API (علاوه بر پنل Django)."""
    return await services.staff_reply(
        session,
        user,
        conversation_id=payload.conversation_id,
        body=payload.body,
        client_message_id=payload.client_message_id,
    )


@router.post("/internal/broadcast", status_code=status.HTTP_202_ACCEPTED)
async def internal_broadcast(
    payload: BroadcastIn,
    x_support_internal_token: str | None = Header(default=None),
):
    """Django admin بعد از ذخیره پاسخ ادمین این را صدا می‌زند."""
    settings = get_settings()
    expected = settings.SUPPORT_INTERNAL_TOKEN
    if expected and x_support_internal_token != expected:
        from fastapi import HTTPException

        raise HTTPException(status_code=403, detail="forbidden")
    await services.broadcast_external(payload.model_dump(mode="json"))
    return {"ok": True}


@router.websocket("/ws")
async def support_ws(
    websocket: WebSocket,
    token: str = Query(...),
    role: str = Query(default="customer"),
):
    """
    WebSocket زنده پشتیبانی.
    Query: token=<JWT access>&role=customer|staff
    """
    try:
        user = decode_access_token(token)
    except Exception:  # noqa: BLE001
        await websocket.close(code=4401)
        return

    session_maker = SessionLocal

    if role == "staff":
        async with session_maker() as session:
            try:
                user = await services.ensure_staff(session, user)
            except Exception:  # noqa: BLE001
                await websocket.close(code=4403)
                return
        await support_hub.connect_staff(websocket)
        user_id = None
    else:
        await support_hub.connect_customer(user.id, websocket)
        user_id = user.id
        async with session_maker() as session:
            conversation = await services.get_my_conversation(session, user)
            await websocket.send_text(
                json.dumps(
                    {
                        "type": "support.snapshot",
                        "conversation": conversation.model_dump(mode="json"),
                    },
                    default=str,
                )
            )

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                await websocket.send_text(
                    json.dumps({"type": EVENT_ERROR, "detail": "json نامعتبر"})
                )
                continue

            action = data.get("action")
            if action == WS_ACTION_PING:
                await websocket.send_text(json.dumps({"type": "support.pong"}))
                continue

            if role == "staff":
                if action == WS_ACTION_SEND:
                    async with session_maker() as session:
                        try:
                            conv_id = UUID(str(data["conversation_id"]))
                            msg = await services.staff_reply(
                                session,
                                user,
                                conversation_id=conv_id,
                                body=str(data.get("body") or ""),
                                client_message_id=data.get("client_message_id"),
                            )
                            await websocket.send_text(
                                json.dumps(
                                    {
                                        "type": "support.ack",
                                        "message": msg.model_dump(mode="json"),
                                    },
                                    default=str,
                                )
                            )
                        except Exception as exc:  # noqa: BLE001
                            await websocket.send_text(
                                json.dumps({"type": EVENT_ERROR, "detail": str(exc)})
                            )
                continue

            if action == WS_ACTION_SEND:
                async with session_maker() as session:
                    try:
                        msg = await services.customer_send(
                            session,
                            user,
                            body=str(data.get("body") or ""),
                            client_message_id=data.get("client_message_id"),
                        )
                        await websocket.send_text(
                            json.dumps(
                                {
                                    "type": "support.ack",
                                    "message": msg.model_dump(mode="json"),
                                },
                                default=str,
                            )
                        )
                    except Exception as exc:  # noqa: BLE001
                        await websocket.send_text(
                            json.dumps({"type": EVENT_ERROR, "detail": str(exc)})
                        )
            elif action == WS_ACTION_CLOSE:
                async with session_maker() as session:
                    await services.close_my_session(session, user)
                    await websocket.send_text(
                        json.dumps({"type": "support.closed", "ok": True})
                    )
    except WebSocketDisconnect:
        logger.info("support ws disconnected user=%s role=%s", user.id, role)
    finally:
        await support_hub.disconnect(websocket, user_id=user_id)
