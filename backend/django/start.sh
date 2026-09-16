# اگر در پنل Runflare مسیر ریشه روی backend/django باشد،
# این اسکریپت از همان‌جا استارت را اجرا می‌کند.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
exec bash "$ROOT/deploy/runflare/start.sh"
