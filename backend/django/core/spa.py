"""سرو خروجی استاتیک فرانت (Next export) از داخل Django — برای هاست واحد Runflare."""

from __future__ import annotations

import asyncio
import re
from pathlib import Path

from django.conf import settings
from django.http import HttpResponse, HttpResponseNotFound, StreamingHttpResponse
from django.views.decorators.http import require_GET

# زیر ASGI نباید FileResponse همگام استفاده شود (کندی / قطع nginx → 502)
_INLINE_MAX_BYTES = 8 * 1024 * 1024
_STREAM_CHUNK = 64 * 1024

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

# این استایل روی HTML تزریق می‌شود تا حتی با بیلد قدیمی، موبایل و مجله درست باشند.
_CRITICAL_CSS = """<style id="mk-ship-fix">
html,body,.site-canvas,main,.home-v2,.landing--v2{max-width:100%!important;overflow-x:clip!important}
.landing--v2,.landing-v2-stage,.landing-v2-media{overflow:hidden!important;max-width:100%!important}
.landing--v2 .landing-v2-video{width:100%!important;height:100%!important;max-width:100%!important;inset:0!important}
html:has(.mk-mag),html:has(.mk-mag) body,html:has(.mk-mag) .site-canvas{background:#005B48!important}
html:has(.mk-read),html:has(.mk-read) body,html:has(.mk-read) .site-canvas{background:#F4F0E8!important}
.site-canvas:has(.mk-mag)::before,.site-canvas:has(.mk-read)::before{display:none!important;content:none!important;background:none!important}
.mk-mag{background:#005B48!important}
.mk-mag:has(.mk-read){background:#F4F0E8!important;color:#1D1D1B!important}
html.is-home-v2,html.is-home-v2 body,.is-home-v2,.is-home-v2 body,.is-home-v2 .site-canvas,.is-home-v2 .home-v2,html.is-home-v2 main{background:#0a5540!important}
.is-home-v2 .home-v2 > *{margin-top:0!important;margin-bottom:0!important}
.v2-bookcase{background-color:#0a5540!important}
.v2-bookcase-scene{background-color:#0a5540!important}
.v2-bookcase-scene--magazine{background-image:url(/brand/v2/bookcase-morning-read-daylight.png)!important;background-size:cover!important;background-position:16% 48%!important;background-repeat:no-repeat!important}
.v2-bookcase-scene--catalog{background-image:url(/brand/v2/bookcase-morning-work-daylight.png)!important;background-size:cover!important;background-position:18% 58%!important;background-repeat:no-repeat!important}
.v2-bookcase-scene-img{display:block!important;position:absolute!important;inset:0!important;width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;object-fit:cover!important}
.v2-bookcase-scene--magazine .v2-bookcase-scene-img{object-position:16% 48%!important}
.v2-bookcase-scene--catalog .v2-bookcase-scene-img{object-position:18% 58%!important}
.v2-bookcase-scene-veil{background-color:transparent!important;background-image:linear-gradient(180deg,rgb(10 85 64 / 16%) 0%,transparent 26%,transparent 72%,rgb(10 85 64 / 14%) 100%)!important}
.v2-unveil canvas{position:absolute!important;inset:0!important;z-index:3!important;width:100%!important;height:100%!important}
.profile-coverflow-title,.profile-coverflow-sub,.profile-scene-kicker{position:relative;z-index:8}
.profile-coverflow-sub{margin-bottom:clamp(28px,5vh,64px)}
.profile-coverflow-stage{padding-top:clamp(36px,6vh,88px)}
@media (max-width:980px){
  .site-header--v2 .v2-primary-nav{display:none!important}
  .site-header--v2 .v2-menu-toggle{display:flex!important}
  .is-home-v2 .for-home--v2.kitchen-ui{height:auto!important;min-height:0!important;max-height:none!important;overflow:hidden!important}
  .is-home-v2 .kui-plate-wrap{transform:none!important}
  .is-home-v2 .kui-plate{overflow:hidden!important;width:min(72vw,260px)!important;max-width:100%!important}
  .v2-unveil{min-height:0!important;height:auto!important;overflow:hidden!important;background:#0a5540!important}
  .v2-unveil .v2-section-edge{display:none!important}
  .v2-unveil-copy{position:absolute!important;top:0!important;right:0!important;left:0!important;z-index:4!important;width:min(720px,calc(100% - 28px))!important;margin:0 auto!important;padding:.75rem 0 0!important}
  .v2-unveil-stage{position:relative!important;inset:auto!important;width:100%!important;height:auto!important;aspect-ratio:16/10!important;overflow:hidden!important}
  .v2-unveil canvas{position:absolute!important;inset:0!important;z-index:3!important;width:100%!important;height:100%!important}
  .is-home-v2 .home-v2 > div,.is-home-v2 .v2-home-lazy,.is-home-v2 .v2-home-lazy.is-ready{min-height:0!important;height:auto!important;background:transparent!important}
  .is-home-v2 .v2-bookcase,.is-home-v2 .v2-bookcase--magazine,.is-home-v2 .v2-bookcase--catalog{min-height:0!important;height:auto!important;padding-block:.85rem .45rem!important;margin:0!important;overflow-x:clip!important;overflow-y:visible!important;background:#0a5540!important}
  .is-home-v2 .v2-bookcase-layout,.is-home-v2 .v2-bookcase-shell,.is-home-v2 .v2-bookcase-stage{min-height:0!important;height:auto!important}
  .is-home-v2 .v2-bookcase-scene--magazine{background-image:url(/brand/v2/bookcase-morning-read-daylight.png)!important;background-size:210% 210%!important;background-position:6% 42%!important;background-repeat:no-repeat!important}
  .is-home-v2 .v2-bookcase-scene-veil{background-color:transparent!important;background-image:linear-gradient(180deg,rgb(10 85 64 / 12%) 0%,transparent 28%,transparent 70%,rgb(10 85 64 / 16%) 100%)!important}
  .is-home-v2 .v2-bookcase-scene--catalog{background-image:url(/brand/v2/bookcase-morning-work-daylight.png)!important;background-size:185% 185%!important;background-position:8% 38%!important;background-repeat:no-repeat!important}
  .is-home-v2 .v2-bookcase-scene--magazine .v2-bookcase-scene-img{width:210%!important;height:210%!important;max-width:none!important;max-height:none!important;left:-8%!important;top:-28%!important;object-fit:cover!important;object-position:6% 42%!important}
  .is-home-v2 .v2-bookcase-scene--catalog .v2-bookcase-scene-img{width:185%!important;height:185%!important;max-width:none!important;max-height:none!important;left:-6%!important;top:-14%!important;object-fit:cover!important;object-position:8% 38%!important}
  .is-home-v2 .v2-section-edge{display:block!important;pointer-events:none!important}
  .is-home-v2 .v2-section-edge--top{height:96px!important;top:0!important;background:linear-gradient(to bottom,#0a5540 0%,rgb(10 85 64 / 78%) 28%,rgb(10 85 64 / 28%) 62%,transparent 100%)!important}
  .is-home-v2 .v2-section-edge--bottom{height:88px!important;bottom:0!important;background:linear-gradient(to bottom,transparent 0%,rgb(10 85 64 / 28%) 38%,rgb(10 85 64 / 78%) 72%,#0a5540 100%)!important}
  .is-home-v2 .v2-bookcase--catalog .v2-section-edge--top,.is-home-v2 .v2-bookcase--magazine .v2-section-edge--top{height:56px!important;background:linear-gradient(to bottom,rgb(10 85 64 / 32%) 0%,transparent 100%)!important}
  .is-home-v2 .v2-bookcase--catalog .v2-section-edge--bottom,.is-home-v2 .v2-bookcase--magazine .v2-section-edge--bottom{height:52px!important;background:linear-gradient(to bottom,transparent 0%,rgb(10 85 64 / 28%) 100%)!important}
  img,video,svg{max-width:100%!important}
  .v2-bookcase-scene-img{max-width:none!important;max-height:none!important}
  .landing--v2,.is-home-v2 .site-canvas > main .landing--v2{margin-top:0!important}
  .landing--v2 .landing-v2-stage{min-height:min(68svh,560px)!important;height:min(68svh,560px)!important;aspect-ratio:auto!important}
  .landing--v2 .landing-v2-shell{min-height:0!important;padding-top:0!important;padding-bottom:0!important}
  .landing--v2 .landing-v2-dock{bottom:14px!important;top:auto!important;left:12px!important;right:12px!important}
  .landing--v2 .landing-v2-video{object-fit:cover!important;object-position:center 42%!important;height:100%!important}
  .landing-v2-playlist-track{justify-content:center!important;width:100%!important;max-width:100%!important}
  .is-home-v2 .site-footer{position:relative!important;overflow:hidden!important;margin-top:0!important;background:#0a5540!important}
  .is-home-v2 .footer-scene-art,.is-home-v2 .footer-scene img{margin-bottom:0!important;width:100%!important;height:min(78svh,640px)!important;object-fit:cover!important;object-position:76% 58%!important}
  .is-home-v2 .footer-body{position:absolute!important;inset:0!important;top:0!important;bottom:0!important;height:100%!important;min-height:100%!important;display:flex!important;flex-direction:column!important;justify-content:space-between!important;padding:14% 0 0!important;background:linear-gradient(180deg,transparent 0%,rgb(10 85 64 / 10%) 22%,rgb(10 85 64 / 48%) 58%,rgb(8 50 40 / 88%) 100%)!important}
  .is-home-v2 .footer-grid{display:flex!important;flex-direction:column!important;flex:1 1 auto!important;gap:.45rem!important;padding:0 1rem .45rem!important;text-align:right!important;direction:rtl!important;min-height:0!important}
  .is-home-v2 .site-footer .footer-brand,.is-home-v2 .site-footer .footer-brand-copy,.is-home-v2 .footer-company,.is-home-v2 .footer-col--pages{direction:rtl!important;text-align:right!important;width:100%!important;align-items:stretch!important;margin-inline:0!important;flex:0 0 auto!important}
  .is-home-v2 .footer-col--contact{margin-top:auto!important;padding-bottom:.35rem!important}
  .is-home-v2 .footer-col--products,.is-home-v2 .footer-col--actions,.is-home-v2 .footer-blurb,.is-home-v2 .footer-kicker,.is-home-v2 .footer-hours,.is-home-v2 .site-footer .footer-brand-seal{display:none!important}
  .is-home-v2 .footer-col--pages ul{display:flex!important;flex-wrap:wrap!important;gap:.2rem .9rem!important;justify-content:flex-start!important}
  .mk-ledger-topbar{display:grid!important;grid-template-columns:1fr auto!important;align-items:start!important;gap:8px 10px!important}
  .mk-ledger-titles strong,.mk-ledger-titles span{white-space:normal!important}
}
</style>"""

_PRELOAD_VIDEO_RE = re.compile(
    rb"<link[^>]+as=[\"']video[\"'][^>]*>",
    re.IGNORECASE,
)


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


_SHIP_FIX_RE = re.compile(
    rb'<style id="mk-ship-fix">.*?</style>',
    re.IGNORECASE | re.DOTALL,
)


def _prepare_html(data: bytes) -> bytes:
    data = _PRELOAD_VIDEO_RE.sub(b"", data)
    css = _CRITICAL_CSS.encode("utf-8")
    if _SHIP_FIX_RE.search(data):
        return _SHIP_FIX_RE.sub(css, data, count=1)
    lower = data.lower()
    idx = lower.find(b"</head>")
    if idx == -1:
        return css + data
    return data[:idx] + css + data[idx:]


def _cache_headers(response: HttpResponse, suffix: str) -> None:
    if suffix in {".woff", ".woff2", ".ttf", ".otf", ".js", ".css"}:
        response["Cache-Control"] = "public, max-age=31536000, immutable"
    elif suffix in {".html", ".txt"}:
        response["Cache-Control"] = "no-cache, must-revalidate"
    elif suffix in {".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".ico", ".avif"}:
        response["Cache-Control"] = "public, max-age=86400"
    elif suffix in {".mp4", ".webm", ".mov"}:
        response["Cache-Control"] = "public, max-age=86400"
        response["Accept-Ranges"] = "bytes"


def _parse_range(header: str, size: int) -> tuple[int, int] | None:
    if not header.startswith("bytes="):
        return None
    spec = header[6:].split(",", 1)[0].strip()
    if "-" not in spec:
        return None
    start_s, end_s = spec.split("-", 1)
    try:
        if start_s == "":
            length = int(end_s)
            start = max(size - length, 0)
            end = size - 1
        else:
            start = int(start_s)
            end = int(end_s) if end_s else size - 1
    except ValueError:
        return None
    if start < 0 or start >= size:
        return None
    end = min(end, size - 1)
    if end < start:
        return None
    return start, end


async def _aiter_file(path: Path, start: int, length: int, chunk: int = _STREAM_CHUNK):
    f = await asyncio.to_thread(path.open, "rb")
    try:
        if start:
            await asyncio.to_thread(f.seek, start)
        remaining = length
        while remaining > 0:
            data = await asyncio.to_thread(f.read, min(chunk, remaining))
            if not data:
                break
            remaining -= len(data)
            yield data
    finally:
        await asyncio.to_thread(f.close)


def _file_response(path: Path, request) -> HttpResponse:
    suffix = path.suffix.lower()
    content_type = _CONTENT_TYPES.get(suffix)
    size = path.stat().st_size

    if suffix == ".html":
        body = _prepare_html(path.read_bytes())
        response: HttpResponse = HttpResponse(body, content_type=content_type)
        response["Content-Length"] = str(len(body))
        _cache_headers(response, suffix)
        return response

    if size <= _INLINE_MAX_BYTES and suffix not in {".mp4", ".webm", ".mov"}:
        response = HttpResponse(path.read_bytes(), content_type=content_type)
        response["Content-Length"] = str(size)
        _cache_headers(response, suffix)
        return response

    rng = _parse_range(request.META.get("HTTP_RANGE") or "", size)
    if rng:
        start, end = rng
        length = end - start + 1
        response = StreamingHttpResponse(
            _aiter_file(path, start, length),
            status=206,
            content_type=content_type,
        )
        response["Content-Range"] = f"bytes {start}-{end}/{size}"
        response["Content-Length"] = str(length)
    else:
        response = StreamingHttpResponse(
            _aiter_file(path, 0, size),
            content_type=content_type,
        )
        response["Content-Length"] = str(size)

    response["Accept-Ranges"] = "bytes"
    _cache_headers(response, suffix)
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
        return _file_response(best, request)

    if _looks_like_asset(rel) or _looks_like_api(rel) or rel.startswith("magazine"):
        return HttpResponseNotFound("not found")

    for root in _candidate_roots():
        if not root.is_dir():
            continue
        try:
            fallback = root.resolve() / "index.html"
        except OSError:
            continue
        if fallback.is_file() and fallback.stat().st_size > 4096:
            return _file_response(fallback, request)

    return _landing_html()
