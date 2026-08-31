"""Catalog API permissions — public read, staff write."""

from __future__ import annotations

from rest_framework.permissions import SAFE_METHODS, AllowAny, BasePermission

from product.constants import PRODUCT_PANEL_GROUPS


class IsCatalogStaff(BasePermission):
    """Staff or members of product panel groups."""

    message = "دسترسی مدیریت کاتالوگ لازم است."

    def has_permission(self, request, view) -> bool:
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_staff:
            return True
        return user.groups.filter(name__in=PRODUCT_PANEL_GROUPS).exists()


class CatalogPublicRead(BasePermission):
    """Allow unauthenticated GET; mutations require catalog staff."""

    def has_permission(self, request, view) -> bool:
        if request.method in SAFE_METHODS:
            return True
        return IsCatalogStaff().has_permission(request, view)


# Explicit alias for public storefront endpoints.
AllowPublicCatalogRead = AllowAny
