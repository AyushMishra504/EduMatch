"""Simplified diag: run with strict options to avoid loading extra stages."""

from __future__ import annotations

import faulthandler
import os
import sys
import time

LOG = os.path.expanduser("~/rp_diag6.log")
ARTIFACTS = os.path.expanduser("~/.local/share/edumatch-models")

os.environ.setdefault("HF_HUB_OFFLINE", "1")
os.environ.setdefault("HF_HUB_DISABLE_TELEMETRY", "1")
os.environ.setdefault("DOCLING_NUM_THREADS", "2")

T0 = time.time()
_log = open(LOG, "a", buffering=1)
faulthandler.enable(file=_log)
faulthandler.dump_traceback_later(30, repeat=True, file=_log)


def stage(name: str) -> None:
    print(f"[{time.time() - T0:7.1f}s] {name}", file=_log, flush=True)


stage("start")
from docling.datamodel.accelerator_options import AcceleratorDevice, AcceleratorOptions
from docling.datamodel.base_models import InputFormat
from docling.datamodel.object_detection_engine_options import OnnxRuntimeObjectDetectionEngineOptions
from docling.datamodel.pipeline_options import LayoutObjectDetectionOptions, PdfPipelineOptions, RapidOcrOptions
from docling.document_converter import DocumentConverter, PdfFormatOption

stage("imported core")

options = PdfPipelineOptions(
    do_ocr=False,
    do_table_structure=False,
    do_code_enrichment=False,
    do_formula_enrichment=False,
    do_picture_classification=False,
    do_picture_description=False,
    do_chart_extraction=False,
    generate_page_images=False,
    generate_picture_images=False,
    generate_table_images=False,
    document_timeout=90,
    layout_options=LayoutObjectDetectionOptions(
        engine_options=OnnxRuntimeObjectDetectionEngineOptions(),
    ),
    ocr_options=RapidOcrOptions(lang=["en"]),
)
options.enable_remote_services = False
options.accelerator_options = AcceleratorOptions(num_threads=2, device=AcceleratorDevice.CPU)
stage("opts built")

converter = DocumentConverter(
    allowed_formats=[InputFormat.PDF, InputFormat.DOCX],
    format_options={
        InputFormat.PDF: PdfFormatOption(
            pipeline_options=options,
            artifacts_path=ARTIFACTS,
        )
    },
)
stage("converter built")

path = sys.argv[1] if len(sys.argv) > 1 else "/home/ayush/rp_fixture.pdf"
stage(f"convert {path}")
res = converter.convert(path, raises_on_error=True, max_num_pages=6)
text = res.document.export_to_text()
stage(f"done text={len(text)}")
print(text[:200], file=_log)
stage("DONE")