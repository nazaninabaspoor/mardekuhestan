"""تسک‌های عمومی و نگهداری سیستم (Celery)."""

from __future__ import annotations

import logging
from celery import shared_task
from django.db import connection

logger = logging.getLogger(__name__)


@shared_task(
    name="common.tasks.system_health_heartbeat_task",
    bind=True,
    max_retries=1,
)
def system_health_heartbeat_task(self) -> dict[str, str]:
    """ضربان قلب سلامت سیستم: بررسی اتصال دیتابیس و ردیس."""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        logger.debug("Database heartbeat OK")
        return {"status": "healthy", "database": "ok"}
    except Exception as exc:
        logger.error("Database heartbeat FAILED: %s", exc)
        return {"status": "degraded", "error": str(exc)}
