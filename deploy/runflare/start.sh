#!/usr/bin/env bash
# استارت سرویس واحد روی Runflare (Django + FastAPI در یک ASGI)
set -euo pipefail

# اگر از ریشه ریپو اجرا شود یا از داخل backend/django
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if [ -d "$SCRIPT_DIR/../../backend/django" ]; then
  ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
elif [ -f "$SCRIPT_DIR/manage.py" ] && [ -d "$SCRIPT_DIR/core" ]; then
  ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
else
  ROOT="$(pwd)"
fi

if [ -d "$ROOT/backend/django" ]; then
  DJANGO_DIR="$ROOT/backend/django"
  FASTAPI_DIR="$ROOT/backend/fastapi"
elif [ -f "$ROOT/manage.py" ] && [ -d "$ROOT/core" ]; then
  DJANGO_DIR="$ROOT"
  FASTAPI_DIR="${ROOT}/../fastapi"
else
  echo "Django project not found. pwd=$(pwd) ROOT=$ROOT" >&2
  exit 1
fi

export PYTHONPATH="${DJANGO_DIR}:${FASTAPI_DIR}:${PYTHONPATH:-}"
cd "$DJANGO_DIR"

export RUNFLARE_PUBLIC_DISK="${RUNFLARE_PUBLIC_DISK:-true}"
# دیسک Runflare معمولاً روی /app/public مونت می‌شود
export PUBLIC_DIR="${PUBLIC_DIR:-/app/public}"
mkdir -p "$PUBLIC_DIR/static" "$PUBLIC_DIR/media" "$PUBLIC_DIR/web"

python manage.py migrate --noinput
python manage.py collectstatic --noinput

PORT="${PORT:-8000}"
exec daphne -b 0.0.0.0 -p "$PORT" core.asgi:application
