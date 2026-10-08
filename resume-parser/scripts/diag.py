"""Stage-timed Docling diagnostic. Never edit service code based on guesses —
run this and read diag.log.

Usage (WSL, native venv, background):
    systemd-run --user --unit=rp-diag ... python diag.py [pdf_path]

Log: $HOME/rp_diag.log
"""

from __future__ import annotations

import faulthandler
import os
import sys
import time

LOG = os.path.expanduser("~/rp_diag.log")
ARTIFACTS = os.path.expanduser("~/.local/share/edumatch-models")

# Offline: model must come from the prefetched dir, never the network (§3).
os.environ.setdefault("HF_HUB_OFFLINE", "1")
os.environ.setdefault("HF_HUB_DISABLE_TELEMETRY", "1")

T0 = time.time()
_log = open(LOG, "a", buffering=1)
faulthandler.enable(file=_log)
faulthandler.dump_traceback_later(20, repeat=True, file=_log)


def stage(name: str) -> None:
    print(f"[{time.time() - T0:7.1f}s] {name}", file=_log, flush=True)


stage("start (interpreter up)")
stage(f"HUB offline={os.environ.get('HF_HUB_OFFLINE')} artifacts={ARTIFACTS}")

import numpy  # noqa: E402

stage(f"import numpy {numpy.__version__}")

try:
    import torch  # noqa: E402

    stage(f"import torch {torch.__version__}  <-- PyTorch present, violates audit")
except ImportError:
    stage("import torch -> absent (audit OK)")

import transformers  # noqa: E402

stage(f"import transformers {transformers.__version__}")

try:
    from transformers import AutoImageProcessor

    stage(
        "AutoImageProcessor.from_pretrained(heron-onnx) -> "
        + type(
            AutoImageProcessor.from_pretrained(
                f"{ARTIFACTS}/docling-project--docling-layout-heron-onnx"
            )
        ).__name__
    )
except Exception as exc:  # noqa: BLE001
    stage(f"AutoImageProcessor FAILED: {type(exc).__name__}: {exc}")

from docling.datamodel.accelerator_options import (  # noqa: E402
    AcceleratorDevice,
    AcceleratorOptions,
)
from docling.datamodel.base_models import InputFormat  # noqa: E402
from docling.datamodel.object_detection_engine_options import (  # noqa: E402
    OnnxRuntimeObjectDetectionEngineOptions,
)
from docling.datamodel.pipeline_options import (  # noqa: E402
    LayoutObjectDetectionOptions,
    PdfPipelineOptions,
    RapidOcrOptions,
)

stage("import docling pipeline options")

import onnxruntime  # noqa: E402

stage(f"import onnxruntime {onnxruntime.__version__}")

from docling.document_converter import DocumentConverter, PdfFormatOption  # noqa: E402

stage("import DocumentConverter")

options = PdfPipelineOptions(
    do_ocr=False,
    do_table_structure=False,
    do_code_enrichment=False,
    do_formula_enrichment=False,
    generate_page_images=False,
    generate_picture_images=False,
    do_picture_classification=False,
    document_timeout=45,
    layout_options=LayoutObjectDetectionOptions(
        engine_options=OnnxRuntimeObjectDetectionEngineOptions(),
    ),
    ocr_options=RapidOcrOptions(lang=["en"]),
)
options.enable_remote_services = False
options.accelerator_options = AcceleratorOptions(
    num_threads=4, device=AcceleratorDevice.CPU
)
stage("pipeline options built")

converter = DocumentConverter(
    allowed_formats=[InputFormat.PDF, InputFormat.DOCX],
    format_options={
        InputFormat.PDF: PdfFormatOption(
            pipeline_options=options, artifacts_path=ARTIFACTS
        )
    },
)
stage("DocumentConverter constructed (lazy; models load on first convert)")

if len(sys.argv) < 2:
    stage("no input given; stopping after converter construction")
    raise SystemExit(0)

path = sys.argv[1]
stage(f"convert START {path}")
result = converter.convert(path, raises_on_error=True, max_num_pages=6)
markdown = result.document.export_to_markdown()
text = result.document.export_to_text()
stage(f"convert DONE md={len(markdown)}ch text={len(text)}ch")
stage("first 400 chars of text: " + repr(text[:400]))
stage("SLOWEST STAGE — check timestamps above")