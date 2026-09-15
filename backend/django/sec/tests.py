"""تست‌های جامع بخش امنیت، Rate Limiting، Middlewareها و سلامت سیستم (سطح Enterprise)."""

from __future__ import annotations

import time
from django.core.cache import cache
from django.http import HttpResponse, JsonResponse
from django.test import RequestFactory, TestCase, override_settings
from rest_framework.test import APITestCase

from sec.constants import (
    DEFAULT_IP_JAIL_SECONDS,
    MAX_QUERY_STRING_LENGTH,
    MAX_URI_LENGTH,
    RATE_SCOPE_GLOBAL_IP,
)
from sec.decorators import circuit_breaker, rate_limit
from sec.middleware import (
    DDoSMitigationMiddleware,
    SecurityHeadersMiddleware,
    SlowRequestWatchdogMiddleware,
)
from sec.rate_limit import (
    check_rate_limit,
    is_ip_jailed,
    jail_ip,
    record_ip_offense,
    unjail_ip,
)
from sec.tasks import cleanup_expired_security_jails_task, log_security_event_task

_TEST_CACHE = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "sec-test-cache",
    }
}


@override_settings(CACHES=_TEST_CACHE)
class RateLimitAndJailTests(TestCase):
    def setUp(self):
        cache.clear()

    def test_ip_jailing_and_unjailed(self):
        ip = "198.51.100.42"
        self.assertFalse(is_ip_jailed(ip))

        jail_ip(ip, duration_seconds=60)
        self.assertTrue(is_ip_jailed(ip))

        unjail_ip(ip)
        self.assertFalse(is_ip_jailed(ip))

    def test_repeated_offenses_lead_to_jail(self):
        ip = "203.0.113.88"
        # 7 بار نقض سقف هنوز jail نمی‌شود
        for _ in range(7):
            record_ip_offense(ip)
        self.assertFalse(is_ip_jailed(ip))

        # بار هشتم باید خودکار به قرنطینه برود
        jailed = record_ip_offense(ip)
        self.assertTrue(jailed)
        self.assertTrue(is_ip_jailed(ip))

    def test_sliding_window_rate_limiting(self):
        scope = "test_scope"
        ident = "test-client-1"

        # بررسی در سناریوی نرمال
        res1 = check_rate_limit(scope="auth_login", identifier=ident)
        self.assertTrue(res1.allowed)
        self.assertGreater(res1.limit, 0)


@override_settings(CACHES=_TEST_CACHE)
class MiddlewareSecurityTests(TestCase):
    def setUp(self):
        cache.clear()
        self.factory = RequestFactory()

    def test_ddos_middleware_blocks_jailed_ip(self):
        ip = "192.0.2.77"
        jail_ip(ip, duration_seconds=300)

        middleware = DDoSMitigationMiddleware(lambda req: HttpResponse("OK"))
        request = self.factory.get("/api/products/")
        request.META["REMOTE_ADDR"] = ip

        response = middleware(request)
        self.assertEqual(response.status_code, 403)

    def test_ddos_middleware_blocks_vulnerability_scanners(self):
        middleware = DDoSMitigationMiddleware(lambda req: HttpResponse("OK"))
        request = self.factory.get("/wp-admin/setup-config.php")
        request.META["REMOTE_ADDR"] = "192.0.2.99"

        response = middleware(request)
        self.assertEqual(response.status_code, 404)

    def test_ddos_middleware_blocks_oversized_query_string(self):
        middleware = DDoSMitigationMiddleware(lambda req: HttpResponse("OK"))
        long_query = "q=" + ("a" * (MAX_QUERY_STRING_LENGTH + 50))
        request = self.factory.get(f"/api/catalog/search/?{long_query}")

        response = middleware(request)
        self.assertEqual(response.status_code, 414)

    def test_request_id_injected(self):
        middleware = DDoSMitigationMiddleware(lambda req: HttpResponse("OK"))
        request = self.factory.get("/api/products/")
        response = middleware(request)

        self.assertIn("X-Request-ID", response)
        self.assertTrue(hasattr(request, "request_id"))

    def test_slow_request_watchdog_adds_response_time_header(self):
        middleware = SlowRequestWatchdogMiddleware(lambda req: HttpResponse("OK"))
        request = self.factory.get("/api/products/")
        response = middleware(request)

        self.assertIn("X-Response-Time", response)

    def test_security_headers_middleware(self):
        middleware = SecurityHeadersMiddleware(lambda req: HttpResponse("OK"))
        request = self.factory.get("/")
        response = middleware(request)

        self.assertEqual(response.headers.get("X-Content-Type-Options"), "nosniff")
        self.assertEqual(response.headers.get("X-Frame-Options"), "DENY")


@override_settings(CACHES=_TEST_CACHE)
class DecoratorsTests(TestCase):
    def setUp(self):
        cache.clear()
        self.factory = RequestFactory()

    def test_rate_limit_decorator_headers(self):
        @rate_limit(scope="auth_login")
        def sample_view(request):
            return JsonResponse({"status": "ok"})

        request = self.factory.post("/test-auth/")
        request.META["REMOTE_ADDR"] = "10.0.0.1"

        response = sample_view(request)
        self.assertEqual(response.status_code, 200)
        self.assertIn("X-RateLimit-Limit", response)
        self.assertIn("X-RateLimit-Remaining", response)

    def test_circuit_breaker_decorator(self):
        calls = 0

        @circuit_breaker(fallback_value="fallback", failure_threshold=2, recovery_time_seconds=60)
        def unreliable_service():
            nonlocal calls
            calls += 1
            raise ConnectionError("Gateway timeout")

        # تلاش اول: خطا و برگشت فال‌بک
        res1 = unreliable_service()
        self.assertEqual(res1, "fallback")
        self.assertEqual(calls, 1)

        # تلاش دوم: خطا و باز شدن مدار
        res2 = unreliable_service()
        self.assertEqual(res2, "fallback")
        self.assertEqual(calls, 2)

        # تلاش سوم: مدار باز است و تابع اصلاً اجرا نمی‌شود (محافظت از ورکر)
        res3 = unreliable_service()
        self.assertEqual(res3, "fallback")
        self.assertEqual(calls, 2)


@override_settings(CACHES=_TEST_CACHE)
class SystemHealthApiTests(APITestCase):
    def test_health_endpoint(self):
        response = self.client.get("/api/sec/health/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "healthy")

    def test_readiness_endpoint(self):
        response = self.client.get("/api/sec/ready/")
        self.assertIn(response.status_code, (200, 503))
        self.assertIn("checks", response.json())


@override_settings(CACHES=_TEST_CACHE)
class CeleryTasksTests(TestCase):
    def test_security_tasks_run(self):
        res1 = cleanup_expired_security_jails_task.apply()
        self.assertEqual(res1.result["status"], "success")

        res2 = log_security_event_task.apply(
            kwargs={"event_type": "suspicious_login", "ip": "1.2.3.4"}
        )
        self.assertEqual(res2.result["status"], "logged")
