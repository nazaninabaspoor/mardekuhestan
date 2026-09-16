#!/usr/bin/env bash
# استارت سرویس واحد روی Runflare (Django + FastAPI در یک ASGI)
set -uo pipefail

echo "[mk] start pwd=$(pwd) PORT=${PORT:-} PUBLIC_DIR=${PUBLIC_DIR:-}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if [ -d "$SCRIPT_DIR/../../backend/django" ]; then
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
  echo "[mk] Django project not found. pwd=$(pwd) ROOT=$ROOT" >&2
  ls -la "$ROOT" >&2 || true
  exit 1
fi

export PYTHONPATH="${DJANGO_DIR}:${FASTAPI_DIR}:${PYTHONPATH:-}"
cd "$DJANGO_DIR"
echo "[mk] django_dir=$DJANGO_DIR"

export RUNFLARE_PUBLIC_DISK="${RUNFLARE_PUBLIC_DISK:-true}"
export PUBLIC_DIR="${PUBLIC_DIR:-/app/public}"
mkdir -p "$PUBLIC_DIR/static" "$PUBLIC_DIR/media" "$PUBLIC_DIR/web" || true

# اگر migrate/collectstatic شکست بخورد، حداقل سرور بالا بیاید تا لاگ دیده شود
python manage.py migrate --noinput || echo "[mk] WARN: migrate failed"
python manage.py collectstatic --noinput || echo "[mk] WARN: collectstatic failed"

# Runflare معمولاً PORT را می‌دهد؛ اگر ندهد اغلب 80 است
PORT="${PORT:-80}"
echo "[mk] listening on 0.0.0.0:${PORT}"
exec daphne -b 0.0.0.0 -p "$PORT" core.asgi:application
