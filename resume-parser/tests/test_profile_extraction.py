"""Field-level extraction from fixture resumes (spec §15–§23, §48, §54)."""

from pathlib import Path

import pytest

from app.resume_extractor import extract_from_text

FIXTURES = Path(__file__).parent / "fixtures"


@pytest.fixture(scope="module")
def normal():
    text = (FIXTURES / "normal_resume.txt").read_text()
    profile, warnings = extract_from_text(text)
    return profile, warnings


@pytest.fixture(scope="module")
def sparse():
    text = (FIXTURES / "sparse_resume.txt").read_text()
    profile, warnings = extract_from_text(text)
    return profile, warnings


def test_personal_fields(normal):
    profile, _ = normal
    personal = profile.personal
    assert personal.name == "AYUSH MISHRA"
    assert personal.email == "ayush.mishra@example.com"
    assert personal.phone == "+919876543210"
    assert personal.location == "Pune, Maharashtra"
    assert personal.linkedin == "https://linkedin.com/in/ayushmishra"
    assert personal.github == "https://github.com/ayushmishra"
    assert personal.orcid == "0000-0002-1825-0097"


def test_education_records(normal):
    profile, _ = normal
    assert len(profile.education) == 2

    first = profile.education[0]
    assert first.institution == "Manipal Institute of Technology"
    assert first.degree == "B.Tech"
    assert first.field == "Computer Science"
    assert first.startDate == "2022"
    assert first.endDate == "2026"
    assert first.grade == "8.7/10"

    second = profile.education[1]
    assert second.institution == "St. Xavier's College"
    assert second.degree == "B.Sc"
    assert second.field == "Physics"
    assert second.startDate == "2018"
    assert second.endDate == "2021"
    assert second.grade == "82%"


def test_experience_records(normal):
    profile, _ = normal
    assert len(profile.experience) == 2

    first = profile.experience[0]
    assert first.role == "Software Engineering Intern"
    assert first.company == "Google India"
    assert first.startDate == "2025-05"
    assert first.endDate == "2025-07"
    assert "Internal dashboards" not in (first.description or "")  # verbatim bullets
    assert "dashboard query latency" in (first.description or "")

    second = profile.experience[1]
    assert second.role == "Research Assistant"
    assert second.company == "IIT Bombay"
    assert second.startDate == "2024-01"
    assert second.endDate == "2024-04"


def test_skills_canonical_and_deduped(normal):
    profile, _ = normal
    assert "Python" in profile.skills
    assert "React" in profile.skills
    assert "Node.js" in profile.skills
    assert "PostgreSQL" in profile.skills
    assert "Machine Learning" in profile.skills
    # "Node.js" must not also register the bare "js" alias as JavaScript.
    assert profile.skills.count("JavaScript") == 0
    assert len(profile.skills) == len(set(profile.skills))


def test_project_technologies_match_spec_example(normal):
    profile, _ = normal
    assert len(profile.projects) == 1
    project = profile.projects[0]
    assert project.name == "NeuroSense"
    assert "Parkinson" in (project.description or "")
    # Description must not repeat the technology line.
    assert "HOG" not in (project.description or "")
    assert project.technologies == ["Python", "SVM", "HOG", "scikit-learn"]


def test_certifications_and_eligibility(normal):
    profile, _ = normal
    names = [c.name for c in profile.certifications]
    assert any("AWS Certified" in n for n in names)
    assert "UGC-NET" in profile.eligibilityHints


def test_sparse_resume_warns_but_never_invents(sparse):
    profile, warnings = sparse
    personal = profile.personal
    assert personal.name == "Jane Doe"
    assert personal.email == "jane@example.com"
    # No degree/dates in the resume → no invented education row.
    assert profile.education == []
    assert profile.experience == []
    assert personal.phone is None
    assert any("phone" in w.lower() for w in warnings)
    assert any("education" in w.lower() for w in warnings)
    # Skills still extracted from the section that exists.
    assert "Python" in profile.skills


def test_no_content_at_all_flags_failure():
    profile, _ = extract_from_text("lorem ipsum")
    assert not profile.personal.email
    assert not profile.education
