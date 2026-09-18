"""انتشار رویداد پاسخ ادمین به FastAPI (HTTP داخلی) + پاک‌سازی چت."""

from __future__ import annotations

import json
import logging
import urllib.error
import urllib.request
from typing import TYPE_CHECKING

from django.conf import settings

if TYPE_CHECKING:
    from support.models import SupportMessage

logger = logging.getLogger(__name__)


def purge_customer_chats(user_id: int) -> int:
    """حذف کامل گفتگوها و پیام‌های یک مشتری (با لاگ‌اوت)."""
    from support.models import SupportConversation, SupportMessage

    conversation_ids = list(
        SupportConversation.objects.filter(customer_id=user_id).values_list("id", flat=True)
    )
    if not conversation_ids:
        return 0
    # صریح: پیام‌ها بعد گفتگو — تا از پنل ادمین هم کامل پاک شود
    SupportMessage.objects.filter(conversation_id__in=conversation_ids).delete()
    deleted, _ = SupportConversation.objects.filter(id__in=conversation_ids).delete()
    logger.info(
        "purged support chats user_id=%s conversations=%s delete_result=%s",
        user_id,
        len(conversation_ids),
        deleted,
    )
    return len(conversation_ids)


def _message_payload(message: SupportMessage) -> dict:
    created = message.created_at
    if created is not None and created.tzinfo is None:
        created_at = created.isoformat() + "Z"
    else:
        created_at = created.isoformat() if created else None
    return {
        "type": "support.message",
        "conversation_id": str(message.conversation_id),
        "customer_id": int(message.conversation.customer_id),
        "message": {
            "id": str(message.id),
            "conversation_id": str(message.conversation_id),
            "sender_role": message.sender_role,
            "sender_user_id": message.sender_user_id,
            "body": message.body,
            "client_message_id": message.client_message_id or None,
            "created_at": created_at,
        },
    }


def publish_staff_reply(message: SupportMessage) -> None:
    """بعد از ذخیره پاسخ ادمین در پنل، به هاب FastAPI بگو تا روی WebSocket مشتری برود."""
    base = getattr(settings, "FASTAPI_BASE_URL", "http://127.0.0.1:8000").rstrip("/")
    token = getattr(settings, "SUPPORT_INTERNAL_TOKEN", "") or ""
    url = f"{base}/api/v1/support/internal/broadcast"
    payload = json.dumps(_message_payload(message), ensure_ascii=False).encode("utf-8")
    headers = {
        "Content-Type": "application/json; charset=utf-8",
        "Accept": "application/json",
    }
    if token:
        headers["X-Support-Internal-Token"] = token

    request = urllib.request.Request(url, data=payload, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(request, timeout=6) as response:
            body = response.read().decode("utf-8", errors="replace")
            if response.status >= 400:
                raise RuntimeError(f"broadcast status={response.status} body={body[:300]}")
            logger.info(
                "support broadcast ok message=%s customer=%s status=%s",
                message.id,
                message.conversation.customer_id,
                response.status,
            )
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")[:400]
        logger.exception(
            "support broadcast HTTP %s for message=%s: %s",
            exc.code,
            message.id,
            detail,
        )
        raise RuntimeError(f"HTTP {exc.code}: {detail}") from exc
    except urllib.error.URLError as exc:
        logger.exception("support broadcast to FastAPI failed for message=%s", message.id)
        raise RuntimeError(str(exc)) from exc
