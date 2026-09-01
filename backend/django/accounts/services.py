"""ورود، ثبت‌نام، خروج و رمز — منطق دامنه."""

from __future__ import annotations

from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password
from django.core.cache import cache
from django.db import transaction
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.token_blacklist.models import (
    BlacklistedToken,
    OutstandingToken,
)
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.constants import (
    GENERIC_LOGIN_ERROR,
    INACTIVE_LOGIN_ERROR,
    LOGIN_FAIL_CACHE_PREFIX,
    LOGIN_FAIL_WINDOW_SECONDS,
    LOGIN_LOCK_CACHE_PREFIX,
    LOGIN_LOCK_SECONDS,
    LOGIN_MAX_FAILURES,
    ACCOUNT_LOCKED_ERROR,
)
from accounts.selectors import get_or_create_profile, get_user_by_email
from accounts.utils import username_from_email
from accounts.validators import (
    normalize_email,
    validate_account_email,
    validate_account_password,
    validate_display_name,
    validate_phone,
)

User = get_user_model()


class AuthError(Exception):
    def __init__(self, message: str, *, code: str = "auth_failed"):
        super().__init__(message)
        self.message = message
        self.code = code


def _fail_key(email: str) -> str:
    return f"{LOGIN_FAIL_CACHE_PREFIX}{normalize_email(email)}"


def _lock_key(email: str) -> str:
    return f"{LOGIN_LOCK_CACHE_PREFIX}{normalize_email(email)}"


def is_login_locked(email: str) -> bool:
    return bool(cache.get(_lock_key(email)))


def record_login_failure(email: str) -> None:
    key = _fail_key(email)
    try:
        added = cache.add(key, 1, timeout=LOGIN_FAIL_WINDOW_SECONDS)
        count = 1 if added else cache.incr(key)
    except Exception:
        return
    if count >= LOGIN_MAX_FAILURES:
        cache.set(_lock_key(email), 1, timeout=LOGIN_LOCK_SECONDS)
        cache.delete(key)


def clear_login_failures(email: str) -> None:
    cache.delete(_fail_key(email))
    cache.delete(_lock_key(email))


def issue_tokens(user) -> tuple[str, str]:
    refresh = RefreshToken.for_user(user)
    return str(refresh.access_token), str(refresh)


def blacklist_refresh(raw: str | None) -> None:
    if not raw:
        return
    try:
        token = RefreshToken(raw)
        token.blacklist()
    except TokenError:
        return


def blacklist_all_refresh_tokens(user) -> None:
    for outstanding in OutstandingToken.objects.filter(user=user):
        BlacklistedToken.objects.get_or_create(token=outstanding)


@transaction.atomic
def register_customer(
    *,
    email: str,
    password: str,
    display_name: str,
    phone: str = "",
):
    email = validate_account_email(email)
    display_name = validate_display_name(display_name)
    phone = validate_phone(phone)

    if get_user_by_email(email) is not None:
        raise AuthError("این ایمیل قبلاً ثبت شده است.", code="email_taken")

    user = User(username=username_from_email(email), email=email)
    validate_account_password(password, user=user)
    user.set_password(password)
    user.first_name = display_name[:150]
    user.is_staff = False
    user.is_superuser = False
    user.is_active = True
    user.save()

    profile = get_or_create_profile(user)
    profile.display_name = display_name
    profile.phone = phone
    profile.email_verified = False
    profile.save(update_fields=["display_name", "phone", "email_verified", "updated_at"])
    return user


def login_user(*, email: str, password: str):
    email = validate_account_email(email)
    if is_login_locked(email):
        raise AuthError(ACCOUNT_LOCKED_ERROR, code="locked")

    if not password:
        record_login_failure(email)
        raise AuthError(GENERIC_LOGIN_ERROR, code="invalid")

    user = get_user_by_email(email)
    if user is None:
        record_login_failure(email)
        raise AuthError(GENERIC_LOGIN_ERROR, code="invalid")

    if not user.is_active:
        record_login_failure(email)
        raise AuthError(INACTIVE_LOGIN_ERROR, code="invalid")

    if not user.check_password(password):
        record_login_failure(email)
        raise AuthError(GENERIC_LOGIN_ERROR, code="invalid")

    clear_login_failures(email)
    get_or_create_profile(user)
    return user


def change_password(user, *, current_password: str, new_password: str) -> None:
    if not check_password(current_password, user.password):
        raise AuthError("رمز فعلی درست نیست.", code="bad_password")
    validate_account_password(new_password, user=user)
    if current_password == new_password:
        raise AuthError("رمز جدید باید با رمز فعلی فرق داشته باشد.", code="same_password")
    user.set_password(new_password)
    user.save(update_fields=["password"])
    blacklist_all_refresh_tokens(user)


def update_profile(user, *, display_name: str | None = None, phone: str | None = None):
    profile = get_or_create_profile(user)
    fields = ["updated_at"]
    if display_name is not None:
        profile.display_name = validate_display_name(display_name)
        user.first_name = profile.display_name[:150]
        user.save(update_fields=["first_name"])
        fields.append("display_name")
    if phone is not None:
        profile.phone = validate_phone(phone)
        fields.append("phone")
    profile.save(update_fields=fields)
    return user
