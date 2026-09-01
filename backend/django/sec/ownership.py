"""جلوگیری از دیدن و عوض کردن مال دیگران — هویت از نشست می‌آید، نه از شماره در آدرس."""

from __future__ import annotations

from typing import Any

from django.http import Http404
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.permissions import BasePermission

NOT_FOUND_MESSAGE = "پیدا نشد."
NOT_YOURS_MESSAGE = "این مورد مال شما نیست."

IDENTITY_KEYS = frozenset(
    {
        "id",
        "pk",
        "user",
        "user_id",
        "owner",
        "owner_id",
        "customer",
        "customer_id",
        "author",
        "author_id",
    }
)


def acting_user(request):
    """کسی که واقعاً وارد شده — نه عددی که در آدرس یا بدنه آمده."""
    user = getattr(request, "user", None)
    if user is None or not user.is_authenticated:
        return None
    return user


def owner_pk(obj: Any, owner_field: str = "user") -> int | None:
    if obj is None:
        return None
    if hasattr(obj, "pk") and owner_field == "self":
        return int(obj.pk)
    if owner_field == "self":
        return int(getattr(obj, "pk"))
    value = getattr(obj, owner_field, None)
    if value is None:
        return None
    return int(getattr(value, "pk", value))


def user_owns(obj: Any, user, *, owner_field: str = "user") -> bool:
    if user is None or not getattr(user, "is_authenticated", False):
        return False
    owned = owner_pk(obj, owner_field)
    if owned is None:
        return False
    return owned == int(user.pk)


def scope_queryset_to_user(
    queryset,
    user,
    *,
    owner_field: str = "user",
    staff_sees_all: bool = False,
):
    """لیست فقط مال همین کاربر. اگر وارد نشده، خالی."""
    if user is None or not getattr(user, "is_authenticated", False):
        return queryset.none()
    if staff_sees_all and (user.is_staff or user.is_superuser):
        return queryset
    return queryset.filter(**{owner_field: user})


def get_owned_or_404(
    queryset,
    user,
    *,
    lookup: dict,
    owner_field: str = "user",
    staff_sees_all: bool = False,
):
    """
    شیء غریبه را «پیدا نشد» می‌گوییم تا معلوم نشود اصلاً وجود دارد.
    """
    scoped = scope_queryset_to_user(
        queryset,
        user,
        owner_field=owner_field,
        staff_sees_all=staff_sees_all,
    )
    obj = scoped.filter(**lookup).first()
    if obj is None:
        raise NotFound(NOT_FOUND_MESSAGE)
    return obj


def require_owner(obj: Any, user, *, owner_field: str = "user") -> None:
    if not user_owns(obj, user, owner_field=owner_field):
        raise Http404(NOT_FOUND_MESSAGE)


def reject_foreign_identity(data: dict | None) -> None:
    """بدنه نباید هویت کس دیگری را قالب کند."""
    if not data:
        return
    keys = {str(key).lower() for key in data.keys()}
    if keys & IDENTITY_KEYS:
        raise PermissionDenied(NOT_YOURS_MESSAGE)


class IsOwner(BasePermission):
    """شیء باید مال کاربر جاری باشد. برای ویوست‌های دارای get_object."""

    message = NOT_FOUND_MESSAGE
    owner_field = "user"

    def has_permission(self, request, view) -> bool:
        return bool(acting_user(request))

    def has_object_permission(self, request, view, obj) -> bool:
        field = getattr(view, "owner_field", self.owner_field)
        if user_owns(obj, request.user, owner_field=field):
            return True
        raise NotFound(NOT_FOUND_MESSAGE)


class OwnedQuerysetMixin:
    """
    برای مدل‌هایی که فیلد صاحب دارند (مثل سفارش بعدی).
    get_queryset را محدود می‌کند؛ عدد مال دیگران ۴۰۴ می‌شود.
    """

    owner_field = "user"
    staff_sees_all = False

    def get_queryset(self):
        qs = super().get_queryset()
        return scope_queryset_to_user(
            qs,
            acting_user(self.request),
            owner_field=self.owner_field,
            staff_sees_all=self.staff_sees_all,
        )
