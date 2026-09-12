"""انتشار رویداد پاسخ ادمین به FastAPI (HTTP داخلی)."""

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


def _message_payload(message: SupportMessage) -> dict:
    return {
        "type": "support.message",
        "conversation_id": str(message.conversation_id),
        "customer_id": message.conversation.customer_id,
        "message": {
            "id": str(message.id),
            "conversation_id": str(message.conversation_id),
            "sender_role": message.sender_role,
            "sender_user_id": message.sender_user_id,
            "body": message.body,
            "client_message_id": message.client_message_id or None,
            "created_at": message.created_at.isoformat(),
        },
    }


def publish_staff_reply(message: SupportMessage) -> None:
    """بعد از ذخیره پاسخ ادمین در پنل، به هاب FastAPI بگو تا روی WebSocket مشتری برود."""
    base = getattr(settings, "FASTAPI_BASE_URL", "http://127.0.0.1:8001").rstrip("/")
    token = getattr(settings, "SUPPORT_INTERNAL_TOKEN", "") or ""
    url = f"{base}/api/v1/support/internal/broadcast"
    payload = json.dumps(_message_payload(message)).encode("utf-8")
    headers = {"Content-Type": "application/json"}
    if token:
        headers["X-Support-Internal-Token"] = token

    request = urllib.request.Request(url, data=payload, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(request, timeout=4) as response:
            if response.status >= 400:
                raise RuntimeError(f"broadcast status={response.status}")
    except urllib.error.URLError as exc:
        logger.exception("support broadcast to FastAPI failed for message=%s", message.id)
        raise RuntimeError(str(exc)) from exc
