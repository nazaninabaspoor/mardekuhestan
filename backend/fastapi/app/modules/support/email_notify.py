"""SMTP notify for hired support staff when a customer writes in chat."""

from __future__ import annotations

import asyncio
import logging
import re
import smtplib
from email.message import EmailMessage
from email.utils import formataddr

from app.core.config import get_settings

logger = logging.getLogger(__name__)

_PLACEHOLDER_MARKERS = (
    "آدرس_فرستنده",
    "اپ_پسوورد",
    "your@",
    "example.com",
    "change-me",
    "password",
)


def _recipient_list() -> list[str]:
    settings = get_settings()
    raw = settings.SUPPORT_NOTIFY_EMAILS or ""
    return [item.strip() for item in raw.split(",") if item.strip()]


def _looks_like_placeholder(value: str) -> bool:
    lowered = value.strip().lower()
    if not lowered:
        return True
    if any(marker in value for marker in _PLACEHOLDER_MARKERS):
        return True
    if any(marker in lowered for marker in _PLACEHOLDER_MARKERS):
        return True
    return False


def _smtp_ready() -> tuple[bool, str]:
    settings = get_settings()
    host = (settings.SMTP_HOST or "").strip()
    user = (settings.SMTP_USER or "").strip()
    password = (settings.SMTP_PASSWORD or "").strip()
    if not host:
        return False, "SMTP_HOST خالی است"
    if _looks_like_placeholder(user) or "@" not in user:
        return False, "SMTP_USER هنوز placeholder است — ایمیل واقعی Gmail بگذار"
    if _looks_like_placeholder(password) or len(password) < 8:
        return False, "SMTP_PASSWORD هنوز placeholder است — App Password جیمیل بگذار"
    return True, ""


def build_staff_email(*, customer_id: int, preview: str, conversation_id: str) -> tuple[str, str]:
    settings = get_settings()
    short = preview.strip().replace("\n", " ")
    if len(short) > 160:
        short = short[:157] + "…"
    admin_url = settings.DJANGO_ADMIN_SUPPORT_URL.rstrip("/") + "/"
    subject = "مرد کوهستان — پیام جدید در چت‌بات پشتیبانی"
    body = (
        "سلام همکار گرامی مرد کوهستان،\n\n"
        "یک پیام جدید در چت‌بات پشتیبانی ثبت شده است. لطفاً هرچه سریع‌تر پاسخ دهید.\n\n"
        f"شناسه مشتری: #{customer_id}\n"
        f"شناسه گفتگو: {conversation_id}\n"
        f"متن پیام: {short}\n\n"
        f"ورود به پنل پاسخ:\n{admin_url}\n\n"
        "با احترام،\n"
        "سامانهٔ پشتیبانی مرد کوهستان\n"
        "این راه سبز است"
    )
    return subject, body


def _from_header() -> str:
    settings = get_settings()
    user = (settings.SMTP_USER or "").strip()
    raw_from = (settings.SMTP_FROM or user or "noreply@mardekoohestan.ir").strip()
    # Allow "Name <email>" or bare email → always brand as مرد کوهستان
    match = re.match(r"^(.*?)\s*<([^>]+)>\s*$", raw_from)
    address = match.group(2).strip() if match else raw_from
    return formataddr(("مرد کوهستان", address))


def _send_smtp_sync(*, subject: str, body: str, recipients: list[str]) -> bool:
    settings = get_settings()
    if not recipients:
        logger.warning("support email skipped: SUPPORT_NOTIFY_EMAILS خالی است")
        return False

    ready, reason = _smtp_ready()
    if not ready:
        logger.error(
            "support email NOT sent (%s). recipients=%s subject=%s",
            reason,
            ",".join(recipients),
            subject,
        )
        logger.info("[support-email:preview]\n%s", body)
        return False

    host = (settings.SMTP_HOST or "").strip()
    user = (settings.SMTP_USER or "").strip()
    password = (settings.SMTP_PASSWORD or "").strip()
    port = int(settings.SMTP_PORT or 587)
    use_tls = bool(settings.SMTP_USE_TLS)

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = _from_header()
    message["To"] = ", ".join(recipients)
    message.set_content(body)

    try:
        with smtplib.SMTP(host, port, timeout=12) as smtp:
            smtp.ehlo()
            if use_tls:
                smtp.starttls()
                smtp.ehlo()
            smtp.login(user, password)
            smtp.send_message(message)
        logger.info(
            "support email sent from مرد کوهستان to=%s subject=%s",
            ",".join(recipients),
            subject,
        )
        return True
    except Exception:  # noqa: BLE001
        logger.exception("SMTP send failed to=%s", recipients)
        return False


async def notify_staff_email(
    *,
    customer_id: int,
    preview: str,
    conversation_id: str,
) -> bool:
    recipients = _recipient_list()
    subject, body = build_staff_email(
        customer_id=customer_id,
        preview=preview,
        conversation_id=conversation_id,
    )
    return await asyncio.to_thread(
        _send_smtp_sync,
        subject=subject,
        body=body,
        recipients=recipients,
    )
