"""FastAPI entry point — POST /parse (spec §25, §26, §35).

Validation is layered: filename extension → size → real file bytes, then
Docling's own page/size limits. Only safe operational fields are logged —
never resume contents or extracted personal data (§34, §56).
"""

from __future__ import annotations

import io
import logging
import time
import uuid
import zipfile
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from starlette.concurrency import run_in_threadpool

from app import __version__
from app.docling_service import (
    MAX_FILE_SIZE,
    MAX_PAGES,
    ParseError,
    convert_bytes,
    warm_up,
)
from app.resume_extractor import extract_from_document, _has_useful_content
from app.schemas import Meta, ParseResponse, Profile

logger = logging.getLogger("resume-parser")

ALLOWED_EXTENSIONS = {".pdf", ".docx"}
PDF_MAGIC = b"%PDF-"
DOCX_MAGIC = b"PK\x03\x04"


@asynccontextmanager
async def _lifespan(_app: FastAPI):
    # Warm the converter once at startup so the first signup is not the one
    # that pays for model initialization (§37).
    warm_up()
    yield


app = FastAPI(title="EduMatch Resume Parser", version=__version__, lifespan=_lifespan)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/ready")
def ready() -> dict:
    """Converter initialized (warm) — distinct from process liveness."""
    from app.docling_service import get_fast_converter

    get_fast_converter()
    return {"status": "ready"}


def _error(status: int, code: str, message: str) -> JSONResponse:
    return JSONResponse(
        status_code=status,
        content={"success": False, "error": {"code": code, "message": message}},
    )


def _validate_bytes(filename: str, data: bytes) -> str:
    """Extension + magic-byte checks (§7). Returns the lowercased extension."""
    extension = Path(filename).suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise ParseError(
            "UNSUPPORTED_FORMAT",
            "Only PDF and DOCX files are supported.",
            status=415,
        )
    if len(data) == 0:
        raise ParseError("EMPTY_FILE", "The uploaded file is empty.", status=422)
    if len(data) > MAX_FILE_SIZE:
        raise ParseError("FILE_TOO_LARGE", "Resume is too large (max 5 MB).", status=413)

    if extension == ".pdf":
        if PDF_MAGIC not in data[:1024]:
            raise ParseError(
                "INVALID_FILE",
                "This file does not look like a PDF.",
                status=422,
            )
    else:  # .docx — ZIP container with a Word document inside
        if not data.startswith(DOCX_MAGIC):
            raise ParseError(
                "INVALID_FILE",
                "This file does not look like a DOCX document.",
                status=422,
            )
        try:
            with zipfile.ZipFile(io.BytesIO(data)) as archive:
                names = archive.namelist()
        except zipfile.BadZipFile as exc:
            raise ParseError(
                "INVALID_FILE",
                "This file does not look like a DOCX document.",
                status=422,
            ) from exc
        if not any(name.startswith("word/") for name in names):
            raise ParseError(
                "INVALID_FILE",
                "This file does not look like a DOCX document.",
                status=422,
            )
    return extension


@app.post("/parse")
async def parse_resume(request: Request) -> JSONResponse:
    request_id = request.headers.get("x-request-id", "")[:64]
    started = time.perf_counter()

    form = await request.form()
    upload = form.get("file")
    if upload is None:
        return _error(400, "NO_FILE", "No file was uploaded.")
    # Starlette returns UploadFile; guard against stray form fields.
    read = getattr(upload, "read", None)
    if read is None:
        return _error(400, "NO_FILE", "No file was uploaded.")

    filename = Path(getattr(upload, "filename", "") or "").name
    if not filename:
        return _error(400, "NO_FILE", "Missing filename.")

    data = await upload.read()
    ocr_used = False
    suffix = Path(filename).suffix.lower()
    source_format = suffix.lstrip(".") if suffix.startswith(".") else suffix
    status = "success"

    try:
        source_format = _validate_bytes(filename, data).lstrip(".")
        # Conversion + extraction are CPU-bound and must not run on the event
        # loop, or concurrent uploads serialize and /health stops answering
        # mid-parse. Hand them to the threadpool (bounded inside the service).
        outcome = await run_in_threadpool(convert_bytes, filename, data)
        ocr_used = outcome.ocr_used
        profile, warnings = await run_in_threadpool(
            extract_from_document, outcome.document
        )
    except ParseError as exc:
        status = exc.code
        _log(request_id, filename, len(data), ocr_used, started, status)
        return _error(exc.status, exc.code, exc.message)
    except Exception:  # noqa: BLE001 - never leak internals (§25)
        status = "INTERNAL"
        logger.exception("resume parse failed request_id=%s", request_id)
        _log(request_id, filename, len(data), ocr_used, started, status)
        return _error(500, "INTERNAL", "Something went wrong while reading this resume.")

    if not _has_useful_content(profile):
        status = "NO_USEFUL_TEXT"
        _log(request_id, filename, len(data), ocr_used, started, status)
        return _error(
            422,
            "NO_USEFUL_TEXT",
            "We could not extract enough information from this resume.",
        )

    elapsed_ms = round((time.perf_counter() - started) * 1000)
    if ocr_used:
        warnings.append("Resume appears to be image-based; OCR was used.")

    body = ParseResponse(
        success=True,
        profile=profile,
        meta=Meta(
            ocrUsed=ocr_used,
            sourceFormat=source_format,
            processingTimeMs=elapsed_ms,
            warnings=warnings,
        ),
    )
    _log(request_id, filename, len(data), ocr_used, started, status)
    return JSONResponse(content=body.model_dump())


def _log(
    request_id: str,
    filename: str,
    size: int,
    ocr_used: bool,
    started: float,
    status: str,
) -> None:
    """Safe operational log only — no content, no personal data (§56)."""
    logger.info(
        "event=resume_parse request_id=%s format=%s bytes=%d ocrUsed=%s "
        "processingTimeMs=%d status=%s",
        request_id or uuid.uuid4().hex[:12],
        Path(filename).suffix.lower().removeprefix("."),
        size,
        ocr_used,
        round((time.perf_counter() - started) * 1000),
        status,
    )
