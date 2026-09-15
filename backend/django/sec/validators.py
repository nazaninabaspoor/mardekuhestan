"""اعتبارسنجی ورودی HTTP / WebSocket / آپلود — لایه sec."""

from __future__ import annotations

import re
from typing import Any

from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import UploadedFile

from sec.constants import (
    ALLOWED_IMAGE_CONTENT_TYPES,
    ALLOWED_IMAGE_EXTENSIONS,
    MAX_IMAGE_UPLOAD_BYTES,
    MAX_QUERY_PARAM_VALUE_LENGTH,
    MAX_QUERY_STRING_LENGTH,
    WS_MAX_ACTION_LENGTH,
    WS_MAX_PAYLOAD_KEYS,
)

_CONTROL_CHARS_RE = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")
_SUSPICIOUS_PATTERNS = re.compile(
    r"(<script|javascript:|union\s+select|;\s*drop\s+|/\*\*/|\x00)",
    re.IGNORECASE,
)


def _strip(value: str | None) -> str:
    return (value or "").strip()


def validate_safe_text(value: str | None, *, field_label: str, max_length: int) -> str:
    text = _strip(value)
    if not text:
        return text
    if len(text) > max_length:
        raise ValidationError(f"{field_label} بیش از حد طولانی است.")
    if _CONTROL_CHARS_RE.search(text):
        raise ValidationError(f"{field_label} شامل کاراکتر غیرمجاز است.")
    if _SUSPICIOUS_PATTERNS.search(text):
        raise ValidationError(f"{field_label} معتبر نیست.")
    return text


def validate_query_param(value: str | None, *, field_label: str) -> str:
    return validate_safe_text(
        value,
        field_label=field_label,
        max_length=MAX_QUERY_PARAM_VALUE_LENGTH,
    )


def validate_request_query_string(request) -> None:
    """طول کل query string — جلوگیری از abuse در پارامترهای زیاد."""
    query = request.META.get("QUERY_STRING", "")
    if len(query) > MAX_QUERY_STRING_LENGTH:
        raise ValidationError("پارامترهای درخواست بیش از حد مجاز است.")


def validate_http_method(request, *, allowed: frozenset[str]) -> None:
    if request.method.upper() not in allowed:
        raise ValidationError("متد HTTP مجاز نیست.")


def validate_uploaded_image(file: UploadedFile) -> UploadedFile:
    """بررسی نوع، اندازه و یکپارچگی تصویر با Pillow."""
    if file.size is None or file.size <= 0:
        raise ValidationError("فایل تصویر خالی است.")
    if file.size > MAX_IMAGE_UPLOAD_BYTES:
        raise ValidationError(
            f"حجم تصویر حداکثر {MAX_IMAGE_UPLOAD_BYTES // (1024 * 1024)} مگابایت است."
        )

    content_type = (getattr(file, "content_type", "") or "").split(";")[0].strip().lower()
    if content_type and content_type not in ALLOWED_IMAGE_CONTENT_TYPES:
        raise ValidationError("نوع فایل تصویر مجاز نیست.")

    name = (getattr(file, "name", "") or "").lower()
    if name and not any(name.endswith(ext) for ext in ALLOWED_IMAGE_EXTENSIONS):
        raise ValidationError("پسوند فایل تصویر مجاز نیست.")

    try:
        from PIL import Image

        image = Image.open(file)
        image.verify()
        file.seek(0)
    except Exception as exc:
        raise ValidationError("فایل تصویر معتبر نیست.") from exc

    return file


def validate_websocket_payload(content: Any) -> dict[str, Any]:
    if not isinstance(content, dict):
        raise ValidationError("پیام WebSocket باید JSON object باشد.")
    if len(content) > WS_MAX_PAYLOAD_KEYS:
        raise ValidationError("پیام WebSocket بیش از حد فیلد دارد.")
    return content


def validate_websocket_action(action: str | None) -> str:
    text = validate_safe_text(
        action,
        field_label="action",
        max_length=WS_MAX_ACTION_LENGTH,
    )
    if not text:
        raise ValidationError("action نمی‌تواند خالی باشد.")
    allowed = frozenset({"ping", "subscribe", "unsubscribe"})
    if text.lower() not in allowed:
        raise ValidationError("action مجاز نیست.")
    return text.lower()
