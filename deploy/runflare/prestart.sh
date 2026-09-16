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
