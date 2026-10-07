import sys
from pathlib import Path

# Tests import the service package as `app.*` (mirrors the Docker WORKDIR).
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
