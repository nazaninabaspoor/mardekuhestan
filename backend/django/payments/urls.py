from django.urls import path

from payments.views import PaymentSandboxCompleteView, PaymentSandboxDetailView, PaymentStartView

app_name = "payments"

urlpatterns = [
    path("start/", PaymentStartView.as_view(), name="start"),
    path("sandbox/<uuid:public_id>/", PaymentSandboxDetailView.as_view(), name="sandbox-detail"),
    path("sandbox/<uuid:public_id>/complete/", PaymentSandboxCompleteView.as_view(), name="sandbox-complete"),
]
