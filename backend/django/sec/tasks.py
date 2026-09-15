"""تسک‌های امنیتی پس‌زمینه (Celery) — ممیزی رویدادها، پاکسازی کلیدهای منقضی."""

from __future__ import annotations

import logging
from celery import shared_task
from django.core.cache import cache

logger = logging.getLogger(__name__)


@shared_task(
    name="sec.tasks.cleanup_expired_security_jails_task",
    bind=True,
    max_retries=3,
    default_retry_delay=10,
)
def cleanup_expired_security_jails_task(self) -> dict[str, str]:
    """پاکسازی حافظه و رکوردهای موقت امنیتی."""
    try:
        # در کش ردیس TTL خودکار کلیدها را پاک می‌کند، این تسک وضعیت را لاگ می‌کند
        logger.info("Security background cleanup task executed successfully")
        return {"status": "success", "message": "Security maintenance completed"}
    except Exception as exc:
        logger.exception("Error in cleanup_expired_security_jails_task: %s", exc)
        raise self.retry(exc=exc)


@shared_task(
    name="sec.tasks.log_security_event_task",
    bind=True,
    max_retries=3,
    default_retry_delay=5,
)
def log_security_event_task(
    self,
    event_type: str,
    ip: str,
    user_id: int | None = None,
    extra_data: dict | None = None,
) -> dict[str, str]:
    """ثبت غیرهمگام رویدادهای امنیتی بدون معطل کردن درخواست کاربر."""
    try:
        logger.warning(
            "SECURITY EVENT: type=%s ip=%s user_id=%s extra=%s",
            event_type,
            ip,
            user_id,
            extra_data,
        )
        return {"status": "logged", "event_type": event_type}
    except Exception as exc:
        logger.exception("Failed to log security event: %s", exc)
        raise self.retry(exc=exc)
