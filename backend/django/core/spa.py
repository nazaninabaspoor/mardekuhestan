"""سرو خروجی استاتیک فرانت (Next export) از داخل Django — برای هاست واحد Runflare."""

from __future__ import annotations

from pathlib import Path

from django.conf import settings
from django.http import FileResponse, HttpResponse
from django.views.decorators.http import require_GET


def _candidate_roots() -> list[Path]:
    roots: list[Path] = []
    primary = Path(
        getattr(settings, "FRONTEND_STATIC_ROOT", settings.BASE_DIR / "public" / "web")
    )
    roots.append(primary)
    # fallback داخل ریپو (قبل از بیلد Next روی دیسک)
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


def _file_response(path: Path) -> FileResponse:
    content_type = None
    suffix = path.suffix.lower()
    if suffix == ".html":
        content_type = "text/html; charset=utf-8"
    elif suffix == ".js":
        content_type = "application/javascript; charset=utf-8"
    elif suffix == ".css":
        content_type = "text/css; charset=utf-8"
    elif suffix == ".json":
        content_type = "application/json; charset=utf-8"
    elif suffix == ".svg":
        content_type = "image/svg+xml"
    elif suffix == ".txt":
        content_type = "text/plain; charset=utf-8"
    return FileResponse(path.open("rb"), content_type=content_type)


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


@require_GET
def spa_serve(request, path: str = ""):
    """
    فایل‌های بیلد فرانت را سرو می‌کند.
    اگر بیلد نبود، لندینگ موقت ۲۰۰ برمی‌گردد (نه ۴۰۴).
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
        # اگر دیسک public لندینگ موقت داشته باشد و ریپو بیلد واقعی، بزرگ‌تر را بگیر
        best = max(hits, key=lambda p: p.stat().st_size if p.is_file() else 0)
        return _file_response(best)

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
