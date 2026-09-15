"""API عمومی ثبت رفتار و نظر محصول."""

from __future__ import annotations

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from product.insight_serializers import (
    InsightEventCreateSerializer,
    ProductOpinionCreateSerializer,
)
from product.request_guards import guard_catalog_request
from sec.throttling import CatalogPublicThrottle


class InsightWriteMixin:
    permission_classes = [AllowAny]
    throttle_classes = [CatalogPublicThrottle]
    throttle_scope = "catalog_public"
    http_method_names = ["post", "options"]

    def initial(self, request, *args, **kwargs):
        guard_catalog_request(request)
        super().initial(request, *args, **kwargs)


class InsightEventCreateView(InsightWriteMixin, APIView):
    def post(self, request: Request) -> Response:
        serializer = InsightEventCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user if getattr(request.user, "is_authenticated", False) else None
        event = serializer.save(user=user)
        return Response({"ok": True, "id": event.pk}, status=status.HTTP_201_CREATED)


class ProductOpinionCreateView(InsightWriteMixin, APIView):
    def post(self, request: Request) -> Response:
        serializer = ProductOpinionCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user if getattr(request.user, "is_authenticated", False) else None
        opinion = serializer.save(user=user)
        return Response({"ok": True, "id": opinion.pk}, status=status.HTTP_201_CREATED)
