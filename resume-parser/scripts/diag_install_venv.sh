#!/usr/bin/env bash
# Native (non-/mnt/c) venv install for the resume parser.
# Log lives in $HOME (ext4) so it survives WSL restarts that wipe /tmp.
set -uo pipefail

ROOT=/mnt/c/Users/ayush/Documents/coding/EduMatch/resume-parser
VENV="$HOME/venvs/resume-parser"
LOG="$HOME/rp_install.log"
ART="$HOME/.local/share/edumatch-models"

exec >> "$LOG" 2>&1
echo "=== install $(date -Is) pid=$$ ==="
mkdir -p "$HOME/venvs" "$HOME/rp"

if [ ! -x "$VENV/bin/python" ]; then
  python3.12 -m venv --without-pip "$VENV" || { echo "VENV_FAIL"; exit 1; }
fi
echo "python: $("$VENV/bin/python" -V 2>&1)"

if [ ! -x "$VENV/bin/pip" ]; then
  echo "bootstrapping pip via get-pip.py"
  curl -sSL --retry 3 --max-time 240 -o "$HOME/rp/get-pip.py" https://bootstrap.pypa.io/get-pip.py \
    || { echo "GETPIP_DOWNLOAD_FAIL"; exit 1; }
  "$VENV/bin/python" "$HOME/rp/get-pip.py" -q || { echo "GETPIP_RUN_FAIL"; exit 1; }
fi
echo "pip: $("$VENV/bin/pip" -V 2>&1)"

if [ ! -f "$ART/docling-project--docling-layout-heron-onnx/model.onnx" ]; then
  echo "copying model artifacts to $ART (native FS)"
  mkdir -p "$ART"
  cp -r "$ROOT/.artifacts/docling-project--docling-layout-heron-onnx" "$ART/" || echo "ARTIFACT_COPY_FAIL"
fi
echo "artifacts: $(du -sh "$ART/docling-project--docling-layout-heron-onnx" 2>/dev/null)"

echo "installing requirements.txt (slow part)"
"$VENV/bin/pip" install -r "$ROOT/requirements.txt"
rc=$?
echo "=== pip rc=$rc $(date -Is) ==="

"$VENV/bin/pip" list 2>/dev/null | grep -Ei "^(docling|docling-core|docling-parse|docling-slim|transformers|onnxruntime|huggingface-hub|rapidocr|torch|torchvision|numpy) "
echo "=== DONE $(date -Is) ==="
touch "$HOME/rp_install.done"
