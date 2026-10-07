#!/usr/bin/env bash
# Dev entry point for the resume parser (FastAPI + Docling).
#
# Usage (PowerShell, repo root):
#   wsl bash ./resume-parser/dev.sh
#
# Prefers the fast native-WSL venv (~/venvs/resume-parser); falls back to
# resume-parser/.venv. Serves POST /parse on http://127.0.0.1:8000, which is
# what the Next.js import route calls by default (RESUME_PARSER_URL).
set -euo pipefail
cd "$(dirname "$0")"

if [ -x "$HOME/venvs/resume-parser/bin/python" ]; then
  PY="$HOME/venvs/resume-parser/bin/python"
elif [ -x ".venv/bin/python" ]; then
  PY=".venv/bin/python"
else
  echo "No parser venv found." >&2
  echo "Create the native one first (see EDUMATCH_DOCLING_PERFORMANCE_AND_INSTALLATION_INSTRUCTIONS.md)." >&2
  exit 1
fi

# Models are prefetched — never hit the network per request (§3).
export HF_HUB_OFFLINE=1
export HF_HUB_DISABLE_TELEMETRY=1

exec "$PY" -m uvicorn app.main:app --host 127.0.0.1 --port 8000
