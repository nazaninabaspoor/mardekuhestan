"""ابزارهای امنیتی — IP کلاینت، کلید rate limit."""

from __future__ import annotations

import hashlib
from typing import TYPE_CHECKING

from django.conf import settings

from sec.constants import MAX_USER_AGENT_LENGTH

if TYPE_CHECKING:
    from django.http import HttpRequest


def get_client_ip(request: HttpRequest) -> str:
    """
    IP واقعی کلاینت — فقط وقتی TRUST_X_FORWARDED_FOR فعال است به X-Forwarded-For اعتماد می‌کند.
    """
    remote = request.META.get("REMOTE_ADDR", "") or "0.0.0.0"
    if not getattr(settings, "TRUST_X_FORWARDED_FOR", False):
        return remote.strip()

    forwarded = request.META.get("HTTP_X_FORWARDED_FOR", "")
    if not forwarded:
        return remote.strip()
    # اولین IP در زنجیره = کلاینت اصلی (پشت reverse proxy معتبر)
    return forwarded.split(",")[0].strip() or remote.strip()


def get_client_identifier(request: HttpRequest) -> str:
    """شناسه پایدار برای throttle — IP + هش کوتاه user-agent (اختیاری)."""
    ip = get_client_ip(request)
    user_agent = (request.META.get("HTTP_USER_AGENT") or "")[:MAX_USER_AGENT_LENGTH]
    if not user_agent:
        return ip
    ua_hash = hashlib.sha256(user_agent.encode("utf-8")).hexdigest()[:12]
    return f"{ip}:{ua_hash}"


def get_scope_limit(scope: str) -> tuple[int, int]:
    from sec.constants import RATE_LIMITS

    return RATE_LIMITS.get(scope, (60, 60))


def rate_limit_fail_closed() -> bool:
    return getattr(settings, "RATE_LIMIT_FAIL_CLOSED", not settings.DEBUG)
