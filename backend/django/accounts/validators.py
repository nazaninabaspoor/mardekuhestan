"""اعتبارسنجی ورودی حساب — پیام ساده برای مشتری."""

from __future__ import annotations

import re

from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import validate_email as django_validate_email

from accounts.constants import (
    DISPLAY_NAME_MAX_LENGTH,
    EMAIL_MAX_LENGTH,
    PASSWORD_MIN_LENGTH,
    PHONE_MAX_LENGTH,
)

_PHONE_RE = re.compile(r"^09\d{9}$")


def normalize_email(value: str) -> str:
    return (value or "").strip().lower()


def validate_account_email(value: str) -> str:
    email = normalize_email(value)
    if not email:
        raise DjangoValidationError("ایمیل را بنویسید.")
    if len(email) > EMAIL_MAX_LENGTH:
        raise DjangoValidationError("ایمیل خیلی بلند است.")
    try:
        django_validate_email(email)
    except DjangoValidationError as exc:
        raise DjangoValidationError("این ایمیل درست به نظر نمی‌رسد.") from exc
    return email


def validate_display_name(value: str) -> str:
    name = (value or "").strip()
    if not name:
        raise DjangoValidationError("نام را بنویسید.")
    if len(name) > DISPLAY_NAME_MAX_LENGTH:
        raise DjangoValidationError("نام خیلی بلند است.")
    return name


def validate_account_password(password: str, *, user=None) -> str:
    if not password:
        raise DjangoValidationError("رمز را بنویسید.")
    if len(password) < PASSWORD_MIN_LENGTH:
        raise DjangoValidationError(
            f"رمز باید حداقل {PASSWORD_MIN_LENGTH} حرف باشد."
        )
    try:
        validate_password(password, user=user)
    except DjangoValidationError as exc:
        raise DjangoValidationError(
            [str(message) for message in exc.messages]
        ) from exc
    return password


def validate_phone(value: str) -> str:
    phone = (value or "").strip().replace(" ", "")
    if not phone:
        return ""
    if len(phone) > PHONE_MAX_LENGTH:
        raise DjangoValidationError("شماره موبایل خیلی بلند است.")
    if not _PHONE_RE.match(phone):
        raise DjangoValidationError("موبایل را مثل ۰۹۱۲۱۲۳۴۵۶۷ بنویسید.")
    return phone
