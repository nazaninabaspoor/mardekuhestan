"""DRF throttles — wrapper روی sec.rate_limit."""

from __future__ import annotations

from rest_framework.throttling import BaseThrottle

from sec.rate_limit import check_rate_limit
from sec.utils import get_client_identifier


class SecRedisThrottle(BaseThrottle):
    """Throttle پایه — scope را در subclass یا view.throttle_scope تنظیم کن."""

    scope: str = "catalog_public"

    def get_scope(self, request, view) -> str:
        return getattr(view, "throttle_scope", self.scope)

    def get_ident(self, request, view) -> str:
        if request.user and request.user.is_authenticated:
            return f"user:{request.user.pk}"
        return get_client_identifier(request)

    def allow_request(self, request, view) -> bool:
        scope = self.get_scope(request, view)
        result = check_rate_limit(scope=scope, identifier=self.get_ident(request, view))
        self.rate_limit_result = result
        return result.allowed

    def wait(self) -> float | None:
        result = getattr(self, "rate_limit_result", None)
        if result is None or result.allowed:
            return None
        return float(result.retry_after)


class CatalogPublicThrottle(SecRedisThrottle):
    scope = "catalog_public"


class CatalogSearchThrottle(SecRedisThrottle):
    scope = "catalog_search"


class CatalogDetailThrottle(SecRedisThrottle):
    scope = "catalog_detail"


class CatalogAdminReadThrottle(SecRedisThrottle):
    scope = "catalog_admin_read"


class CatalogAdminWriteThrottle(SecRedisThrottle):
    scope = "catalog_admin_write"


class CatalogUploadThrottle(SecRedisThrottle):
    scope = "catalog_upload"
