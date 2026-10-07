# EduMatch — Resume/CV Upload → Automatic Profile Prefill

## Implementation specification for the coding agent

> **Goal:** Let a new EduMatch user upload a PDF/DOCX resume once, automatically extract the profile information needed by EduMatch, prefill the profile-setup form, and get the user to the main app as quickly as possible.
>
> **Hard requirements:** No LLM, no VLM, no paid resume API, no third-party resume-processing service. Resume processing should run on infrastructure controlled by EduMatch.
>
> **Primary priority:** speed of signup/profile setup.
>
> **Secondary priorities:** reasonable extraction accuracy, privacy, graceful failure, and easy user correction.

---

## 1. What we are building

The feature should turn this:

```text
User uploads resume
        ↓
EduMatch backend
        ↓
Docling reads PDF/DOCX
        ↓
Deterministic extraction + normalization
        ↓
EduMatch Profile JSON
        ↓
Profile setup form is prefilled
        ↓
User verifies/edits
        ↓
Continue to main page
```

This is **not** an ATS-ranking system and **not** a resume-generation system.

We only need enough extraction to remove as much manual typing as possible during profile setup.

---

# 2. Important distinction: Docling is not the profile parser

Use Docling for **document understanding/extraction**:

- PDF/DOCX parsing
- reading order
- layout/sections
- text extraction
- scanned-document OCR when needed
- structured document representation

Then add a small deterministic EduMatch parsing layer that maps the extracted document content into the exact fields used by the EduMatch profile.

Do **not** send the extracted text to an LLM.

Recommended pipeline:

```text
PDF / DOCX
   ↓
Docling
   ↓
DoclingDocument / plain text / structured text items
   ↓
EduMatch deterministic parser
   ├── regex: email / phone / URLs
   ├── section detection
   ├── date detection
   ├── degree detection
   ├── institution heuristics
   ├── skill dictionary / normalization
   ├── experience/project block detection
   └── confidence / warnings
   ↓
EduMatchProfileImport
   ↓
frontend form prefill
```

Docling's current Python API provides a `DocumentConverter`, a unified `DoclingDocument`, `iterate_items()`, and exports including plain text, Markdown and lossless JSON. citeturn792350search0turn699745search0

---

# 3. Current Docling version and baseline

Research date: **2026-10-02**.

At the time of this specification:

- `docling` latest PyPI release: **2.132.0**.
- Docling requires **Python 3.10+** in the current README.
- Docling is open source under the **MIT license**.
- Current `docling-serve` release: **1.35.0**, but we are not required to use `docling-serve` for this implementation.

Pin the dependency during development instead of silently following latest versions:

```txt
# resume-parser/requirements.txt
docling==2.132.0
fastapi>=0.115,<1
uvicorn[standard]>=0.30,<1
python-multipart>=0.0.9,<1
```

Do not automatically upgrade Docling in production. Upgrade deliberately and rerun the resume test suite.

Official sources:

- https://docling-project.github.io/docling/
- https://docling-project.github.io/docling/getting_started/installation/
- https://docling-project.github.io/docling/getting_started/quickstart/
- https://docling-project.github.io/docling/reference/document_converter/
- https://github.com/docling-project/docling

---

# 4. Recommended architecture for the existing EduMatch stack

EduMatch already uses a JavaScript/TypeScript backend. Do **not** spawn a new Python process for every resume.

Do this instead:

```text
                         PUBLIC

Browser
  │
  │ multipart/form-data
  ▼
Express backend
  │
  │ authenticated internal HTTP request
  ▼
Python resume-parser service
  │
  ├── Docling
  ├── deterministic profile extractor
  └── normalization/validation
  │
  ▼
ProfileImport JSON
  │
  ▼
Express backend
  │
  ▼
Frontend profile setup
```

The Python process stays alive, so Docling's converter/model initialization is reused between requests.

### Why this architecture

Docling is a Python library. The official documentation recommends the Python library for in-process use, while `docling-serve` exists when an HTTP API is preferred from another language. citeturn635208search3turn792350search0

For EduMatch, a small internal Python service gives us more control because we need a **custom resume-to-profile mapping layer**, not only document conversion.

Do not use this architecture:

```text
Express request
  ↓
spawn python process
  ↓
load Docling
  ↓
parse
  ↓
kill process
```

That would destroy the startup/warm-model advantage and hurt signup latency.

---

# 5. Repository structure

Add a small service beside the existing backend:

```text
edumatch/
├── frontend/                 # existing React/Next/Vite frontend
├── backend/                  # existing Express backend
│   └── ...
│
├── resume-parser/            # NEW
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py           # FastAPI entry point
│   │   ├── docling_service.py
│   │   ├── resume_extractor.py
│   │   ├── schemas.py
│   │   ├── normalizer.py
│   │   └── sections.py
│   ├── tests/
│   │   ├── fixtures/
│   │   ├── test_contacts.py
│   │   ├── test_sections.py
│   │   ├── test_profile_extraction.py
│   │   └── test_real_resumes.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── README.md
│
└── docker-compose.yml
```

Keep all resume-specific parsing code in the Python service.

The Express backend should remain responsible for:

- authentication
- authorization
- rate limiting
- user identity
- profile persistence
- exposing the public API

The Python service should remain responsible for:

- accepting the document
- parsing the document
- extracting fields
- returning a validated import object

---

# 6. Supported upload formats

For the first implementation support only:

```text
.pdf
.docx
```

Do not accept every format that Docling supports just because Docling supports it.

Docling currently supports many formats, including PDF, DOCX, images and other Office/document types, but EduMatch only needs PDF/DOCX for the first release. citeturn762515search0

Optionally support `.doc` later, but do not add LibreOffice as a dependency unless there is a real product requirement. Current Docling documentation notes that legacy Office formats such as `.doc` require LibreOffice. citeturn762515search0

---

# 7. Upload limits

Use strict limits. Resumes do not need huge files.

Recommended initial limits:

```text
Maximum file size: 5 MB
Maximum PDF pages: 6
Maximum one file/request: 1
Allowed extensions: .pdf, .docx
```

You can raise these later based on real usage.

Docling's `convert()` API directly supports `max_num_pages` and `max_file_size`, so enforce limits both at the HTTP layer and inside Docling. citeturn536416search0

Do not trust only the browser-provided MIME type. Also validate:

- filename extension
- MIME type
- file signature/magic bytes

Examples:

```text
PDF  → starts with %PDF-
DOCX → ZIP container signature PK + valid Office structure
```

Reject everything else.

---

# 8. Installation

## Local development

Create a Python 3.10+ environment.

```bash
cd resume-parser
python -m venv .venv
```

Windows:

```bash
.venv\Scripts\activate
```

macOS/Linux:

```bash
source .venv/bin/activate
```

Install:

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

The current Docling README says Python 3.10+ and the standard package is installed with `pip install docling`. citeturn762515search4turn762515search1

---

# 9. Model/artifact downloads

Docling may download model artifacts the first time a pipeline needs them.

For production, **pre-download and cache the artifacts** so the first user's signup is not responsible for model initialization/download time.

Docling documents `docling-tools models download`, `artifacts_path`, and `DOCLING_ARTIFACTS_PATH` for prefetch/offline operation. citeturn907322search2

Recommended production flow:

```bash
docling-tools models download
```

Store the resulting artifacts in a persistent location in the container/image or mounted model volume.

Then point the pipeline at that path.

Example:

```python
pipeline_options = PdfPipelineOptions(
    artifacts_path="/models/docling"
)
```

Or configure the equivalent environment variable.

This gives us:

```text
Container starts
  ↓
models already present
  ↓
initialize Docling once
  ↓
first user does not trigger a model download
```

Docling explicitly supports local/air-gapped operation. citeturn907322search2turn907322search3

---

# 10. Do NOT enable remote processing

The EduMatch service should not call external AI/document services.

Keep these disabled:

```python
pipeline_options.enable_remote_services = False
pipeline_options.allow_external_plugins = False
```

Docling documents `enable_remote_services=False` as the default and describes it as a gate for external APIs/cloud services. External plugins are also disabled by default. citeturn907322search1

No VLM pipeline.

No remote OCR API.

No LLM API.

No resume-parser SaaS API.

---

# 11. Docling configuration optimized for EduMatch

The first pass should be optimized for normal digital resumes.

We do not need:

- page image generation
- picture descriptions
- chart extraction
- formula extraction
- code enrichment
- expensive table reconstruction
- VLM processing

A suitable PDF configuration is:

```python
from docling.datamodel.base_models import InputFormat
from docling.datamodel.pipeline_options import PdfPipelineOptions
from docling.document_converter import DocumentConverter, PdfFormatOption

pipeline_options = PdfPipelineOptions(
    do_ocr=False,
    do_table_structure=False,
    do_code_enrichment=False,
    do_formula_enrichment=False,
    generate_page_images=False,
    generate_picture_images=False,
    do_picture_classification=False,
    do_picture_description=False,
    do_chart_extraction=False,
    document_timeout=45,
)

converter = DocumentConverter(
    allowed_formats=[InputFormat.PDF, InputFormat.DOCX],
    format_options={
        InputFormat.PDF: PdfFormatOption(
            pipeline_options=pipeline_options
        )
    },
)
```

Docling's current pipeline options support disabling OCR, table structure, page-image generation and other enrichments. OCR materially increases processing time, and generated page images can be disabled for parse-only workflows. citeturn175070search0turn675676search4

Do not copy a generic Docling example that enables every feature. This is a resume import path where speed matters.

---

# 12. OCR strategy: fast first pass, OCR only when required

This is one of the most important implementation decisions.

Most resumes are normal digital PDFs. Do not pay the OCR cost on every upload.

Use a two-pass strategy:

```text
PDF
 ↓
FAST PASS: do_ocr=False
 ↓
Is useful text present?
 ├── YES → parse profile
 └── NO / suspicious → OCR PASS
                         ↓
                    parse profile
```

Docling documents OCR as necessary for scanned/image-based PDFs and notes that OCR significantly increases processing time. It supports multiple OCR engines, including RapidOCR. citeturn762515search1turn675676search0

For the OCR fallback, use RapidOCR in a CPU-friendly configuration:

```python
from docling.datamodel.pipeline_options import RapidOcrOptions

ocr_options = RapidOcrOptions(lang=["en"])
```

Then create a separate OCR converter lazily on first use:

```python
ocr_pipeline = PdfPipelineOptions(
    do_ocr=True,
    do_table_structure=False,
    do_code_enrichment=False,
    do_formula_enrichment=False,
    generate_page_images=False,
    generate_picture_images=False,
    document_timeout=45,
    ocr_options=RapidOcrOptions(lang=["en"]),
)
```

Docling's current docs list RapidOCR as a supported OCR engine and provide `RapidOcrOptions`. citeturn675676search0turn675676search2

### Useful first-pass fallback trigger

Do not trigger OCR from a single rule.

Start with a heuristic such as:

```python
text = doc.export_to_text()

compact = " ".join(text.split())

looks_empty = len(compact) < 250
has_email = EMAIL_RE.search(compact) is not None
has_sections = detect_known_sections(compact)

needs_ocr = looks_empty or (not has_email and not has_sections and len(compact) < 600)
```

Tune this using real resume fixtures.

Do not force OCR just because the PDF contains an image; normal resumes often contain profile icons/logos alongside perfectly extractable text.

---

# 13. Use in-memory uploads

Do not write every resume to a permanent `uploads/` directory.

The current Docling API accepts `DocumentStream`, so the backend can pass an in-memory byte stream to Docling. citeturn536416search0turn536416search4

Example:

```python
from io import BytesIO
from docling.datamodel.base_models import DocumentStream

stream = DocumentStream(
    name=filename,
    stream=BytesIO(file_bytes),
)

result = converter.convert(
    stream,
    max_num_pages=6,
    max_file_size=5 * 1024 * 1024,
)
```

After parsing, let the request-owned bytes go out of scope.

Only store the original resume if the existing EduMatch product explicitly needs persistent resume storage. This feature does not require persistent storage merely to prefill a profile.

---

# 14. Docling output to use

Use two representations internally:

### A. `iterate_items()`

Use this for semantic section extraction.

Docling's `DoclingDocument.iterate_items()` yields document elements and hierarchy level. Its model includes text items and section-header items. citeturn720242search0

Conceptually:

```python
for item, level in result.document.iterate_items():
    if getattr(item, "text", None):
        text = item.text
        label = str(getattr(item, "label", ""))
        # preserve item + label + level
```

This allows the parser to distinguish:

```text
SECTION HEADER
    Experience

TEXT
    Software Engineering Intern ...
```

instead of flattening the whole document prematurely.

### B. `export_to_text()`

Use plain text as a fallback/general-purpose representation.

Current Docling documentation states that `export_to_text()` produces plain text without Markdown decoration and retains useful list/table separators. citeturn699745search0

Example:

```python
text = result.document.export_to_text()
```

Do not store Markdown as the canonical profile data. Markdown is useful for debugging, but the profile parser should operate on normalized text/items.

---

# 15. Profile JSON contract

Define the profile import contract before writing parsing logic.

Use the following starting shape and adapt field names to the existing EduMatch database/schema:

```json
{
  "personal": {
    "name": null,
    "email": null,
    "phone": null,
    "location": null,
    "linkedin": null,
    "github": null,
    "portfolio": null
  },
  "education": [],
  "skills": [],
  "experience": [],
  "projects": [],
  "certifications": [],
  "meta": {
    "ocrUsed": false,
    "warnings": [],
    "sourceFormat": "pdf",
    "processingTimeMs": 0
  }
}
```

Suggested item shapes:

```json
{
  "education": [
    {
      "institution": null,
      "degree": null,
      "field": null,
      "startDate": null,
      "endDate": null,
      "grade": null
    }
  ],
  "experience": [
    {
      "company": null,
      "role": null,
      "startDate": null,
      "endDate": null,
      "description": null
    }
  ],
  "projects": [
    {
      "name": null,
      "description": null,
      "technologies": []
    }
  ],
  "certifications": [
    {
      "name": null,
      "issuer": null,
      "date": null
    }
  ]
}
```

Every field should be nullable/optional.

**Never invent a field value.**

If the resume does not clearly provide something, return `null`/empty array and let the user fill it in.

---

# 16. Field extraction strategy

## 16.1 Name

Use a deterministic heuristic, because the name normally appears at the top.

Candidate lines:

- first few non-empty lines
- title/name-like text
- not an email
- not a URL
- not a phone number
- not a common section header

Reject candidates such as:

```text
RESUME
CURRICULUM VITAE
PROFILE
CONTACT
EXPERIENCE
EDUCATION
```

Do not use an LLM just to identify a name.

---

## 16.2 Email

Use regex.

```python
EMAIL_RE = re.compile(
    r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"
)
```

Return the first valid-looking email unless multiple emails are clearly listed.

Normalize:

```python
email = email.strip().lower()
```

---

## 16.3 Phone

Use a real phone-number parser such as `phonenumbers`, not a large custom regex.

Add:

```txt
phonenumbers
```

Normalize to E.164 where possible.

Do not reject Indian numbers because they are formatted with spaces or `+91`.

---

## 16.4 Links

Extract URLs with a URL regex and normalize them.

Detect:

```text
linkedin.com/...
github.com/...
http://...
https://...
```

For portfolio detection, use the remaining personal URL after GitHub/LinkedIn have been identified.

Do not make network requests to verify links during signup.

That would slow the flow and introduce unnecessary external dependencies.

---

# 17. Section detection

Create canonical section aliases.

```python
SECTION_ALIASES = {
    "education": {
        "education",
        "academic background",
        "academics",
        "educational background",
        "academic qualifications",
    },
    "experience": {
        "experience",
        "work experience",
        "professional experience",
        "employment",
        "work history",
        "internships",
    },
    "projects": {
        "projects",
        "personal projects",
        "academic projects",
        "selected projects",
    },
    "skills": {
        "skills",
        "technical skills",
        "core skills",
        "technologies",
        "technical expertise",
    },
    "certifications": {
        "certifications",
        "certificates",
        "licenses & certifications",
    },
}
```

Normalize headings before matching:

```python
normalized = re.sub(r"[^a-z0-9+#.& ]", " ", heading.lower())
normalized = " ".join(normalized.split())
```

Keep the original heading text too for debugging.

---

# 18. Skills extraction

This should be dictionary-based rather than generative.

Maintain a versioned skills dictionary:

```json
{
  "Python": ["python", "py"],
  "Java": ["java"],
  "JavaScript": ["javascript", "js"],
  "TypeScript": ["typescript", "ts"],
  "C": ["c programming"],
  "C++": ["c++", "cpp"],
  "React": ["react", "reactjs", "react.js"],
  "Next.js": ["next.js", "nextjs"],
  "Node.js": ["node.js", "nodejs", "node"],
  "Express.js": ["express", "express.js"],
  "PostgreSQL": ["postgresql", "postgres", "psql"],
  "MongoDB": ["mongodb", "mongo"],
  "Git": ["git"],
  "GitHub": ["github"],
  "Docker": ["docker"],
  "Linux": ["linux"],
  "SQL": ["sql"]
}
```

The dictionary should be expanded based on what users actually put in EduMatch profiles.

### Matching rules

1. Prefer the Skills section.
2. Also inspect project/experience descriptions.
3. Match case-insensitively.
4. Prefer word boundaries to avoid false matches.
5. Normalize aliases to one canonical skill.
6. Deduplicate while preserving a stable order.

Example:

```text
Resume:
"Built a web app with ReactJS, Node.js and PostgreSQL."

Store:
["React", "Node.js", "PostgreSQL"]
```

Do not let a skill dictionary blindly match substrings such as `c` inside unrelated words.

---

# 19. Education extraction

Inside the Education section, split content into candidate records.

Detect:

- institution names
- degree names
- field/branch
- dates
- grade/CGPA/percentage

Useful degree aliases:

```text
B.Tech
B.E.
Bachelor of Technology
Bachelor of Engineering
B.Sc
Bachelor of Science
M.Tech
M.E.
M.Sc
Master of Technology
Master of Science
MBA
PhD
```

Useful grade patterns:

```text
CGPA: 8.7
8.7/10
GPA: 3.8/4
92%
Percentage: 92%
```

Date extraction can initially support:

```text
2022 - 2026
2022–2026
Aug 2022 - May 2026
August 2022 – Present
2022 - Present
```

Do not try to infer a graduation year from age.

---

# 20. Experience extraction

Use the Experience section as blocks.

A typical block looks like:

```text
Software Engineering Intern
Google
May 2025 - July 2025
- Built ...
- Improved ...
```

or:

```text
Google | Software Engineering Intern | May 2025 - Jul 2025
- Built ...
```

The parser should identify:

```text
company
role/title
date range
description
```

Use date ranges to help split consecutive records.

Do not aggressively infer the company/title when ambiguous. When uncertain, preserve the text in the description and leave the structured field null.

---

# 21. Projects extraction

For each project block extract:

```text
name
description
technologies
```

Project technology extraction can reuse the same skills dictionary.

Example:

```text
NeuroSense
Multimodal Parkinson's detection using handwriting, voice and MRI.
Python, SVM, HOG, scikit-learn
```

Expected import:

```json
{
  "name": "NeuroSense",
  "description": "Multimodal Parkinson's detection using handwriting, voice and MRI.",
  "technologies": [
    "Python",
    "SVM",
    "HOG",
    "scikit-learn"
  ]
}
```

Do not invent project descriptions.

---

# 22. Certifications

Look for:

```text
Certification name
Issuer
Date
```

Common patterns:

```text
AWS Certified Cloud Practitioner — Amazon Web Services
Google Data Analytics Professional Certificate — Google
```

Again, preserve raw text if structured parsing is ambiguous.

---

# 23. Normalization layer

Create one normalization module.

Examples:

```text
ReactJS       → React
React.js      → React
NextJS        → Next.js
NodeJS        → Node.js
Postgres      → PostgreSQL
Mongo         → MongoDB
JS            → JavaScript
TS            → TypeScript
```

Do not store every alias in the database.

The parser should output canonical EduMatch values.

---

# 24. Do not overwrite user-entered fields

This feature will be used during profile creation.

But the backend should still follow this rule:

```text
Imported resume values are suggestions/prefill values.
They are not authoritative user data until the profile is saved.
```

If the user already typed something manually, never silently replace it with resume-import data.

For the signup flow, recommended behavior:

```text
Resume import
    ↓
Prefilled form state
    ↓
User edits
    ↓
User presses Continue
    ↓
Save final form state
```

Do not immediately write every imported field to PostgreSQL before user verification unless the existing architecture requires it.

---

# 25. The API contract

Expose one internal Python endpoint:

```http
POST /parse
Content-Type: multipart/form-data
```

Field:

```text
file: PDF/DOCX
```

Return:

```json
{
  "success": true,
  "profile": {
    "personal": {
      "name": "Example Person",
      "email": "example@example.com",
      "phone": "+919999999999",
      "location": "Bengaluru, India",
      "linkedin": "https://linkedin.com/in/example",
      "github": "https://github.com/example",
      "portfolio": null
    },
    "education": [],
    "skills": [],
    "experience": [],
    "projects": [],
    "certifications": []
  },
  "meta": {
    "ocrUsed": false,
    "sourceFormat": "pdf",
    "processingTimeMs": 742,
    "warnings": []
  }
}
```

For unsuccessful parsing:

```json
{
  "success": false,
  "error": {
    "code": "NO_USEFUL_TEXT",
    "message": "We could not extract enough information from this resume."
  }
}
```

Do not expose Python exception messages to users.

---

# 26. Python FastAPI service skeleton

Use this as the initial implementation shape.

```python
# app/main.py

import time
from io import BytesIO
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile

from docling.datamodel.base_models import DocumentStream, InputFormat
from docling.datamodel.pipeline_options import PdfPipelineOptions
from docling.document_converter import DocumentConverter, PdfFormatOption

from app.resume_extractor import extract_profile

MAX_FILE_SIZE = 5 * 1024 * 1024
MAX_PAGES = 6

app = FastAPI(title="EduMatch Resume Parser")


def build_fast_converter() -> DocumentConverter:
    options = PdfPipelineOptions(
        do_ocr=False,
        do_table_structure=False,
        do_code_enrichment=False,
        do_formula_enrichment=False,
        generate_page_images=False,
        generate_picture_images=False,
        document_timeout=45,
    )

    return DocumentConverter(
        allowed_formats=[InputFormat.PDF, InputFormat.DOCX],
        format_options={
            InputFormat.PDF: PdfFormatOption(
                pipeline_options=options
            )
        },
    )


converter = build_fast_converter()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/parse")
async def parse_resume(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing filename")

    filename = Path(file.filename).name
    extension = Path(filename).suffix.lower()

    if extension not in {".pdf", ".docx"}:
        raise HTTPException(
            status_code=415,
            detail="Only PDF and DOCX files are supported.",
        )

    data = await file.read()

    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="Resume is too large.",
        )

    started = time.perf_counter()

    source = DocumentStream(
        name=filename,
        stream=BytesIO(data),
    )

    try:
        result = converter.convert(
            source,
            raises_on_error=True,
            max_num_pages=MAX_PAGES,
            max_file_size=MAX_FILE_SIZE,
        )
    except Exception as exc:
        # Log the exception internally; do not return its details.
        raise HTTPException(
            status_code=422,
            detail="Could not parse this resume.",
        ) from exc

    profile, warnings = extract_profile(result.document)

    elapsed_ms = round((time.perf_counter() - started) * 1000)

    return {
        "success": True,
        "profile": profile,
        "meta": {
            "ocrUsed": False,
            "sourceFormat": extension.removeprefix("."),
            "processingTimeMs": elapsed_ms,
            "warnings": warnings,
        },
    }
```

The agent must adapt this skeleton to the exact installed Docling API if a minor API change exists in the pinned version. Do not switch to an old pre-v2 API.

Docling v2 uses the direct `DocumentConverter.convert()` flow and supports `DocumentStream`. citeturn536416search3turn536416search0

---

# 27. Add the OCR converter lazily

Do not initialize the OCR pipeline for every startup if most resumes are digital.

Create a module-level lazy function:

```python
def get_ocr_converter():
    # initialize once and cache it
    ...
```

Use the current RapidOCR options:

```python
from docling.datamodel.pipeline_options import (
    PdfPipelineOptions,
    RapidOcrOptions,
)

options = PdfPipelineOptions(
    do_ocr=True,
    do_table_structure=False,
    generate_page_images=False,
    generate_picture_images=False,
    document_timeout=45,
    ocr_options=RapidOcrOptions(lang=["en"]),
)
```

If the first pass looks unusable:

```text
first conversion
    ↓
check extracted text
    ↓
second OCR conversion
```

Never OCR twice because of a coding mistake. Record `ocrUsed=true` in the response metadata.

---

# 28. Express integration

The frontend should **not** call the Python service directly.

The browser calls the existing Express backend.

Recommended public endpoint:

```http
POST /api/profile/import-resume
```

Express responsibilities:

```text
Authenticate user
    ↓
Validate upload size/type
    ↓
Forward file to Python service
    ↓
Validate returned JSON
    ↓
Return ProfileImport to frontend
```

Example using Node's `form-data` package:

```ts
import FormData from "form-data";
import axios from "axios";

export async function importResume(file: Express.Multer.File) {
  const form = new FormData();

  form.append("file", file.buffer, {
    filename: file.originalname,
    contentType: file.mimetype,
  });

  const response = await axios.post(
    `${process.env.RESUME_PARSER_URL}/parse`,
    form,
    {
      headers: form.getHeaders(),
      maxContentLength: 6 * 1024 * 1024,
      maxBodyLength: 6 * 1024 * 1024,
      timeout: 60_000,
    },
  );

  return response.data;
}
```

The Python URL must be internal-only, for example:

```env
RESUME_PARSER_URL=http://resume-parser:8000
```

Do not expose port 8000 publicly in production.

---

# 29. Express upload middleware

Use memory storage because the file is being forwarded immediately and the initial limit is 5 MB.

Example:

```ts
import multer from "multer";

const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    const allowed = new Set([
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]);

    cb(null, allowed.has(file.mimetype));
  },
});
```

The Python service must still validate the actual bytes. The frontend and Express MIME type are not trusted security boundaries.

---

# 30. Example Express route

```ts
router.post(
  "/profile/import-resume",
  requireAuth,
  resumeUpload.single("file"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { code: "NO_FILE" },
      });
    }

    try {
      const result = await importResume(req.file);

      return res.status(200).json(result);
    } catch (error) {
      // Log internal details.
      return res.status(422).json({
        success: false,
        error: {
          code: "RESUME_PARSE_FAILED",
          message: "We could not read this resume. You can enter your details manually.",
        },
      });
    }
  },
);
```

Do not return a raw stack trace or Python error body to the browser.

---

# 31. Frontend UX requirements

The resume importer exists to make signup faster.

Do not turn it into a separate long resume-processing page.

Recommended UX:

### Step 1

```text
Create your EduMatch profile

[ Upload your resume ]

PDF or DOCX • Max 5 MB

──────── OR ────────

[ Enter details manually ]
```

### Step 2

During processing:

```text
Reading your resume…
```

Use a simple progress/spinner state.

Do not show technical details such as:

```text
Running Docling layout pipeline
Loading OCR model
```

### Step 3

Show the prefilled setup form:

```text
We've filled this in from your resume.
Review anything you want to change.

Name       [ Ayush Mishra          ]
Email      [ ayush@example.com     ]
College    [ Manipal Institute...  ]
Degree     [ B.Tech CSE            ]
Skills     [ Python React ...      ]

             [ Continue → ]
```

### Step 4

After the minimum required fields are available:

```text
Continue to EduMatch →
```

Do not force the user to complete every optional field.

The rest of the profile can be completed from the normal profile page.

---

# 32. Never block signup because one field failed

Example:

```text
Resume extraction found:
✓ name
✓ email
✓ education
✓ skills
✓ projects
✗ phone
✗ LinkedIn
```

The user should still continue.

Blank fields are acceptable.

This feature succeeds when it removes manual work, not when it reaches theoretical 100% extraction.

---

# 33. Confidence/warnings

Do not show raw Docling confidence values as if they were profile-field accuracy scores.

Instead, the EduMatch parser can generate simple statuses:

```text
high
medium
missing
```

or:

```json
{
  "name": {
    "value": "Example Person",
    "status": "high"
  },
  "phone": {
    "value": null,
    "status": "missing"
  }
}
```

Initially, keep this internal unless the UI needs it.

Warnings can include:

```text
"Could not confidently identify a phone number."
"Resume appears to be image-based; OCR was used."
"Some project details may need review."
```

Do not make the user read technical parser warnings unless necessary.

---

# 34. Privacy requirements

Resume files can contain personal information.

Implementation requirements:

- Process locally on EduMatch-controlled infrastructure.
- Do not send resume data to an external AI API.
- Do not enable remote Docling services.
- Do not log full resume text.
- Do not log email/phone/name in debug logs.
- Do not persist raw uploaded bytes unless the product explicitly needs them.
- Clear temporary data after processing.
- Do not include extracted profile contents in application logs.
- Do not expose the Python parser publicly.

Only log safe operational information:

```text
requestId
file extension
file size
processing duration
ocrUsed
success/failure code
```

Docling explicitly supports local/offline execution, which fits this architecture. citeturn762515search4turn907322search3

---

# 35. Error handling matrix

Implement these cases explicitly:

| Case | HTTP | User behavior |
|---|---:|---|
| No file | 400 | Ask user to select a resume |
| Unsupported format | 415 | Tell user PDF/DOCX are supported |
| File too large | 413 | Ask user to upload a smaller file |
| Too many pages | 422 | Ask for a shorter resume |
| Password-protected/unreadable | 422 | Offer manual setup |
| Docling conversion failure | 422 | Offer manual setup |
| No useful text | 422 | Offer manual setup |
| OCR fallback also fails | 422 | Offer manual setup |
| Parser internal error | 500 | Do not expose technical details |
| Resume parsed partially | 200 | Prefill what was found |

Never make signup impossible merely because resume parsing failed.

Fallback:

```text
Couldn't import your resume.
No worries — you can fill the profile manually.

[ Enter details manually ]
```

---

# 36. Performance requirements

Because the entire objective is faster signup, measure parsing time.

Track internally:

```text
upload/read time
Docling conversion time
profile extraction time
total processing time
OCR used/not used
PDF/DOCX
page count
```

Target during local development:

```text
Digital 1–2 page PDF:
preferably < 2–3 seconds after models are warm

DOCX:
preferably < 1–2 seconds after warm-up

Scanned PDF with OCR:
acceptable to be slower
```

These are **engineering targets, not Docling guarantees**. Measure them on the actual EduMatch infrastructure and real resume fixtures.

Docling's `ConversionResult` exposes processing metadata/timings, and the project provides profiling examples. citeturn536416search16turn835204search0

---

# 37. Warm-up behavior

The first request may be substantially slower because models/pipelines have to initialize or because model artifacts are being fetched.

Avoid that first-user penalty.

At service startup:

```text
start FastAPI
  ↓
initialize fast PDF converter
  ↓
initialize DOCX path if necessary
  ↓
(optional) run a tiny local smoke conversion
  ↓
mark service ready
```

Do not make health checks repeatedly load the models.

If startup cost becomes large, use a readiness state:

```text
/health → process alive
/ready  → converter initialized
```

---

# 38. Concurrency

Do not immediately create one massive conversion worker per incoming HTTP request.

Start simple:

```text
1 Python service
1 warm Docling process
controlled request concurrency
```

Then benchmark.

Docling's PDF pipeline has configurable parallelism/threading, and `OMP_NUM_THREADS` can also limit CPU use. citeturn175070search0turn536416search4

For a college-scale EduMatch deployment, a simple single-service setup is enough initially.

Scale to multiple parser replicas only after measurements show that concurrency is a bottleneck.

---

# 39. Optional official `docling-serve` architecture

There is another valid architecture:

```text
Browser
  ↓
Express
  ↓
docling-serve
  ↓
Docling
  ↓
Express deterministic profile parser
```

Current `docling-serve` exposes a stable v1 REST API, including `/v1/convert/file`, which accepts multipart uploads. Its response can contain Markdown, plain text and/or JSON representations. citeturn635208search0turn319969search0turn835204search0

Local service startup is documented as:

```bash
pip install "docling-serve[ui]"
docling-serve run
```

or through the official container images.

The project currently publishes CPU and GPU container variants. citeturn635208search0turn817097search4

### Why this is not the primary EduMatch implementation

For EduMatch we need custom parsing logic anyway. Owning the small Python service makes it easier to:

- implement the exact profile schema
- run OCR only when needed
- keep only required output
- add deterministic skill normalization
- test field-level behavior
- control privacy

Use `docling-serve` later if you want Docling to become a shared internal document service.

---

# 40. If using `docling-serve` instead

The relevant current API is:

```http
POST /v1/convert/file
```

with multipart form data.

The current docs show options such as:

```text
from_formats=pdf
from_formats=docx
to_formats=text
do_ocr=false
```

and the service returns a JSON document containing fields such as:

```text
md_content
json_content
text_content
status
processing_time
timings
errors
```

when JSON output is selected. citeturn319969search0turn835204search0

For a profile importer, request plain text or JSON only. Do not request images unless you actually need them.

---

# 41. Docker setup for the custom parser service

Create:

```dockerfile
# resume-parser/Dockerfile
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Python 3.11 is a reasonable baseline for the service; Docling currently requires Python 3.10 or newer. citeturn762515search4

---

# 42. Docker Compose integration

Add a service similar to:

```yaml
services:
  backend:
    build: ./backend
    environment:
      RESUME_PARSER_URL: http://resume-parser:8000
    depends_on:
      resume-parser:
        condition: service_healthy

  resume-parser:
    build: ./resume-parser
    expose:
      - "8000"
    healthcheck:
      test:
        ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"]
      interval: 10s
      timeout: 5s
      retries: 10
```

Do not publish the parser port to the public internet.

Only Express should be able to reach it.

For production, bake/download Docling model artifacts into the image or mount a persistent artifact directory. Docling documents both approaches. citeturn907322search2

---

# 43. Do not use page images unless debugging

For the normal profile path:

```python
generate_page_images = False
generate_picture_images = False
```

Docling's current pipeline docs explicitly note that disabling page-image generation makes parsing faster because the pipeline no longer needs to render each page for those images. citeturn175070search0

When debugging a difficult resume, temporarily enable images or use Docling visualization tools to inspect what the layout pipeline saw.

Do not keep those features enabled in the production signup path unless needed.

---

# 44. Two-column resumes

Two-column resumes are a major reason to use Docling instead of just calling a raw PDF text extractor.

Docling's PDF processing includes document layout and reading-order handling. citeturn762515search4

Do not manually reconstruct column order unless testing demonstrates a concrete Docling failure.

When a resume is parsed:

```text
left column + right column
        ↓
Docling reading order
        ↓
structured document items
        ↓
EduMatch section parser
```

If a specific resume family consistently fails, add a targeted parser rule rather than a giant universal heuristic.

---

# 45. Section-aware extraction is more important than generic text matching

Do not search the entire resume for every field.

Example:

A word such as `Python` can appear in:

- Skills
- Projects
- Experience
- Coursework

For profile skills, prioritise the Skills section.

Similarly:

- University/institution detection should prioritise Education.
- Company detection should prioritise Experience.
- Project name detection should prioritise Projects.

Use the document structure Docling provides rather than flattening everything immediately.

---

# 46. Preserve provenance during development

During development, retain the source section/line that caused a field to be extracted.

Example internal object:

```json
{
  "field": "skills",
  "value": ["Python", "React"],
  "source": {
    "section": "Skills",
    "text": "Python, React, PostgreSQL"
  }
}
```

Do not return raw source text to the public API in production unless there is a product reason.

Provenance will make debugging dramatically easier.

---

# 47. Testing strategy

Do not declare this feature finished after testing one resume.

Build a fixture set of at least:

```text
10 normal one-column resumes
10 two-column resumes
5 DOCX resumes
5 scanned/image-based resumes
5 resumes with tables
5 resumes with unusual section names
5 resumes with no projects
5 resumes with no experience
5 resumes with missing contact details
```

That gives an initial diverse test set.

Use anonymized/sample resumes where possible.

---

# 48. Field-level accuracy tests

Each fixture should have a manually verified expected result.

For example:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "skills": ["Python", "React", "SQL"],
  "educationCount": 2,
  "experienceCount": 1,
  "projectCount": 3
}
```

Test every field independently.

Do not use one overall “parser accuracy” number only.

Track:

```text
name accuracy
email accuracy
phone accuracy
URL accuracy
education extraction
experience extraction
project extraction
skill extraction
certification extraction
```

---

# 49. Performance tests

Benchmark at least:

```text
cold startup
warm digital PDF
warm DOCX
warm scanned PDF
2-page resume
4-page resume
6-page resume
```

Measure:

```text
median latency
p95 latency
memory usage
CPU usage
OCR latency
```

Example:

```text
Resume type       median      p95
------------------------------------
PDF 1–2 pages     1.1s        1.8s
DOCX              0.8s        1.4s
Scanned PDF       3.7s        5.2s
```

These numbers are examples only; do not hard-code them into the product.

---

# 50. Regression rule

Whenever Docling is upgraded:

```text
install new version
   ↓
run entire resume fixture suite
   ↓
compare field extraction
   ↓
compare latency
   ↓
only then promote
```

This is especially important because document parsing/layout libraries evolve frequently.

---

# 51. Profile setup behavior after import

The user should see imported values as normal profile form fields.

Do not build a separate “parser result” UI unless needed.

Use the exact same components already used by profile setup:

```text
Resume import result
       ↓
form default values
       ↓
existing profile fields
```

This avoids maintaining two versions of the profile UI.

---

# 52. Required vs optional fields

Make the resume import independent from optional profile completeness.

Example:

Required to continue:

```text
name
email
college / education
```

Optional:

```text
phone
LinkedIn
GitHub
portfolio
experience
projects
certifications
```

Adapt this to the current EduMatch product requirements.

The resume parser should never reject an otherwise usable resume just because one optional field is missing.

---

# 53. Minimum extraction priority

Implement fields in this order:

## Phase 1 — highest value

```text
name
email
phone
LinkedIn
GitHub
education
skills
```

## Phase 2

```text
experience
projects
certifications
location
portfolio
```

## Phase 3 only if required by EduMatch

```text
coursework
awards
volunteering
publications
languages
interests
```

Do not delay the feature because the parser does not support every possible resume field.

---

# 54. Important implementation principle: never invent data

Bad:

```text
Resume says:
"Manipal Institute of Technology"

Parser invents:
"B.Tech Computer Science, 2023–2027"
```

Good:

```text
institution = "Manipal Institute of Technology"
degree = null
field = null
startDate = null
endDate = null
```

Then let the user complete what the resume did not clearly state.

This is one of the main reasons the deterministic pipeline is appropriate for this feature.

---

# 55. Security checklist

Before production:

- [ ] Require authenticated user at Express layer.
- [ ] Rate limit resume imports.
- [ ] Limit upload to 5 MB initially.
- [ ] Limit PDF to 6 pages initially.
- [ ] Validate actual file bytes.
- [ ] Accept only PDF/DOCX.
- [ ] Never execute uploaded files.
- [ ] Never treat uploaded filenames as filesystem paths.
- [ ] Use `Path(file.filename).name` before passing names internally.
- [ ] Do not log resume contents.
- [ ] Do not expose parser service publicly.
- [ ] Keep remote services disabled.
- [ ] Do not permanently save the upload unless explicitly needed.
- [ ] Have a safe manual fallback.
- [ ] Add timeout protection.
- [ ] Add memory/CPU resource limits at container level when deploying.

Docling itself exposes document-level timeout and size/page limits that should be used in addition to application-level limits. citeturn536416search0turn907322search1

---

# 56. Observability

Log only:

```json
{
  "event": "resume_parse",
  "requestId": "...",
  "format": "pdf",
  "bytes": 324123,
  "ocrUsed": false,
  "processingTimeMs": 912,
  "status": "success",
  "warningsCount": 1
}
```

Never log:

```text
full resume text
email
phone
address
full extracted profile
```

Use a request ID shared between Express and the Python service.

---

# 57. API timeouts

Use layered timeouts.

Example:

```text
Browser → Express: normal API timeout
Express → parser: 60 seconds
Docling conversion: 45 seconds
```

The parser's internal Docling timeout should be lower than the HTTP timeout so the service can return a clean error instead of hanging until the outer request times out.

Docling's current pipeline documentation describes `document_timeout` and notes that timed-out conversions return partial results with a timeout error. citeturn907322search1

---

# 58. What NOT to add

Do not add these to the initial implementation:

```text
LLM
VLM
GPT
Gemini
Claude
OpenAI API
paid resume parser API
embedding model
vector database
RAG
resume scoring
resume ranking
```

None are needed for the profile prefill requirement.

Do not use OCR for every PDF.

Do not enable all Docling enrichments.

Do not store the raw resume just because it was uploaded.

---

# 59. Optional future improvement: local NER

Only if deterministic rules prove insufficient after real testing, consider adding an open-source local NER model for particular fields.

That would still fit the no-LLM requirement.

But do **not** add it in the first implementation. First measure how far Docling + deterministic extraction gets.

The target is a simple, understandable pipeline.

---

# 60. Complete implementation order

The coding agent should implement in this exact order:

### Step 1 — inspect existing EduMatch profile schema

Identify the exact fields currently present in:

- signup
- profile setup
- database model
- API response

Do not invent a second profile schema if one already exists.

Create a mapping table:

```text
Resume field → existing EduMatch field
```

### Step 2 — add the Python service

Create:

```text
resume-parser/
```

Install pinned Docling.

### Step 3 — make raw Docling parsing work

Verify:

```text
PDF → DoclingDocument
DOCX → DoclingDocument
```

Verify:

```python
result.document.export_to_text()
```

### Step 4 — add in-memory upload endpoint

Implement:

```http
POST /parse
```

### Step 5 — add section-aware extraction

Implement:

```text
name
email
phone
links
education
skills
```

### Step 6 — add Phase 2 fields

Implement:

```text
experience
projects
certifications
location
portfolio
```

### Step 7 — add OCR fallback

Use:

```text
normal PDF parse
        ↓
text-quality heuristic
        ↓
RapidOCR only if needed
```

### Step 8 — connect Express

Create:

```http
POST /api/profile/import-resume
```

### Step 9 — connect frontend

Upload → loading → prefilled existing profile form.

### Step 10 — manual verification

User changes anything they want.

### Step 11 — run fixture test suite

Only then consider the feature complete.

---

# 61. Acceptance criteria

The feature is complete when all of these are true:

### Functionality

- [ ] User can upload PDF resume.
- [ ] User can upload DOCX resume.
- [ ] Parsed data is returned as profile-compatible JSON.
- [ ] Existing profile form is automatically prefilled.
- [ ] User can edit every imported value.
- [ ] Missing fields remain blank instead of being invented.
- [ ] User can continue even when some fields fail to parse.
- [ ] Manual profile setup remains available if parsing fails.

### Performance

- [ ] Docling converter is initialized once, not per request.
- [ ] Model artifacts are cached/preloaded.
- [ ] OCR is not run on every PDF.
- [ ] Page and file limits are enforced.
- [ ] No page/picture rendering is done during normal profile import unless required.
- [ ] Parser latency is measured on real fixtures.

### Privacy/security

- [ ] No external AI/resume API is used.
- [ ] No LLM is used.
- [ ] No VLM is used.
- [ ] Uploaded resume does not become a permanent file automatically.
- [ ] Parser service is internal-only.
- [ ] Full resume text is never logged.

### Quality

- [ ] Two-column resumes are tested.
- [ ] DOCX is tested.
- [ ] Scanned PDF is tested.
- [ ] Missing sections are tested.
- [ ] Multiple education/experience entries are tested.
- [ ] Skill normalization is tested.
- [ ] Parser regression tests exist before dependency upgrades.

---

# 62. Reference implementation target

The final system should look approximately like this:

```text
                         EDU MATCH

┌─────────────────────────────────────────────┐
│                Profile Setup                │
│                                             │
│  Upload Resume                               │
│  ┌───────────────────────────────────────┐  │
│  │  Drop PDF/DOCX here                   │  │
│  │  or click to browse                   │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  [ Enter manually instead ]                 │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
                 Express API
                       │
                       ▼
               Python Parser API
                       │
                       ▼
                    Docling
                       │
          ┌────────────┴────────────┐
          │                         │
     normal parse             OCR fallback
          │                         │
          └────────────┬────────────┘
                       ▼
              deterministic parser
                       │
                       ▼
                  Profile JSON
                       │
                       ▼
┌─────────────────────────────────────────────┐
│        We've filled this in for you         │
│                                             │
│ Name       [ Example Person             ]  │
│ Email      [ example@email.com           ]  │
│ Education  [ B.Tech CSE                  ]  │
│ College    [ Example Institute           ]  │
│ Skills     [ Python React PostgreSQL ... ]  │
│ Projects   [ 3 imported                  ]  │
│                                             │
│                 [ Continue → ]              │
└─────────────────────────────────────────────┘
                       │
                       ▼
                  EduMatch Main
```

That is the product behavior we are optimizing for.

---

# 63. Official Docling references used for this implementation

Use these as the source of truth when the coding agent encounters API details that may have changed:

1. Docling project / README
   - https://github.com/docling-project/docling

2. Official installation guide
   - https://docling-project.github.io/docling/getting_started/installation/

3. Official quickstart
   - https://docling-project.github.io/docling/getting_started/quickstart/

4. `DocumentConverter` API reference
   - https://docling-project.github.io/docling/reference/document_converter/

5. `DoclingDocument` API reference
   - https://docling-project.github.io/docling/reference/docling_document/

6. Pipeline options
   - https://docling-project.github.io/docling/reference/pipeline_options/

7. Advanced options
   - https://docling-project.github.io/docling/usage/advanced_options/

8. Supported formats
   - https://github.com/docling-project/docling/blob/main/docs/usage/supported_formats.md

9. OCR documentation
   - https://github.com/docling-project/docling/blob/main/docs/concepts/OCR.md

10. Official API service (`docling-serve`)
    - https://github.com/docling-project/docling-serve

11. `docling-serve` REST API
    - https://docling-project.github.io/docling/usage/api_server/rest_api/

12. `docling-serve` deployment
    - https://docling-project.github.io/docling/usage/api_server/deployment/

---

# 64. Final instruction to the coding agent

Build this feature as a **fast local resume importer**, not as an AI resume analyzer.

The parser should be:

```text
Docling
+ deterministic rules
+ section awareness
+ skill normalization
+ strict schema validation
+ graceful fallback
```

The user experience should be:

```text
Upload resume
    ↓
wait briefly
    ↓
profile is already filled
    ↓
review/edit
    ↓
continue
```

The user should never need to understand that Docling exists.

The user should feel that EduMatch simply **filled the profile for them**.

Most importantly:

> **Do not optimize for extracting every possible resume field. Optimize for getting enough correct data into the EduMatch profile quickly so the user can reach the main page without filling a long form manually.**
