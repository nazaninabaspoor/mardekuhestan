import ssl
import time
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET

AMOUNT = 10000
CALLBACK = "http://127.0.0.1:8000/api/payments/callback/parsian/?pid=test"
PIN = "XXXXXXXXXXXXXXXXXXXX"
ORDER_ID = int(time.time() * 1000) % (10**12)

ENDPOINTS = [
    "https://pec.shaparak.ir/NewIPGServices/Sale/SaleService.asmx",
    "https://sandbox.banktest.ir/parsian/pec.shaparak.ir/NewIPGServices/Sale/SaleService.asmx",
]


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


envelope = f"""<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <SalePaymentRequest xmlns="https://pec.Shaparak.ir/NewIPGServices/Sale/SaleService">
      <requestData>
        <LoginAccount>{PIN}</LoginAccount>
        <Amount>{AMOUNT}</Amount>
        <OrderId>{ORDER_ID}</OrderId>
        <CallBackUrl>{CALLBACK}</CallBackUrl>
      </requestData>
    </SalePaymentRequest>
  </soap:Body>
</soap:Envelope>"""

ctx = ssl.create_default_context()
for url in ENDPOINTS:
    print("====", url)
    req = urllib.request.Request(
        url,
        data=envelope.encode("utf-8"),
        headers={
            "Content-Type": "text/xml; charset=utf-8",
            "SOAPAction": "https://pec.Shaparak.ir/NewIPGServices/Sale/SaleService/SalePaymentRequest",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=15, context=ctx) as resp:
            raw = resp.read().decode("utf-8", "replace")
            print("HTTP", resp.status)
            print("Token", xml_first(raw, "Token"), "Status", xml_first(raw, "Status"), "Message", xml_first(raw, "Message"))
            print(raw[:900])
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode("utf-8", "replace")
        print("HTTPError", exc.code)
        print("Token", xml_first(raw, "Token"), "Status", xml_first(raw, "Status"), "Message", xml_first(raw, "Message"))
        print(raw[:900])
    except Exception as exc:
        print(type(exc).__name__, exc)
    ORDER_ID += 1
