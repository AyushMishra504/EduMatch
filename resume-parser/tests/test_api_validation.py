"""HTTP-layer validation (§7, §35) — runs without Docling installed."""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)  # no lifespan: startup warm-up never runs here

DOCX_BYTES = b"PK\x03\x04" + b"\x00" * 64


def _post(filename: str, data: bytes):
    return client.post("/parse", files={"file": (filename, data, "application/octet-stream")})


def test_health():
    assert client.get("/health").json() == {"status": "ok"}


def test_missing_file_is_400():
    response = client.post("/parse", data={})
    assert response.status_code == 400
    assert response.json()["error"]["code"] == "NO_FILE"


def test_unsupported_extension_is_415():
    response = _post("resume.txt", b"hello")
    assert response.status_code == 415
    assert response.json()["error"]["code"] == "UNSUPPORTED_FORMAT"


def test_oversized_file_is_413():
    big = b"%PDF-" + b"\x00" * (5 * 1024 * 1024 + 10)
    response = _post("resume.pdf", big)
    assert response.status_code == 413
    assert response.json()["error"]["code"] == "FILE_TOO_LARGE"


def test_fake_pdf_is_422():
    response = _post("resume.pdf", b"not a real pdf at all")
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "INVALID_FILE"


def test_fake_docx_is_422():
    response = _post("resume.docx", b"PK\x03\x04 definitely not a zip")
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "INVALID_FILE"


def test_zip_without_word_document_is_422():
    import io
    import zipfile

    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w") as archive:
        archive.writestr("other/data.xml", "<x/>")
    response = _post("resume.docx", buffer.getvalue())
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "INVALID_FILE"


def test_filename_is_basename_only():
    # A path-traversing filename must be reduced to its basename.
    response = _post("../../evil.pdf", b"not a real pdf")
    # Rejected as invalid file (not as missing) — never used as a path.
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "INVALID_FILE"
