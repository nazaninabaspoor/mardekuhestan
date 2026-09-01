"""Permission helpers امنیتی."""

from __future__ import annotations

from rest_framework.permissions import SAFE_METHODS, BasePermission

from sec.ownership import IsOwner

__all__ = ["SafeMethodsOnly", "IsOwner"]


class SafeMethodsOnly(BasePermission):
    """فقط GET/HEAD/OPTIONS — جلوگیری از mutation روی endpoint عمومی."""

    message = "این مسیر فقط خواندنی است."

    def has_permission(self, request, view) -> bool:
        return request.method in SAFE_METHODS
