"""WSGI entry for Runflare when deploy root is the monorepo root."""
from __future__ import annotations

import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DJANGO_DIR = ROOT / "backend" / "django"
FASTAPI_DIR = ROOT / "backend" / "fastapi"

sys.path.insert(0, str(DJANGO_DIR))
if FASTAPI_DIR.is_dir():
    sys.path.insert(0, str(FASTAPI_DIR))

os.chdir(DJANGO_DIR)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

from django.core.wsgi import get_wsgi_application  # noqa: E402

application = get_wsgi_application()
