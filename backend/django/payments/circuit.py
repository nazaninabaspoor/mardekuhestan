"""Circuit breaker درگاه پرداخت — وضعیت در Redis/کش مشترک است تا همهٔ ورکرها یک مدار ببینند.

قطع شدن زرین‌پال/پارسیان نباید صف Celery را پر کند یا درخواست را آویزان بگذارد.
"""

from __future__ import annotations

import logging

from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger(__name__)


class CircuitOpen(Exception):
    """مدار باز است؛ تماس با درگاه انجام نمی‌شود."""


class GatewayTransportError(Exception):
    """قطع شبکه / تایم‌اوت / خطای ۵xx درگاه."""


def _fail_key(gateway: str) -> str:
    return f"pay:cb:fail:{gateway}"


def _open_key(gateway: str) -> str:
    return f"pay:cb:open:{gateway}"


def _threshold() -> int:
    return int(getattr(settings, "PAYMENT_CIRCUIT_FAILURE_THRESHOLD", 3))


def _open_seconds() -> int:
    return int(getattr(settings, "PAYMENT_CIRCUIT_OPEN_SECONDS", 45))


def is_open(gateway: str) -> bool:
    try:
        return bool(cache.get(_open_key(gateway)))
    except Exception:
        return False


def record_success(gateway: str) -> None:
    try:
        cache.delete(_fail_key(gateway))
        cache.delete(_open_key(gateway))
    except Exception:
        pass


def record_failure(gateway: str) -> None:
    try:
        current = int(cache.get(_fail_key(gateway)) or 0) + 1
        cache.set(_fail_key(gateway), current, timeout=60)
        if current >= _threshold():
            cache.set(_open_key(gateway), 1, timeout=_open_seconds())
            logger.error("Payment circuit OPEN for %s after %s failures", gateway, current)
    except Exception as exc:
        logger.warning("Could not record payment circuit failure: %s", exc)


def guard(gateway: str) -> None:
    if is_open(gateway):
        logger.warning("Payment circuit open; skipping %s so workers stay free", gateway)
        raise CircuitOpen(gateway)
