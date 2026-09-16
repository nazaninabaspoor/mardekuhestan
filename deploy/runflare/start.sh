#!/usr/bin/env bash
# استارت سرویس واحد روی Runflare (Django + FastAPI در یک ASGI)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
DJANGO_DIR="$ROOT/backend/django"
FASTAPI_DIR="$ROOT/backend/fastapi"

export PYTHONPATH="${DJANGO_DIR}:${FASTAPI_DIR}:${PYTHONPATH:-}"
cd "$DJANGO_DIR"

# دیسک Runflare برای static/media/web
export RUNFLARE_PUBLIC_DISK="${RUNFLARE_PUBLIC_DISK:-true}"
export PUBLIC_DIR="${PUBLIC_DIR:-$DJANGO_DIR/public}"
mkdir -p "$PUBLIC_DIR/static" "$PUBLIC_DIR/media" "$PUBLIC_DIR/web"

python manage.py migrate --noinput
python manage.py collectstatic --noinput

PORT="${PORT:-8000}"
exec daphne -b 0.0.0.0 -p "$PORT" core.asgi:application
