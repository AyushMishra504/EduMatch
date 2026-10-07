"""End-to-end /parse roundtrip (§47) — requires Docling + python-docx.

Skipped automatically when the heavy dependency is not installed, so the
light unit suite stays runnable anywhere.
"""

import pytest

docling = pytest.importorskip("docling", reason="docling not installed")
pytest.importorskip("docx", reason="python-docx not installed")

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402


def _docx_bytes(paragraphs: list[str]) -> bytes:
    from docx import Document

    document = Document()
    for line in paragraphs:
        document.add_paragraph(line)
    import io

    buffer = io.BytesIO()
    document.save(buffer)
    return buffer.getvalue()


CONTENT = [
    "AYUSH MISHRA",
    "ayush.mishra@example.com",
    "+91 98765 43210",
    "Pune, Maharashtra",
    "EDUCATION",
    "Manipal Institute of Technology",
    "B.Tech, Computer Science",
    "2022 - 2026 | CGPA: 8.7/10",
    "SKILLS",
    "Python, React, PostgreSQL, Git",
]


def test_docx_parse_roundtrip():
    with TestClient(app) as client:  # lifespan: warm-up runs once
        response = client.post(
            "/parse",
            files={"file": ("resume.docx", _docx_bytes(CONTENT), "application/vnd.openxmlformats-officedocument.wordprocessingml.document")},
        )
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["success"] is True
    personal = body["profile"]["personal"]
    assert personal["email"] == "ayush.mishra@example.com"
    assert personal["phone"] == "+919876543210"
    assert personal["location"] == "Pune, Maharashtra"
    assert body["profile"]["education"], "education should be extracted"
    assert "Python" in body["profile"]["skills"]
    assert body["meta"]["sourceFormat"] == "docx"
    assert body["meta"]["processingTimeMs"] >= 0
