"""کوکی توکن و نام کاربری از روی ایمیل."""

from __future__ import annotations

import hashlib
from datetime import timedelta

from django.conf import settings
from django.http import HttpResponse
from rest_framework_simplejwt.settings import api_settings as jwt_api_settings

from accounts.constants import (
    ACCESS_COOKIE_NAME,
    REFRESH_COOKIE_NAME,
    REFRESH_COOKIE_PATH,
)


def username_from_email(email: str) -> str:
    """User.username حداکثر ۱۵۰ حرف است؛ ایمیل بلند را کوتاه و یکتا می‌کنیم."""
    email = (email or "").strip().lower()
    if len(email) <= 150:
        return email
    digest = hashlib.sha256(email.encode("utf-8")).hexdigest()[:10]
    local = email.split("@", 1)[0][:130]
    return f"{local}.{digest}"


def _cookie_secure() -> bool:
    if getattr(settings, "AUTH_COOKIE_SECURE", None) is not None:
        return bool(settings.AUTH_COOKIE_SECURE)
    return not settings.DEBUG


def _cookie_samesite() -> str:
    value = getattr(settings, "AUTH_COOKIE_SAMESITE", "Lax") or "Lax"
    if str(value).lower() == "none":
        return "None"
    return str(value)


def _cookie_common() -> dict:
    samesite = _cookie_samesite()
    secure = _cookie_secure()
    if samesite == "None":
        secure = True
    kwargs: dict = {
        "httponly": True,
        "secure": secure,
        "samesite": samesite,
    }
    domain = getattr(settings, "AUTH_COOKIE_DOMAIN", None)
    if domain:
        kwargs["domain"] = domain
    return kwargs


def _age(lifetime: timedelta) -> int:
    return max(int(lifetime.total_seconds()), 1)


def set_auth_cookies(response: HttpResponse, *, access: str, refresh: str) -> None:
    common = _cookie_common()
    response.set_cookie(
        ACCESS_COOKIE_NAME,
        access,
        max_age=_age(jwt_api_settings.ACCESS_TOKEN_LIFETIME),
        path="/",
        **common,
    )
    response.set_cookie(
        REFRESH_COOKIE_NAME,
        refresh,
        max_age=_age(jwt_api_settings.REFRESH_TOKEN_LIFETIME),
        path=REFRESH_COOKIE_PATH,
        **common,
    )


def clear_auth_cookies(response: HttpResponse) -> None:
    common = _cookie_common()
    response.delete_cookie(
        ACCESS_COOKIE_NAME,
        path="/",
        samesite=common.get("samesite"),
        domain=common.get("domain"),
    )
    response.delete_cookie(
        REFRESH_COOKIE_NAME,
        path=REFRESH_COOKIE_PATH,
        samesite=common.get("samesite"),
        domain=common.get("domain"),
    )
