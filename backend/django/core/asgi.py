"""
ASGI — یک پروسس برای Django + FastAPI + WebSocket.

مسیرها:
  /api/v1/*  → FastAPI (AI / پشتیبانی / راهیار)
  بقیه HTTP → Django
  /ws/*      → Channels (کاتالوگ)
  /api/v1/*/ws → FastAPI WebSocket
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

django_asgi_app = get_asgi_application()

from core.routing import websocket_urlpatterns  # noqa: E402

_FASTAPI_ROOT = Path(__file__).resolve().parents[2] / "fastapi"
if _FASTAPI_ROOT.is_dir():
    fastapi_path = str(_FASTAPI_ROOT)
    if fastapi_path not in sys.path:
        sys.path.insert(0, fastapi_path)

_fastapi_app = None
try:
    from app.main import app as _fastapi_app  # type: ignore
except Exception:  # pragma: no cover — لوکال بدون FastAPI هم Django بالا می‌آید
    _fastapi_app = None


def _path_of(scope: dict) -> str:
    return scope.get("path") or ""


async def http_application(scope, receive, send):
    path = _path_of(scope)
    if _fastapi_app is not None and path.startswith("/api/v1"):
        await _fastapi_app(scope, receive, send)
        return
    await django_asgi_app(scope, receive, send)


async def websocket_application(scope, receive, send):
    path = _path_of(scope)
    if _fastapi_app is not None and path.startswith("/api/v1"):
        await _fastapi_app(scope, receive, send)
        return
    django_ws = AuthMiddlewareStack(URLRouter(websocket_urlpatterns))
    await django_ws(scope, receive, send)


application = ProtocolTypeRouter(
    {
        "http": http_application,
        "websocket": websocket_application,
    }
)
