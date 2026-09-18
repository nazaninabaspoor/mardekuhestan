#!/usr/bin/env bash
# دستور اصلی Runflare (Start / Command) — فقط این را بگذار:
#   bash /app/deploy/runflare/start.sh
#
# این اسکریپت خودش gunicorn را با ASGI درست بالا می‌آورد تا
# «Empty module name» و worker: sync دیگر پیش نیاید.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

export PYTHONPATH="${ROOT}/backend/django:${ROOT}/backend/fastapi:${ROOT}:${PYTHONPATH:-}"
export DJANGO_SETTINGS_MODULE="${DJANGO_SETTINGS_MODULE:-core.settings}"
export DJANGO_ASGI_MODULE="${DJANGO_ASGI_MODULE:-koohestan.asgi}"
export DJANGO_WSGI_MODULE="${DJANGO_WSGI_MODULE:-koohestan.asgi}"
export WSGI_MODULE="${WSGI_MODULE:-koohestan.asgi}"
export APP_MODULE="${APP_MODULE:-koohestan.asgi}"

# لینک پکیج‌های Django به ریشه (اگر لازم بود)
DJ="${ROOT}/backend/django"
if [ -d "$DJ/core" ]; then
  for d in accounts common content core inventory logistics orders payments product sec support notifications; do
    if [ -d "$DJ/$d" ] && [ ! -e "${ROOT}/$d" ]; then
      ln -sfn "$DJ/$d" "${ROOT}/$d" || true
    fi
  done
fi

# همگام‌سازی فرانت
mkdir -p /app/public/web 2>/dev/null || mkdir -p "${ROOT}/backend/django/public/web" || true
REPO_WEB="${ROOT}/backend/django/public/web"
DISK_WEB="/app/public/web"
if [ ! -d "$DISK_WEB" ]; then
  DISK_WEB="$REPO_WEB"
fi
if [ -f "$REPO_WEB/index.html" ]; then
  REPO_SIZE=$(wc -c < "$REPO_WEB/index.html" | tr -d ' ')
  if [ "${REPO_SIZE:-0}" -gt 4096 ] && [ "$DISK_WEB" != "$REPO_WEB" ]; then
    echo "[mk-start] syncing frontend (${REPO_SIZE} bytes) -> $DISK_WEB"
    find "$DISK_WEB" -mindepth 1 -maxdepth 1 -exec rm -rf {} + 2>/dev/null || true
    cp -a "$REPO_WEB"/. "$DISK_WEB"/ || true
  fi
fi

BIND="${PORT:-8000}"
WORKERS="${WEB_CONCURRENCY:-2}"
APP="koohestan.asgi:application"
WORKER="uvicorn.workers.UvicornWorker"

# gunicorn واقعی (اگر wrapper قبلی بود)
GUNI="$(command -v gunicorn || true)"
if [ -x /usr/local/bin/gunicorn.real ]; then
  GUNI=/usr/local/bin/gunicorn.real
elif [ -z "$GUNI" ]; then
  GUNI=gunicorn
fi

echo "[mk-start] $GUNI $APP -k $WORKER -b 0.0.0.0:${BIND} -w ${WORKERS}"
exec "$GUNI" "$APP" \
  -k "$WORKER" \
  -b "0.0.0.0:${BIND}" \
  -w "$WORKERS" \
  --timeout 120 \
  --graceful-timeout 30 \
  --keep-alive 5
