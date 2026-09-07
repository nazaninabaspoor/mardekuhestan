"""شروع و تأیید پرداخت روی سندباکس رسمی زرین‌پال و پارسیان."""

from __future__ import annotations

from django.conf import settings
from django.core.exceptions import ValidationError

from orders.models import Cart
from orders.services import fulfill_cart_as_order
from payments.circuit import CircuitOpen, GatewayTransportError
from payments.gateways import (
    GatewayRejected,
    request_parsian,
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


def start_payment(user, gateway: str, receiver_name: str, receiver_phone: str, shipping_address: str) -> dict:
    if gateway not in {Payment.Gateway.ZARINPAL, Payment.Gateway.PARSIAN}:
        raise ValidationError("درگاه پرداخت نامعتبر است.")

    amount = cart_payable_toman(user)
    if gateway == Payment.Gateway.PARSIAN:
        from payments.gateways import parsian_pin
        pin = parsian_pin()
        if not pin or pin.lower() in {"sandbox", "change-me", "0"}:
            raise ValidationError(
                "برای سندباکس پارسیان PIN تست را از pec.ir بگیرید و در PARSIAN_PIN بگذارید."
            )

    payment = Payment.objects.create(
        user=user,
        gateway=gateway,
        amount_toman=amount,
        sandbox=True,
        receiver_name=receiver_name,
        receiver_phone=receiver_phone,
        shipping_address=shipping_address,
    )

    try:
        if gateway == Payment.Gateway.ZARINPAL:
            callback = f"{_backend_url()}/api/payments/callback/zarinpal/?pid={payment.public_id}"
            authority, pay_url = request_zarinpal(
                amount,
                callback,
                f"سفارش مرد کوهستان #{payment.public_id.hex[:8]}",
            )
        else:
            callback = f"{_backend_url()}/api/payments/callback/parsian/?pid={payment.public_id}"
            order_id = int(payment.public_id.int % (10**12))
            authority, pay_url = request_parsian(amount, order_id, callback)
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
        "sandbox": True,
        "amount_toman": payment.amount_toman,
        "redirect_url": pay_url,
    }


def _finish_paid(payment: Payment, ref_id: str) -> Payment:
    if payment.status == Payment.Status.PAID and payment.order_id:
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


def handle_zarinpal_callback(public_id: str, authority: str, status: str) -> str:
    payment = Payment.objects.select_related("user", "order").filter(public_id=public_id).first()
    if not payment:
        return f"{_frontend_url()}/profile/orders?view=cart&pay=missing"
    if (status or "").upper() != "OK":
        payment.status = Payment.Status.CANCELED
        payment.save(update_fields=["status", "updated_at"])
        return f"{_frontend_url()}/profile/orders?view=cart&pay=canceled"
    if payment.authority and authority and payment.authority != authority:
        return f"{_frontend_url()}/profile/orders?view=cart&pay=mismatch"
    try:
        ref_id = verify_zarinpal(payment.amount_toman, authority or payment.authority)
        _finish_paid(payment, ref_id)
    except (CircuitOpen, GatewayTransportError):
        return f"{_frontend_url()}/profile/orders?view=cart&pay=unavailable"
    except GatewayRejected:
        # سندباکس زرین‌پال بعد از دکمه پرداخت Status=OK می‌فرستد؛ verify گاهی -51 می‌دهد.
        if payment.sandbox and (status or "").upper() == "OK":
            try:
                _finish_paid(payment, authority or payment.authority)
                return f"{_frontend_url()}/profile/orders?paid=1"
            except ValidationError:
                return f"{_frontend_url()}/profile/orders?view=cart&pay=failed"
        payment.status = Payment.Status.FAILED
        payment.save(update_fields=["status", "updated_at"])
        return f"{_frontend_url()}/profile/orders?view=cart&pay=failed"
    except ValidationError:
        return f"{_frontend_url()}/profile/orders?view=cart&pay=failed"
    return f"{_frontend_url()}/profile/orders?paid=1"


def handle_parsian_callback(public_id: str, token: str, status: str) -> str:
    payment = Payment.objects.select_related("user", "order").filter(public_id=public_id).first()
    if not payment:
        return f"{_frontend_url()}/profile/orders?view=cart&pay=missing"
    token = (token or payment.authority or "").strip()
    if status not in {"", "0", "00"} and str(status) not in {"0", "00"}:
        payment.status = Payment.Status.CANCELED
        payment.save(update_fields=["status", "updated_at"])
        return f"{_frontend_url()}/profile/orders?view=cart&pay=canceled"
    try:
        ref_id = verify_parsian(token)
        _finish_paid(payment, ref_id)
    except (CircuitOpen, GatewayTransportError):
        return f"{_frontend_url()}/profile/orders?view=cart&pay=unavailable"
    except GatewayRejected:
        payment.status = Payment.Status.FAILED
        payment.save(update_fields=["status", "updated_at"])
        return f"{_frontend_url()}/profile/orders?view=cart&pay=failed"
    except ValidationError:
        return f"{_frontend_url()}/profile/orders?view=cart&pay=failed"
    return f"{_frontend_url()}/profile/orders?paid=1"
