from rest_framework.permissions import BasePermission

from sec.ownership import IsOwner, OwnedQuerysetMixin

# سفارش‌ها مال مشتری‌اند؛ بعد از ساخت مدل از این‌ها استفاده می‌شود.
__all__ = ["IsOwner", "OwnedQuerysetMixin"]
