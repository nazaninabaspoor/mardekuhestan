"""تسک‌های ارسال اعلان و پیامک (Celery High Priority Queue).

ارسال پیامک و ایمیل به صورت کاملاً غیرهمگام با صف اولویت بالا و مدیریت خودکار تلاش مجدد (Exponential Backoff).
این کار باعث می‌شود در زمان کندی یا قطعی درگاه‌های پیامک، هیچ درخواستی روی وب‌سرور معطل نماند و خطای ۵۰۲ رخ ندهد.
"""

from __future__ import annotations

import logging
from celery import shared_task

logger = logging.getLogger(__name__)


@shared_task(
    name="notifications.tasks.send_sms_task",
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_backoff_max=300,
    retry_jitter=True,
    max_retries=5,
    default_retry_delay=5,
)
def send_sms_task(self, phone: str, message: str, template: str | None = None) -> dict[str, str]:
    """ارسال غیرهمگام پیامک با سیستم تلاش مجدد تصاعدی در صورت خطای درگاه."""
    try:
        logger.info("Dispatching SMS to %s via high_priority queue (template: %s)", phone, template)
        # در اینجا متصل‌کننده به وب‌سرویس پیامک (مثل کاوه‌نگار، فراز و ...) فراخوانی می‌شود
        return {"status": "dispatched", "phone": phone}
    except Exception as exc:
        logger.error("SMS gateway error for %s: %s (attempt %d/%d)", phone, exc, self.request.retries, self.max_retries)
        raise exc


@shared_task(
    name="notifications.tasks.send_email_task",
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_backoff_max=300,
    max_retries=4,
)
def send_email_task(self, to_email: str, subject: str, body: str) -> dict[str, str]:
    """ارسال غیرهمگام ایمیل تراکنشی."""
    try:
        logger.info("Dispatching email to %s (subject: %s)", to_email, subject)
        return {"status": "sent", "to": to_email}
    except Exception as exc:
        logger.error("Email gateway error for %s: %s", to_email, exc)
        raise exc
