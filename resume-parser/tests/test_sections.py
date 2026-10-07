"""Section detection: heading normalization, aliases, block grouping (§17)."""

from app.sections import (
    build_blocks,
    build_tagged_lines,
    canonical_for_heading,
    lines_before_first_section,
    normalize_heading,
)


def test_normalize_heading_strips_punctuation_and_case():
    assert normalize_heading("Work Experience:") == "work experience"
    assert normalize_heading("TECHNICAL SKILLS") == "technical skills"
    assert normalize_heading("Licenses & Certifications") == "licenses & certifications"


def test_canonical_aliases():
    assert canonical_for_heading("Education") == "education"
    assert canonical_for_heading("Academic Background") == "education"
    assert canonical_for_heading("Work Experience") == "experience"
    assert canonical_for_heading("Internships") == "experience"
    assert canonical_for_heading("Personal Projects") == "projects"
    assert canonical_for_heading("Technical Skills") == "skills"
    assert canonical_for_heading("Certificates") == "certifications"
    assert canonical_for_heading("Summary") is None  # meta, not a section


def test_plain_text_builds_header_blocks():
    text = "AYUSH\nayush@example.com\n\nEDUCATION\nMIT\nB.Tech\n"
    tagged = build_tagged_lines(text)
    # ALL-CAPS short lines are headers even without a known alias.
    kinds = dict(tagged)
    assert ("header", "EDUCATION") in tagged
    blocks = build_blocks(tagged)
    education = [b for b in blocks if b.canonical == "education"]
    assert len(education) == 1
    assert "MIT" in education[0].lines


def test_contact_region_is_before_first_section():
    text = "Jane\njane@example.com\nEDUCATION\nMIT\n"
    blocks = build_blocks(build_tagged_lines(text))
    head = lines_before_first_section(blocks)
    assert "Jane" in head
    assert "MIT" not in head


def test_lowercase_prose_is_not_a_header():
    tagged = build_tagged_lines("Built dashboards with React and Node.js")
    assert tagged[0][0] == "text"
