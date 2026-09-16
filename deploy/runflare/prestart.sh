#!/usr/bin/env bash
# تنظیمات Runflare → «دستور پیش از شروع» = دقیقاً این یک خط:
# bash /app/deploy/runflare/prestart.sh
set -uo pipefail

echo "[mk-prestart] begin"

export PYTHONPATH="/app/backend/django:/app/backend/fastapi:/app:${PYTHONPATH:-}"
export DJANGO_SETTINGS_MODULE="${DJANGO_SETTINGS_MODULE:-core.settings}"
export DJANGO_WSGI_MODULE="${DJANGO_WSGI_MODULE:-koohestan.wsgi}"

DJ="/app/backend/django"
if [ -d "$DJ/core" ]; then
  for d in accounts common content core inventory logistics orders payments product sec support notifications; do
    if [ -d "$DJ/$d" ] && [ ! -e "/app/$d" ]; then
      ln -sfn "$DJ/$d" "/app/$d" || true
    fi
  done
fi

# همگام‌سازی فرانت استاتیک از ریپو → دیسک public
# اگر فقط index قدیمی لندینگ روی دیسک باشد، سایت واقعی دیده نمی‌شود.
mkdir -p /app/public/web || true
REPO_WEB="/app/backend/django/public/web"
DISK_WEB="/app/public/web"
if [ -f "$REPO_WEB/index.html" ]; then
  REPO_SIZE=$(wc -c < "$REPO_WEB/index.html" | tr -d ' ')
  DISK_SIZE=0
  if [ -f "$DISK_WEB/index.html" ]; then
    DISK_SIZE=$(wc -c < "$DISK_WEB/index.html" | tr -d ' ')
  fi
  # بیلد Next معمولاً خیلی بزرگ‌تر از لندینگ موقت (~1KB) است
  if [ "${REPO_SIZE:-0}" -gt 4096 ]; then
    if [ "${DISK_SIZE:-0}" -lt 4096 ] || [ "${REPO_SIZE}" -ne "${DISK_SIZE}" ]; then
      echo "[mk-prestart] syncing frontend build (${REPO_SIZE} bytes) -> $DISK_WEB"
      # پاک کردن محتوای قبلی بدون حذف خود پوشه (ممکن است mount باشد)
      find "$DISK_WEB" -mindepth 1 -maxdepth 1 -exec rm -rf {} + 2>/dev/null || true
      cp -a "$REPO_WEB"/. "$DISK_WEB"/ || true
      echo "[mk-prestart] frontend sync done"
    else
      echo "[mk-prestart] frontend already in sync (${DISK_SIZE} bytes)"
    fi
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
DEFAULT_APP="koohestan.wsgi:application"

ARGS=()
HAS_APP=0
for a in "$@"; do
  case "$a" in
    ""|":application"|".wsgi:application"|".wsgi")
      ARGS+=("$DEFAULT_APP")
      HAS_APP=1
      ;;
    -*)
      ARGS+=("$a")
      ;;
    *:application|*.wsgi)
      ARGS+=("$a")
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

echo "[mk-gunicorn] ${ARGS[*]}" >&2
exec /usr/local/bin/gunicorn.real "${ARGS[@]}"
WRAP
  chmod +x "$BIN"
  echo "[mk-prestart] gunicorn wrapper OK"
else
  echo "[mk-prestart] WARN: $BIN missing"
fi

echo "[mk-prestart] done module=$DJANGO_WSGI_MODULE"
