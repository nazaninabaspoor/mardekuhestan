"""ASGI entry for Runflare (monorepo root) — Django + FastAPI gateway."""

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
if str(ROOT) not in sys.path:
    sys.path.append(str(ROOT))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

from core.asgi import application  # noqa: E402
