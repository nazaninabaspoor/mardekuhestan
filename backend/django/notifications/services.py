"""سرویس لیست انتظار و سهمیه راهیار."""

from __future__ import annotations

import logging

from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction

from notifications.models import AiCoachQuota, WaitlistInterest

logger = logging.getLogger(__name__)


def _admin_emails() -> list[str]:
    raw = (
        getattr(settings, "ORDER_NOTIFY_EMAILS", "")
        or getattr(settings, "SUPPORT_NOTIFY_EMAILS", "")
        or ""
    )
    return [x.strip() for x in raw.split(",") if x.strip()]


def _send_admin_mail(subject: str, body: str) -> bool:
    recipients = _admin_emails()
    if not recipients:
        logger.warning("admin notify skipped: no ORDER_NOTIFY_EMAILS — %s", subject)
        logger.info("[admin-email:preview]\n%s", body)
        return False
    from_email = getattr(settings, "DEFAULT_FROM_EMAIL", None) or settings.EMAIL_HOST_USER
    if not from_email or not getattr(settings, "EMAIL_HOST", ""):
        logger.error("admin email NOT sent (SMTP missing): %s", subject)
        logger.info("[admin-email:preview]\n%s", body)
        return False
    try:
        send_mail(subject, body, from_email, recipients, fail_silently=False)
        return True
    except Exception:  # noqa: BLE001
        logger.exception("admin email failed: %s", subject)
        return False


@transaction.atomic
def register_waitlist(
    *,
    user,
    product_key: str,
    product_name: str,
    source: str = "product-unveil",
) -> tuple[WaitlistInterest, bool]:
    profile = getattr(user, "customer_profile", None)
    email = (user.email or "").strip()
    phone = (getattr(profile, "phone", "") or "").strip()
    name = (getattr(profile, "display_name", "") or user.get_username() or "").strip()

    interest, created = WaitlistInterest.objects.get_or_create(
        user=user,
        product_key=product_key.strip()[:80],
        defaults={
            "product_name": product_name.strip()[:200] or product_key,
            "source": source[:80],
            "email": email,
            "phone": phone,
            "display_name": name,
        },
    )
    if not created:
        return interest, False

    base = getattr(settings, "BACKEND_PUBLIC_URL", "http://127.0.0.1:8000").rstrip("/")
    admin_url = f"{base}/admin/notifications/waitlistinterest/{interest.pk}/change/"
    subject = f"مرد کوهستان — خبرم کن: {interest.product_name}"
    body = (
        "سلام همکار گرامی،\n\n"
        "یک کاربر روی «خبرم کن» کلیک کرده است.\n\n"
        f"محصول: {interest.product_name} ({interest.product_key})\n"
        f"نام: {name or '—'}\n"
        f"ایمیل: {email or '—'}\n"
        f"موبایل: {phone or '—'}\n"
        f"منبع: {source}\n\n"
        f"مشاهده در پنل:\n{admin_url}\n\n"
        "این راه سبز است\n"
    )
    if _send_admin_mail(subject, body):
        interest.notified_admin = True
        interest.save(update_fields=["notified_admin"])
    return interest, True


def get_or_create_quota(user) -> AiCoachQuota:
    quota, _ = AiCoachQuota.objects.get_or_create(user=user)
    return quota


def quota_snapshot(user) -> dict:
    q = get_or_create_quota(user)
    return {
        "free_remaining": q.free_remaining,
        "free_limit": AiCoachQuota.FREE_LIMIT,
        "paid_remaining": int(q.paid_remaining),
        "paid_pack_questions": AiCoachQuota.PAID_PACK_QUESTIONS,
        "pack_price_toman": AiCoachQuota.PACK_PRICE_TOMAN,
        "can_ask": q.can_ask,
        "needs_payment": not q.can_ask,
        "pricing_note": (
            f"برآورد هزینه API حدود {AiCoachQuota.PACK_COST_USD_ESTIMATE}$ برای "
            f"{AiCoachQuota.PAID_PACK_QUESTIONS} جواب + حدود "
            f"{AiCoachQuota.PACK_PROFIT_USD_TARGET}$ سود ≈ {AiCoachQuota.PACK_PRICE_TOMAN:,} تومان"
        ),
    }


@transaction.atomic
def consume_ai_question(user) -> dict:
    q = get_or_create_quota(user)
    if q.free_remaining > 0:
        q.free_used = int(q.free_used) + 1
        q.save(update_fields=["free_used", "updated_at"])
        return quota_snapshot(user)
    if int(q.paid_remaining) > 0:
        q.paid_remaining = int(q.paid_remaining) - 1
        q.save(update_fields=["paid_remaining", "updated_at"])
        return quota_snapshot(user)
    raise ValueError("quota_exhausted")


@transaction.atomic
def grant_ai_pack(user, payment=None) -> AiCoachQuota:
    q = get_or_create_quota(user)
    q.paid_remaining = int(q.paid_remaining) + AiCoachQuota.PAID_PACK_QUESTIONS
    q.paid_total = int(q.paid_total) + AiCoachQuota.PAID_PACK_QUESTIONS
    if payment is not None:
        q.last_payment = payment
    q.save(update_fields=["paid_remaining", "paid_total", "last_payment", "updated_at"])

    base = getattr(settings, "BACKEND_PUBLIC_URL", "http://127.0.0.1:8000").rstrip("/")
    subject = f"مرد کوهستان — اشتراک راهیار تغذیه برای کاربر #{user.pk}"
    body = (
        "سلام،\n\n"
        "یک اشتراک راهیار تغذیه پرداخت و فعال شد.\n\n"
        f"کاربر: {user.get_username()} / {user.email}\n"
        f"سوالات اضافه‌شده: {AiCoachQuota.PAID_PACK_QUESTIONS}\n"
        f"باقی‌مانده پولی: {q.paid_remaining}\n"
        f"مبلغ بسته: {AiCoachQuota.PACK_PRICE_TOMAN:,} تومان\n"
        f"پنل سهمیه:\n{base}/admin/notifications/aicoachquota/{q.pk}/change/\n\n"
        "این راه سبز است\n"
    )
    _send_admin_mail(subject, body)
    return q
