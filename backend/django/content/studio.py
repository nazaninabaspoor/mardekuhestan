"""پنل مجله و نوشته‌های مرد کوهستان (جدا از پنل فروشگاه)."""

from unfold.sites import UnfoldAdminSite

from content.constants import CONTENT_PANEL_GROUPS


class ContentStudioAdminSite(UnfoldAdminSite):
    settings_name = "UNFOLD_STUDIO"
    site_header = "مجله مرد کوهستان"
    site_title = "مجله مرد کوهستان"
    index_title = "میز کار نوشته‌ها"
    site_url = "/"
    enable_nav_sidebar = True

    def has_permission(self, request):
        user = request.user
        if not user.is_authenticated or not user.is_staff:
            return False
        if user.is_superuser:
            return True
        return user.groups.filter(name__in=CONTENT_PANEL_GROUPS).exists()


content_studio = ContentStudioAdminSite(name="content_studio")
