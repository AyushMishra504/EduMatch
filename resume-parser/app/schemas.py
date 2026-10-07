"""ProfileImport contract (EDUMATCH_DOCLING_INTEGRATION.md §15/§25).

Every field is nullable/optional. The extractor must never invent a value:
if the resume does not clearly state something, the field stays None/[].

`eligibilityHints` and `personal.orcid` are EduMatch extensions of the spec
contract (deterministic dictionary/regex matches only) — the frontend maps
them onto the EduMatch schema.
"""

from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


class Personal(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None
    orcid: Optional[str] = None


class EducationItem(BaseModel):
    institution: Optional[str] = None
    degree: Optional[str] = None
    field: Optional[str] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    grade: Optional[str] = None


class ExperienceItem(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    description: Optional[str] = None


class ProjectItem(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    technologies: list[str] = Field(default_factory=list)


class CertificationItem(BaseModel):
    name: Optional[str] = None
    issuer: Optional[str] = None
    date: Optional[str] = None


class Profile(BaseModel):
    personal: Personal = Field(default_factory=Personal)
    education: list[EducationItem] = Field(default_factory=list)
    skills: list[str] = Field(default_factory=list)
    experience: list[ExperienceItem] = Field(default_factory=list)
    projects: list[ProjectItem] = Field(default_factory=list)
    certifications: list[CertificationItem] = Field(default_factory=list)
    eligibilityHints: list[str] = Field(default_factory=list)


class Meta(BaseModel):
    ocrUsed: bool = False
    sourceFormat: str = "pdf"
    processingTimeMs: int = 0
    warnings: list[str] = Field(default_factory=list)


class ParseResponse(BaseModel):
    success: bool
    profile: Optional[Profile] = None
    meta: Meta = Field(default_factory=Meta)


class ErrorBody(BaseModel):
    code: str
    message: str


class ErrorResponse(BaseModel):
    success: bool = False
    error: ErrorBody
