"""API پرداخت زرین‌پال و پارسیان."""

from __future__ import annotations

from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsCustomerOrStaff
from payments.models import Payment
from payments.services import complete_sandbox_payment, start_payment
from sec.ownership import acting_user


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
            return Response({"detail": msg}, status=status.HTTP_400_BAD_REQUEST)
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
            }
        )


class PaymentSandboxCompleteView(APIView):
    permission_classes = [IsCustomerOrStaff]

    def post(self, request, public_id: str):
        user = acting_user(request)
        outcome = (request.data.get("outcome") or "paid").strip()
        try:
            payload = complete_sandbox_payment(user, public_id, outcome)
        except DjangoValidationError as exc:
            msg = exc.messages[0] if getattr(exc, "messages", None) else str(exc)
            return Response({"detail": msg}, status=status.HTTP_400_BAD_REQUEST)
        return Response(payload)
