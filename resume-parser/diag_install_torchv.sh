#!/usr/bin/env bash
set -uo pipefail
VENV=/home/ayush/venvs/resume-parser
exec >> /home/ayush/rp_torch2.log 2>&1
echo "=== torchvision (cpu) install $(date -Is) ==="
"$VENV/bin/pip" install torchvision --index-url https://download.pytorch.org/whl/cpu 2>&1 | tail -5
echo "rc=$?"
"$VENV/bin/pip" list 2>/dev/null | grep -Ei "^(torch|torchvision) " || echo "no torch installed"
echo "=== DONE $(date -Is) ==="
touch /home/ayush/rp_torch2.done