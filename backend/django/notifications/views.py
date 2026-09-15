"""API اعلان‌ها، لیست انتظار و سهمیه راهیار."""

from __future__ import annotations

from django.utils.decorators import method_decorator
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsCustomerOrStaff
from notifications.services import (
    consume_ai_question,
    get_or_create_quota,
    quota_snapshot,
    register_waitlist,
)
from sec.decorators import rate_limit
from sec.ownership import acting_user


@method_decorator(rate_limit(scope="payment_start"), name="dispatch")
class WaitlistRegisterView(APIView):
    permission_classes = [IsCustomerOrStaff]

    def post(self, request):
        user = acting_user(request)
        product_key = (request.data.get("product_key") or "").strip()
        product_name = (request.data.get("product_name") or "").strip()
        source = (request.data.get("source") or "product-unveil").strip()
        if not product_key:
            return Response({"detail": "product_key لازم است."}, status=status.HTTP_400_BAD_REQUEST)
        interest, created = register_waitlist(
            user=user,
            product_key=product_key,
            product_name=product_name or product_key,
            source=source,
        )
        return Response(
            {
                "ok": True,
                "created": created,
                "product_key": interest.product_key,
                "product_name": interest.product_name,
                "message": "یادم ماند" if created else "قبلاً ثبت شده بود",
            },
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class AiQuotaView(APIView):
    permission_classes = [IsCustomerOrStaff]

    def get(self, request):
        user = acting_user(request)
        get_or_create_quota(user)
        return Response(quota_snapshot(user))


class AiConsumeView(APIView):
    """مصرف یک سوال — توسط FastAPI بعد از پاسخ موفق صدا زده می‌شود."""

    permission_classes = [IsCustomerOrStaff]

    def post(self, request):
        user = acting_user(request)
        # Internal token OR authenticated user (assistant uses user JWT)
        try:
            snap = consume_ai_question(user)
        except ValueError:
            return Response(
                {"detail": "سهمیه تمام شده است.", **quota_snapshot(user)},
                status=status.HTTP_402_PAYMENT_REQUIRED,
            )
        return Response(snap)


class AiInternalConsumeView(APIView):
    """مصرف سهمیه با توکن داخلی FastAPI (بدون وابستگی به cookie)."""

    authentication_classes = []
    permission_classes = []

    def post(self, request):
        from django.conf import settings

        token = (request.headers.get("X-Support-Internal-Token") or "").strip()
        expected = (getattr(settings, "SUPPORT_INTERNAL_TOKEN", "") or "").strip()
        if not expected or token != expected:
            return Response({"detail": "forbidden"}, status=status.HTTP_403_FORBIDDEN)
        try:
            user_id = int(request.data.get("user_id"))
        except (TypeError, ValueError):
            return Response({"detail": "user_id نامعتبر"}, status=status.HTTP_400_BAD_REQUEST)
        from django.contrib.auth import get_user_model

        User = get_user_model()
        user = User.objects.filter(pk=user_id).first()
        if not user:
            return Response({"detail": "کاربر یافت نشد"}, status=status.HTTP_404_NOT_FOUND)
        action = (request.data.get("action") or "consume").strip()
        if action == "snapshot":
            get_or_create_quota(user)
            return Response(quota_snapshot(user))
        try:
            return Response(consume_ai_question(user))
        except ValueError:
            return Response(
                {"detail": "quota_exhausted", **quota_snapshot(user)},
                status=status.HTTP_402_PAYMENT_REQUIRED,
            )
