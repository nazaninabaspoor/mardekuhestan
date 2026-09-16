#!/usr/bin/env bash
# دستور استارت قطعی برای Runflare — ماژول هاردکد، بدون متغیر خالی
set -uo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

export DJANGO_SETTINGS_MODULE="${DJANGO_SETTINGS_MODULE:-core.settings}"
export DJANGO_WSGI_MODULE="${DJANGO_WSGI_MODULE:-koohestan.wsgi}"
export PYTHONPATH="${ROOT}/backend/django:${ROOT}/backend/fastapi:${ROOT}:${PYTHONPATH:-}"
export RUNFLARE_PUBLIC_DISK="${RUNFLARE_PUBLIC_DISK:-true}"
export PUBLIC_DIR="${PUBLIC_DIR:-/app/public}"

mkdir -p "$PUBLIC_DIR/static" "$PUBLIC_DIR/media" "$PUBLIC_DIR/web" || true

(
  cd "$ROOT/backend/django"
  python manage.py migrate --noinput || echo "[mk] WARN: migrate failed"
  python manage.py collectstatic --noinput || echo "[mk] WARN: collectstatic failed"
)

PORT="${PORT:-80}"
echo "[mk] boot koohestan.wsgi:application on 0.0.0.0:${PORT}"

exec gunicorn koohestan.wsgi:application \
  --bind "0.0.0.0:${PORT}" \
  --workers "${WEB_CONCURRENCY:-2}" \
  --timeout 120 \
  --access-logfile - \
  --error-logfile -
