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

if [ ! -d "$ROOT/backend/django" ]; then
  echo "[mk] Django project not found. pwd=$(pwd) ROOT=$ROOT" >&2
  ls -la "$ROOT" >&2 || true
  exit 1
fi

DJANGO_DIR="$ROOT/backend/django"
FASTAPI_DIR="$ROOT/backend/fastapi"
cd "$ROOT"

export PYTHONPATH="${DJANGO_DIR}:${FASTAPI_DIR}:${ROOT}:${PYTHONPATH:-}"
export DJANGO_SETTINGS_MODULE="${DJANGO_SETTINGS_MODULE:-core.settings}"
# مهم: فقط نام ماژول، بدون :application (رانفلر خودش :application را اضافه می‌کند)
export DJANGO_WSGI_MODULE="${DJANGO_WSGI_MODULE:-wsgi}"

echo "[mk] root=$ROOT django_dir=$DJANGO_DIR DJANGO_WSGI_MODULE=$DJANGO_WSGI_MODULE"

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

if python -c "import gunicorn" 2>/dev/null; then
  # صریح — هرگز ماژول خالی نده
  exec gunicorn "wsgi:application" \
    --config "$ROOT/gunicorn.conf.py" \
    --bind "0.0.0.0:${PORT}" \
    --workers "${WEB_CONCURRENCY:-2}" \
    --timeout 120 \
    --access-logfile - \
    --error-logfile -
fi

echo "[mk] gunicorn missing; falling back to daphne"
cd "$DJANGO_DIR"
exec daphne -b 0.0.0.0 -p "$PORT" core.asgi:application
