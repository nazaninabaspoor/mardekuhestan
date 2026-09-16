#!/usr/bin/env bash
# اگر Root Directory سرویس روی backend/django باشد از این استفاده کن
set -uo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

export DJANGO_SETTINGS_MODULE="${DJANGO_SETTINGS_MODULE:-core.settings}"
export PYTHONPATH="${ROOT}:${ROOT}/../fastapi:${PYTHONPATH:-}"
export RUNFLARE_PUBLIC_DISK="${RUNFLARE_PUBLIC_DISK:-true}"
export PUBLIC_DIR="${PUBLIC_DIR:-/app/public}"

mkdir -p "$PUBLIC_DIR/static" "$PUBLIC_DIR/media" "$PUBLIC_DIR/web" || true

python manage.py migrate --noinput || echo "[mk] WARN: migrate failed"
python manage.py collectstatic --noinput || echo "[mk] WARN: collectstatic failed"

PORT="${PORT:-80}"
echo "[mk] boot core.wsgi:application on 0.0.0.0:${PORT}"

exec gunicorn core.wsgi:application \
  --bind "0.0.0.0:${PORT}" \
  --workers "${WEB_CONCURRENCY:-2}" \
  --timeout 120 \
  --access-logfile - \
  --error-logfile -
