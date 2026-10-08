"""Contract test: the parser's Pydantic field names must match the frozen
contract in ``contracts/parser-profile-fields.json``.

The frontend has a mirrored test against the same file. Renaming a field on
one side without the other breaks CI instead of silently degrading imports.
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from app.schemas import (
    CertificationItem,
    EducationItem,
    ExperienceItem,
    Meta,
    ParseResponse,
    Personal,
    Profile,
    ProjectItem,
)

# tests/ -> resume-parser/ -> repo root
CONTRACT_PATH = (
    Path(__file__).resolve().parents[2] / "contracts" / "parser-profile-fields.json"
)
CONTRACT = json.loads(CONTRACT_PATH.read_text(encoding="utf-8"))

MODELS = {
    "personal": Personal,
    "educationItem": EducationItem,
    "experienceItem": ExperienceItem,
    "projectItem": ProjectItem,
    "certificationItem": CertificationItem,
    "profile": Profile,
    "meta": Meta,
    "parseResponse": ParseResponse,
}


@pytest.mark.parametrize("key", sorted(MODELS))
def test_parser_fields_match_contract(key: str) -> None:
    model = MODELS[key]
    assert sorted(model.model_fields) == sorted(CONTRACT[key]), (
        f"{key} drift: parser={sorted(model.model_fields)} "
        f"contract={sorted(CONTRACT[key])}"
    )
