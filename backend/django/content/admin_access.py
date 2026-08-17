"""قفل دسترسی ادمین فنی: تیم محتوا/سئو فقط استودیو را دارند."""

from __future__ import annotations

from django.contrib import admin
from django.shortcuts import redirect

from content.constants import CONTENT_PANEL_GROUPS


def is_restricted_content_user(user) -> bool:
    if not getattr(user, "is_authenticated", False) or not user.is_staff:
        return False
    if user.is_superuser:
        return False
    return user.groups.filter(name__in=CONTENT_PANEL_GROUPS).exists()


def install_content_admin_guards() -> None:
    """کاربران محتوا/سئو از /admin فنی به /studio هدایت می‌شوند."""

    if getattr(admin.AdminSite, "_mk_content_permission_guarded", False):
        return

    original_has_permission = admin.AdminSite.has_permission
    original_login = admin.AdminSite.login
    original_index = admin.AdminSite.index

    def has_permission(self, request):
        # پنل استودیو has_permission خودش را دارد؛ این قفل فقط روی AdminSite پایه است
        if self.name == "content_studio":
            return original_has_permission(self, request)
        if is_restricted_content_user(request.user):
            return False
        return original_has_permission(self, request)

    def login(self, request, extra_context=None):
        if self.name == "content_studio":
            return original_login(self, request, extra_context=extra_context)

        user = request.user
        if (
            user.is_authenticated
            and user.is_staff
            and is_restricted_content_user(user)
        ):
            return redirect("content_studio:index")

        response = original_login(self, request, extra_context=extra_context)
        if (
            request.method == "POST"
            and getattr(request, "user", None)
            and request.user.is_authenticated
            and is_restricted_content_user(request.user)
        ):
            return redirect("content_studio:index")
        return response

    def index(self, request, extra_context=None):
        if self.name != "content_studio" and is_restricted_content_user(request.user):
            return redirect("content_studio:index")
        return original_index(self, request, extra_context=extra_context)

    admin.AdminSite.has_permission = has_permission
    admin.AdminSite.login = login
    admin.AdminSite.index = index
    admin.AdminSite._mk_content_permission_guarded = True
