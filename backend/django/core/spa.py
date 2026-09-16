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


@require_GET
def spa_serve(request, path: str = ""):
    """
    فایل‌های بیلد فرانت را سرو می‌کند.
    اگر بیلد نبود، لندینگ موقت ۲۰۰ برمی‌گردد (نه ۴۰۴).
    """
    rel = (path or "").lstrip("/")

    for root in _candidate_roots():
        if not root.is_dir():
            continue
        try:
            root_resolved = root.resolve()
        except OSError:
            continue

        candidate = (root_resolved / rel).resolve() if rel else (root_resolved / "index.html")
        if not str(candidate).startswith(str(root_resolved)):
            continue

        if candidate.is_file():
            return FileResponse(candidate.open("rb"))

        as_dir_index = candidate / "index.html"
        if as_dir_index.is_file():
            return FileResponse(as_dir_index.open("rb"))

        fallback = root_resolved / "index.html"
        if fallback.is_file():
            return FileResponse(fallback.open("rb"))

    return _landing_html()
