"""Minimal diag: check converter creation + convert without heavy imports except core."""

from __future__ import annotations

import faulthandler
import os
import sys
import time

LOG = os.path.expanduser("~/rp_diag7.log")
ARTIFACTS = os.path.expanduser("~/.local/share/edumatch-models")

os.environ.setdefault("HF_HUB_OFFLINE", "1")
os.environ.setdefault("HF_HUB_DISABLE_TELEMETRY", "1")

T0 = time.time()
_log = open(LOG, "w", buffering=1)
faulthandler.enable(file=_log)
faulthandler.dump_traceback_later(20, repeat=True, file=_log)


def s(n: str) -> None:
    print(f"[{time.time() - T0:6.2f}s] {n}", file=_log, flush=True)


try:
    s("1. docling imports")
    from docling.datamodel.base_models import InputFormat
    from docling.datamodel.pipeline_options import (
        LayoutObjectDetectionOptions,
        PdfPipelineOptions,
        RapidOcrOptions,
    )
    from docling.datamodel.object_detection_engine_options import OnnxRuntimeObjectDetectionEngineOptions
    from docling.datamodel.accelerator_options import AcceleratorDevice, AcceleratorOptions
    s("2. converter")
    from docling.document_converter import DocumentConverter, PdfFormatOption
    s("3. build opts")
    opts = PdfPipelineOptions(
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
        layout_options=LayoutObjectDetectionOptions(
            engine_options=OnnxRuntimeObjectDetectionEngineOptions(providers=["CPUExecutionProvider"])
        ),
        ocr_options=RapidOcrOptions(lang=["en"]),
    )
    opts.enable_remote_services = False
    opts.accelerator_options = AcceleratorOptions(num_threads=1, device=AcceleratorDevice.CPU)
    s("4. converter instance")
    conv = DocumentConverter(
        allowed_formats=[InputFormat.PDF, InputFormat.DOCX],
        format_options={InputFormat.PDF: PdfFormatOption(pipeline_options=opts, artifacts_path=ARTIFACTS)},
    )
    s("5. convert")
    path = sys.argv[1] if len(sys.argv) > 1 else "/home/ayush/rp_fixture.pdf"
    res = conv.convert(path, raises_on_error=True, max_num_pages=6)
    s("6. export")
    _ = res.document.export_to_text()
    s("7. DONE")
except Exception as e:
    s(f"ERR {type(e).__name__}")
    raise
