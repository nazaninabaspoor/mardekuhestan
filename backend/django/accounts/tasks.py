"""تسک‌های پس‌زمینه اپ حساب‌ها (Celery) — پاکسازی توکن‌های منقضی، اعلان‌های ایمیلی/پیامکی."""

from __future__ import annotations

import logging
from celery import shared_task
from django.utils import timezone

logger = logging.getLogger(__name__)


@shared_task(
    name="accounts.tasks.cleanup_expired_tokens_task",
    bind=True,
    max_retries=3,
    default_retry_delay=30,
)
def cleanup_expired_tokens_task(self) -> dict[str, int]:
    """پاکسازی توکن‌های منقضی‌شده و رکوردهای بلک‌لیست از دیتابیس برای جلوگیری از تورم جداول."""
    try:
        from rest_framework_simplejwt.token_blacklist.models import OutstandingToken

        now = timezone.now()
        deleted_count, _ = OutstandingToken.objects.filter(expires_at__lt=now).delete()
        logger.info("Cleaned up %d expired outstanding JWT tokens", deleted_count)
        return {"deleted_tokens": deleted_count}
    except Exception as exc:
        logger.exception("Error in cleanup_expired_tokens_task: %s", exc)
        raise self.retry(exc=exc)


@shared_task(
    name="accounts.tasks.send_welcome_email_task",
    bind=True,
    max_retries=3,
    default_retry_delay=15,
)
def send_welcome_email_task(self, user_id: int) -> dict[str, str]:
    """ارسال ایمیل خوش‌آمدگویی در پس‌زمینه بدون کند کردن فرآیند ثبت‌نام کاربر."""
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        user = User.objects.filter(pk=user_id).first()
        if not user:
            return {"status": "skipped", "reason": "user_not_found"}

        logger.info("Welcome notification queued for user %s (%s)", user.pk, user.email)
        return {"status": "sent", "email": user.email}
    except Exception as exc:
        logger.exception("Failed to send welcome email to user %d: %s", user_id, exc)
        raise self.retry(exc=exc)


@shared_task(
    name="accounts.tasks.notify_password_changed_task",
    bind=True,
    max_retries=3,
    default_retry_delay=10,
)
def notify_password_changed_task(self, user_id: int) -> dict[str, str]:
    """اطلاع‌رسانی تغییر رمز عبور در پس‌زمینه."""
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        user = User.objects.filter(pk=user_id).first()
        if not user:
            return {"status": "skipped", "reason": "user_not_found"}

        logger.info("Password change alert sent to %s", user.email)
        return {"status": "notified", "email": user.email}
    except Exception as exc:
        logger.exception("Failed to notify password change for user %d: %s", user_id, exc)
        raise self.retry(exc=exc)
