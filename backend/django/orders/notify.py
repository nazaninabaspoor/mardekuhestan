"""ایمیل به ادمین وقتی سفارش جدید ثبت می‌شود — مرد کوهستان."""

from __future__ import annotations

import logging

from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


def _recipient_list() -> list[str]:
    raw = getattr(settings, "ORDER_NOTIFY_EMAILS", "") or ""
    return [item.strip() for item in raw.split(",") if item.strip()]


def _admin_order_url(order_id: int) -> str:
    base = getattr(settings, "BACKEND_PUBLIC_URL", "http://127.0.0.1:8000").rstrip("/")
    return f"{base}/admin/orders/order/{order_id}/change/"


def notify_admins_new_order(order_id: int) -> bool:
    """ارسال ایمیل اطلاع‌رسانی ثبت سفارش؛ خطا سفارش را خراب نمی‌کند."""
    from orders.models import Order

    recipients = _recipient_list()
    if not recipients:
        logger.warning("order email skipped: ORDER_NOTIFY_EMAILS خالی است (order_id=%s)", order_id)
        return False

    order = (
        Order.objects.select_related("user", "user__customer_profile")
        .prefetch_related("items")
        .filter(pk=order_id)
        .first()
    )
    if not order:
        logger.warning("order email skipped: order_id=%s یافت نشد", order_id)
        return False

    profile = getattr(order.user, "customer_profile", None)
    profile_name = (getattr(profile, "display_name", "") or "").strip()
    profile_phone = (getattr(profile, "phone", "") or "").strip()
    account_email = (order.user.email or order.user.get_username() or "").strip()
    items_lines = "\n".join(
        f"  • {item.product_name} × {item.quantity} — {item.total_price_toman:,} تومان"
        for item in order.items.all()
    ) or "  (بدون قلم)"

    subject = f"مرد کوهستان — سفارش جدید #{order.order_number}"
    body = (
        "سلام همکار گرامی مرد کوهستان،\n\n"
        "یک سفارش جدید در سایت ثبت شد. لطفاً در پنل ادمین بررسی کنید.\n\n"
        f"شماره سفارش: {order.order_number}\n"
        f"وضعیت: {order.get_status_display()}\n"
        f"مبلغ نهایی: {order.final_amount_toman:,} تومان\n\n"
        "اطلاعات خریدار / پروفایل:\n"
        f"  نام پروفایل: {profile_name or '—'}\n"
        f"  ایمیل حساب: {account_email or '—'}\n"
        f"  موبایل پروفایل: {profile_phone or '—'}\n"
        f"  نام تحویل‌گیرنده: {order.receiver_name or '—'}\n"
        f"  تلفن تحویل: {order.receiver_phone or '—'}\n"
        f"  نشانی: {order.shipping_address or '—'}\n\n"
        "اقلام:\n"
        f"{items_lines}\n\n"
        f"مشاهده در پنل ادمین:\n{_admin_order_url(order.pk)}\n\n"
        "با احترام،\n"
        "سامانهٔ فروش مرد کوهستان\n"
        "این راه سبز است"
    )

    from_email = getattr(settings, "DEFAULT_FROM_EMAIL", None) or settings.EMAIL_HOST_USER
    if not from_email or not settings.EMAIL_HOST:
        logger.error(
            "order email NOT sent: SMTP تنظیم نشده. order=#%s recipients=%s",
            order.order_number,
            ",".join(recipients),
        )
        logger.info("[order-email:preview]\n%s", body)
        return False

    try:
        send_mail(
            subject=subject,
            message=body,
            from_email=from_email,
            recipient_list=recipients,
            fail_silently=False,
        )
        logger.info(
            "order email sent order=#%s to=%s",
            order.order_number,
            ",".join(recipients),
        )
        return True
    except Exception:  # noqa: BLE001
        logger.exception(
            "order email failed order=#%s to=%s",
            order.order_number,
            ",".join(recipients),
        )
        return False
