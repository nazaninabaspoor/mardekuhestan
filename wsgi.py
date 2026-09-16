"""WSGI entry for Runflare (monorepo root).

Runflare often starts: gunicorn ${DJANGO_WSGI_MODULE}:application
Set env DJANGO_WSGI_MODULE=wsgi  (NOT empty, NOT 'wsgi:application')
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DJANGO_DIR = ROOT / "backend" / "django"
FASTAPI_DIR = ROOT / "backend" / "fastapi"

# backend/django must be first so `import core.settings` resolves correctly
sys.path.insert(0, str(DJANGO_DIR))
if FASTAPI_DIR.is_dir():
    sys.path.insert(0, str(FASTAPI_DIR))
# keep repo root available for gunicorn.conf / local imports
if str(ROOT) not in sys.path:
    sys.path.append(str(ROOT))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

from django.core.wsgi import get_wsgi_application  # noqa: E402

application = get_wsgi_application()
