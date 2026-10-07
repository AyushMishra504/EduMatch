"""Docling integration: warm fast converter, lazy OCR fallback (§11, §12, §27).
 
 Docling is imported here only — the extraction core stays importable
 without it. The fast converter is built at module import (service warm-up,
 spec §37); the OCR converter is created lazily on first scanned document.
 """

from __future__ import annotations

import io
import os
import threading
from dataclasses import dataclass

MAX_FILE_SIZE = 5 * 1024 * 1024
MAX_PAGES = 6
DOCUMENT_TIMEOUT = 45

# Text-quality heuristic (§12) deciding whether the OCR pass is needed.
_MIN_TEXT_LEN = 250
_MIN_WITH_SIGNAL = 600


class ParseError(Exception):
    """Conversion failure with a safe, user-facing code."""

    def __init__(self, code: str, message: str, status: int = 422):
        super().__init__(code)
        self.code = code
        self.message = message
        self.status = status


@dataclass
class ConversionOutcome:
    document: object
    ocr_used: bool


def _get_artifacts_path():
    """Resolve model artifacts path for offline/pre-cached models."""
    home = os.path.expanduser("~")
    candidates = [
        os.environ.get("DOCLING_ARTIFACTS_PATH"),
        os.path.join(home, ".local/share/edumatch-models"),
        "/usr/share/edumatch-models",
    ]
    for c in candidates:
        if c and os.path.isdir(os.path.join(c, "docling-project--docling-layout-heron-onnx")):
            return c
    return None


def build_fast_converter():
    from docling.datamodel.base_models import InputFormat
    from docling.datamodel.object_detection_engine_options import (
        OnnxRuntimeObjectDetectionEngineOptions,
    )
    from docling.datamodel.pipeline_options import (
        LayoutObjectDetectionOptions,
        PdfPipelineOptions,
        RapidOcrOptions,
    )
    from docling.datamodel.accelerator_options import AcceleratorDevice, AcceleratorOptions
    from docling.document_converter import DocumentConverter, PdfFormatOption

    options = PdfPipelineOptions(
        do_ocr=False,
        do_table_structure=False,
        do_code_enrichment=False,
        do_formula_enrichment=False,
        generate_page_images=False,
        generate_picture_images=False,
        generate_table_images=False,
        do_picture_classification=False,
        do_picture_description=False,
        do_chart_extraction=False,
        document_timeout=DOCUMENT_TIMEOUT,
        layout_options=LayoutObjectDetectionOptions(
            engine_options=OnnxRuntimeObjectDetectionEngineOptions(providers=["CPUExecutionProvider"])
        ),
        ocr_options=RapidOcrOptions(lang=["en"]),
    )
    options.enable_remote_services = False
    options.accelerator_options = AcceleratorOptions(num_threads=2, device=AcceleratorDevice.CPU)
    return DocumentConverter(
        allowed_formats=[InputFormat.PDF, InputFormat.DOCX],
        format_options={
            InputFormat.PDF: PdfFormatOption(
                pipeline_options=options,
                artifacts_path=_get_artifacts_path(),
            )
        },
    )


def build_ocr_converter():
    from docling.datamodel.base_models import InputFormat
    from docling.datamodel.object_detection_engine_options import (
        OnnxRuntimeObjectDetectionEngineOptions,
    )
    from docling.datamodel.pipeline_options import (
        LayoutObjectDetectionOptions,
        PdfPipelineOptions,
        RapidOcrOptions,
    )
    from docling.datamodel.accelerator_options import AcceleratorDevice, AcceleratorOptions
    from docling.document_converter import DocumentConverter, PdfFormatOption

    options = PdfPipelineOptions(
        do_ocr=True,
        do_table_structure=False,
        do_code_enrichment=False,
        do_formula_enrichment=False,
        generate_page_images=False,
        generate_picture_images=False,
        generate_table_images=False,
        document_timeout=DOCUMENT_TIMEOUT,
        layout_options=LayoutObjectDetectionOptions(
            engine_options=OnnxRuntimeObjectDetectionEngineOptions(providers=["CPUExecutionProvider"])
        ),
        ocr_options=RapidOcrOptions(lang=["en"]),
    )
    options.enable_remote_services = False
    options.accelerator_options = AcceleratorOptions(num_threads=2, device=AcceleratorDevice.CPU)
    return DocumentConverter(
        allowed_formats=[InputFormat.PDF, InputFormat.DOCX],
        format_options={
            InputFormat.PDF: PdfFormatOption(
                pipeline_options=options,
                artifacts_path=_get_artifacts_path(),
            )
        },
    )


_fast_converter = None
_ocr_converter = None
_ocr_lock = threading.Lock()


def get_fast_converter():
    global _fast_converter
    if _fast_converter is None:
        _fast_converter = build_fast_converter()
    return _fast_converter


def get_ocr_converter():
    """Lazy: most resumes are digital and never pay this cost (§27)."""
    global _ocr_converter
    if _ocr_converter is None:
        with _ocr_lock:
            if _ocr_converter is None:
                _ocr_converter = build_ocr_converter()
    return _ocr_converter


def warm_up() -> None:
    """Initialize the fast converter once at startup (§37)."""
    get_fast_converter()


def _convert(converter, filename: str, data: bytes):
    from docling.datamodel.base_models import DocumentStream

    source = DocumentStream(name=filename, stream=io.BytesIO(data))
    return converter.convert(
        source,
        raises_on_error=True,
        max_num_pages=MAX_PAGES,
        max_file_size=MAX_FILE_SIZE,
    )


def needs_ocr(text: str) -> bool:
    """Heuristic from §12 — tuned with real fixtures, never single-rule."""
    compact = " ".join(text.split())
    looks_empty = len(compact) < _MIN_TEXT_LEN
    has_email = "@" in compact
    has_sections = any(
        marker in compact.lower()
        for marker in ("experience", "education", "skills", "projects")
    )
    if looks_empty:
        return True
    return not has_email and not has_sections and len(compact) < _MIN_WITH_SIGNAL


def convert_bytes(filename: str, data: bytes) -> ConversionOutcome:
    """Fast pass first; OCR pass only when the text looks unusable."""
    try:
        result = _convert(get_fast_converter(), filename, data)
        text = result.document.export_to_text()
    except ParseError:
        raise
    except Exception as exc:  # noqa: BLE001 - surfaced as a safe 422
        raise ParseError(
            "CONVERSION_FAILED",
            "We could not read this resume. You can enter your details manually.",
        ) from exc

    if needs_ocr(text):
        try:
            ocr_result = _convert(get_ocr_converter(), filename, data)
            ocr_text = ocr_result.document.export_to_text()
            if len(" ".join(ocr_text.split())) > len(" ".join(text.split())):
                return ConversionOutcome(document=ocr_result.document, ocr_used=True)
        except Exception:  # noqa: BLE001 - fall through to the fast result
            pass

    return ConversionOutcome(document=result.document, ocr_used=False)
