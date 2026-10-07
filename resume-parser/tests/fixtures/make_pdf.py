"""Generate a small text-based resume PDF in pure Python (no reportlab).

Used by the integration tests and the local smoke benchmark so the suite
does not need binary fixtures in git. Layout is a plain one-column resume;
`two_column=True` puts contact info in a right-hand column (§44, §53).
"""

from __future__ import annotations

from io import BytesIO

PAGE_W, PAGE_H = 612, 792  # US Letter, points
MARGIN = 72


def _escape(text: str) -> str:
    return text.replace("\\", r"\\").replace("(", r"\(").replace(")", r"\)")


def _text_ops(lines: list[tuple[str, float, float, int]]) -> str:
    """lines: (text, x, y, font_size) → PDF text-drawing operators."""
    parts = ["BT"]
    for text, x, y, size in lines:
        parts.append(f"/F1 {size} Tf {x} {y} Td ({_escape(text)}) Tj")
        # Reset position each iteration: Td is relative to the previous line.
        parts.append(f"/F1 {size} Tf 0 0 Td")
        # (absolute move needs re-issue; simpler: use Tm below)
    parts.append("ET")
    # The relative-Td dance above is error-prone; build with Tm instead.
    parts = ["BT"]
    for text, x, y, size in lines:
        parts.append(
            f"/F1 {size} Tf 1 0 0 1 {x} {y} Tm ({_escape(text)}) Tj"
        )
    parts.append("ET")
    return "\n".join(parts)


def resume_lines(two_column: bool = False) -> list[tuple[str, float, float, int]]:
    left = MARGIN
    lines: list[tuple[str, float, float, int]] = [
        ("AYUSH MISHRA", left, 720, 20),
        ("ayush.mishra@example.com  |  +91 98765 43210", left, 698, 11),
        ("Pune, Maharashtra, India", left, 682, 11),
        ("EDUCATION", left, 648, 13),
        ("Manipal Institute of Technology", left, 628, 11),
        ("B.Tech, Computer Science and Engineering", left, 612, 11),
        ("2022 - 2026  |  CGPA: 8.7/10", left, 596, 11),
        ("EXPERIENCE", left, 566, 13),
        ("Software Engineering Intern, Google India", left, 546, 11),
        ("May 2025 - July 2025", left, 530, 11),
        ("- Built internal dashboards used by 40+ teams.", left, 514, 11),
        ("- Improved query latency by 35%.", left, 500, 11),
        ("SKILLS", left, 470, 13),
        ("Python, React, JavaScript, PostgreSQL, Docker, Git", left, 450, 11),
        ("PROJECTS", left, 420, 13),
        ("NeuroSense", left, 400, 11),
        ("Multimodal Parkinson's detection using handwriting and voice.", left, 384, 11),
        ("Python, SVM, HOG, scikit-learn", left, 370, 11),
    ]
    if two_column:
        right = 340
        lines = [
            ("AYUSH MISHRA", left, 720, 20),
            ("EDUCATION", left, 660, 13),
            ("Manipal Institute of Technology", left, 640, 11),
            ("B.Tech, Computer Science and Engineering", left, 624, 11),
            ("2022 - 2026  |  CGPA: 8.7/10", left, 608, 11),
            ("SKILLS", left, 570, 13),
            ("Python, React, JavaScript,", left, 550, 11),
            ("PostgreSQL, Docker, Git", left, 536, 11),
            ("CONTACT", right, 720, 13),
            ("ayush.mishra@example.com", right, 700, 11),
            ("+91 98765 43210", right, 684, 11),
            ("Pune, India", right, 668, 11),
            ("PROJECTS", right, 630, 13),
            ("NeuroSense", right, 610, 11),
            ("Parkinson's detection via", right, 594, 11),
            ("handwriting and voice.", right, 580, 11),
            ("Python, SVM, scikit-learn", right, 566, 11),
        ]
    return lines


def make_resume_pdf(two_column: bool = False) -> bytes:
    content = _text_ops(resume_lines(two_column)).encode("latin-1")

    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        (
            f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {PAGE_W} {PAGE_H}] "
            "/Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>"
        ).encode("latin-1"),
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        b"<< /Length %d >>\nstream\n" % len(content) + content + b"\nendstream",
    ]

    buffer = BytesIO()
    buffer.write(b"%PDF-1.4\n")
    offsets = []
    for index, body in enumerate(objects, start=1):
        offsets.append(buffer.tell())
        buffer.write(f"{index} 0 obj\n".encode("latin-1"))
        buffer.write(body)
        buffer.write(b"\nendobj\n")

    xref_pos = buffer.tell()
    buffer.write(f"xref\n0 {len(objects) + 1}\n".encode("latin-1"))
    buffer.write(b"0000000000 65535 f \n")
    for offset in offsets:
        buffer.write(f"{offset:010d} 00000 n \n".encode("latin-1"))
    buffer.write(
        (
            f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\n"
            f"startxref\n{xref_pos}\n%%EOF"
        ).encode("latin-1")
    )
    return buffer.getvalue()


if __name__ == "__main__":
    import sys

    two = "--two-column" in sys.argv
    sys.stdout.buffer.write(make_resume_pdf(two))
