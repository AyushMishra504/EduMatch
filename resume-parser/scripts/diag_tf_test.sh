#!/usr/bin/env bash
# Test hypothesis: transformers 5.x resolves image processors by model_type
# (rt_detr_v2 -> broken deimv2 mapping). transformers 4.x resolves by the
# image_processor_type string in preprocessor_config.json, which works.
set -uo pipefail
VENV=/home/ayush/venvs/resume-parser
exec >> /home/ayush/rp_tf_test.log 2>&1
echo "=== transformers 4.x test $(date -Is) ==="
"$VENV/bin/pip" install "transformers==4.57.6" 2>&1 | tail -3
echo "pip rc=$?"
"$VENV/bin/python" - <<'PY'
import time
t0 = time.time()
import transformers
print("version", transformers.__version__, f"({time.time()-t0:.1f}s)")
M = "/home/ayush/.local/share/edumatch-models/docling-project--docling-layout-heron-onnx"
from transformers import AutoImageProcessor
try:
    p = AutoImageProcessor.from_pretrained(M)
    print("AutoImageProcessor OK ->", type(p).__name__, "size", p.size)
except Exception as e:
    print("AutoImageProcessor FAIL:", type(e).__name__, str(e)[:300])
from transformers import AutoConfig
try:
    c = AutoConfig.from_pretrained(M)
    print("AutoConfig OK ->", type(c).__name__, "labels", len(c.id2label))
except Exception as e:
    print("AutoConfig FAIL:", type(e).__name__, str(e)[:300])
PY
echo "=== DONE $(date -Is) ==="
touch /home/ayush/rp_tf_test.done