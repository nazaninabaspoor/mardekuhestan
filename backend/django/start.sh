#!/usr/bin/env bash
# اگر Root Directory روی backend/django باشد باز هم ASGI درست بالا بیاید.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
exec bash "$ROOT/deploy/runflare/start.sh"
