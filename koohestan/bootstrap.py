"""Bootstrap PYTHONPATH for monorepo Django + FastAPI."""

from __future__ import annotations

import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DJANGO_DIR = ROOT / "backend" / "django"
FASTAPI_DIR = ROOT / "backend" / "fastapi"

# backend/django must win for `import core.*`
_paths = [str(DJANGO_DIR), str(FASTAPI_DIR), str(ROOT)]
for p in reversed(_paths):
    if p and p not in sys.path:
        sys.path.insert(0, p)
    elif p in sys.path:
        sys.path.remove(p)
        sys.path.insert(0, p)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
