#!/usr/bin/env bash
# The requirements pin omits docling's convert-core extra (rtree + scipy),
# which docling imports at module load. Install the correct extra set.
set -uo pipefail
VENV=/home/ayush/venvs/resume-parser
exec >> /home/ayush/rp_install3.log 2>&1
echo "=== install convert-core extras $(date -Is) ==="
"$VENV/bin/pip" install "docling-slim[convert-core]==2.132.0"
echo "rc=$?"
"$VENV/bin/pip" list 2>/dev/null | grep -Ei "^(docling-slim|rtree|scipy|pandas|pypdfium2|numpy) "
echo "torch still absent? -> $("$VENV/bin/python" -c 'import importlib.util as u; print("YES-VIOLATION" if u.find_spec("torch") else "no")' 2>&1)"
echo "=== DONE $(date -Is) ==="
touch /home/ayush/rp_install3.done