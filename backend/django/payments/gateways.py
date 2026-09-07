"""تماس مستقیم با سندباکس رسمی زرین‌پال و درگاه رسمی پارسیان — تایم‌اوت کوتاه، بدون retry."""

from __future__ import annotations

import json
import logging
import os
import re
import ssl
import subprocess
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
_PARSIAN_TOKEN = re.compile(r"^[1-9]\d{3,18}$")

_PARSIAN_STATUS = {
    "-138": "عملیات پرداخت توسط کاربر لغو شد.",
    "-132": "مبلغ تراکنش کمتر از حداقل مجاز است.",
    "-131": "توکن پارسیان نامعتبر است.",
    "-130": "توکن پارسیان منقضی شده است.",
    "-127": "آدرس بازگشت پارسیان معتبر نیست.",
    "-126": "کد شناسایی پذیرنده پارسیان معتبر نیست.",
    "-117": "طول PIN پارسیان کمتر از حد مجاز است.",
    "-116": "طول PIN پارسیان بیش از حد مجاز است.",
    "-113": "پارامتر ورودی پارسیان خالی است.",
    "-112": "شماره سفارش پارسیان تکراری است.",
    "-101": "پذیرنده پارسیان احراز هویت نشد.",
    "-100": "پذیرنده پارسیان غیرفعال است.",
    "-1": "خطای سرور پارسیان.",
    "0": "موفق",
}


class GatewayRejected(Exception):
    """درگاه پاسخ داد ولی پرداخت را نپذیرفت (مرچنت نامعتبر و مشابه). مدار را باز نمی‌کند."""


def _timeout() -> float:
    return float(getattr(settings, "PAYMENT_GATEWAY_TIMEOUT_SECONDS", 4))


def _soap_timeout() -> float:
    return max(_timeout(), 8.0)


def _zarinpal_base() -> str:
    if getattr(settings, "ZARINPAL_SANDBOX", True):
        return "https://sandbox.zarinpal.com"
    return "https://api.zarinpal.com"


def _parsian_sandbox() -> bool:
    return bool(getattr(settings, "PARSIAN_SANDBOX", True))


def _parsian_sale_url() -> str:
    if _parsian_sandbox():
        return "https://sandbox.banktest.ir/parsian/pec.shaparak.ir/NewIPGServices/Sale/SaleService.asmx"
    return "https://pec.shaparak.ir/NewIPGServices/Sale/SaleService.asmx"


def _parsian_confirm_url() -> str:
    if _parsian_sandbox():
        return "https://sandbox.banktest.ir/parsian/pec.shaparak.ir/NewIPGServices/Confirm/ConfirmService.asmx"
    return "https://pec.shaparak.ir/NewIPGServices/Confirm/ConfirmService.asmx"


def parsian_token_ok(token: str) -> bool:
    return bool(_PARSIAN_TOKEN.match((token or "").strip()))


def parsian_startpay_url(token: str) -> str:
    auth = (token or "").strip()
    if not parsian_token_ok(auth):
        raise GatewayRejected("توکن سندباکس پارسیان باید عدد معتبر درگاه باشد، نه خالی یا ۱-.")
    if _parsian_sandbox():
        return f"https://sandbox.banktest.ir/parsian/pec.shaparak.ir/NewIPG/?Token={auth}"
    return f"https://pec.shaparak.ir/NewIPG/?Token={auth}"


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
    if gateway == "parsian":
        if not parsian_token_ok(auth):
            return ""
        if sandbox:
            return f"https://sandbox.banktest.ir/parsian/pec.shaparak.ir/NewIPG/?Token={auth}"
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


def _looks_like_soap(raw: str) -> bool:
    text = (raw or "").lstrip()
    return text.startswith("<") and ("Envelope" in text or "Token" in text or "Status" in text)


def _soap_urllib(url: str, envelope: str, soap_action: str) -> str:
    req = urllib.request.Request(
        url,
        data=envelope.encode("utf-8"),
        headers={
            "Content-Type": "text/xml; charset=utf-8",
            "SOAPAction": f'"{soap_action}"',
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(
            req, timeout=_soap_timeout(), context=ssl.create_default_context()
        ) as resp:
            return resp.read().decode("utf-8")
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode("utf-8", "replace")
        if _looks_like_soap(raw):
            return raw
        raise GatewayTransportError(f"http {exc.code}") from exc
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        raise GatewayTransportError(str(exc)) from exc


def _soap_curl(url: str, envelope: str, soap_action: str) -> str:
    curl = "curl.exe" if os.name == "nt" else "curl"
    timeout = int(_soap_timeout())
    try:
        completed = subprocess.run(
            [
                curl,
                "-sS",
                "-m",
                str(timeout),
                "--http1.1",
                "-H",
                "Content-Type: text/xml; charset=utf-8",
                "-H",
                f'SOAPAction: "{soap_action}"',
                "--data-binary",
                "@-",
                "-w",
                "\n__HTTPSTATUS__%{http_code}",
                url,
            ],
            input=envelope.encode("utf-8"),
            capture_output=True,
            timeout=timeout + 3,
            check=False,
        )
    except (FileNotFoundError, subprocess.TimeoutExpired, OSError) as exc:
        raise GatewayTransportError(str(exc)) from exc
    out = completed.stdout.decode("utf-8", "replace")
    err = completed.stderr.decode("utf-8", "replace")
    status = ""
    raw = out
    if "__HTTPSTATUS__" in out:
        raw, status = out.rsplit("__HTTPSTATUS__", 1)
        status = status.strip()
    if completed.returncode != 0 and not _looks_like_soap(raw):
        raise GatewayTransportError(err or f"curl {completed.returncode}")
    if status and status not in {"200", "500"} and not _looks_like_soap(raw):
        raise GatewayTransportError(f"http {status} {err}".strip())
    if not _looks_like_soap(raw):
        raise GatewayTransportError(err or "empty soap")
    return raw


def _http_soap(url: str, envelope: str, soap_action: str, gateway: str) -> str:
    guard(gateway)
    senders = (_soap_curl, _soap_urllib) if os.name == "nt" else (_soap_urllib, _soap_curl)
    last_exc: GatewayTransportError | None = None
    for sender in senders:
        try:
            raw = sender(url, envelope, soap_action)
            record_success(gateway)
            return raw
        except GatewayTransportError as exc:
            last_exc = exc
            logger.warning("Parsian SOAP via %s failed: %s", sender.__name__, exc)
    record_failure(gateway)
    raise last_exc or GatewayTransportError("soap failed")


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


def _parsian_message(status: str, message: str) -> str:
    mapped = _PARSIAN_STATUS.get(str(status).strip())
    text = (message or "").strip() or mapped or "پارسیان درخواست پرداخت را نپذیرفت."
    return text


def request_parsian(amount_toman: int, order_id: int, callback_url: str) -> tuple[str, str]:
    pin = parsian_pin()
    if not _parsian_sandbox() and (not pin or pin.lower() in {"sandbox", "change-me", "0"}):
        raise GatewayRejected(
            "برای درگاه زنده پارسیان PIN واقعی pec.ir را در PARSIAN_PIN بگذارید."
        )
    if not pin:
        pin = "12345678901234567890"
    envelope = f"""<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <SalePaymentRequest xmlns="https://pec.Shaparak.ir/NewIPGServices/Sale/SaleService">
      <requestData>
        <LoginAccount>{_xml_text(pin)}</LoginAccount>
        <Amount>{int(amount_toman) * 10}</Amount>
        <OrderId>{int(order_id)}</OrderId>
        <CallBackUrl>{_xml_text(callback_url)}</CallBackUrl>
        <AdditionalData></AdditionalData>
        <Originator></Originator>
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
    message = _xml_first(raw, "Message")
    if not parsian_token_ok(token) or status not in {"0", "00"}:
        raise GatewayRejected(_parsian_message(status, message))
    return token, parsian_startpay_url(token)


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
    message = _xml_first(raw, "Message")
    if status not in {"0", "00"}:
        raise GatewayRejected(_parsian_message(status, message))
    try:
        if int(rrn) <= 0:
            raise GatewayRejected("شماره مرجع پارسیان نامعتبر است.")
    except ValueError:
        if not rrn:
            raise GatewayRejected("شماره مرجع پارسیان نامعتبر است.")
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
