#!/usr/bin/env bash
# اگر Start Command فقط start.sh باشد، همان استارت ASGI درست اجرا شود.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
exec bash "$ROOT/deploy/runflare/start.sh"
