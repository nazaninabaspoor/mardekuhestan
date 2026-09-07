"""API پرداخت زرین‌پال و پارسیان."""

from __future__ import annotations

from django.core.exceptions import ValidationError as DjangoValidationError
from django.http import HttpResponseRedirect
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsCustomerOrStaff
from payments.gateways import official_pay_url
from payments.models import Payment
from payments.services import (
    handle_parsian_callback,
    handle_zarinpal_callback,
    start_payment,
)
from sec.decorators import rate_limit
from sec.ownership import acting_user


@method_decorator(rate_limit(scope="payment_start"), name="dispatch")
class PaymentStartView(APIView):
    permission_classes = [IsCustomerOrStaff]

    def post(self, request):
        user = acting_user(request)
        gateway = (request.data.get("gateway") or "").strip()
        try:
            payload = start_payment(
                user,
                gateway,
                receiver_name=request.data.get("receiver_name") or "",
                receiver_phone=request.data.get("receiver_phone") or "",
                shipping_address=request.data.get("shipping_address") or "",
            )
        except DjangoValidationError as exc:
            msg = exc.messages[0] if getattr(exc, "messages", None) else str(exc)
            code = status.HTTP_503_SERVICE_UNAVAILABLE if "موقتاً" in msg else status.HTTP_400_BAD_REQUEST
            return Response({"detail": msg}, status=code)
        return Response(payload)


class PaymentSandboxDetailView(APIView):
    permission_classes = [IsCustomerOrStaff]

    def get(self, request, public_id: str):
        user = acting_user(request)
        payment = Payment.objects.filter(public_id=public_id, user=user).select_related("order").first()
        if not payment:
            return Response({"detail": "پرداخت یافت نشد."}, status=status.HTTP_404_NOT_FOUND)
        return Response(
            {
                "payment_id": str(payment.public_id),
                "gateway": payment.gateway,
                "gateway_display": payment.get_gateway_display(),
                "status": payment.status,
                "amount_toman": payment.amount_toman,
                "sandbox": payment.sandbox,
                "order_number": payment.order.order_number if payment.order_id else None,
                "redirect_url": official_pay_url(payment.gateway, payment.authority, payment.sandbox),
            }
        )


@method_decorator(csrf_exempt, name="dispatch")
@method_decorator(rate_limit(scope="payment_callback"), name="dispatch")
class ZarinpalCallbackView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        return self._go(request)

    def post(self, request):
        return self._go(request)

    def _go(self, request):
        pid = request.GET.get("pid") or request.data.get("pid") or ""
        authority = request.GET.get("Authority") or request.GET.get("authority") or ""
        gw_status = request.GET.get("Status") or request.GET.get("status") or ""
        return HttpResponseRedirect(handle_zarinpal_callback(pid, authority, gw_status))


@method_decorator(csrf_exempt, name="dispatch")
@method_decorator(rate_limit(scope="payment_callback"), name="dispatch")
class ParsianCallbackView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        return self._go(request)

    def post(self, request):
        return self._go(request)

    def _go(self, request):
        data = {}
        try:
            if hasattr(request, "data"):
                data = request.data if isinstance(request.data, dict) else {}
        except Exception:
            data = {}
        post = getattr(request, "POST", {}) or {}
        pid = (
            request.GET.get("pid")
            or data.get("pid")
            or post.get("pid")
            or ""
        )
        token = (
            request.GET.get("Token")
            or request.GET.get("token")
            or data.get("Token")
            or data.get("token")
            or post.get("Token")
            or post.get("token")
            or ""
        )
        gw_status = (
            request.GET.get("status")
            or request.GET.get("Status")
            or data.get("status")
            or data.get("Status")
            or post.get("status")
            or post.get("Status")
            or ""
        )
        rrn = (
            request.GET.get("RRN")
            or request.GET.get("rrn")
            or data.get("RRN")
            or data.get("rrn")
            or post.get("RRN")
            or post.get("rrn")
            or ""
        )
        return HttpResponseRedirect(
            handle_parsian_callback(str(pid), str(token), str(gw_status), str(rrn))
        )
