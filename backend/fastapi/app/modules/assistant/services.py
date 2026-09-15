"""تماس با Django برای سهمیه راهیار + OpenAI."""

from __future__ import annotations

import logging
from typing import Any

import httpx

from app.core.config import get_settings
from app.modules.assistant.prompts import SYSTEM_PROMPT

logger = logging.getLogger(__name__)


async def django_quota(user_id: int, *, action: str = "snapshot") -> dict[str, Any]:
    settings = get_settings()
    url = f"{settings.DJANGO_BASE_URL.rstrip('/')}/api/notifications/ai/internal/"
    headers = {"X-Support-Internal-Token": settings.SUPPORT_INTERNAL_TOKEN}
    async with httpx.AsyncClient(timeout=20.0) as client:
        res = await client.post(url, json={"user_id": user_id, "action": action}, headers=headers)
        data = res.json() if res.content else {}
        if res.status_code == 402:
            data["needs_payment"] = True
            data["can_ask"] = False
            return data
        res.raise_for_status()
        return data


async def generate_coach_reply(user_message: str, history: list[dict[str, str]] | None = None) -> str:
    settings = get_settings()
    key = (settings.OPENAI_API_KEY or "").strip()
    if not key:
        return (
            "الان خط مشاوره موقتاً قطع است. کمی بعد دوباره بپرس؛ "
            "یا از بخش محصولات، پروتئین‌های مرتعی مرد کوهستان را ببین."
        )

    messages: list[dict[str, str]] = [{"role": "system", "content": SYSTEM_PROMPT}]
    for item in (history or [])[-8:]:
        role = item.get("role") or "user"
        content = (item.get("content") or "").strip()
        if content and role in {"user", "assistant"}:
            messages.append({"role": role, "content": content})
    messages.append({"role": "user", "content": user_message.strip()[:2000]})

    model = getattr(settings, "OPENAI_MODEL", None) or "gpt-4o-mini"
    payload = {
        "model": model,
        "messages": messages,
        "temperature": 0.75,
        "max_tokens": 700,
    }
    async with httpx.AsyncClient(timeout=45.0) as client:
        res = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
            json=payload,
        )
        if res.status_code >= 400:
            logger.error("OpenAI error %s: %s", res.status_code, res.text[:400])
            return "یک لحظه قطع شدم. لطفاً دوباره همان سوال را بپرس."
        body = res.json()
        try:
            return (body["choices"][0]["message"]["content"] or "").strip()
        except (KeyError, IndexError, TypeError):
            return "جواب آماده نشد؛ دوباره امتحان کن."
