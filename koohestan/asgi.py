"""ASGI entry — Django + mounted FastAPI gateway."""

from koohestan.bootstrap import ROOT  # noqa: F401

from core.asgi import application  # backend/django/core/asgi.py
