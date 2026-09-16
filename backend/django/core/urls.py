from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.sitemaps.views import sitemap
from django.urls import include, path, re_path

from content.sitemaps import ArticleSitemap
from content.studio import content_studio
from core.spa import spa_serve

admin.site.site_header = "مرد کوهستان"
admin.site.site_title = "مدیریت مرد کوهستان"
admin.site.index_title = "خانه مدیریت"

sitemaps = {
    "articles": ArticleSitemap,
}

urlpatterns = [
    path("admin/", admin.site.urls),
    path("studio/", content_studio.urls),
    path("ckeditor5/", include("django_ckeditor_5.urls")),
    path(
        "sitemap.xml",
        sitemap,
        {"sitemaps": sitemaps},
        name="django.contrib.sitemaps.views.sitemap",
    ),
    # Auth / security
    path("api/auth/", include("accounts.urls")),
    path("api/sec/", include("sec.urls")),
    # Commerce & catalog
    path("api/products/", include("product.urls")),
    path("api/inventory/", include("inventory.urls")),
    path("api/orders/", include("orders.urls")),
    path("api/payments/", include("payments.urls")),
    path("api/logistics/", include("logistics.urls")),
    # Brand & ops
    path("api/content/", include("content.urls")),
    path("api/notifications/", include("notifications.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# فرانت استاتیک — آخر لیست تا /api و /admin را نگیرد
if getattr(settings, "SERVE_FRONTEND_FROM_DJANGO", True):
    urlpatterns += [
        re_path(r"^(?P<path>.*)$", spa_serve, name="spa"),
    ]
