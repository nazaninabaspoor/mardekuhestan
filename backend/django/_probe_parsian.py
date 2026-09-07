import ssl
import time
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET

PINS = [
    "XXXXXXXXXXXXXXXXXXXX",
    "12345678901234567890",
    "scsdsdfbdsthsgfnfgndg",
    "00000000000000000000",
    "TESTPIN0000000000001",
]
ORDER_ID = int(time.time() * 1000) % (10**12)
AMOUNT = 10000
CALLBACK = "http://127.0.0.1:8000/api/payments/callback/parsian/?pid=test"
URL = "https://sandbox.pec.ir/NewIPGServices/Sale/SaleService.asmx"


def xml_first(raw: str, tag: str) -> str:
    try:
        root = ET.fromstring(raw)
    except ET.ParseError:
        return ""
    for el in root.iter():
        local = el.tag.rsplit("}", 1)[-1]
        if local == tag and el.text:
            return el.text.strip()
    return ""


def get(url: str) -> None:
    try:
        req = urllib.request.Request(url, method="GET")
        with urllib.request.urlopen(req, timeout=12, context=ssl.create_default_context()) as resp:
            body = resp.read(500).decode("utf-8", "replace").replace("\n", " ")
            print("GET", url, "->", resp.status, body[:220])
    except Exception as exc:
        print("GET", url, "FAIL", type(exc).__name__, exc)


for probe in [
    "https://sandbox.pec.ir/NewIPG/",
    "https://sandbox.pec.ir/NewIPGServices/Sale/SaleService.asmx",
    "https://sandbox.pec.ir/NewIPGServices/Sale/SaleService.asmx?wsdl",
]:
    get(probe)

for pin in PINS:
    envelope = f"""<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <SalePaymentRequest xmlns="https://pec.Shaparak.ir/NewIPGServices/Sale/SaleService">
      <requestData>
        <LoginAccount>{pin}</LoginAccount>
        <Amount>{AMOUNT}</Amount>
        <OrderId>{ORDER_ID}</OrderId>
        <CallBackUrl>{CALLBACK}</CallBackUrl>
      </requestData>
    </SalePaymentRequest>
  </soap:Body>
</soap:Envelope>"""
    req = urllib.request.Request(
        URL,
        data=envelope.encode("utf-8"),
        headers={
            "Content-Type": "text/xml; charset=utf-8",
            "SOAPAction": "https://pec.Shaparak.ir/NewIPGServices/Sale/SaleService/SalePaymentRequest",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=12, context=ssl.create_default_context()) as resp:
            raw = resp.read().decode("utf-8", "replace")
            print(
                "PIN",
                pin,
                "HTTP",
                resp.status,
                "Token",
                xml_first(raw, "Token"),
                "Status",
                xml_first(raw, "Status"),
                "Message",
                xml_first(raw, "Message"),
            )
            print(raw[:600])
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode("utf-8", "replace")
        print(
            "PIN",
            pin,
            "HTTPError",
            exc.code,
            "Token",
            xml_first(raw, "Token"),
            "Status",
            xml_first(raw, "Status"),
            "Message",
            xml_first(raw, "Message"),
        )
        print(raw[:800])
    except Exception as exc:
        print("PIN", pin, "FAIL", type(exc).__name__, exc)
    ORDER_ID += 1
