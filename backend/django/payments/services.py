"""شروع و تکمیل پرداخت زرین‌پال / پارسیان (سندباکس تا دریافت Merchant)."""

from __future__ import annotations

import json
import re
import urllib.error
import urllib.request
import uuid

from django.conf import settings
from django.core.exceptions import ValidationError

from orders.models import Cart
from orders.services import fulfill_cart_as_order
from payments.models import Payment

_UUID = re.compile(r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$")


def _frontend_url() -> str:
    return getattr(settings, "FRONTEND_URL", "http://localhost:3000").rstrip("/")


def _zarinpal_merchant() -> str:
    return (getattr(settings, "ZARINPAL_MERCHANT_ID", "") or "").strip()


def _parsian_pin() -> str:
    return (getattr(settings, "PARSIAN_PIN", "") or "").strip()


def zarinpal_live_sandbox_ready() -> bool:
    merchant = _zarinpal_merchant()
    return bool(merchant and _UUID.match(merchant) and "xxxx" not in merchant.lower())


def parsian_live_sandbox_ready() -> bool:
    pin = _parsian_pin()
    return bool(pin and pin.lower() not in {"", "sandbox", "change-me", "0"})


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
    payment = Payment.objects.create(
        user=user,
        gateway=gateway,
        amount_toman=amount,
        sandbox=True,
        receiver_name=receiver_name,
        receiver_phone=receiver_phone,
        shipping_address=shipping_address,
        authority=uuid.uuid4().hex[:32],
    )

    local_url = f"{_frontend_url()}/pay/sandbox/{payment.public_id}?gateway={gateway}"

    if gateway == Payment.Gateway.ZARINPAL and zarinpal_live_sandbox_ready():
        remote = _zarinpal_request(payment)
        if remote:
            return remote

    if gateway == Payment.Gateway.PARSIAN and parsian_live_sandbox_ready():
        remote = _parsian_request(payment)
        if remote:
            return remote

    payment.sandbox = True
    payment.save(update_fields=["sandbox", "updated_at"])
    return {
        "payment_id": str(payment.public_id),
        "gateway": gateway,
        "sandbox": True,
        "amount_toman": payment.amount_toman,
        "redirect_url": local_url,
    }


def _zarinpal_request(payment: Payment) -> dict | None:
    payload = json.dumps(
        {
            "merchant_id": _zarinpal_merchant(),
            "amount": int(payment.amount_toman) * 10,
            "callback_url": f"{_frontend_url()}/pay/callback/zarinpal?pid={payment.public_id}",
            "description": f"سفارش مرد کوهستان #{payment.public_id.hex[:8]}",
        }
    ).encode("utf-8")
    req = urllib.request.Request(
        "https://sandbox.zarinpal.com/pg/v4/payment/request.json",
        data=payload,
        headers={"Content-Type": "application/json", "Accept": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=12) as resp:
            body = json.loads(resp.read().decode("utf-8"))
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError, ValueError):
        return None

    data = (body or {}).get("data") or {}
    authority = data.get("authority")
    code = data.get("code")
    if not authority or code not in (100, "100"):
        return None
    payment.authority = str(authority)
    payment.save(update_fields=["authority", "updated_at"])
    return {
        "payment_id": str(payment.public_id),
        "gateway": Payment.Gateway.ZARINPAL,
        "sandbox": True,
        "amount_toman": payment.amount_toman,
        "redirect_url": f"https://sandbox.zarinpal.com/pg/StartPay/{authority}",
    }


def _parsian_request(payment: Payment) -> dict | None:
    """پارسیان سندباکس بدون PIN معتبر به صفحهٔ محلی برمی‌گردد."""
    return None


def complete_sandbox_payment(user, public_id: str, outcome: str) -> dict:
    try:
        payment = Payment.objects.select_related("user").get(public_id=public_id, user=user)
    except Payment.DoesNotExist as exc:
        raise ValidationError("پرداخت یافت نشد.") from exc

    if payment.status == Payment.Status.PAID and payment.order_id:
        return {"ok": True, "order_number": payment.order.order_number, "already": True}

    if outcome != "paid":
        payment.status = Payment.Status.CANCELED
        payment.save(update_fields=["status", "updated_at"])
        return {"ok": False, "canceled": True, "order_number": None}

    order = fulfill_cart_as_order(
        user,
        receiver_name=payment.receiver_name,
        receiver_phone=payment.receiver_phone,
        shipping_address=payment.shipping_address,
    )
    payment.status = Payment.Status.PAID
    payment.order = order
    payment.ref_id = f"SB-{order.order_number}"
    payment.save(update_fields=["status", "order", "ref_id", "updated_at"])
    return {"ok": True, "order_number": order.order_number, "already": False}
