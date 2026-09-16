#!/usr/bin/env python
"""Entry point for Runflare when deploy root is the monorepo root."""
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


def main() -> None:
    from django.core.management import execute_from_command_line

    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
