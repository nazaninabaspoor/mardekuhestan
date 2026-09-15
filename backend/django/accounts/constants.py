"""ثابت‌های حساب کاربری و ورود."""

from __future__ import annotations

from typing import Final

DISPLAY_NAME_MAX_LENGTH: Final[int] = 80
EMAIL_MAX_LENGTH: Final[int] = 254
PASSWORD_MIN_LENGTH: Final[int] = 10
PHONE_MAX_LENGTH: Final[int] = 20

# کوکی‌ها — نام‌ها ثابت بمانند تا logout همان را پاک کند
ACCESS_COOKIE_NAME: Final[str] = "mk_access"
REFRESH_COOKIE_NAME: Final[str] = "mk_refresh"
REFRESH_COOKIE_PATH: Final[str] = "/api/auth/"

GENERIC_LOGIN_ERROR: Final[str] = "ایمیل یا رمز درست نیست."
ACCOUNT_LOCKED_ERROR: Final[str] = "چند بار پشت سر هم اشتباه شد. کمی بعد دوباره امتحان کنید."
INACTIVE_LOGIN_ERROR: Final[str] = "ایمیل یا رمز درست نیست."

LOGIN_FAIL_CACHE_PREFIX: Final[str] = "sec:auth:fail:"
LOGIN_LOCK_CACHE_PREFIX: Final[str] = "sec:auth:lock:"
LOGIN_MAX_FAILURES: Final[int] = 8
LOGIN_FAIL_WINDOW_SECONDS: Final[int] = 15 * 60
LOGIN_LOCK_SECONDS: Final[int] = 15 * 60
