"""Rate Limiting و Anti-DDoS مبتنی بر Redis — Sliding Window Counter و IP Jailing خودکار.

ویژگی‌های کلیدی:
1. الگوریتم Sliding Window برای جلوگیری از حملات مرزی (Boundary Bursts).
2. تشخیص رفتارهای ناهنجار و مسدودسازی سریع در لایه Redis (IP Jailing) بدون فشار به دیتابیس.
3. مدیریت Fail-Safe برای جلوگیری از خطای ۵۰۲ در زمان افت موقت Redis.
"""

from __future__ import annotations

import logging
import time
from dataclasses import dataclass

from django.core.cache import cache

from sec.constants import (
    DEFAULT_IP_JAIL_SECONDS,
    IP_JAIL_CACHE_PREFIX,
    IP_OFFENSE_COUNT_PREFIX,
    MAX_OFFENSES_BEFORE_JAIL,
    OFFENSE_WINDOW_SECONDS,
    RATE_LIMIT_CACHE_PREFIX,
)
from sec.utils import get_scope_limit, rate_limit_fail_closed

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class RateLimitResult:
    allowed: bool
    remaining: int
    retry_after: int
    limit: int
    is_jailed: bool = False


# ---------------------------------------------------------------------------
# IP Jailing / Auto-ban (مسدودسازی خودکار مهاجمان در سطح Redis)
# ---------------------------------------------------------------------------

def _jail_key(ip: str) -> str:
    safe_ip = ip.replace(" ", "_").strip()[:64]
    return f"{IP_JAIL_CACHE_PREFIX}{safe_ip}"


def _offense_key(ip: str) -> str:
    safe_ip = ip.replace(" ", "_").strip()[:64]
    return f"{IP_OFFENSE_COUNT_PREFIX}{safe_ip}"


def is_ip_jailed(ip: str) -> bool:
    """بررسی مسدود بودن IP در کسری از میلی‌ثانیه."""
    if not ip or ip in ("127.0.0.1", "::1", "localhost"):
        return False
    try:
        return bool(cache.get(_jail_key(ip)))
    except Exception:
        return False


def jail_ip(ip: str, duration_seconds: int = DEFAULT_IP_JAIL_SECONDS) -> None:
    """قرنطینه کردن مستقیم یک IP متخلف برای مدت مشخص."""
    if not ip or ip in ("127.0.0.1", "::1", "localhost"):
        return
    try:
        cache.set(_jail_key(ip), int(time.time()), timeout=duration_seconds)
        logger.warning("IP %s jailed in Redis for %d seconds due to abusive traffic", ip, duration_seconds)
    except Exception as exc:
        logger.error("Failed to jail IP %s: %s", ip, exc)


def unjail_ip(ip: str) -> None:
    """آزادسازی IP از قرنطینه."""
    try:
        cache.delete(_jail_key(ip))
        cache.delete(_offense_key(ip))
    except Exception:
        pass


def record_ip_offense(ip: str) -> bool:
    """
    ثبت نقض محدودیت برای IP.
    اگر تعداد تخلفات در بازه مشخص از سقف بگذرد، IP خودکار قرنطینه (Jail) می‌شود.
    خروجی: True در صورت رفتن به قرنطینه.
    """
    if not ip or ip in ("127.0.0.1", "::1", "localhost"):
        return False

    key = _offense_key(ip)
    try:
        added = cache.add(key, 1, timeout=OFFENSE_WINDOW_SECONDS)
        count = 1 if added else cache.incr(key)
    except Exception:
        return False

    if count >= MAX_OFFENSES_BEFORE_JAIL:
        jail_ip(ip, DEFAULT_IP_JAIL_SECONDS)
        try:
            cache.delete(key)
        except Exception:
            pass
        return True
    return False


# ---------------------------------------------------------------------------
# Sliding Window Rate Limiting
# ---------------------------------------------------------------------------

def _window_keys(scope: str, identifier: str, window: int) -> tuple[str, str, float]:
    """تولید کلید بازه جاری و بازه قبلی برای تخمین دقیق پنجره لغزان."""
    now = time.time()
    current_window_id = int(now) // window
    previous_window_id = current_window_id - 1
    safe_id = identifier.replace(" ", "_")[:128]

    curr_key = f"{RATE_LIMIT_CACHE_PREFIX}{scope}:{safe_id}:{current_window_id}"
    prev_key = f"{RATE_LIMIT_CACHE_PREFIX}{scope}:{safe_id}:{previous_window_id}"
    time_into_curr = now % window
    weight_prev = 1.0 - (time_into_curr / float(window))
    return curr_key, prev_key, weight_prev


def check_rate_limit(*, scope: str, identifier: str) -> RateLimitResult:
    """
    بررسی محدودیت درخواست با الگوریتم Sliding Window.
    ترکیبی از شمارنده بازه فعلی + درصد وزنی بازه قبلی برای رفع باگ مرزی (Bursting).
    """
    limit, window = get_scope_limit(scope)
    curr_key, prev_key, weight_prev = _window_keys(scope, identifier, window)

    try:
        # دریافت تعداد درخواست‌های بازه قبلی
        prev_count = cache.get(prev_key) or 0
        if not isinstance(prev_count, (int, float)):
            prev_count = 0

        # ثبت درخواست جدید در بازه جاری با timeout دو برابر طول بازه
        added = cache.add(curr_key, 1, timeout=window * 2)
        if added:
            curr_count = 1
        else:
            try:
                curr_count = cache.incr(curr_key)
            except ValueError:
                cache.set(curr_key, 1, timeout=window * 2)
                curr_count = 1

        # تخمین دقیق تعداد درخواست‌ها در پنجره لغزان
        estimated_count = int(curr_count + (prev_count * weight_prev))

        if estimated_count > limit:
            retry_after = max(int(window - (time.time() % window)), 1)
            # ثبت تخلف روی IP اگر درخواست مربوط به اینترنت عمومی است
            if not scope.startswith("catalog_admin"):
                ip_part = identifier.split(":")[0]
                record_ip_offense(ip_part)

            return RateLimitResult(
                allowed=False,
                remaining=0,
                retry_after=retry_after,
                limit=limit,
                is_jailed=False,
            )

        return RateLimitResult(
            allowed=True,
            remaining=max(limit - estimated_count, 0),
            retry_after=0,
            limit=limit,
            is_jailed=False,
        )

    except Exception:
        logger.exception("Rate limit check failed for scope=%s id=%s", scope, identifier)
        if rate_limit_fail_closed():
            return RateLimitResult(
                allowed=False,
                remaining=0,
                retry_after=window,
                limit=limit,
            )
        # در حالت Fail-Open دسترسی قطع نمی‌شود تا پلتفرم خطای ۵۰۲ ندهد
        return RateLimitResult(
            allowed=True,
            remaining=limit,
            retry_after=0,
            limit=limit,
        )


def enforce_rate_limit(*, scope: str, identifier: str) -> RateLimitResult:
    """نام صریح برای فراخوانی مستقیم در middlewareها یا consumerها."""
    return check_rate_limit(scope=scope, identifier=identifier)
