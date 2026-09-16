"""سرو خروجی استاتیک فرانت (Next export) از داخل Django — برای هاست واحد Runflare."""

from __future__ import annotations

from pathlib import Path

from django.conf import settings
from django.http import FileResponse, Http404, HttpResponse
from django.views.decorators.http import require_GET


def _web_root() -> Path:
    return Path(getattr(settings, "FRONTEND_STATIC_ROOT", settings.BASE_DIR / "public" / "web"))


@require_GET
def spa_serve(request, path: str = ""):
    """
    فایل‌های بیلد فرانت را سرو می‌کند.
    مسیرهای ناشناخته → index.html (برای client-side routing).
    """
    root = _web_root().resolve()
    if not root.is_dir():
        return HttpResponse(
            "<!doctype html><meta charset=utf-8>"
            "<title>مرد کوهستان</title>"
            "<body style='font-family:tahoma;background:#0b3d2e;color:#fff;padding:2rem'>"
            "<h1>مرد کوهستان</h1>"
            "<p>بک‌اند بالا است. خروجی فرانت هنوز در <code>public/web</code> قرار نگرفته.</p>"
            "<p><a style='color:#cfe' href='/admin/'>ورود به ادمین</a></p>"
            "</body>",
            content_type="text/html; charset=utf-8",
        )

    rel = (path or "").lstrip("/")
    candidate = (root / rel).resolve() if rel else root / "index.html"

    # جلوگیری از path traversal
    if not str(candidate).startswith(str(root)):
        raise Http404()

    if candidate.is_file():
        return FileResponse(candidate.open("rb"))

    # Next export: مسیرهای بدون پسوند → index.html همان پوشه یا ریشه
    as_dir_index = candidate / "index.html"
    if as_dir_index.is_file():
        return FileResponse(as_dir_index.open("rb"))

    fallback = root / "index.html"
    if fallback.is_file():
        return FileResponse(fallback.open("rb"))

    raise Http404()
