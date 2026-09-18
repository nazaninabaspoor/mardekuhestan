#!/usr/bin/env bash
# تنظیمات Runflare → «دستور پیش از شروع» = دقیقاً این یک خط:
# bash /app/deploy/runflare/prestart.sh
set -uo pipefail

echo "[mk-prestart] begin"

export PYTHONPATH="/app/backend/django:/app/backend/fastapi:/app:${PYTHONPATH:-}"
export DJANGO_SETTINGS_MODULE="${DJANGO_SETTINGS_MODULE:-core.settings}"
# ASGI لازم است تا FastAPI روی /api/v1 و WebSocket پشتیبانی کار کند
export DJANGO_ASGI_MODULE="${DJANGO_ASGI_MODULE:-koohestan.asgi}"
export DJANGO_WSGI_MODULE="${DJANGO_WSGI_MODULE:-koohestan.asgi}"
export WSGI_MODULE="${WSGI_MODULE:-koohestan.asgi}"
export APP_MODULE="${APP_MODULE:-koohestan.asgi}"

DJ="/app/backend/django"
if [ -d "$DJ/core" ]; then
  for d in accounts common content core inventory logistics orders payments product sec support notifications; do
    if [ -d "$DJ/$d" ] && [ ! -e "/app/$d" ]; then
      ln -sfn "$DJ/$d" "/app/$d" || true
    fi
  done
fi

# همگام‌سازی فرانت استاتیک از ریپو → دیسک public
mkdir -p /app/public/web || true
REPO_WEB="/app/backend/django/public/web"
DISK_WEB="/app/public/web"
if [ -f "$REPO_WEB/index.html" ]; then
  REPO_SIZE=$(wc -c < "$REPO_WEB/index.html" | tr -d ' ')
  if [ "${REPO_SIZE:-0}" -gt 4096 ]; then
    echo "[mk-prestart] syncing frontend build (${REPO_SIZE} bytes) -> $DISK_WEB"
    find "$DISK_WEB" -mindepth 1 -maxdepth 1 -exec rm -rf {} + 2>/dev/null || true
    cp -a "$REPO_WEB"/. "$DISK_WEB"/ || true
    echo "[mk-prestart] frontend sync done"
  elif [ ! -f "$DISK_WEB/index.html" ]; then
    cp -f "$REPO_WEB/index.html" "$DISK_WEB/index.html" || true
    echo "[mk-prestart] seeded placeholder index.html"
  fi
fi

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
SKIP_NEXT=0
for a in "$@"; do
  if [ "$SKIP_NEXT" = "1" ]; then
    SKIP_NEXT=0
    continue
  fi
  case "$a" in
    -k|--worker-class)
      SKIP_NEXT=1
      continue
      ;;
    ""|":application"|".wsgi:application"|".wsgi"|".asgi:application"|".asgi")
      ARGS+=("$DEFAULT_APP")
      HAS_APP=1
      ;;
    *wsgi*|*asgi*|*:application)
      ARGS+=("$DEFAULT_APP")
      HAS_APP=1
      ;;
    *)
      ARGS+=("$a")
      ;;
  esac
done

if [ "$HAS_APP" -eq 0 ]; then
  ARGS+=("$DEFAULT_APP")
fi
ARGS+=("-k" "$DEFAULT_WORKER")

echo "[mk-gunicorn] ${ARGS[*]}" >&2
exec /usr/local/bin/gunicorn.real "${ARGS[@]}"
WRAP
  chmod +x "$BIN"
  echo "[mk-prestart] gunicorn ASGI wrapper OK (uvicorn worker)"
else
  echo "[mk-prestart] WARN: $BIN missing"
fi

echo "[mk-prestart] done module=$DJANGO_ASGI_MODULE"
