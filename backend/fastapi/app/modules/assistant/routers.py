"""REST + WebSocket راهیار تغذیه مرد کوهستان."""

from __future__ import annotations

import asyncio
import json
import logging
from typing import Any

import redis.asyncio as redis
from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect

from app.core.config import get_settings
from app.core.security import decode_access_token
from app.modules.assistant.services import django_quota, generate_coach_reply

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/assistant", tags=["assistant"])

# اگر همزمانی اتصال از این بیشتر شد، تولید جواب را به صف Celery می‌دهیم
_WS_LOAD_THRESHOLD = 8
_active_ws = 0
_active_lock = asyncio.Lock()


async def _redis_active_count() -> int:
    settings = get_settings()
    try:
        client = redis.from_url(settings.REDIS_URL, decode_responses=True)
        try:
            n = await client.incr("mk:assistant:ws_active")
            await client.expire("mk:assistant:ws_active", 120)
            return int(n)
        finally:
            await client.aclose()
    except Exception:  # noqa: BLE001
        return _active_ws


async def _redis_active_decr() -> None:
    settings = get_settings()
    try:
        client = redis.from_url(settings.REDIS_URL, decode_responses=True)
        try:
            await client.decr("mk:assistant:ws_active")
        finally:
            await client.aclose()
    except Exception:  # noqa: BLE001
        pass


async def _reply_with_optional_celery(message: str, history: list[dict[str, str]]) -> str:
    use_celery = False
    try:
        count = await _redis_active_count()
        use_celery = count >= _WS_LOAD_THRESHOLD
    except Exception:  # noqa: BLE001
        use_celery = _active_ws >= _WS_LOAD_THRESHOLD

    if use_celery:
        try:
            from app.modules.assistant.tasks import generate_reply_task

            async_result = generate_reply_task.delay(message, history)
            # صبر کوتاه؛ اگر worker نباشد، fallback مستقیم
            for _ in range(40):
                if async_result.ready():
                    return str(async_result.result or "")
                await asyncio.sleep(0.25)
        except Exception:  # noqa: BLE001
            logger.warning("Celery assistant fallback to direct OpenAI", exc_info=True)
    return await generate_coach_reply(message, history)


@router.get("/health")
async def assistant_health():
    return {"ok": True, "service": "rahyar-nutrition"}


@router.websocket("/ws")
async def assistant_ws(
    websocket: WebSocket,
    token: str = Query(...),
):
    """
    WebSocket راهیار.
    client → { "type": "ask", "text": "...", "history": [{"role","content"}] }
    server → { "type": "quota" | "typing" | "answer" | "paywall" | "error", ... }
    """
    global _active_ws
    try:
        user = decode_access_token(token)
    except Exception:  # noqa: BLE001
        await websocket.close(code=4401)
        return

    await websocket.accept()
    async with _active_lock:
        _active_ws += 1

    try:
        try:
            snap = await django_quota(user.id, action="snapshot")
            await websocket.send_json({"type": "quota", **snap})
        except Exception as exc:  # noqa: BLE001
            logger.exception("quota fetch failed")
            await websocket.send_json({"type": "error", "detail": f"سهمیه در دسترس نیست: {exc}"})

        while True:
            raw = await websocket.receive_text()
            try:
                payload: dict[str, Any] = json.loads(raw)
            except json.JSONDecodeError:
                await websocket.send_json({"type": "error", "detail": "پیام نامعتبر"})
                continue

            action = (payload.get("type") or payload.get("action") or "ask").strip()
            if action == "ping":
                await websocket.send_json({"type": "pong"})
                continue
            if action == "quota":
                snap = await django_quota(user.id, action="snapshot")
                await websocket.send_json({"type": "quota", **snap})
                continue
            if action != "ask":
                await websocket.send_json({"type": "error", "detail": "نوع پیام پشتیبانی نمی‌شود"})
                continue

            text = (payload.get("text") or payload.get("body") or "").strip()
            if not text:
                await websocket.send_json({"type": "error", "detail": "متن خالی است"})
                continue

            history = payload.get("history") if isinstance(payload.get("history"), list) else []

            try:
                snap = await django_quota(user.id, action="snapshot")
            except Exception as exc:  # noqa: BLE001
                await websocket.send_json({"type": "error", "detail": str(exc)})
                continue

            if not snap.get("can_ask"):
                await websocket.send_json(
                    {
                        "type": "paywall",
                        "message": "دو سوال رایگان تموم شد. برای ادامه، بسته ۲۰ سوالی راهیار را فعال کن.",
                        **snap,
                    }
                )
                continue

            await websocket.send_json({"type": "typing", "on": True})
            try:
                answer = await _reply_with_optional_celery(text, history)
                # مصرف سهمیه فقط بعد از جواب موفق
                after = await django_quota(user.id, action="consume")
                await websocket.send_json(
                    {
                        "type": "answer",
                        "text": answer,
                        "quota": after,
                    }
                )
            except Exception as exc:  # noqa: BLE001
                logger.exception("assistant ask failed")
                await websocket.send_json({"type": "error", "detail": "پاسخ آماده نشد؛ دوباره تلاش کن."})
            finally:
                await websocket.send_json({"type": "typing", "on": False})

    except WebSocketDisconnect:
        pass
    finally:
        async with _active_lock:
            _active_ws = max(0, _active_ws - 1)
        await _redis_active_decr()
