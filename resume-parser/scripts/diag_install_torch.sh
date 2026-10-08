#!/usr/bin/env bash
# torch is required by docling 2.132.0's ONNX layout path (decide_device does
# `import torch`). Install the CPU-only wheel from the PyTorch CPU index so we
# get it without the multi-GB CUDA bundle. Spec §54 permits keeping torch when
# the chosen pipeline genuinely needs it.
set -uo pipefail
VENV=/home/ayush/venvs/resume-parser
exec >> /home/ayush/rp_torch.log 2>&1
echo "=== cpu-only torch install $(date -Is) ==="
"$VENV/bin/pip" install torch --index-url https://download.pytorch.org/whl/cpu 2>&1 | tail -12
echo "pip rc=$?"
"$VENV/bin/pip" list 2>/dev/null | grep -Ei "^(torch|torchvision) " || echo "no torch installed"
echo "=== DONE $(date -Is) ==="
touch /home/ayush/rp_torch.done