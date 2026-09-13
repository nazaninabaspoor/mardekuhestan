"""SMTP notify for hired support staff when a customer writes in chat."""

from __future__ import annotations

import asyncio
import logging
import smtplib
from email.message import EmailMessage

from app.core.config import get_settings

logger = logging.getLogger(__name__)


def _recipient_list() -> list[str]:
    settings = get_settings()
    raw = settings.SUPPORT_NOTIFY_EMAILS or ""
    return [item.strip() for item in raw.split(",") if item.strip()]


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


def _send_smtp_sync(*, subject: str, body: str, recipients: list[str]) -> bool:
    settings = get_settings()
    host = (settings.SMTP_HOST or "").strip()
    user = (settings.SMTP_USER or "").strip()
    password = (settings.SMTP_PASSWORD or "").strip()
    from_addr = (settings.SMTP_FROM or user or "noreply@mardekoohestan.ir").strip()
    port = int(settings.SMTP_PORT or 587)
    use_tls = bool(settings.SMTP_USE_TLS)

    if not host or not recipients:
        logger.info(
            "[support-email:log] to=%s subject=%s\n%s",
            ",".join(recipients) or "(none)",
            subject,
            body,
        )
        return True

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = from_addr
    message["To"] = ", ".join(recipients)
    message.set_content(body)

    try:
        with smtplib.SMTP(host, port, timeout=12) as smtp:
            smtp.ehlo()
            if use_tls:
                smtp.starttls()
                smtp.ehlo()
            if user and password:
                smtp.login(user, password)
            smtp.send_message(message)
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
