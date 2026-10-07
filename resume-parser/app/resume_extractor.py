"""Deterministic resume → ProfileImport extraction (spec §15–§23, §45).

Section-aware: every field is pulled from its own section first, with a
whole-document fallback only where the spec allows one (contacts, skills
hints). Never invents a value — unclear fields stay None/[].

Docling is imported only in `docling_service`/`main`; this module is pure
Python so the unit suite runs without Docling installed.
"""

from __future__ import annotations

import re
from typing import Optional

from app.normalizer import (
    find_eligibility_hints,
    find_email,
    find_grade,
    find_links,
    find_name,
    find_orcid,
    find_phone,
    format_date,
    detect_degree,
    has_date_range,
    looks_like_institution,
    parse_date_range,
    parse_location,
)
from app.sections import (
    Block,
    build_blocks,
    build_tagged_lines,
    join_block_lines,
    lines_before_first_section,
)
from app.skills_dictionary import match_skills
from app.schemas import (
    CertificationItem,
    EducationItem,
    ExperienceItem,
    Profile,
    ProjectItem,
)

_BULLET_RE = re.compile(r"^\s*(?:[-*•●▪◦]|\d+[.)])\s+")
_FIELD_SEPARATORS_RE = re.compile(r"[,;:|\u2013\u2014()]+")
_YEAR_RE = re.compile(r"\b(?:19|20)\d{2}\b")

_MAX_EDUCATION = 6
_MAX_EXPERIENCE = 10
_MAX_PROJECTS = 8
_MAX_CERTIFICATIONS = 8


def _strip_bullet(line: str) -> tuple[str, bool]:
    stripped = _BULLET_RE.sub("", line).strip()
    return stripped, stripped != line.strip()


def _clean_line(line: str) -> str:
    return _strip_bullet(line)[0].strip()


# ---------------------------------------------------------------------------
# Entry points
# ---------------------------------------------------------------------------

def extract_from_text(text: str) -> tuple[Profile, list[str]]:
    tagged = build_tagged_lines(text)
    return _extract(tagged)


def extract_from_document(document) -> tuple[Profile, list[str]]:
    """From a DoclingDocument via iterate_items() (labels + reading order)."""
    tagged: list[tuple[str, str]] = []
    for item, _level in document.iterate_items():
        text = getattr(item, "text", None)
        if not text:
            continue
        label = str(getattr(item, "label", "")).lower()
        raw_text = str(text)
        t = raw_text.strip()
        section_like = (
            "section_header" in label
            or "header" in label
            or t.upper() in {
                "EDUCATION",
                "EXPERIENCE",
                "WORK EXPERIENCE",
                "PROFESSIONAL EXPERIENCE",
                "SKILLS",
                "TECHNICAL SKILLS",
                "PROJECTS",
                "CERTIFICATIONS",
                "PUBLICATIONS",
                "RESEARCH",
                "ACHIEVEMENTS",
                "AWARDS",
                "SUMMARY",
                "OBJECTIVE",
                "PROFILE",
                "CONTACT",
            }
            or re.match(r"^(education|experience|work experience|projects|skills|certifications|publications|achievements|awards|summary|profile|contact)$", t, re.IGNORECASE)
        )
        kind = "header" if section_like else "text"
        for subline in raw_text.splitlines():
            if subline.strip():
                tagged.append((kind, subline.strip()))
    if not tagged:
        return Profile(), ["No readable text was found in this resume."]
    return _extract(tagged)


def extract_profile(document) -> tuple[Profile, list[str]]:
    return extract_from_document(document)


# ---------------------------------------------------------------------------
# Pipeline
# ---------------------------------------------------------------------------

def _extract(tagged: list[tuple[str, str]]) -> tuple[Profile, list[str]]:
    warnings: list[str] = []
    blocks = build_blocks(tagged)
    sections: dict[str, list[Block]] = {}
    for block in blocks:
        if block.canonical:
            sections.setdefault(block.canonical, []).append(block)

    head_lines = [line for _kind, line in tagged[:10]]
    contact_lines = lines_before_first_section(blocks)
    full_text = "\n".join(line for _kind, line in tagged)

    name = find_name(head_lines)
    email = find_email(full_text)
    phone = find_phone(full_text)
    links = find_links(full_text)
    orcid = find_orcid(full_text)

    location = None
    for line in contact_lines:
        location = parse_location(line, name=name)
        if location:
            break
    if location is None:
        for line in head_lines:
            location = parse_location(line, name=name)
            if location:
                break

    profile = Profile()
    profile.personal.name = name
    profile.personal.email = email
    profile.personal.phone = phone
    profile.personal.location = location
    profile.personal.linkedin = links["linkedin"]
    profile.personal.github = links["github"]
    profile.personal.portfolio = links["portfolio"]
    profile.personal.orcid = orcid

    education_lines = join_block_lines(sections.get("education", []))
    experience_lines = join_block_lines(sections.get("experience", []))
    project_lines = join_block_lines(sections.get("projects", []))
    skill_lines = join_block_lines(sections.get("skills", []))
    cert_lines = join_block_lines(sections.get("certifications", []))

    profile.education = _extract_education(education_lines)
    profile.experience, date_warnings = _extract_experience(experience_lines)
    warnings.extend(date_warnings)
    profile.projects = _extract_projects(project_lines)
    profile.certifications = _extract_certifications(cert_lines)
    profile.eligibilityHints = find_eligibility_hints(full_text)

    skill_pool = "\n".join(
        "\n".join(part) for part in (skill_lines, experience_lines, project_lines) if part
    )
    profile.skills = match_skills(skill_pool or full_text)

    if email is None:
        warnings.append("Could not find an email address in this resume.")
    if phone is None:
        warnings.append("Could not find a phone number in this resume.")
    if not profile.education:
        warnings.append("No education entries could be read from this resume.")
    if not profile.experience and not profile.education:
        warnings.append("This resume may be image-based or use an unusual layout.")

    if not _has_useful_content(profile):
        return profile, ["Not enough readable content was found in this resume."]
    return profile, warnings


def _has_useful_content(profile: Profile) -> bool:
    p = profile.personal
    return bool(
        p.email
        or p.name
        or p.phone
        or profile.education
        or profile.experience
        or profile.skills
    )


# ---------------------------------------------------------------------------
# Education (§19)
# ---------------------------------------------------------------------------

def _extract_education(lines: list[str]) -> list[EducationItem]:
    groups: list[list[str]] = []
    current: list[str] = []

    for raw in lines:
        line = _clean_line(raw)
        if not line:
            continue
        has_degree_now = any(detect_degree(existing) for existing in current)
        has_date_now = any(parse_date_range(existing) for existing in current)
        starts_new = bool(current) and (
            (bool(detect_degree(line)) and has_degree_now)
            or (has_degree_now and has_date_now)
        )
        if starts_new:
            groups.append(current)
            current = []
        current.append(line)
    if current:
        groups.append(current)

    items: list[EducationItem] = []
    for group in groups[:_MAX_EDUCATION]:
        item = _parse_education_group(group)
        if item is not None:
            items.append(item)
    return items


def _parse_education_group(lines: list[str]) -> Optional[EducationItem]:
    degree: Optional[str] = None
    degree_line_index: Optional[int] = None
    for index, line in enumerate(lines):
        found = detect_degree(line)
        if found:
            degree = found
            degree_line_index = index
            break

    dates = None
    grade: Optional[str] = None
    for line in lines:
        if dates is None:
            dates = parse_date_range(line)
        if grade is None:
            grade = find_grade(line)

    institution: Optional[str] = None
    field: Optional[str] = None

    for line in lines:
        if looks_like_institution(line):
            institution = line
            break

    # Field: remainder of the degree line, e.g. "B.Tech, Computer Science".
    if degree and degree_line_index is not None:
        remainder = lines[degree_line_index]
        remainder = remainder.replace(degree, " ", 1)
        remainder = _FIELD_SEPARATORS_RE.sub(" ", remainder).strip()
        remainder = re.sub(r"^(?:in|of|from)\s+", "", remainder, flags=re.IGNORECASE)
        if 2 <= len(remainder) <= 60 and not _YEAR_RE.search(remainder):
            field = remainder

    if field is None:
        for line in lines:
            if line == degree or line == institution:
                continue
            if _YEAR_RE.search(line) or looks_like_institution(line):
                continue
            if detect_degree(line):
                continue
            candidate = _FIELD_SEPARATORS_RE.sub(" ", line).strip()
            if 2 <= len(candidate) <= 60 and len(candidate.split()) <= 8:
                field = candidate
                break

    if institution is None:
        for line in lines:
            if line == degree or line == field:
                continue
            if _YEAR_RE.search(line) or detect_degree(line):
                continue
            if 2 <= len(line) <= 100 and len(line.split()) <= 8:
                institution = line
                break

    if not degree or not field or not institution or not dates:
        return None

    return EducationItem(
        institution=institution[:100],
        degree=degree[:60],
        field=field[:60],
        startDate=format_date(dates["start"]),
        endDate=None if dates["present"] else format_date(dates.get("end")),
        grade=grade[:20] if grade else None,
    )


# ---------------------------------------------------------------------------
# Experience (§20)
# ---------------------------------------------------------------------------

def _extract_experience(lines: list[str]) -> tuple[list[ExperienceItem], list[str]]:
    warnings: list[str] = []
    chunks: list[list[tuple[str, bool]]] = []
    current: list[tuple[str, bool]] = []
    current_has_date = False

    for raw in lines:
        line = _clean_line(raw)
        if not line:
            continue
        is_bullet = _strip_bullet(raw)[1]
        has_date = has_date_range(line)
        if current and not is_bullet and current_has_date:
            chunks.append(current)
            current = []
            current_has_date = False
        current.append((line, is_bullet))
        current_has_date = current_has_date or has_date
    if current:
        chunks.append(current)

    items: list[ExperienceItem] = []
    for chunk in chunks[:_MAX_EXPERIENCE]:
        item, chunk_warnings = _parse_experience_chunk(chunk)
        warnings.extend(chunk_warnings)
        if item is not None:
            items.append(item)
    return items, warnings


def _parse_experience_chunk(
    chunk: list[tuple[str, bool]],
) -> tuple[Optional[ExperienceItem], list[str]]:
    warnings: list[str] = []
    dates = None
    for line, _bullet in chunk:
        if dates is None:
            dates = parse_date_range(line)
    if dates is None:
        return None, warnings

    all_headers = [line for line, _bullet in chunk if not _bullet]
    bullet_lines = [line for line, bullet in chunk if bullet]
    # Pure date lines carry no identity — drop them from the stacked layout.
    header_lines = [
        line
        for line in all_headers
        if not parse_date_range(line) or detect_degree(line)
    ]

    company: Optional[str] = None
    role: Optional[str] = None

    pipe_index = next(
        (i for i, line in enumerate(all_headers) if "|" in line),
        None,
    )
    if pipe_index is not None:
        parts = [p.strip() for p in all_headers[pipe_index].split("|") if p.strip()]
        non_date = [p for p in parts if not has_date_range(p)]
        if len(non_date) == 2:
            first, second = non_date
            first_company = bool(re.search(r"(?i)\b(ltd|pvt|inc|llp|llc|college|university|institute)\b", first))
            second_company = bool(re.search(r"(?i)\b(ltd|pvt|inc|llp|llc|college|university|institute)\b", second))
            first_role = bool(re.search(r"(?i)\b(intern|engineer|assistant|professor|lecturer|developer|manager|analyst)\b", first))
            second_role = bool(re.search(r"(?i)\b(intern|engineer|assistant|professor|lecturer|developer|manager|analyst)\b", second))
            if first_company and not second_company:
                company, role = first, second
            elif second_company and not first_company:
                company, role = second, first
            elif first_role and not second_role:
                role, company = first, second
            elif second_role and not first_role:
                role, company = second, first
            else:
                company, role = first, second
        elif len(non_date) == 1:
            single = non_date[0]
            if re.search(r"(?i)\b(intern|engineer|assistant|professor|lecturer)\b", single):
                role = single
            else:
                company = single
        remaining_headers = [h for i, h in enumerate(all_headers) if i != pipe_index]
        remaining_headers = [
            line
            for line in remaining_headers
            if not parse_date_range(line) or detect_degree(line)
        ]
    else:
        remaining_headers = list(header_lines)

    role_hint_index = next(
        (i for i, line in enumerate(remaining_headers) if re.search(r"(?i)\b(intern|engineer|developer|assistant|professor|lecturer|faculty|trainer|teacher|manager|analyst|consultant|specialist|researcher|trainee|coordinator|officer|executive|architect|designer|scientist|tutor|head|director)\b", line)),
        None,
    )
    company_hint_index = next(
        (i for i, line in enumerate(remaining_headers) if re.search(r"(?i)\b(ltd|pvt|inc|llp|llc|college|university|institute|school|academy|hospital|foundation|bank|technologies|systems|labs|solutions|services|studio|org|ngo)\b", line)),
        None,
    )

    if role is None and company is None:
        if role_hint_index is not None:
            role = remaining_headers[role_hint_index]
            others = [h for i, h in enumerate(remaining_headers) if i != role_hint_index]
            company = others[0] if others else None
        elif company_hint_index is not None:
            company = remaining_headers[company_hint_index]
            others = [h for i, h in enumerate(remaining_headers) if i != company_hint_index]
            role = others[0] if others else None
        elif remaining_headers:
            role = remaining_headers[0]
            company = remaining_headers[1] if len(remaining_headers) > 1 else None
    elif role is None and company is not None:
        others = [h for h in remaining_headers if h != company]
        role = others[0] if others else None
    elif company is None and role is not None:
        others = [h for h in remaining_headers if h != role]
        company = others[0] if others else None

    if role and len(role) > 60:
        role = None
        warnings.append("An experience role title was too long to import.")
    if company and len(company) > 100:
        company = None
    if role and company and role == company:
        company = None

    if not role and not company:
        return None, warnings

    if not dates["present"] and dates.get("end") and dates["end"].get("m") is None:
        warnings.append("Some experience dates only had a year — the month was filled in for you to adjust.")
    if dates["start"].get("m") is None:
        warnings.append("Some experience start dates only had a year — the month was filled in for you to adjust.")

    description_parts = [line for line in header_lines]
    description_parts.extend(bullet_lines)
    description = " \u2022 ".join(p for p in description_parts if p) or None
    if description and len(description) > 900:
        description = description[:900]

    return (
        ExperienceItem(
            company=company[:100] if company else None,
            role=role[:60] if role else None,
            startDate=format_date(dates["start"]),
            endDate=None if dates["present"] else format_date(dates.get("end")),
            description=description,
        ),
        warnings,
    )


# ---------------------------------------------------------------------------
# Projects (§21)
# ---------------------------------------------------------------------------

def _looks_like_project_name(line: str, has_content: bool) -> bool:
    if not has_content:
        return True
    if "," in line or _YEAR_RE.search(line) or len(line.split()) > 6:
        return False
    if line.endswith((".", "!", "?")) or not line[:1].isupper():
        return False  # prose continues, not a new project title
    return len(line) <= 50


def _extract_projects(lines: list[str]) -> list[ProjectItem]:
    items: list[ProjectItem] = []
    name: Optional[str] = None
    content: list[str] = []

    def flush() -> None:
        nonlocal name, content
        if name:
            tech_line: str | None = None
            technologies: list[str] = []
            for line in content:
                matches = match_skills(line)
                if len(matches) >= 2 and ("," in line or "|" in line):
                    raw = [
                        t.strip()
                        for t in re.split(r"[,|/]", line)
                        if t.strip() and len(t.strip()) <= 30
                    ]
                    technologies = raw[:8]
                    tech_line = line
                    break
            if not technologies:
                technologies = match_skills("\n".join(content))[:8]
            description_lines = [
                line for line in content if line != tech_line
            ]
            description = " ".join(description_lines) or None
            items.append(
                ProjectItem(
                    name=name[:80],
                    description=(description[:600] if description else None),
                    technologies=technologies,
                )
            )
        name = None
        content = []

    for raw in lines:
        line = _clean_line(raw)
        if not line:
            continue
        is_bullet = _strip_bullet(raw)[1]
        starts_new = (
            not is_bullet
            and name is not None
            and bool(content)
            and _looks_like_project_name(line, True)
        )
        if starts_new:
            flush()
            name = line
        elif not is_bullet and name is None:
            name = line
        else:
            content.append(line)
    flush()
    return items[:_MAX_PROJECTS]


# ---------------------------------------------------------------------------
# Certifications (§22)
# ---------------------------------------------------------------------------

def _extract_certifications(lines: list[str]) -> list[CertificationItem]:
    items: list[CertificationItem] = []
    for raw in lines:
        line = _clean_line(raw)
        if not line or len(line) < 4:
            continue
        date = None
        date_match = _YEAR_RE.search(line)
        if date_match:
            date = date_match.group(0)
            line = line.replace(date_match.group(0), "").strip(" -,;|")
        parts = re.split(r"\s*[|\u2013\u2014]\s*|\s+[-\u2014]\s+", line)
        parts = [p.strip(" .,") for p in parts if p.strip(" .,")]
        if not parts:
            continue
        name = parts[0]
        issuer = parts[1] if len(parts) > 1 else None
        if len(name) < 4:
            continue
        items.append(
            CertificationItem(
                name=name[:120],
                issuer=issuer[:80] if issuer else None,
                date=date,
            )
        )
        if len(items) >= _MAX_CERTIFICATIONS:
            break
    return items
