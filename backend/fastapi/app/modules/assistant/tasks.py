"""Celery task برای تولید پاسخ راهیار وقتی بار بالاست."""

from __future__ import annotations

import asyncio

from app.core.celery_app import celery_app


@celery_app.task(name="assistant.generate_reply")
def generate_reply_task(user_message: str, history: list | None = None) -> str:
    from app.modules.assistant.services import generate_coach_reply

    return asyncio.run(generate_coach_reply(user_message, history or []))
