"""سرو خروجی استاتیک فرانت (Next export) از داخل Django — برای هاست واحد Runflare."""

from __future__ import annotations

from pathlib import Path

from django.conf import settings
from django.http import FileResponse, HttpResponse, HttpResponseNotFound
from django.views.decorators.http import require_GET

# زیر ASGI نباید با FileResponse همگام کند شود (کندی / قطع nginx → 502)
_INLINE_MAX_BYTES = 4 * 1024 * 1024

_ASSET_SUFFIXES = {
    ".woff",
    ".woff2",
    ".ttf",
    ".otf",
    ".eot",
    ".mp4",
    ".webm",
    ".mov",
    ".js",
    ".css",
    ".map",
    ".json",
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".gif",
    ".svg",
    ".ico",
    ".avif",
    ".txt",
    ".xml",
    ".pdf",
}

_CONTENT_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".txt": "text/plain; charset=utf-8",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".otf": "font/otf",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".ico": "image/x-icon",
    ".avif": "image/avif",
}


def _candidate_roots() -> list[Path]:
    roots: list[Path] = []
    primary = Path(
        getattr(settings, "FRONTEND_STATIC_ROOT", settings.BASE_DIR / "public" / "web")
    )
    roots.append(primary)
    repo_web = Path(settings.BASE_DIR) / "public" / "web"
    if repo_web.resolve() != primary.resolve():
        roots.append(repo_web)
    return roots


def _landing_html() -> HttpResponse:
    return HttpResponse(
        """<!doctype html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>کوهستان سپید | مرد کوهستان</title>
  <style>
    body{margin:0;font-family:Tahoma,Arial,sans-serif;background:#005B48;color:#F4F0E8;
      min-height:100vh;display:flex;align-items:center;justify-content:center;padding:2rem}
    .box{max-width:36rem;text-align:center}
    h1{font-size:1.75rem;margin:0 0 1rem}
    p{line-height:1.9;opacity:.92}
    a{display:inline-block;margin:.5rem .35rem 0;padding:.75rem 1.25rem;border-radius:10px;
      background:#F4F0E8;color:#005B48;text-decoration:none;font-weight:700}
    .ghost{background:transparent;color:#F4F0E8;border:1px solid rgba(244,240,232,.45)}
  </style>
</head>
<body>
  <div class="box">
    <h1>مرد کوهستان</h1>
    <p>این راه سبز است. سرور فروشگاه بالا است و آمادهٔ اتصال فرانت.</p>
    <p>
      <a href="/admin/">ورود به پنل مدیریت</a>
      <a class="ghost" href="/api/products/">API محصولات</a>
    </p>
  </div>
</body>
</html>""",
        content_type="text/html; charset=utf-8",
    )


def _file_response(path: Path) -> HttpResponse:
    suffix = path.suffix.lower()
    content_type = _CONTENT_TYPES.get(suffix)
    size = path.stat().st_size

    # HTML/CSS/JS/فونت/عکس‌های کوچک را یک‌جا بخوان — زیر ASGI پایدار و سریع
    if size <= _INLINE_MAX_BYTES and suffix not in {".mp4", ".webm", ".mov"}:
        response: HttpResponse = HttpResponse(path.read_bytes(), content_type=content_type)
        response["Content-Length"] = str(size)
    else:
        response = FileResponse(path.open("rb"), content_type=content_type)

    if suffix in {".woff", ".woff2", ".ttf", ".otf", ".js", ".css"}:
        response["Cache-Control"] = "public, max-age=31536000, immutable"
    elif suffix in {".html", ".txt"}:
        response["Cache-Control"] = "public, max-age=60"
    elif suffix in {".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".ico", ".avif"}:
        response["Cache-Control"] = "public, max-age=86400"
    elif suffix in {".mp4", ".webm", ".mov"}:
        response["Cache-Control"] = "public, max-age=86400"
        response["Accept-Ranges"] = "bytes"

    return response


def _resolve_static(root: Path, rel: str) -> Path | None:
    """Next export بدون trailingSlash: /magazine → magazine.html"""
    try:
        root_resolved = root.resolve()
    except OSError:
        return None

    if not rel:
        index = root_resolved / "index.html"
        return index if index.is_file() else None

    base = (root_resolved / rel).resolve()
    if not str(base).startswith(str(root_resolved)):
        return None

    if base.is_file():
        return base

    html_file = Path(f"{base}.html")
    if html_file.is_file() and str(html_file.resolve()).startswith(str(root_resolved)):
        return html_file

    as_dir_index = base / "index.html"
    if as_dir_index.is_file():
        return as_dir_index

    return None


def _looks_like_asset(rel: str) -> bool:
    name = rel.rsplit("/", 1)[-1]
    if "." not in name:
        return False
    suffix = "." + name.rsplit(".", 1)[-1].lower()
    return suffix in _ASSET_SUFFIXES


def _looks_like_api(rel: str) -> bool:
    return rel == "api" or rel.startswith("api/")


@require_GET
def spa_serve(request, path: str = ""):
    """
    فایل‌های بیلد فرانت را سرو می‌کند.
    برای مسیرهای HTML بدون فایل، fallback به index؛ برای assetها و /api هرگز HTML برنگردان.
    """
    rel = (path or "").lstrip("/")
    hits: list[Path] = []

    for root in _candidate_roots():
        if not root.is_dir():
            continue
        found = _resolve_static(root, rel)
        if found is not None:
            hits.append(found)

    if hits:
        best = max(hits, key=lambda p: p.stat().st_size if p.is_file() else 0)
        return _file_response(best)

    if _looks_like_asset(rel) or _looks_like_api(rel):
        return HttpResponseNotFound("not found")

    for root in _candidate_roots():
        if not root.is_dir():
            continue
        try:
            fallback = root.resolve() / "index.html"
        except OSError:
            continue
        if fallback.is_file() and fallback.stat().st_size > 4096:
            return _file_response(fallback)

    return _landing_html()
