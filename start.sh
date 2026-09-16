#!/usr/bin/env bash
# نقطه ورود ریشه ریپو برای Runflare
set -uo pipefail
cd "$(dirname "$0")"
exec bash deploy/runflare/start.sh
