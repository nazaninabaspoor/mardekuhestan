"""Gunicorn config — never boot with an empty module name."""

from __future__ import annotations

import os

# Prefer nested package (Runflare autodetect-friendly)
_module = (
    os.getenv("DJANGO_WSGI_MODULE")
    or os.getenv("WSGI_MODULE")
    or "koohestan.wsgi:application"
).strip()

if not _module:
    _module = "koohestan.wsgi:application"

if ":" not in _module:
    wsgi_app = f"{_module}:application"
else:
    wsgi_app = _module

bind = f"0.0.0.0:{os.getenv('PORT', '80')}"
workers = int(os.getenv("WEB_CONCURRENCY", "2"))
timeout = int(os.getenv("GUNICORN_TIMEOUT", "120"))
accesslog = "-"
errorlog = "-"
capture_output = True
preload_app = False
chdir = os.getenv("GUNICORN_CHDIR", os.getcwd())
