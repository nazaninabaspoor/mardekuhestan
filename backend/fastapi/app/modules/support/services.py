"""Support chat domain services."""

from __future__ import annotations

import asyncio
import logging
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import SessionLocal
from app.core.security import AuthUser
from app.modules.support import repositories as repo
from app.modules.support.constants import (
    EVENT_MESSAGE,
    ROLE_CUSTOMER,
    ROLE_STAFF,
    STATUS_CLOSED,
    STATUS_OPEN,
)
from app.modules.support.exceptions import SupportError
from app.modules.support.hub import support_hub
from app.modules.support.models import SupportMessage
from app.modules.support.schemas import ConversationOut, MessageOut
from app.modules.support.whatsapp import notify_admin_whatsapp

logger = logging.getLogger(__name__)


def message_to_out(message) -> MessageOut:
    return MessageOut(
        id=message.id,
        conversation_id=message.conversation_id,
        sender_role=message.sender_role,
        sender_user_id=message.sender_user_id,
        body=message.body,
        client_message_id=message.client_message_id or None,
        created_at=message.created_at,
    )


def conversation_to_out(conversation) -> ConversationOut:
    messages = [message_to_out(item) for item in (conversation.messages or [])]
    return ConversationOut(
        id=conversation.id,
        status=conversation.status,
        customer_id=conversation.customer_id,
        last_message_at=conversation.last_message_at,
        messages=messages,
    )


async def ensure_staff(session: AsyncSession, user: AuthUser) -> AuthUser:
    if user.is_staff or user.is_superuser:
        return user
    row = await repo.get_user_flags(session, user.id)
    if row and row.is_active and (row.is_staff or row.is_superuser):
        return AuthUser(id=user.id, is_staff=True, is_superuser=bool(row.is_superuser))
    raise SupportError("فقط ادمین", code=403)


async def get_my_conversation(session: AsyncSession, user: AuthUser) -> ConversationOut:
    conversation = await repo.get_or_create_active_conversation(session, user.id)
    # reload with messages
    conversation = await repo.get_conversation(session, conversation.id) or conversation
    return conversation_to_out(conversation)


async def close_my_session(session: AsyncSession, user: AuthUser) -> dict:
    conversation = await repo.get_active_conversation(session, user.id)
    if conversation:
        await repo.close_conversation(session, conversation)
        await support_hub.publish(
            {
                "type": "support.conversation",
                "conversation_id": str(conversation.id),
                "customer_id": user.id,
                "status": STATUS_CLOSED,
            }
        )
    return {"ok": True, "status": STATUS_CLOSED}


async def customer_send(
    session: AsyncSession,
    user: AuthUser,
    *,
    body: str,
    client_message_id: str | None = None,
) -> MessageOut:
    text = body.strip()
    if not text:
        raise SupportError("متن پیام خالی است")
    conversation = await repo.get_or_create_active_conversation(session, user.id)
    message = await repo.add_message(
        session,
        conversation=conversation,
        sender_role=ROLE_CUSTOMER,
        sender_user_id=user.id,
        body=text,
        client_message_id=client_message_id or "",
        next_status=repo.waiting_status_for_customer(),
    )
    out = message_to_out(message)
    event = {
        "type": EVENT_MESSAGE,
        "conversation_id": str(conversation.id),
        "customer_id": user.id,
        "message": out.model_dump(mode="json"),
    }
    await support_hub.publish(event)
    asyncio.create_task(
        _whatsapp_after_customer_message(
            session_factory_message_id=message.id,
            customer_id=user.id,
            preview=text,
            conversation_id=str(conversation.id),
        )
    )
    return out


async def staff_reply(
    session: AsyncSession,
    staff: AuthUser,
    *,
    conversation_id: uuid.UUID,
    body: str,
    client_message_id: str | None = None,
) -> MessageOut:
    await ensure_staff(session, staff)
    text = body.strip()
    if not text:
        raise SupportError("متن پیام خالی است")
    conversation = await repo.get_conversation(session, conversation_id)
    if not conversation:
        raise SupportError("گفتگو پیدا نشد", code=404)
    if conversation.assigned_staff_id is None:
        conversation.assigned_staff_id = staff.id
    message = await repo.add_message(
        session,
        conversation=conversation,
        sender_role=ROLE_STAFF,
        sender_user_id=staff.id,
        body=text,
        client_message_id=client_message_id or "",
        next_status=STATUS_OPEN,
    )
    out = message_to_out(message)
    await support_hub.publish(
        {
            "type": EVENT_MESSAGE,
            "conversation_id": str(conversation.id),
            "customer_id": conversation.customer_id,
            "message": out.model_dump(mode="json"),
        }
    )
    return out


async def broadcast_external(event: dict) -> None:
    await support_hub.publish(event)


async def _whatsapp_after_customer_message(
    *,
    session_factory_message_id: uuid.UUID,
    customer_id: int,
    preview: str,
    conversation_id: str,
) -> None:
    try:
        ok = await notify_admin_whatsapp(
            customer_id=customer_id,
            preview=preview,
            conversation_id=conversation_id,
        )
        if not ok:
            return
        async with SessionLocal() as session:
            message = await session.get(SupportMessage, session_factory_message_id)
            if message:
                await repo.mark_whatsapp_notified(session, message)
    except Exception:  # noqa: BLE001
        logger.exception("whatsapp notify failed for conversation=%s", conversation_id)
