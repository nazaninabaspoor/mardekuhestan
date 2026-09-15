"""Mixins امنیتی برای viewهای کاتالوگ."""

from __future__ import annotations

from rest_framework.permissions import AllowAny, IsAuthenticated

from product.permissions import IsCatalogStaff
from product.request_guards import guard_catalog_request
from sec.permissions import SafeMethodsOnly
from sec.throttling import (
    CatalogAdminReadThrottle,
    CatalogAdminWriteThrottle,
    CatalogDetailThrottle,
    CatalogPublicThrottle,
    CatalogSearchThrottle,
    CatalogUploadThrottle,
)


class CatalogPublicReadMixin:
    """فروشگاه — فقط GET + rate limit + guard query."""

    permission_classes = [AllowAny, SafeMethodsOnly]
    throttle_classes = [CatalogPublicThrottle]
    throttle_scope = "catalog_public"
    http_method_names = ["get", "head", "options"]

    def initial(self, request, *args, **kwargs):
        guard_catalog_request(request)
        super().initial(request, *args, **kwargs)


class CatalogSearchMixin(CatalogPublicReadMixin):
    throttle_classes = [CatalogSearchThrottle]
    throttle_scope = "catalog_search"


class CatalogDetailMixin(CatalogPublicReadMixin):
    throttle_classes = [CatalogDetailThrottle]
    throttle_scope = "catalog_detail"


class CatalogAdminMixin:
    """پنل manage — JWT + staff + throttle جدا برای read/write."""

    permission_classes = [IsAuthenticated, IsCatalogStaff]
    throttle_classes = [CatalogAdminReadThrottle]
    throttle_scope = "catalog_admin_read"
    http_method_names = ["get", "post", "put", "patch", "delete", "head", "options"]

    def initial(self, request, *args, **kwargs):
        guard_catalog_request(request)
        super().initial(request, *args, **kwargs)

    def get_throttles(self):
        write_actions = {"create", "update", "partial_update", "destroy"}
        action = getattr(self, "action", None)
        if action in write_actions:
            if action == "create" and getattr(self, "upload_throttle_on_create", False):
                return [CatalogUploadThrottle()]
            return [CatalogAdminWriteThrottle()]
        return [CatalogAdminReadThrottle()]
