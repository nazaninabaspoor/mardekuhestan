#!/usr/bin/env bash
# استارت سازگار با هاست Django رانفلر (nginx + gunicorn)
set -uo pipefail

echo "[mk] start pwd=$(pwd) PORT=${PORT:-} PUBLIC_DIR=${PUBLIC_DIR:-}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if [ -d "$SCRIPT_DIR/../../backend/django" ]; then
  ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
else
  ROOT="$(pwd)"
fi

# همیشه از ریشه ریپو: wsgi.py / asgi.py
if [ -d "$ROOT/backend/django" ] && [ -f "$ROOT/wsgi.py" ]; then
  DJANGO_DIR="$ROOT/backend/django"
  FASTAPI_DIR="$ROOT/backend/fastapi"
  WSGI_APP="wsgi:application"
  ASGI_APP="asgi:application"
  cd "$ROOT"
elif [ -d "$ROOT/backend/django" ]; then
  DJANGO_DIR="$ROOT/backend/django"
  FASTAPI_DIR="$ROOT/backend/fastapi"
  WSGI_APP="core.wsgi:application"
  ASGI_APP="core.asgi:application"
  cd "$DJANGO_DIR"
elif [ -f "$ROOT/manage.py" ] && [ -d "$ROOT/core" ]; then
  DJANGO_DIR="$ROOT"
  FASTAPI_DIR="${ROOT}/../fastapi"
  WSGI_APP="core.wsgi:application"
  ASGI_APP="core.asgi:application"
  cd "$DJANGO_DIR"
else
  echo "[mk] Django project not found. pwd=$(pwd) ROOT=$ROOT" >&2
  ls -la "$ROOT" >&2 || true
  exit 1
fi

export PYTHONPATH="${ROOT}:${DJANGO_DIR}:${FASTAPI_DIR}:${PYTHONPATH:-}"
export DJANGO_SETTINGS_MODULE="${DJANGO_SETTINGS_MODULE:-core.settings}"
echo "[mk] root=$ROOT django_dir=$DJANGO_DIR wsgi=$WSGI_APP"

export RUNFLARE_PUBLIC_DISK="${RUNFLARE_PUBLIC_DISK:-true}"
export PUBLIC_DIR="${PUBLIC_DIR:-/app/public}"
mkdir -p "$PUBLIC_DIR/static" "$PUBLIC_DIR/media" "$PUBLIC_DIR/web" || true

(
  cd "$DJANGO_DIR"
  python manage.py migrate --noinput || echo "[mk] WARN: migrate failed"
  python manage.py collectstatic --noinput || echo "[mk] WARN: collectstatic failed"
)

PORT="${PORT:-80}"
echo "[mk] listening on 0.0.0.0:${PORT}"

# Runflare معمولاً gunicorn می‌خواهد؛ اگر APP_MODULE خالی باشد خودمان صریح می‌دهیم
if python -c "import gunicorn" 2>/dev/null; then
  exec gunicorn "$WSGI_APP" \
    --bind "0.0.0.0:${PORT}" \
    --workers "${WEB_CONCURRENCY:-2}" \
    --timeout 120 \
    --access-logfile - \
    --error-logfile -
fi

echo "[mk] gunicorn missing; falling back to daphne"
exec daphne -b 0.0.0.0 -p "$PORT" "$ASGI_APP"
