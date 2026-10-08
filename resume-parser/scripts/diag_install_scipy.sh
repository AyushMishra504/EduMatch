#!/usr/bin/env bash
set -uo pipefail
VENV=/home/ayush/venvs/resume-parser
exec >> /home/ayush/rp_install2.log 2>&1
echo "=== scipy install $(date -Is) ==="
"$VENV/bin/pip" install "scipy>=1.6.0,<2.0.0"
echo "rc=$?"
"$VENV/bin/pip" list 2>/dev/null | grep -Ei "^(scipy|numpy) "
echo "=== DONE $(date -Is) ==="
touch /home/ayush/rp_install2.done