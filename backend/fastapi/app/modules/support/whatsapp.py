"""WhatsApp outbound notify — ping hired admin to open Django panel."""

from __future__ import annotations

import logging

import httpx

from app.core.config import get_settings

logger = logging.getLogger(__name__)


def build_admin_ping_text(*, customer_id: int, preview: str, conversation_id: str) -> str:
    settings = get_settings()
    short = preview.strip().replace("\n", " ")
    if len(short) > 120:
        short = short[:117] + "…"
    return (
        "مرد کوهستان — پیام پشتیبانی جدید\n"
        f"مشتری: #{customer_id}\n"
        f"گفتگو: {conversation_id[:8]}\n"
        f"متن: {short}\n"
        f"برو به پنل: {settings.DJANGO_ADMIN_SUPPORT_URL}"
    )


async def notify_admin_whatsapp(*, customer_id: int, preview: str, conversation_id: str) -> bool:
    settings = get_settings()
    text = build_admin_ping_text(
        customer_id=customer_id,
        preview=preview,
        conversation_id=conversation_id,
    )
    provider = (settings.WHATSAPP_PROVIDER or "log").lower()
    phone = settings.WHATSAPP_ADMIN_PHONE.strip()

    if provider == "log" or not phone:
        logger.info("[whatsapp:%s] %s", provider, text)
        return True

    if provider == "meta":
        return await _send_meta(phone=phone, text=text)
    if provider == "greenapi":
        return await _send_greenapi(phone=phone, text=text)

    logger.warning("unknown WHATSAPP_PROVIDER=%s — logged only", provider)
    logger.info("[whatsapp:fallback] %s", text)
    return False


async def _send_meta(*, phone: str, text: str) -> bool:
    settings = get_settings()
    if not settings.WHATSAPP_ACCESS_TOKEN or not settings.WHATSAPP_PHONE_NUMBER_ID:
        logger.error("Meta WhatsApp credentials missing")
        return False
    url = (
        f"https://graph.facebook.com/v21.0/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages"
    )
    payload = {
        "messaging_product": "whatsapp",
        "to": phone,
        "type": "text",
        "text": {"body": text},
    }
    headers = {
        "Authorization": f"Bearer {settings.WHATSAPP_ACCESS_TOKEN}",
        "Content-Type": "application/json",
    }
    async with httpx.AsyncClient(timeout=8.0) as client:
        response = await client.post(url, json=payload, headers=headers)
        if response.status_code >= 400:
            logger.error("Meta WhatsApp failed: %s %s", response.status_code, response.text)
            return False
    return True


async def _send_greenapi(*, phone: str, text: str) -> bool:
    settings = get_settings()
    instance = settings.WHATSAPP_GREENAPI_INSTANCE_ID
    token = settings.WHATSAPP_GREENAPI_TOKEN
    if not instance or not token:
        logger.error("GreenAPI credentials missing")
        return False
    chat_id = phone if phone.endswith("@c.us") else f"{phone}@c.us"
    url = f"https://api.green-api.com/waInstance{instance}/sendMessage/{token}"
    async with httpx.AsyncClient(timeout=8.0) as client:
        response = await client.post(url, json={"chatId": chat_id, "message": text})
        if response.status_code >= 400:
            logger.error("GreenAPI failed: %s %s", response.status_code, response.text)
            return False
    return True
