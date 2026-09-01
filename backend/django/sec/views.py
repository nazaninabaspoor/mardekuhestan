"""ویوهای امنیتی، بررسی سلامت (Health Check) و وضعیت سیستم.

طراحی شده برای Load Balancerها، Nginx و Kubernetes جهت جلوگیری از خطای ۵۰۲.
"""

from __future__ import annotations

import time
from typing import Any

from django.core.cache import cache
from django.db import connection
from django.http import HttpRequest, JsonResponse
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

from sec.decorators import rate_limit
from sec.rate_limit import is_ip_jailed, unjail_ip
from sec.utils import get_client_ip


class SystemHealthView(APIView):
    """
    بررسی زنده بودن سرویس (Liveness Probe).
    پاسخ سریع برای Nginx upstream check و مانیتورینگ.
    """

    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request: HttpRequest) -> JsonResponse:
        return JsonResponse(
            {
                "status": "healthy",
                "timestamp": int(time.time()),
                "service": "marde-kuhestan-backend",
            },
            status=200,
        )


class SystemReadinessView(APIView):
    """
    بررسی آمادگی کامل سرویس (Readiness Probe).
    تست اتصال به دیتابیس PostgreSQL و حافظه Redis به همراه اندازه‌گیری تاخیر (Latency).
    اگر دیتابیس قطع باشد وضعیت ۵۰۳ بازمی‌گرداند تا Nginx کاربر را به سرور دیگر هدایت کند و ۵۰۲ ندهد.
    """

    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request: HttpRequest) -> JsonResponse:
        checks: dict[str, Any] = {}
        is_healthy = True

        # ۱. تست اتصال دیتابیس
        db_start = time.monotonic()
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1;")
                cursor.fetchone()
            db_latency_ms = round((time.monotonic() - db_start) * 1000, 2)
            checks["database"] = {"status": "ok", "latency_ms": db_latency_ms}
        except Exception as exc:
            checks["database"] = {"status": "error", "detail": str(exc)}
            is_healthy = False

        # ۲. تست اتصال Redis
        cache_start = time.monotonic()
        try:
            test_key = "sec:healthcheck:ping"
            cache.set(test_key, "pong", timeout=10)
            val = cache.get(test_key)
            if val == "pong":
                redis_latency_ms = round((time.monotonic() - cache_start) * 1000, 2)
                checks["redis"] = {"status": "ok", "latency_ms": redis_latency_ms}
            else:
                checks["redis"] = {"status": "degraded", "detail": "unexpected_value"}
        except Exception as exc:
            checks["redis"] = {"status": "error", "detail": str(exc)}
            # در صورتی که ردیس موقتاً قطع باشد سرویس به کلی داون نمی‌شود
            checks["redis_fallback"] = "active"

        overall_status = 200 if is_healthy else 503
        return JsonResponse(
            {
                "status": "ready" if is_healthy else "unready",
                "checks": checks,
                "timestamp": int(time.time()),
            },
            status=overall_status,
        )


class ClientIpStatusView(APIView):
    """استعلام وضعیت امنیتی IP جاری برای پشتیبانی و دیباگ کلاینت."""

    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request: HttpRequest) -> JsonResponse:
        ip = get_client_ip(request)
        jailed = is_ip_jailed(ip)
        return JsonResponse(
            {
                "ip": ip,
                "is_jailed": jailed,
            }
        )
