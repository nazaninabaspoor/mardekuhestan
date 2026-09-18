#!/usr/bin/env bash
# «دستور پیش از شروع» — اختیاری اگر Start Command = start.sh باشد.
# اگر پلتفرم فقط prestart را دارد، همین فایل gunicorn را هم wrap می‌کند.
set -uo pipefail

echo "[mk-prestart] begin"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

export PYTHONPATH="${ROOT}/backend/django:${ROOT}/backend/fastapi:${ROOT}:${PYTHONPATH:-}"
export DJANGO_SETTINGS_MODULE="${DJANGO_SETTINGS_MODULE:-core.settings}"
export DJANGO_ASGI_MODULE="${DJANGO_ASGI_MODULE:-koohestan.asgi}"
export DJANGO_WSGI_MODULE="${DJANGO_WSGI_MODULE:-koohestan.asgi}"
export WSGI_MODULE="${WSGI_MODULE:-koohestan.asgi}"
export APP_MODULE="${APP_MODULE:-koohestan.asgi}"

DJ="${ROOT}/backend/django"
if [ -d "$DJ/core" ]; then
  for d in accounts common content core inventory logistics orders payments product sec support notifications; do
    if [ -d "$DJ/$d" ] && [ ! -e "${ROOT}/$d" ]; then
      ln -sfn "$DJ/$d" "${ROOT}/$d" || true
    fi
  done
fi

mkdir -p /app/public/web || true
REPO_WEB="${ROOT}/backend/django/public/web"
DISK_WEB="/app/public/web"
if [ -f "$REPO_WEB/index.html" ]; then
  REPO_SIZE=$(wc -c < "$REPO_WEB/index.html" | tr -d ' ')
  if [ "${REPO_SIZE:-0}" -gt 4096 ]; then
    echo "[mk-prestart] syncing frontend (${REPO_SIZE} bytes) -> $DISK_WEB"
    find "$DISK_WEB" -mindepth 1 -maxdepth 1 -exec rm -rf {} + 2>/dev/null || true
    cp -a "$REPO_WEB"/. "$DISK_WEB"/ || true
  fi
fi

# اگر پلتفرم هنوز gunicorn خودش را صدا زد، app خالی را نجات بده
BIN="/usr/local/bin/gunicorn"
REAL="/usr/local/bin/gunicorn.real"
if [ -e "$BIN" ]; then
  if [ ! -f "$REAL" ]; then
    cp -f "$BIN" "$REAL" 2>/dev/null || mv -f "$BIN" "$REAL"
  fi
  cat > "$BIN" << 'WRAP'
#!/usr/bin/env bash
export PYTHONPATH="/app/backend/django:/app/backend/fastapi:/app:${PYTHONPATH:-}"
export DJANGO_SETTINGS_MODULE="${DJANGO_SETTINGS_MODULE:-core.settings}"
DEFAULT_APP="koohestan.asgi:application"
DEFAULT_WORKER="uvicorn.workers.UvicornWorker"
ARGS=()
HAS_APP=0
SKIP=0
for a in "$@"; do
  if [ "$SKIP" = "1" ]; then SKIP=0; continue; fi
  case "$a" in
    -k|--worker-class) SKIP=1; continue ;;
    ""|":application"|".wsgi"*|".asgi"*) ARGS+=("$DEFAULT_APP"); HAS_APP=1 ;;
    *wsgi*|*asgi*|*:application) ARGS+=("$DEFAULT_APP"); HAS_APP=1 ;;
    *) ARGS+=("$a") ;;
  esac
done
[ "$HAS_APP" = "0" ] && ARGS+=("$DEFAULT_APP")
ARGS+=("-k" "$DEFAULT_WORKER")
echo "[mk-gunicorn] ${ARGS[*]}" >&2
exec /usr/local/bin/gunicorn.real "${ARGS[@]}"
WRAP
  chmod +x "$BIN"
  echo "[mk-prestart] gunicorn wrapper ready"
fi

echo "[mk-prestart] done — ترجیحاً Start Command را بگذار: bash /app/deploy/runflare/start.sh"
