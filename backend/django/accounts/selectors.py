"""خواندن کاربر برای ورود و پروفایل."""

from __future__ import annotations

from django.contrib.auth import get_user_model
from django.db.models import QuerySet

from accounts.models import CustomerProfile
from accounts.validators import normalize_email

User = get_user_model()


def get_user_by_email(email: str) -> User | None:
    normalized = normalize_email(email)
    if not normalized:
        return None
    return (
        User.objects.filter(email__iexact=normalized)
        .order_by("id")
        .first()
    )


def get_or_create_profile(user) -> CustomerProfile:
    profile, _created = CustomerProfile.objects.get_or_create(user=user)
    return profile


def users_with_profile() -> QuerySet:
    return User.objects.select_related("customer_profile")
