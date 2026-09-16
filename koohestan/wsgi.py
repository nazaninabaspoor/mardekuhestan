"""WSGI entry — Runflare expects package.wsgi:application (not root wsgi.py)."""

from koohestan.bootstrap import ROOT  # noqa: F401  — sets sys.path + DJANGO_SETTINGS_MODULE

from django.core.wsgi import get_wsgi_application

application = get_wsgi_application()
