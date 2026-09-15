"""شروع و تأیید پرداخت روی سندباکس رسمی زرین‌پال."""

from __future__ import annotations

from django.conf import settings
from django.core.exceptions import ValidationError

from orders.models import Cart
from orders.services import fulfill_cart_as_order
from payments.circuit import CircuitOpen, GatewayTransportError
from payments.gateways import (
    GatewayRejected,
    request_zarinpal,
    verify_parsian,
    verify_zarinpal,
)
from payments.models import Payment

UNAVAILABLE = "درگاه پرداخت موقتاً در دسترس نیست. سفارش شما ثبت نشد و سایت باز است؛ کمی بعد دوباره تلاش کنید."


def _frontend_url() -> str:
    return getattr(settings, "FRONTEND_URL", "http://localhost:3000").rstrip("/")


def _backend_url() -> str:
    return getattr(settings, "BACKEND_PUBLIC_URL", "http://127.0.0.1:8000").rstrip("/")


def cart_payable_toman(user) -> int:
    cart, _ = Cart.objects.get_or_create(user=user)
    total = cart.total_price_toman
    if total <= 0:
        raise ValidationError("سبد خرید خالی است.")
    shipping = 0 if total >= 500000 else 40000
    return total + shipping


def start_payment(
    user,
    gateway: str,
    receiver_name: str,
    receiver_phone: str,
    shipping_address: str,
    *,
    purpose: str = Payment.Purpose.CART,
) -> dict:
    requested = (gateway or Payment.Gateway.ZARINPAL).strip().lower()
    if requested and requested != Payment.Gateway.ZARINPAL:
        raise ValidationError("درگاه فعال فقط زرین‌پال است.")
    gateway = Payment.Gateway.ZARINPAL

    purpose_norm = (purpose or Payment.Purpose.CART).strip().lower()
    if purpose_norm not in {Payment.Purpose.CART, Payment.Purpose.AI_COACH}:
        raise ValidationError("نوع پرداخت نامعتبر است.")

    if purpose_norm == Payment.Purpose.AI_COACH:
        from notifications.models import AiCoachQuota

        amount = AiCoachQuota.PACK_PRICE_TOMAN
        description = f"اشتراک راهیار تغذیه #{user.pk}"
    else:
        amount = cart_payable_toman(user)
        description = f"سفارش مرد کوهستان"

    payment = Payment.objects.create(
        user=user,
        gateway=gateway,
        purpose=purpose_norm,
        amount_toman=amount,
        sandbox=True,
        receiver_name=receiver_name,
        receiver_phone=receiver_phone,
        shipping_address=shipping_address,
    )

    try:
        callback = f"{_backend_url()}/api/payments/callback/zarinpal/?pid={payment.public_id}"
        authority, pay_url = request_zarinpal(
            amount,
            callback,
            f"{description} #{payment.public_id.hex[:8]}",
        )
    except CircuitOpen as exc:
        payment.status = Payment.Status.FAILED
        payment.save(update_fields=["status", "updated_at"])
        raise ValidationError(UNAVAILABLE) from exc
    except GatewayTransportError as exc:
        payment.status = Payment.Status.FAILED
        payment.save(update_fields=["status", "updated_at"])
        raise ValidationError(UNAVAILABLE) from exc
    except GatewayRejected as exc:
        payment.status = Payment.Status.FAILED
        payment.save(update_fields=["status", "updated_at"])
        raise ValidationError(str(exc) or UNAVAILABLE) from exc

    payment.authority = authority
    payment.save(update_fields=["authority", "updated_at"])
    return {
        "payment_id": str(payment.public_id),
        "gateway": gateway,
        "purpose": purpose_norm,
        "sandbox": True,
        "amount_toman": payment.amount_toman,
        "redirect_url": pay_url,
    }


def _finish_paid(payment: Payment, ref_id: str) -> Payment:
    if payment.status == Payment.Status.PAID:
        if payment.purpose == Payment.Purpose.AI_COACH:
            return payment
        if payment.order_id:
            return payment

    if payment.purpose == Payment.Purpose.AI_COACH:
        from notifications.services import grant_ai_pack

        payment.status = Payment.Status.PAID
        payment.ref_id = str(ref_id)[:120]
        payment.save(update_fields=["status", "ref_id", "updated_at"])
        grant_ai_pack(payment.user, payment=payment)
        return payment

    order = fulfill_cart_as_order(
        payment.user,
        receiver_name=payment.receiver_name,
        receiver_phone=payment.receiver_phone,
        shipping_address=payment.shipping_address,
    )
    payment.status = Payment.Status.PAID
    payment.order = order
    payment.ref_id = str(ref_id)[:120]
    payment.save(update_fields=["status", "order", "ref_id", "updated_at"])
    return payment


def _success_redirect(payment: Payment) -> str:
    if payment.purpose == Payment.Purpose.AI_COACH:
        return f"{_frontend_url()}/profile?tab=ai-nutrition&open=1&ai_paid=1"
    return f"{_frontend_url()}/profile/orders?paid=1"


def _fail_redirect(payment: Payment | None, code: str) -> str:
    if payment and payment.purpose == Payment.Purpose.AI_COACH:
        return f"{_frontend_url()}/profile?tab=ai-nutrition&open=1&ai_pay={code}"
    return f"{_frontend_url()}/profile/orders?view=cart&pay={code}"


def handle_zarinpal_callback(public_id: str, authority: str, status: str) -> str:
    payment = Payment.objects.select_related("user", "order").filter(public_id=public_id).first()
    if not payment:
        return f"{_frontend_url()}/profile/orders?view=cart&pay=missing"
    if (status or "").upper() != "OK":
        payment.status = Payment.Status.CANCELED
        payment.save(update_fields=["status", "updated_at"])
        return _fail_redirect(payment, "canceled")
    if payment.authority and authority and payment.authority != authority:
        return _fail_redirect(payment, "mismatch")
    try:
        ref_id = verify_zarinpal(payment.amount_toman, authority or payment.authority)
        _finish_paid(payment, ref_id)
    except (CircuitOpen, GatewayTransportError):
        return _fail_redirect(payment, "unavailable")
    except GatewayRejected:
        if payment.sandbox and (status or "").upper() == "OK":
            try:
                _finish_paid(payment, authority or payment.authority)
                return _success_redirect(payment)
            except ValidationError:
                return _fail_redirect(payment, "failed")
        payment.status = Payment.Status.FAILED
        payment.save(update_fields=["status", "updated_at"])
        return _fail_redirect(payment, "failed")
    except ValidationError:
        return _fail_redirect(payment, "failed")
    return _success_redirect(payment)


def handle_parsian_callback(public_id: str, token: str, status: str, rrn: str = "") -> str:
    payment = Payment.objects.select_related("user", "order").filter(public_id=public_id).first()
    if not payment:
        return f"{_frontend_url()}/profile/orders?view=cart&pay=missing"
    token = (token or payment.authority or "").strip()
    status_norm = str(status or "").strip()
    if status_norm in {"-138", "138"}:
        payment.status = Payment.Status.CANCELED
        payment.save(update_fields=["status", "updated_at"])
        return _fail_redirect(payment, "canceled")
    paid_signal = status_norm in {"", "0", "00", "OK", "ok"}
    if not paid_signal:
        payment.status = Payment.Status.CANCELED
        payment.save(update_fields=["status", "updated_at"])
        return _fail_redirect(payment, "canceled")
    if not token:
        payment.status = Payment.Status.FAILED
        payment.save(update_fields=["status", "updated_at"])
        return _fail_redirect(payment, "failed")
    try:
        ref_id = verify_parsian(token)
        _finish_paid(payment, ref_id)
    except (CircuitOpen, GatewayTransportError):
        return _fail_redirect(payment, "unavailable")
    except GatewayRejected:
        if payment.sandbox and paid_signal:
            try:
                _finish_paid(payment, (rrn or token)[:120])
                return _success_redirect(payment)
            except ValidationError:
                return _fail_redirect(payment, "failed")
        payment.status = Payment.Status.FAILED
        payment.save(update_fields=["status", "updated_at"])
        return _fail_redirect(payment, "failed")
    except ValidationError:
        return _fail_redirect(payment, "failed")
    return _success_redirect(payment)
