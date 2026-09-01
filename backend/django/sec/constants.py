"""ثابت‌های امنیتی — rate limit، آپلود، الگوهای مشکوک."""

from __future__ import annotations

from typing import Final

# ---------------------------------------------------------------------------
# Rate limiting (Redis) — (max_requests, window_seconds)
# ---------------------------------------------------------------------------

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

RATE_LIMITS: Final[dict[str, tuple[int, int]]] = {
    # فروشگاه عمومی
    RATE_SCOPE_CATALOG_PUBLIC: (120, 60),
    RATE_SCOPE_CATALOG_SEARCH: (30, 60),
    RATE_SCOPE_CATALOG_DETAIL: (90, 60),
    # پنل staff
    RATE_SCOPE_CATALOG_ADMIN_READ: (60, 60),
    RATE_SCOPE_CATALOG_ADMIN_WRITE: (20, 60),
    RATE_SCOPE_CATALOG_UPLOAD: (10, 60),
    # WebSocket
    RATE_SCOPE_WS_CONNECT: (20, 60),
    RATE_SCOPE_WS_MESSAGE: (60, 60),
    RATE_SCOPE_AUTH_LOGIN: (8, 60),
    RATE_SCOPE_AUTH_REGISTER: (5, 3600),
    RATE_SCOPE_AUTH_REFRESH: (30, 60),
}

RATE_LIMIT_CACHE_PREFIX: Final[str] = "sec:rl:"

# ---------------------------------------------------------------------------
# HTTP / query hardening
# ---------------------------------------------------------------------------

MAX_QUERY_STRING_LENGTH: Final[int] = 2048
MAX_QUERY_PARAM_VALUE_LENGTH: Final[int] = 256
MAX_USER_AGENT_LENGTH: Final[int] = 512

# ---------------------------------------------------------------------------
# Upload (تصاویر کاتالوگ)
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
