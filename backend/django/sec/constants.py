"""ثابت‌های امنیتی و کارایی سیستم — Rate Limiting, Anti-DDoS, Celery Queues, HTTP Hardening.

طراحی شده برای مقاومت در برابر بار ترافیکی بالا، جلوگیری از OOM و Nginx 502.
"""

from __future__ import annotations

from typing import Final

# ---------------------------------------------------------------------------
# Rate limiting scopes & Redis thresholds — (max_requests, window_seconds)
# ---------------------------------------------------------------------------

RATE_SCOPE_GLOBAL_IP: Final[str] = "global_ip"
RATE_SCOPE_CATALOG_PUBLIC: Final[str] = "catalog_public"
RATE_SCOPE_CATALOG_SEARCH: Final[str] = "catalog_search"
RATE_SCOPE_CATALOG_DETAIL: Final[str] = "catalog_detail"
RATE_SCOPE_CATALOG_ADMIN_READ: Final[str] = "catalog_admin_read"
RATE_SCOPE_CATALOG_ADMIN_WRITE: Final[str] = "catalog_admin_write"
RATE_SCOPE_CATALOG_UPLOAD: Final[str] = "catalog_upload"
RATE_SCOPE_WS_CONNECT: Final[str] = "ws_catalog_connect"
RATE_SCOPE_WS_MESSAGE: Final[str] = "ws_catalog_message"
RATE_SCOPE_AUTH_LOGIN: Final[str] = "auth_login"
RATE_SCOPE_AUTH_REGISTER: Final[str] = "auth_register"
RATE_SCOPE_AUTH_REFRESH: Final[str] = "auth_refresh"
RATE_SCOPE_PASSWORD_CHANGE: Final[str] = "auth_password_change"
RATE_SCOPE_HEALTHCHECK: Final[str] = "healthcheck"

RATE_LIMITS: Final[dict[str, tuple[int, int]]] = {
    # سقف عمومی هر IP در کل سایت (جلوگیری از حملات سیل‌آسا و L7 DDoS)
    RATE_SCOPE_GLOBAL_IP: (300, 60),
    # فروشگاه عمومی
    RATE_SCOPE_CATALOG_PUBLIC: (120, 60),
    RATE_SCOPE_CATALOG_SEARCH: (30, 60),
    RATE_SCOPE_CATALOG_DETAIL: (90, 60),
    # پنل کارکنان / مدیریت
    RATE_SCOPE_CATALOG_ADMIN_READ: (60, 60),
    RATE_SCOPE_CATALOG_ADMIN_WRITE: (20, 60),
    RATE_SCOPE_CATALOG_UPLOAD: (10, 60),
    # وب‌سوکت
    RATE_SCOPE_WS_CONNECT: (20, 60),
    RATE_SCOPE_WS_MESSAGE: (60, 60),
    # احراز هویت (محدودیت سفت و سخت روی IP)
    RATE_SCOPE_AUTH_LOGIN: (8, 60),
    RATE_SCOPE_AUTH_REGISTER: (5, 3600),
    RATE_SCOPE_AUTH_REFRESH: (30, 60),
    RATE_SCOPE_PASSWORD_CHANGE: (5, 300),
    # بررسی سلامت سرویس
    RATE_SCOPE_HEALTHCHECK: (120, 60),
}

RATE_LIMIT_CACHE_PREFIX: Final[str] = "sec:rl:"
IP_JAIL_CACHE_PREFIX: Final[str] = "sec:jail:ip:"
IP_OFFENSE_COUNT_PREFIX: Final[str] = "sec:offense:ip:"

# ---------------------------------------------------------------------------
# Dynamic IP Jailing & Anti-DDoS Thresholds
# ---------------------------------------------------------------------------

DEFAULT_IP_JAIL_SECONDS: Final[int] = 15 * 60  # 15 دقیقه مسدودی خودکار در لایه Redis
MAX_OFFENSES_BEFORE_JAIL: Final[int] = 8      # پس از 8 بار نقض محدودیت در پنجره کوتاه
OFFENSE_WINDOW_SECONDS: Final[int] = 10 * 60   # بازه 10 دقیقه‌ای ثبت تخلفات

# ---------------------------------------------------------------------------
# HTTP / Request Payload Hardening (جلوگیری از OOM با قطع بدنه درخواست‌های حجیم)
# ---------------------------------------------------------------------------

MAX_REQUEST_BODY_BYTES: Final[int] = 10 * 1024 * 1024  # سقف مجاز برای کل درخواست (10MB)
MAX_QUERY_STRING_LENGTH: Final[int] = 2048
MAX_QUERY_PARAM_VALUE_LENGTH: Final[int] = 256
MAX_USER_AGENT_LENGTH: Final[int] = 512
MAX_URI_LENGTH: Final[int] = 4096

# ---------------------------------------------------------------------------
# Upload (تصاویر و رسانه کاتالوگ)
# ---------------------------------------------------------------------------

MAX_IMAGE_UPLOAD_BYTES: Final[int] = 5 * 1024 * 1024  # 5 MB
ALLOWED_IMAGE_CONTENT_TYPES: Final[frozenset[str]] = frozenset(
    {"image/jpeg", "image/png", "image/webp"}
)
ALLOWED_IMAGE_EXTENSIONS: Final[frozenset[str]] = frozenset(
    {".jpg", ".jpeg", ".png", ".webp"}
)

# ---------------------------------------------------------------------------
# WebSocket
# ---------------------------------------------------------------------------

WS_MAX_PAYLOAD_KEYS: Final[int] = 8
WS_MAX_ACTION_LENGTH: Final[int] = 32

# ---------------------------------------------------------------------------
# Slow Request Watchdog (جلوگیری از انباشت Worker و خطای 502)
# ---------------------------------------------------------------------------

SLOW_REQUEST_THRESHOLD_SECONDS: Final[float] = 1.5  # ثبت هشدار برای درخواست‌های بالاتر از 1.5 ثانیه

# ---------------------------------------------------------------------------
# Celery Queue Names
# ---------------------------------------------------------------------------

CELERY_QUEUE_HIGH: Final[str] = "high_priority"
CELERY_QUEUE_DEFAULT: Final[str] = "default"
CELERY_QUEUE_LOW: Final[str] = "low_priority"
