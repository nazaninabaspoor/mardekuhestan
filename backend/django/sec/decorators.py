"""دکوراتورهای امنیتی و کنترل ترافیک (Rate Limiting, Circuit Breaker, Abuse Protection).

طراحی شده برای استفاده ساده روی Function Viewها، Class-Based Viewها و متدهای اختصاصی.
"""

from __future__ import annotations

import functools
import logging
import time
from typing import Any, Callable

from django.http import HttpRequest, HttpResponse, JsonResponse
from rest_framework.response import Response as DRFResponse

from sec.rate_limit import check_rate_limit, is_ip_jailed, record_ip_offense
from sec.utils import get_client_identifier, get_client_ip

logger = logging.getLogger(__name__)


def rate_limit(
    scope: str = "custom",
    *,
    limit: int | None = None,
    window: int | None = None,
    key_func: Callable[[HttpRequest], str] | None = None,
    block_on_breach: bool = False,
):
    """
    دکوراتور همه‌منظوره Rate Limiting برای ویوهای جنگو و DRF.

    نمونه استفاده:
    @rate_limit(scope="auth_login")
    def my_view(request): ...

    @method_decorator(rate_limit(scope="checkout"), name="dispatch")
    class CheckoutView(View): ...
    """
    def decorator(view_func: Callable[..., Any]) -> Callable[..., Any]:
        @functools.wraps(view_func)
        def wrapped(request: HttpRequest, *args: Any, **kwargs: Any) -> HttpResponse:
            # اگر آرگومان اول self باشد (در متدهای کلاس)
            actual_request = request
            if not isinstance(request, HttpRequest) and hasattr(args[0] if args else None, "META"):
                actual_request = args[0]

            ip = get_client_ip(actual_request)

            # بررسی سریع وضعیت قرنطینه
            if is_ip_jailed(ip):
                return JsonResponse(
                    {"detail": "دسترسی شما به دلیل ارسال درخواست‌های غیرمجاز موقتاً مسدود شده است."},
                    status=403,
                )

            # استخراج شناسه
            if key_func is not None:
                identifier = key_func(actual_request)
            else:
                identifier = get_client_identifier(actual_request)

            # بررسی Rate Limit
            result = check_rate_limit(scope=scope, identifier=identifier)

            if not result.allowed:
                if block_on_breach:
                    record_ip_offense(ip)

                response_data = {
                    "detail": "تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً کمی صبر کنید.",
                    "retry_after": result.retry_after,
                }
                resp = JsonResponse(response_data, status=429)
                resp["Retry-After"] = str(result.retry_after)
                resp["X-RateLimit-Limit"] = str(result.limit)
                resp["X-RateLimit-Remaining"] = "0"
                resp["X-RateLimit-Reset"] = str(int(time.time()) + result.retry_after)
                return resp

            response = view_func(request, *args, **kwargs)

            # افزودن هدرهای استاندارد RateLimit به پاسخ
            if isinstance(response, (HttpResponse, DRFResponse)):
                response["X-RateLimit-Limit"] = str(result.limit)
                response["X-RateLimit-Remaining"] = str(result.remaining)
                response["X-RateLimit-Reset"] = str(int(time.time()) + 60)

            return response

        return wrapped

    return decorator


def circuit_breaker(
    fallback_value: Any = None,
    failure_threshold: int = 5,
    recovery_time_seconds: int = 30,
):
    """
    Circuit Breaker برای توابع خارجی (مثل ارسال پیامک یا اتصال وب‌سرویس‌ها).
    در صورت بروز خطاهای پیاپی، مسیر را سریعاً قطع می‌کند تا Worker آزاد بماند و خطای ۵۰۲ ایجاد نشود.
    """
    failure_count = 0
    last_failure_time = 0.0
    is_open = False

    def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
        @functools.wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            nonlocal failure_count, last_failure_time, is_open
            now = time.time()

            if is_open:
                if now - last_failure_time > recovery_time_seconds:
                    is_open = False
                    failure_count = 0
                    logger.info("Circuit breaker half-open: probing service %s", func.__name__)
                else:
                    logger.warning("Circuit breaker OPEN for %s; skipping execution", func.__name__)
                    return fallback_value

            try:
                result = func(*args, **kwargs)
                failure_count = 0
                return result
            except Exception as exc:
                failure_count += 1
                last_failure_time = now
                logger.warning("Circuit breaker error in %s (%d/%d): %s", func.__name__, failure_count, failure_threshold, exc)
                if failure_count >= failure_threshold:
                    is_open = True
                    logger.error("Circuit breaker TRIPPED for %s", func.__name__)
                return fallback_value

        return wrapper

    return decorator
