# Resume parser image (FastAPI + Docling).
#
# Build from the repo root:  docker build -f resume-parser/Dockerfile resume-parser
#
# NOTE: authored but NOT built in the authoring environment (no Docker there).
# The image is intentionally CPU-only: the CUDA torch wheels are ~10x larger
# and this service runs on CPU (see requirements.txt's dependency audit).

FROM python:3.12-slim AS base
WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    # Models are baked in below — never reach the network per request (§3).
    HF_HUB_OFFLINE=1 \
    HF_HUB_DISABLE_TELEMETRY=1 \
    # Bound parallel ONNX conversions (docling_service.MAX_CONCURRENCY).
    PARSER_MAX_CONCURRENCY=2

# CPU-only torch/torchvision from the PyTorch CPU index — must land before
# requirements.txt so the resolver does not pull the CUDA build.
RUN pip install --index-url https://download.pytorch.org/whl/cpu torch torchvision

COPY requirements.txt ./
RUN pip install -r requirements.txt

COPY app ./app

# Prefetch the Docling layout/OCR artifacts at build time so the container
# starts warm and the first signup does not pay model initialization (§37).
RUN docling-tools models download --output-dir /opt/docling-models || true
ENV DOCLING_ARTIFACTS_PATH=/opt/docling-models

EXPOSE 8000
# /ready reports converter warm-up (distinct from /health liveness), so give
# it a generous start period.
HEALTHCHECK --interval=30s --timeout=5s --start-period=120s --retries=3 \
    CMD python -c "import urllib.request, sys; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8000/ready').status == 200 else 1)"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
