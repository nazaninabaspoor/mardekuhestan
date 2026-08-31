"""Rate limiting مبتنی بر Redis (django cache) — sliding window تقریبی."""

from __future__ import annotations

import logging
import time
from dataclasses import dataclass

from django.core.cache import cache

from sec.constants import RATE_LIMIT_CACHE_PREFIX
from sec.utils import get_scope_limit, rate_limit_fail_closed

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class RateLimitResult:
    allowed: bool
    remaining: int
    retry_after: int
    limit: int


def _cache_key(scope: str, identifier: str, window: int) -> str:
    window_id = int(time.time()) // window
    safe_id = identifier.replace(" ", "_")[:128]
    return f"{RATE_LIMIT_CACHE_PREFIX}{scope}:{safe_id}:{window_id}"


def check_rate_limit(*, scope: str, identifier: str) -> RateLimitResult:
    """
    شمارنده fixed-window روی Redis.

    در production اگر Redis در دسترس نباشد و RATE_LIMIT_FAIL_CLOSED=True → درخواست رد می‌شود.
    """
    limit, window = get_scope_limit(scope)
    key = _cache_key(scope, identifier, window)

    try:
        added = cache.add(key, 1, timeout=window)
        if added:
            return RateLimitResult(
                allowed=True,
                remaining=max(limit - 1, 0),
                retry_after=0,
                limit=limit,
            )
        try:
            count = cache.incr(key)
        except ValueError:
            cache.set(key, 1, timeout=window)
            count = 1

        if count > limit:
            ttl = cache.ttl(key) if hasattr(cache, "ttl") else window
            retry = max(int(ttl) if ttl and ttl > 0 else window, 1)
            return RateLimitResult(
                allowed=False,
                remaining=0,
                retry_after=retry,
                limit=limit,
            )
        return RateLimitResult(
            allowed=True,
            remaining=max(limit - count, 0),
            retry_after=0,
            limit=limit,
        )
    except Exception:
        logger.exception("Rate limit check failed scope=%s", scope)
        if rate_limit_fail_closed():
            return RateLimitResult(
                allowed=False,
                remaining=0,
                retry_after=window,
                limit=limit,
            )
        return RateLimitResult(
            allowed=True,
            remaining=limit,
            retry_after=0,
            limit=limit,
        )


def enforce_rate_limit(*, scope: str, identifier: str) -> RateLimitResult:
    """همان check_rate_limit — نام صریح برای middleware/consumer."""
    return check_rate_limit(scope=scope, identifier=identifier)
