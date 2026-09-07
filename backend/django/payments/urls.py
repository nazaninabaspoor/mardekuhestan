from django.urls import path

from payments.views import (
    ParsianCallbackView,
    PaymentSandboxDetailView,
    PaymentStartView,
    ZarinpalCallbackView,
)

app_name = "payments"

urlpatterns = [
    path("start/", PaymentStartView.as_view(), name="start"),
    path("sandbox/<uuid:public_id>/", PaymentSandboxDetailView.as_view(), name="sandbox-detail"),
    path("callback/zarinpal/", ZarinpalCallbackView.as_view(), name="callback-zarinpal"),
    path("callback/parsian/", ParsianCallbackView.as_view(), name="callback-parsian"),
]
