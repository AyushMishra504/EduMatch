"""Section detection (spec §17, §45).

Works on "tagged lines" — (kind, text) pairs where kind is "header" or
"text". Two sources produce them:

  * Docling ``iterate_items()`` labels (section-header vs text) — precise.
  * Plain text from ``export_to_text()`` — alias + ALL-CAPS heuristics.

Blocks group tagged lines under the nearest header so the extractor can
stay section-aware instead of scanning the whole document for every field.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Iterable, Optional

SECTION_ALIASES: dict[str, set[str]] = {
    "education": {
        "education",
        "academic background",
        "academics",
        "educational background",
        "academic qualifications",
        "education and training",
        "qualifications",
        "academic details",
    },
    "experience": {
        "experience",
        "work experience",
        "professional experience",
        "employment",
        "employment history",
        "work history",
        "internships",
        "internship experience",
        "teaching experience",
        "professional background",
        "industry experience",
    },
    "projects": {
        "projects",
        "personal projects",
        "academic projects",
        "selected projects",
        "key projects",
        "project work",
    },
    "skills": {
        "skills",
        "technical skills",
        "core skills",
        "technologies",
        "technical expertise",
        "skills and technologies",
        "areas of expertise",
        "competencies",
    },
    "certifications": {
        "certifications",
        "certificates",
        "licenses & certifications",
        "licenses and certifications",
        "courses & certificates",
    },
}

# Recognised non-content headings: they close a block but carry no data.
META_HEADINGS = {
    "summary",
    "objective",
    "profile",
    "about",
    "about me",
    "contact",
    "contact information",
    "personal details",
    "personal information",
    "header",
    "career objective",
    "career summary",
    "awards",
    "awards & honors",
    "honors",
    "achievements",
    "languages",
    "volunteering",
    "volunteer experience",
    "publications",
    "research",
    "research interests",
    "interests",
    "references",
    "declarations",
    "declaration",
}

_ALIAS_TO_CANONICAL: dict[str, str] = {
    alias: canonical for canonical, aliases in SECTION_ALIASES.items() for alias in aliases
}
_ALL_KNOWN = set(_ALIAS_TO_CANONICAL) | META_HEADINGS


def normalize_heading(heading: str) -> str:
    """Spec §17 heading normalization, plus trailing-colon stripping."""
    normalized = re.sub(r"[^a-z0-9+#.& ]", " ", heading.lower())
    normalized = " ".join(normalized.split())
    return normalized.strip(" :.-")


def canonical_for_heading(heading: str) -> Optional[str]:
    """Map a raw heading to its canonical section key (or None)."""
    return _ALIAS_TO_CANONICAL.get(normalize_heading(heading))


def is_known_heading(heading: str) -> bool:
    return normalize_heading(heading) in _ALL_KNOWN


def is_heading_line(line: str) -> bool:
    """Plain-text heading heuristic: known alias, or a short ALL-CAPS line."""
    stripped = line.strip()
    if not stripped or len(stripped) > 60:
        return False
    if canonical_for_heading(stripped) or normalize_heading(stripped) in META_HEADINGS:
        return True
    letters = [c for c in stripped if c.isalpha()]
    # >=5 letters keeps short ALL-CAPS tokens like "MIT"/"IIT" as content.
    if len(letters) < 5:
        return False
    if not all(c.isupper() for c in letters):
        return False
    words = stripped.split()
    return 1 <= len(words) <= 5 and not stripped.endswith((".", ",", ";"))


@dataclass
class Block:
    heading_raw: str
    canonical: Optional[str]  # known section key; None = unknown/meta heading
    lines: list[str] = field(default_factory=list)


def build_tagged_lines(text: str) -> list[tuple[str, str]]:
    """Plain-text fallback: tag each line as header/text."""
    tagged: list[tuple[str, str]] = []
    for raw in text.splitlines():
        line = raw.rstrip()
        if not line.strip():
            continue
        kind = "header" if is_heading_line(line) else "text"
        tagged.append((kind, line.strip()))
    return tagged


def build_blocks(tagged: Iterable[tuple[str, str]]) -> list[Block]:
    """Group tagged lines under their nearest preceding header."""
    blocks: list[Block] = []
    current = Block(heading_raw="", canonical=None)
    for kind, line in tagged:
        if kind == "header":
            if current.lines or current.heading_raw:
                blocks.append(current)
            current = Block(heading_raw=line, canonical=canonical_for_heading(line))
        else:
            current.lines.append(line)
    if current.lines or current.heading_raw:
        blocks.append(current)
    # Drop leading content that sits before any header (kept as a meta block).
    return blocks


def blocks_by_section(blocks: list[Block]) -> dict[str, list[Block]]:
    out: dict[str, list[Block]] = {}
    for block in blocks:
        if block.canonical:
            out.setdefault(block.canonical, []).append(block)
    return out


def lines_before_first_section(blocks: list[Block]) -> list[str]:
    """Contact/intro region: everything before the first known section."""
    out: list[str] = []
    for block in blocks:
        if block.canonical:
            break
        out.extend(block.lines)
    return out


def join_block_lines(blocks: list[Block]) -> list[str]:
    lines: list[str] = []
    for block in blocks:
        lines.extend(block.lines)
    return lines
