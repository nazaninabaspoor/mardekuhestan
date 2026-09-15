"""میدل‌ویرهای امنیتی و ضد DDoS برای پلتفرم مرد کوهستان.

طراحی شده برای:
1. قطع فوری درخواست‌های مخرب و IPهای متخلف قبل از رسیدن به دیتابیس یا منطق برنامه.
2. جلوگیری از OOM با مهار درخواست‌های با حجم غیرمجاز.
3. مانیتورینگ درخواست‌های کند برای پیشگیری از مسدود شدن Workerها و خطای ۵۰۲.
"""

from __future__ import annotations

import logging
import time
import uuid
from typing import Callable

from django.http import HttpRequest, HttpResponse, JsonResponse

from sec.constants import (
    MAX_QUERY_STRING_LENGTH,
    MAX_REQUEST_BODY_BYTES,
    MAX_URI_LENGTH,
    RATE_SCOPE_GLOBAL_IP,
    SLOW_REQUEST_THRESHOLD_SECONDS,
)
from sec.rate_limit import check_rate_limit, is_ip_jailed, record_ip_offense
from sec.utils import get_client_ip

logger = logging.getLogger(__name__)

# الگوهای مشکوک ربات‌ها و اسکنرهای وب که فوراً مسدود می‌شوند
_BLOCKED_URI_PATTERNS: frozenset[str] = frozenset(
    {
        ".php",
        "wp-login",
        "wp-admin",
        "xmlrpc.php",
        "phpmyadmin",
        "setup.cgi",
        ".env",
        ".git/",
        "eval-stdin.php",
        "../",
    }
)


class DDoSMitigationMiddleware:
    """
    سپر دفاعی لایه ۷:
    - بررسی فوری وضعیت مسدودی IP (Jail).
    - Rate Limit سراسری روی هر IP.
    - مهار حجم ورودی و طول URI برای پیشگیری از پر شدن حافظه (OOM).
    """

    def __init__(self, get_response: Callable[[HttpRequest], HttpResponse]) -> None:
        self.get_response = get_response

    def __call__(self, request: HttpRequest) -> HttpResponse:
        ip = get_client_ip(request)

        # ۱. بررسی قرنطینه IP (در کسری از میلی‌ثانیه از حافظه Redis)
        if is_ip_jailed(ip):
            return JsonResponse(
                {
                    "detail": "دسترسی این آدرس موقتاً به دلیل فعالیت مشکوک مسدود شده است.",
                    "code": "ip_jailed",
                },
                status=403,
            )

        # ۲. بررسی الگوهای پویشگر و مهاجمین شناخته‌شده
        path_lower = request.path.lower()
        if any(bad in path_lower for bad in _BLOCKED_URI_PATTERNS):
            record_ip_offense(ip)
            return JsonResponse({"detail": "پیدا نشد."}, status=404)

        # ۳. کنترل طول URL و Query String (جلوگیری از DoS پردازشی)
        if len(request.path) > MAX_URI_LENGTH:
            return JsonResponse({"detail": "طول آدرس بیش از حد مجاز است."}, status=414)

        query_string = request.META.get("QUERY_STRING", "")
        if len(query_string) > MAX_QUERY_STRING_LENGTH:
            return JsonResponse({"detail": "پارامترهای آدرس خیلی طولانی است."}, status=414)

        # ۴. کنترل حجم بدنه درخواست قبل از اشغال رم سرور (ضد OOM)
        content_length_header = request.META.get("CONTENT_LENGTH")
        if content_length_header:
            try:
                content_length = int(content_length_header)
                if content_length > MAX_REQUEST_BODY_BYTES:
                    return JsonResponse(
                        {"detail": "حجم محتوای ارسالی بیش از سقف مجاز است."},
                        status=413,
                    )
            except (ValueError, TypeError):
                pass

        # ۵. کنترل سقف ترافیک سراسری IP
        if not path_lower.startswith(("/static/", "/media/")):
            global_rl = check_rate_limit(scope=RATE_SCOPE_GLOBAL_IP, identifier=ip)
            if not global_rl.allowed:
                resp = JsonResponse(
                    {"detail": "تعداد درخواست‌های سرور بیش از حد است. لطفاً چند لحظه دیگر امتحان کنید."},
                    status=429,
                )
                resp["Retry-After"] = str(global_rl.retry_after)
                return resp

        # ایجاد شناسه رهگیری یکتا برای هر درخواست
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        request.request_id = request_id

        response = self.get_response(request)
        response["X-Request-ID"] = request_id
        return response


class SlowRequestWatchdogMiddleware:
    """
    دیده‌بان کارایی: اندازه‌گیری زمان پاسخ و ثبت لاگ برای درخواست‌های کند.
    کمک می‌کند تا قبل از مسدود شدن ورکرها و بروز خطای ۵۰۲ ناشی از کندی دیتابیس یا سرویس‌های جانبی، مشکل شناسایی شود.
    """

    def __init__(self, get_response: Callable[[HttpRequest], HttpResponse]) -> None:
        self.get_response = get_response

    def __call__(self, request: HttpRequest) -> HttpResponse:
        start_time = time.monotonic()

        response = self.get_response(request)

        duration = time.monotonic() - start_time
        duration_ms = int(duration * 1000)

        if duration > SLOW_REQUEST_THRESHOLD_SECONDS and not request.path.startswith(("/static/", "/media/")):
            ip = get_client_ip(request)
            logger.warning(
                "SLOW REQUEST DETECTED: %s %s took %.3fs (IP: %s, Status: %d)",
                request.method,
                request.path,
                duration,
                ip,
                response.status_code,
            )

        response["X-Response-Time"] = f"{duration_ms}ms"
        return response


class SecurityHeadersMiddleware:
    """تزریق هدرهای استاندارد امنیتی برای محافظت از نشست‌ها و محتوای کاربران."""

    def __init__(self, get_response: Callable[[HttpRequest], HttpResponse]) -> None:
        self.get_response = get_response

    def __call__(self, request: HttpRequest) -> HttpResponse:
        response = self.get_response(request)
        response["X-Content-Type-Options"] = "nosniff"
        response["X-Frame-Options"] = "DENY"
        response["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        return response
