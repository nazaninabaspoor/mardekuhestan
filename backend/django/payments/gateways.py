"""تماس مستقیم با سندباکس رسمی زرین‌پال و پارسیان — تایم‌اوت کوتاه، بدون retry."""

from __future__ import annotations

import json
import logging
import re
import ssl
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET

from django.conf import settings

from payments.circuit import (
    GatewayTransportError,
    guard,
    record_failure,
    record_success,
)

logger = logging.getLogger(__name__)

_UUID = re.compile(
    r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
)


class GatewayRejected(Exception):
    """درگاه پاسخ داد ولی پرداخت را نپذیرفت (مرچنت نامعتبر و مشابه). مدار را باز نمی‌کند."""


def _timeout() -> float:
    return float(getattr(settings, "PAYMENT_GATEWAY_TIMEOUT_SECONDS", 4))


def _zarinpal_base() -> str:
    if getattr(settings, "ZARINPAL_SANDBOX", True):
        return "https://sandbox.zarinpal.com"
    return "https://api.zarinpal.com"


def _parsian_sale_url() -> str:
    if getattr(settings, "PARSIAN_SANDBOX", True):
        return "https://sandbox.pec.ir/NewIPGServices/Sale/SaleService.asmx"
    return "https://pec.shaparak.ir/NewIPGServices/Sale/SaleService.asmx"


def _parsian_confirm_url() -> str:
    if getattr(settings, "PARSIAN_SANDBOX", True):
        return "https://sandbox.pec.ir/NewIPGServices/Confirm/ConfirmService.asmx"
    return "https://pec.shaparak.ir/NewIPGServices/Confirm/ConfirmService.asmx"


def _parsian_pay_url(token: str) -> str:
    if getattr(settings, "PARSIAN_SANDBOX", True):
        return f"https://sandbox.pec.ir/NewIPG/?Token={token}"
    return f"https://pec.shaparak.ir/NewIPG/?Token={token}"


def zarinpal_startpay_url(authority: str) -> str:
    auth = (authority or "").strip()
    if len(auth) != 36 or not auth.startswith("S"):
        raise GatewayRejected("کد پیگیری سندباکس زرین‌پال باید ۳۶ کاراکتر و با S شروع شود.")
    return f"{_zarinpal_base()}/pg/StartPay/{auth}/"


def official_pay_url(gateway: str, authority: str, sandbox: bool = True) -> str:
    auth = (authority or "").strip()
    if gateway == "zarinpal":
        if sandbox:
            if len(auth) != 36 or not auth.startswith("S"):
                return ""
            return f"https://sandbox.zarinpal.com/pg/StartPay/{auth}/"
        if len(auth) != 36 or not auth.startswith("A"):
            return ""
        return f"https://www.zarinpal.com/pg/StartPay/{auth}/"
    if gateway == "parsian" and auth:
        if sandbox:
            return f"https://sandbox.pec.ir/NewIPG/?Token={auth}"
        return f"https://pec.shaparak.ir/NewIPG/?Token={auth}"
    return ""


def zarinpal_merchant() -> str:
    return (getattr(settings, "ZARINPAL_MERCHANT_ID", "") or "").strip()


def parsian_pin() -> str:
    return (getattr(settings, "PARSIAN_PIN", "") or "").strip()


def _http_json(url: str, payload: dict, gateway: str) -> dict:
    guard(gateway)
    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=body,
        headers={"Content-Type": "application/json", "Accept": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=_timeout(), context=ssl.create_default_context()) as resp:
            raw = resp.read().decode("utf-8")
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        record_failure(gateway)
        raise GatewayTransportError(str(exc)) from exc
    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError as exc:
        record_failure(gateway)
        raise GatewayTransportError("invalid json") from exc
    record_success(gateway)
    return parsed if isinstance(parsed, dict) else {}


def _http_soap(url: str, envelope: str, soap_action: str, gateway: str) -> str:
    guard(gateway)
    req = urllib.request.Request(
        url,
        data=envelope.encode("utf-8"),
        headers={
            "Content-Type": "text/xml; charset=utf-8",
            "SOAPAction": soap_action,
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=_timeout(), context=ssl.create_default_context()) as resp:
            raw = resp.read().decode("utf-8")
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        record_failure(gateway)
        raise GatewayTransportError(str(exc)) from exc
    record_success(gateway)
    return raw


def request_zarinpal(amount_toman: int, callback_url: str, description: str) -> tuple[str, str]:
    merchant = zarinpal_merchant()
    if not merchant or not _UUID.match(merchant):
        raise GatewayRejected("Merchant ID زرین‌پال نامعتبر است.")
    payload = {
        "merchant_id": merchant,
        "amount": int(amount_toman) * 10,
        "callback_url": callback_url,
        "description": description[:255],
    }
    body = _http_json(f"{_zarinpal_base()}/pg/v4/payment/request.json", payload, "zarinpal")
    data = body.get("data") or {}
    errors = body.get("errors")
    authority = data.get("authority")
    code = data.get("code")
    if not authority or code not in (100, "100"):
        message = ""
        if isinstance(errors, dict):
            message = str(errors.get("message") or "")
        raise GatewayRejected(message or "زرین‌پال درخواست پرداخت را نپذیرفت.")
    return str(authority).strip(), zarinpal_startpay_url(str(authority).strip())


def verify_zarinpal(amount_toman: int, authority: str) -> str:
    merchant = zarinpal_merchant()
    if not merchant:
        raise GatewayRejected("Merchant ID زرین‌پال تنظیم نشده است.")
    body = _http_json(
        f"{_zarinpal_base()}/pg/v4/payment/verify.json",
        {
            "merchant_id": merchant,
            "amount": int(amount_toman) * 10,
            "authority": authority,
        },
        "zarinpal",
    )
    data = body.get("data") or {}
    code = data.get("code")
    if code not in (100, 101, "100", "101"):
        raise GatewayRejected("تأیید پرداخت زرین‌پال ناموفق بود.")
    return str(data.get("ref_id") or authority)


def request_parsian(amount_toman: int, order_id: int, callback_url: str) -> tuple[str, str]:
    pin = parsian_pin()
    if not pin or pin.lower() in {"sandbox", "change-me", "0"}:
        raise GatewayRejected(
            "برای سندباکس پارسیان PIN تست را از pec.ir بگیرید و در PARSIAN_PIN بگذارید."
        )
    envelope = f"""<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <SalePaymentRequest xmlns="https://pec.Shaparak.ir/NewIPGServices/Sale/SaleService">
      <requestData>
        <LoginAccount>{_xml_text(pin)}</LoginAccount>
        <Amount>{int(amount_toman) * 10}</Amount>
        <OrderId>{int(order_id)}</OrderId>
        <CallBackUrl>{_xml_text(callback_url)}</CallBackUrl>
      </requestData>
    </SalePaymentRequest>
  </soap:Body>
</soap:Envelope>"""
    raw = _http_soap(
        _parsian_sale_url(),
        envelope,
        "https://pec.Shaparak.ir/NewIPGServices/Sale/SaleService/SalePaymentRequest",
        "parsian",
    )
    token = _xml_first(raw, "Token")
    status = _xml_first(raw, "Status")
    if not token or status not in {"0", "00"}:
        raise GatewayRejected("پارسیان درخواست پرداخت را نپذیرفت.")
    return token, _parsian_pay_url(token)


def verify_parsian(token: str) -> str:
    pin = parsian_pin()
    if not pin:
        raise GatewayRejected("PIN پارسیان تنظیم نشده است.")
    envelope = f"""<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <ConfirmPayment xmlns="https://pec.Shaparak.ir/NewIPGServices/Confirm/ConfirmService">
      <requestData>
        <LoginAccount>{_xml_text(pin)}</LoginAccount>
        <Token>{_xml_text(token)}</Token>
      </requestData>
    </ConfirmPayment>
  </soap:Body>
</soap:Envelope>"""
    raw = _http_soap(
        _parsian_confirm_url(),
        envelope,
        "https://pec.Shaparak.ir/NewIPGServices/Confirm/ConfirmService/ConfirmPayment",
        "parsian",
    )
    status = _xml_first(raw, "Status")
    rrn = _xml_first(raw, "RRN") or token
    if status not in {"0", "00"}:
        raise GatewayRejected("تأیید پرداخت پارسیان ناموفق بود.")
    return rrn


def _xml_text(value: str) -> str:
    return (
        value.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def _xml_first(raw: str, tag: str) -> str:
    try:
        root = ET.fromstring(raw)
    except ET.ParseError:
        return ""
    for el in root.iter():
        local = el.tag.rsplit("}", 1)[-1]
        if local == tag and el.text:
            return el.text.strip()
    return ""
