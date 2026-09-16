"""Gunicorn config for Runflare Django host.

If the platform runs bare `gunicorn` (or empty APP module), this file
still boots the monorepo WSGI entrypoint.
"""

from __future__ import annotations

import os

# Critical: never leave module empty (causes ValueError: Empty module name)
_module = (
    os.getenv("DJANGO_WSGI_MODULE")
    or os.getenv("WSGI_MODULE")
    or os.getenv("APP_MODULE")
    or "wsgi:application"
).strip()

if not _module:
    _module = "wsgi:application"

if ":" not in _module:
    # Platform often expands: gunicorn ${DJANGO_WSGI_MODULE}:application
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
