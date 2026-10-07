"""Deterministic normalization helpers (spec §16, §19, §23).

Regex/date/phone/link/degree/location extraction only — no guessing, no
network calls. `phonenumbers` is used for phone parsing so Indian formats
(+91, 0-prefixed, spaced) are handled by a real parser.
"""

from __future__ import annotations

import re
from typing import Optional

import phonenumbers
from phonenumbers import PhoneNumberFormat

EMAIL_RE = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b")

URL_RE = re.compile(
    r'(?<![\w@./-])(?:https?://)?(?:www\.)?[A-Za-z0-9][A-Za-z0-9-]*'
    r'(?:\.[A-Za-z0-9-]+)+(?:/[^\s,;|<>\\"\'()\]]*)?'
)

ORCID_RE = re.compile(r"\b\d{4}-\d{4}-\d{4}-\d{3}[\dX]\b")

# Domains that are never a personal portfolio.
_NON_PORTFOLIO_DOMAINS = (
    "google.",
    "youtube.",
    "youtu.be",
    "facebook.",
    "instagram.",
    "twitter.",
    "x.com",
    "linkedin.",
    "github.",
    "maps.",
    "drive.google",
    "docs.google",
    "mail.",
    "outlook.",
    "amazon.",
    "flipkart.",
)

_MONTHS: dict[str, int] = {
    "jan": 1, "january": 1,
    "feb": 2, "february": 2,
    "mar": 3, "march": 3,
    "apr": 4, "april": 4,
    "may": 5,
    "jun": 6, "june": 6,
    "jul": 7, "july": 7,
    "aug": 8, "august": 8,
    "sep": 9, "sept": 9, "september": 9,
    "oct": 10, "october": 10,
    "nov": 11, "november": 11,
    "dec": 12, "december": 12,
}

_MONTH_PATTERN = (
    r"(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|"
    r"Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|"
    r"Dec(?:ember)?)\.?"
)

# "May 2025 - July 2025", "2022 – 2026", "Aug 2022 - Present",
# "2022 - present", "Jan 2024 to Apr 2024"
_DATE_RANGE_RE = re.compile(
    rf"(?P<sm>{_MONTH_PATTERN})?\.?\s*(?P<sy>19\d{{2}}|20\d{{2}})\s*"
    rf"(?:[-\u2013\u2014]|\bto\b)\s*"
    rf"(?:(?P<present>present|current|now|till\s+date)\b|"
    rf"(?P<em>{_MONTH_PATTERN})?\.?\s*(?P<ey>19\d{{2}}|20\d{{2}}))",
    re.IGNORECASE,
)

# Standalone "Present" / "Current role" hints next to a start year.
_PRESENT_RE = re.compile(r"\b(present|current|till date|to date)\b", re.IGNORECASE)

_GRADE_PATTERNS = [
    re.compile(r"(?i)\bcgpa\s*[:=]?\s*(\d{1,2}\.\d{1,2})(?:\s*/\s*(\d{1,2}(?:\.\d)?))?"),
    re.compile(r"(?i)\bgpa\s*[:=]?\s*(\d{1,2}\.\d{1,2})(?:\s*/\s*(\d{1,2}(?:\.\d)?))?"),
    re.compile(r"(\d{1,2}\.\d{1,2})\s*/\s*10\b"),
    re.compile(r"(?i)\bpercentage\s*[:=]?\s*(\d{1,3}(?:\.\d{1,2})?)\s*%?"),
    re.compile(r"\b(\d{1,3})\s*%"),
]

# Loose degree detector for parsing structure only. Exact enum mapping
# happens on the EduMatch side from the raw degree string.
DEGREE_ABBREV_RE = re.compile(
    r"\b(?:B\.?\s?Tech|B\.?\s?E\.?|B\.?\s?Sc|B\.?\s?Com|B\.?\s?A\.?|"
    r"B\.?\s?Arch|B\.?\s?Ed|B\.?\s?Pharm|B\.?\s?Des|"
    r"M\.?\s?Tech|E\.?\s?Tech|M\.?\s?E\.?|M\.?\s?Sc|M\.?\s?Com|M\.?\s?A\.?|"
    r"M\.?\s?Arch|M\.?\s?Ed|M\.?\s?Phil|M\.?\s?Des|MBA|MBBS|MS|M\.?D\.?|"
    r"Ph\.?\s?D|D\.?\s?Phil|Post-?Doc(?:toral)?)"
)
DEGREE_FULL_RE = re.compile(
    r"(?i)\b(?:bachelor(?:'s)?(?:\s+of\s+(?:arts|science|engineering|technology|"
    r"commerce|education|law|computer applications|business administration))*|"
    r"master(?:'s)?(?:\s+of\s+(?:arts|science|engineering|technology|commerce|"
    r"law|computer applications|business administration))*|"
    r"doctorate|doctoral|diploma\b.*|polytechnic\b.*)"
)

INSTITUTION_RE = re.compile(
    r"(?i)\b(?:college|institute|university|school|academy|iit\b|iisc\b|"
    r"nit\b|iiit\b|bits\b|polytechnic|alumni)\b"
)

ROLE_HINT_RE = re.compile(
    r"(?i)\b(?:intern|engineer|developer|assistant|professor|lecturer|faculty|"
    r"trainer|teacher|tutor|manager|analyst|consultant|specialist|associate|"
    r"researcher|research|trainee|coordinator|officer|executive|architect|"
    r"administrator|designer|scientist|technologist|lead|head|director|"
    r"curator|mentor|tutor)\b"
)

COMPANY_HINT_RE = re.compile(
    r"(?i)\b(?:ltd|limited|pvt|inc|corp|corp\.|technologies|systems|labs|"
    r"solutions|services|studio|group|industries|enterprises|university|"
    r"institute|college|academy|school|hospital|foundation|trust|bank|"
    r"startup|company|org|org\.|ngo)\b"
)

_ELIGIBILITY_PATTERNS: dict[str, re.Pattern[str]] = {
    "UGC-NET": re.compile(r"\bUGC[-\s]?NET\b", re.IGNORECASE),
    "CSIR-NET": re.compile(r"\bCSIR[-\s]?NET\b", re.IGNORECASE),
    "JRF": re.compile(r"\bJRF\b|\bJunior Research Fellowship\b", re.IGNORECASE),
    "GATE": re.compile(r"\b(?:qualified|cleared|scored|AIR)\b[^\n]{0,20}\bGATE\b|\bGATE\s+(?:score|percentile|rank)", re.IGNORECASE),
    "SET": re.compile(r"\bSLET\b|\bqualified\s+SET\b|\bSET\s+(?:exam|examination|test)\b|\bSET[/\s]SLET\b", re.IGNORECASE),
}


# ---------------------------------------------------------------------------
# Contacts (§16.2–16.4)
# ---------------------------------------------------------------------------

def find_email(text: str) -> Optional[str]:
    match = EMAIL_RE.search(text)
    if not match:
        return None
    return match.group(0).strip().lower().rstrip(".,")


def find_phone(text: str) -> Optional[str]:
    """First valid phone as E.164. Indian landline/mobile formats allowed."""
    for region in (None, "IN"):
        try:
            for match in phonenumbers.PhoneNumberMatcher(text, region):
                number = match.number
                if phonenumbers.is_valid_number(number):
                    return phonenumbers.format_number(number, PhoneNumberFormat.E164)
                if (
                    phonenumbers.country_code_for_region("IN") == number.country_code
                    and len(str(number.national_number)) == 10
                    and str(number.national_number)[0] in "6789"
                ):
                    return phonenumbers.format_number(number, PhoneNumberFormat.E164)
        except NumberParseException:
            continue
    return None


def _clean_url(url: str) -> str:
    url = url.strip().rstrip(".,;:)")
    if not url.lower().startswith(("http://", "https://")):
        url = "https://" + url
    return url


def find_links(text: str) -> dict[str, Optional[str]]:
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None
    for raw in URL_RE.findall(text):
        url = _clean_url(raw)
        low = url.lower()
        if "linkedin." in low and linkedin is None:
            linkedin = url
        elif "github." in low and github is None:
            github = url
        elif portfolio is None and not any(d in low for d in _NON_PORTFOLIO_DOMAINS):
            portfolio = url
    return {"linkedin": linkedin, "github": github, "portfolio": portfolio}


def find_orcid(text: str) -> Optional[str]:
    match = ORCID_RE.search(text)
    return match.group(0) if match else None


def find_eligibility_hints(text: str) -> list[str]:
    hints: list[str] = []
    for label, pattern in _ELIGIBILITY_PATTERNS.items():
        if pattern.search(text) and label not in hints:
            hints.append(label)
    return hints


# ---------------------------------------------------------------------------
# Name (§16.1)
# ---------------------------------------------------------------------------

_NAME_RE = re.compile(r"^[A-Za-z][A-Za-z.'-]*(?:\s+[A-Za-z][A-Za-z.'-]*){0,3}$")

_NAME_REJECT_SUBSTRINGS = (
    "resume", "curriculum", "vitae", "cv", "profile", "contact", "detail",
    "education", "experience", "skill", "project", "certificate", "summary",
    "objective", "reference", "declaration", "award", "achievement",
    "engineer", "developer", "student", "aspirant", "graduate", "teacher",
    "professor", "lecturer", "faculty", "researcher", "analyst", "consultant",
    "intern", "manager", "specialist", "http", "www", "india",
)


def find_name(lines: list[str]) -> Optional[str]:
    """First plausible name among the top lines of the document."""
    for line in lines[:8]:
        candidate = line.strip().strip("|•*-–—")
        if not candidate or len(candidate) > 60:
            continue
        low = candidate.lower()
        if "@" in candidate or any(ch.isdigit() for ch in candidate):
            continue
        if "http" in low or "www." in low:
            continue
        if any(word in low for word in _NAME_REJECT_SUBSTRINGS):
            continue
        if not _NAME_RE.match(candidate):
            continue
        words = candidate.split()
        if not 1 <= len(words) <= 4:
            continue
        # A separator usually means a tagline, not a name.
        if re.search(r"\s[|\u2022•\-–—/]\s", candidate):
            continue
        return candidate
    return None


# ---------------------------------------------------------------------------
# Location (Phase 2)
# ---------------------------------------------------------------------------

INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
    "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
    "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
    "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
    "Ladakh", "Lakshadweep", "Puducherry",
]

_STATE_ALIASES = {"orissa": "Odisha", "pondicherry": "Puducherry"}
_STATE_BY_CASEFOLD = {state.casefold(): state for state in INDIAN_STATES}
for alias, proper in _STATE_ALIASES.items():
    _STATE_BY_CASEFOLD[alias] = proper

_CITY_RE = re.compile(r"^[A-Za-z][A-Za-z .'-]{1,39}$")


def parse_location(line: str, name: Optional[str] = None) -> Optional[str]:
    """Return a "City, State" location string from a contact line, or None.

    Fills only what the line clearly states: state only, or city only, are
    returned as just the city/state the user can verify later.
    """
    text = line.strip()
    if not text or "@" in text or any(ch.isdigit() for ch in text):
        return None
    if URL_RE.search(text):
        return None
    parts = [p.strip() for p in text.split(",") if p.strip()]
    if not parts:
        return None
    # Drop trailing country noise: "Pune, Maharashtra, India".
    if parts[-1].casefold() in {"india", "indian"} and len(parts) > 1:
        parts = parts[:-1]
    if not parts:
        return None
    state = _STATE_BY_CASEFOLD.get(parts[-1].casefold())
    if state:
        city_parts = parts[:-1]
        city = ", ".join(city_parts).strip()
        if city and _CITY_RE.match(city) and city.casefold() != (name or "").casefold():
            return f"{city}, {state}"
        return state
    # No state — a single short location word/phrase is treated as the city.
    if len(parts) == 1 and _CITY_RE.match(parts[0]) and len(parts[0]) >= 3:
        if name and parts[0].casefold() == name.casefold():
            return None
        return parts[0]
    return None


# ---------------------------------------------------------------------------
# Dates & grades (§19, §20)
# ---------------------------------------------------------------------------

def _month_num(token: Optional[str]) -> Optional[int]:
    if not token:
        return None
    return _MONTHS.get(token.lower().rstrip("."))


def parse_date_range(line: str) -> Optional[dict]:
    """Parse a date range → {"start": {"y","m"}, "end": {"y","m"}|None, ...}."""
    match = _DATE_RANGE_RE.search(line)
    if not match:
        return None
    start = {"y": int(match.group("sy")), "m": _month_num(match.group("sm"))}
    if match.group("present"):
        return {"start": start, "end": None, "present": True}
    end = {"y": int(match.group("ey")), "m": _month_num(match.group("em"))}
    return {"start": start, "end": end, "present": False}


def has_date_range(line: str) -> bool:
    return _DATE_RANGE_RE.search(line) is not None


def has_present(line: str) -> bool:
    return _PRESENT_RE.search(line) is not None


def format_date(d: Optional[dict]) -> Optional[str]:
    """{"y": 2022, "m": 5} → "2022-05"; year-only → "2022"."""
    if not d:
        return None
    if d.get("m"):
        return f"{d['y']}-{d['m']:02d}"
    return str(d["y"])


def find_grade(line: str) -> Optional[str]:
    match = _GRADE_PATTERNS[0].search(line) or _GRADE_PATTERNS[1].search(line)
    if match:
        scale = match.group(2)
        value = match.group(1)
        return f"{value}/{scale}" if scale else f"{value} CGPA"
    match = _GRADE_PATTERNS[2].search(line)
    if match:
        return f"{match.group(1)}/10"
    match = _GRADE_PATTERNS[3].search(line) or _GRADE_PATTERNS[4].search(line)
    if match:
        return f"{match.group(1)}%"
    return None


def detect_degree(line: str) -> Optional[str]:
    """Return the raw degree text if the line clearly states one."""
    abbrev = DEGREE_ABBREV_RE.search(line)
    if abbrev:
        return abbrev.group(0).strip()
    full = DEGREE_FULL_RE.search(line)
    if full:
        return full.group(0).strip()
    return None


def looks_like_institution(line: str) -> bool:
    return bool(INSTITUTION_RE.search(line))
