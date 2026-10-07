# EduMatch Resume Import — Docling Installation, Performance & Deployment

## Core goal

This feature is only for:

**Upload CV/resume → extract profile data → prefill EduMatch profile → user reviews/edits → enter the main app quickly.**

Do **not** add an LLM.

Priorities:
1. Fast upload-to-prefill experience
2. Zero per-resume API cost
3. Local/self-hosted processing
4. Good extraction accuracy
5. Privacy
6. Simple, maintainable architecture

---

## 1. IMPORTANT: audit the 3 GB PyTorch installation before proceeding

The current Docling installation attempted to download a very large PyTorch package.

Do **not** blindly continue with the full/default Docling dependency set.

First determine:

- What package is pulling PyTorch.
- Which Docling feature/pipeline requires PyTorch.
- Whether that feature is actually needed for EduMatch resumes.
- Whether the current Docling version supports a lighter installation/configuration.
- Whether `docling-slim` or selective extras can satisfy the required PDF/DOCX pipeline.
- Whether unnecessary OCR/model packages are being installed.

### Do not make this rule

> Never install PyTorch.

### Use this rule instead

> Do not install a multi-gigabyte dependency unless the chosen Docling pipeline genuinely requires it for the resume use case.

If the selected pipeline genuinely requires PyTorch, **keep it**. A large Docker dependency is acceptable when it is installed once at build/deployment time rather than downloaded for every user upload.

---

## 2. Installation size is different from upload latency

The 3 GB download is primarily an **installation/build-time cost**.

Desired lifecycle:

```text
DOCKER BUILD
  ↓
Install Python dependencies
  ↓
Install Docling
  ↓
Install PyTorch if genuinely required
  ↓
Prefetch required model artifacts
  ↓
Build final image
```

Then:

```text
SERVER STARTUP
  ↓
FastAPI starts
  ↓
Docling initializes
  ↓
Local model artifacts are available
  ↓
Server remains running
```

Then every upload:

```text
USER UPLOAD
  ↓
Next.js API
  ↓
Python parser
  ↓
Already-installed Docling
  ↓
Already-available models
  ↓
Parse
  ↓
Return profile JSON
```

A user upload must **never** trigger:
- PyTorch installation
- Python package installation
- model download
- dependency download

---

## 3. Prevent first-request model downloads

Docling may obtain model artifacts on first use when they are not already present.

Do not allow this in the user request path.

Prefetch required Docling model artifacts during Docker image build/deployment where supported.

Conceptually:

```text
Docker build
  ↓
Install dependencies
  ↓
Prefetch required artifacts
  ↓
Store artifacts locally
  ↓
Final image ready
```

At runtime:

```text
Resume upload
  ↓
Use local artifacts
  ↓
No model download
```

Use Docling's supported local artifacts configuration for the installed version.

Do not invent configuration arguments; verify them against the exact installed Docling version.

---

## 4. Use a persistent FastAPI service

Do not launch a new Python process for every resume.

Do not fully initialize Docling for every request.

Preferred:

```text
Docker container
  ↓
FastAPI
  ↓
initialize Docling once
  ↓
wait for requests
```

Use FastAPI's modern `lifespan` mechanism.

Initialize expensive converter/parser state once during service startup where practical.

---

## 5. Architecture

Use:

```text
Browser
  ↓
Next.js POST /api/profile/import-resume
  ↓
Authentication
  ↓
File validation
  ↓
Rate limiting
  ↓
Internal HTTP request
  ↓
Python FastAPI resume-parser
  ↓
Docling
  ↓
Deterministic extraction/normalization
  ↓
ProfileImport JSON
  ↓
Zod validation
  ↓
Prisma transaction
  ↓
PostgreSQL
  ↓
Wizard/dashboard
```

Do **not** route through the currently empty/unwired Express backend.

---

## 6. Responsibility split

### Next.js owns

- Authentication
- Authorization
- Public API endpoint
- File validation
- Rate limiting
- Calling the Python service
- Validating parser output
- Applying import rules
- Prisma/database writes
- Returning `filled[]`
- Returning `warnings[]`

### Python owns

- PDF/DOCX extraction
- Docling
- Section detection
- Text/layout extraction
- Resume-specific deterministic extraction
- Regex extraction
- Entity extraction where useful
- Skills normalization
- Education extraction
- Experience extraction
- Project extraction
- Returning structured JSON

Python must **not** own:
- Auth
- Sessions
- Prisma
- PostgreSQL
- User authorization
- Frontend logic

Keep the parser service stateless.

---

## 7. No LLM

Do not add:

- OpenAI
- Gemini
- Anthropic
- local generative LLMs
- VLMs
- AI rewriting
- AI-generated summaries

The feature is document extraction + profile prefill.

---

## 8. Docling is the document extraction layer

Treat Docling as:

```text
PDF/DOCX
  ↓
Docling
  ↓
text + structure/layout
  ↓
resume extraction
  ↓
EduMatch profile schema
```

Do not make Docling responsible for all EduMatch business logic.

---

## 9. Keep the Docling feature set minimal

The target is resume processing.

Do not install every optional Docling feature if it is not needed.

Avoid unnecessary:
- VLM features
- unrelated document processors
- audio/video components
- chart processing
- unused OCR engines
- unused model backends

Focus on:
- PDF
- DOC/DOCX
- text/layout extraction
- only the OCR/model capabilities actually needed for resumes

---

## 10. Normal vs scanned resumes

Prefer a normal path for digitally-generated resumes:

```text
PDF/DOCX
  ↓
Docling
  ↓
text/layout
  ↓
profile extraction
```

Use OCR only when necessary:

```text
Scanned/image resume
  ↓
OCR
  ↓
text
  ↓
profile extraction
```

Do not invoke expensive OCR for every normal text-based resume.

---

## 11. Long-running service instead of per-request startup

Preferred:

```text
Container starts
  ↓
Docling initializes
  ↓
models are already available
  ↓
container remains running
  ↓
many uploads use the same service
```

Avoid:

```text
request
  ↓
cold start
  ↓
initialize/install/download
  ↓
parse
  ↓
shutdown
```

For this feature, a persistent Docker service is preferred over scale-to-zero execution where practical.

---

## 12. Benchmark runtime behavior

Measure:

- Docker startup time
- Docling initialization time
- first resume parse time
- subsequent resume parse time
- memory usage
- CPU usage

The important comparison is:

```text
FIRST PARSE
vs
SUBSEQUENT PARSE
```

We need to know whether startup/model-loading cost has accidentally entered the request path.

Do not promise a specific latency until it has been measured.

---

## 13. Runtime performance objective

Optimize for:

- no external parsing API
- no LLM
- no model download on request
- no dependency installation on request
- minimal network hops
- persistent parser service
- one-time Docling initialization
- no unnecessary OCR
- minimal file copying

A large Docker image is acceptable when request-time latency remains low.

**Optimize runtime latency, not just image size.**

---

## 14. File handling

Initially support:

- PDF
- DOC
- DOCX

Maximum upload size:

**5 MB**

Reject:
- unsupported file types
- oversized files
- empty files
- invalid/unreadable uploads where detectable

Do not rely solely on file extension. Validate the received type as practical.

---

## 15. Never persist the uploaded resume

Existing fields:
- `resumeUrl`
- `resumeFilename`

remain unused for this feature.

Lifecycle:

```text
Upload
  ↓
Parse
  ↓
Extract
  ↓
Write profile data
  ↓
Discard resume
```

Do not create file-storage infrastructure.

If temporary disk storage is unavoidable, delete temporary files after processing.

---

## 16. Security

Treat uploaded resumes as untrusted data.

Protect against:
- oversized files
- malformed PDFs
- malicious files
- document/archive bombs where applicable
- path traversal
- unsafe filenames
- arbitrary command execution
- parser crashes
- resource exhaustion

Never execute content from a resume.

Never interpolate an uploaded filename into a shell command.

---

## 17. Privacy

Resumes can contain personal information.

Therefore:
- do not store the file unnecessarily
- do not send it to third-party parsing APIs
- do not send it to LLM APIs
- do not log full resume contents
- do not log phone/email/full name unnecessarily
- delete temporary files after use
- keep the Python parser internal

---

## 18. Public API

Implement:

```text
POST /api/profile/import-resume
```

Flow:

1. Authenticate.
2. Parse multipart upload.
3. Validate file type.
4. Validate <= 5 MB.
5. Apply per-user rate limit.
6. Forward to `RESUME_PARSER_URL`.
7. Validate parser response with Zod.
8. Fetch the latest authenticated user's profile.
9. Apply fill-only-empty-fields rules.
10. Merge collections.
11. Apply only allowed derived/inferred values.
12. Write using Prisma transaction.
13. Return `filled[]` and `warnings[]`.

---

## 19. Parser API

Internal service:

```text
POST /parse-resume
```

Input:
- multipart file

Output:

```json
{
  "profile": {},
  "warnings": []
}
```

The parser should not know the authenticated user.

---

## 20. Authentication and authorization

The Next.js route must require an authenticated user.

Never accept a client-provided user ID as the authority.

Only modify the profile belonging to the authenticated session.

---

## 21. Rate limiting

Use per-user rate limiting for resume imports.

This protects against:
- repeated accidental uploads
- abuse
- resource exhaustion

Return an appropriate HTTP error when exceeded.

---

## 22. Target EduMatch schema

Map into existing schema only.

### User
- `User.name`

### EducatorProfile
- `phone`
- `city`
- `state`
- `headline`
- `discipline`
- `specializations`
- `highestDegree`
- `phdStatus`
- `eligibility`

### Education
Use the existing education row schema.

### Experience
Use the existing experience row schema.

### LinkedIn/GitHub/portfolio

Ignore for now unless a Prisma migration is explicitly requested.

Do not create new fields just for this feature.

---

## 23. Fill-only-empty-fields rule

This is mandatory.

```text
Existing field has meaningful value
  → preserve it

Existing field is empty
  → fill from resume
```

Treat these as empty:

- `null`
- `undefined`
- `""`
- whitespace-only strings

Do not blindly treat every falsy value as empty.

The server must determine emptiness, not the browser.

---

## 24. Merge collections instead of replacing them

For:
- education
- experience
- projects
- certifications
- skills

do not replace the entire existing collection.

Merge imported data into existing data.

Suggested conservative dedupe:

### Education
`normalized institution + degree`

### Experience
`normalized company + role` (and dates when useful)

### Projects
`normalized project name`

### Skills
canonical normalized skill name

Do not use aggressive fuzzy matching without tests.

---

## 25. Never-invent rule

If the resume does not clearly provide a value:

**leave it empty.**

Do not fabricate information simply to increase profile completion.

---

## 26. Experience date policy

Do **not** convert:

```text
2024 – 2025
```

into:

```text
January 2024 – December 2025
```

That invents precision.

Prefer an intermediate representation such as:

```json
{
  "startYear": 2024,
  "endYear": 2025,
  "datePrecision": "year"
}
```

If the current database requires exact months:

- preserve year-only meaning in the import layer
- require user verification before presenting exact months as facts
- or use internal placeholders only if absolutely necessary, while never showing them as extracted facts

Preferred UI:

```text
2024 – 2025
```

with:

```text
Exact months were not provided in the resume.
```

---

## 27. Headline policy

If the resume contains an explicit headline/summary, use it when it maps cleanly.

Otherwise a derived headline is allowed.

Example:

```text
Assistant Professor
+
MIT
```

→

```text
Assistant Professor at MIT
```

Mark it internally:

```text
source = derived
```

Do not describe a derived value as directly extracted.

If there is not enough information, leave it empty.

---

## 28. Discipline inference

Use this hierarchy:

### Priority 1
Explicit field.

Example:

```text
B.Tech in Computer Science and Engineering
```

→

```text
Computer Science
```

### Priority 2
Strong keyword mapping.

### Priority 3
Ambiguous degree only:

```text
Bachelor of Technology
```

→ leave discipline empty.

Do not guess.

---

## 29. Provenance

Where practical, distinguish:

- `resume`
- `inferred`
- `derived`

Example:

```json
{
  "phone": {
    "value": "+91...",
    "source": "resume"
  },
  "discipline": {
    "value": "Computer Science",
    "source": "inferred"
  },
  "headline": {
    "value": "Assistant Professor at MIT",
    "source": "derived"
  }
}
```

This is mainly for debugging and maintainability.

---

## 30. Warnings

Return warnings for uncertain fields.

Example:

```json
{
  "warnings": [
    {
      "field": "experience.0.endDate",
      "message": "The resume provided only a year; the exact month was not available."
    }
  ]
}
```

Frontend should keep warnings lightweight.

---

## 31. Deterministic extraction

Use deterministic methods when they are better.

Examples:

### Email
Regex.

### Phone
A phone-number parsing library.

### URL
Detect LinkedIn/GitHub/portfolio, but ignore them at DB layer for now.

### Dates
Deterministic date parsing.

### Skills
Controlled dictionary + normalization.

---

## 32. Skills

Maintain canonical skills and aliases.

Example:

```json
{
  "python": ["python", "py"],
  "javascript": ["javascript", "js"],
  "typescript": ["typescript", "ts"],
  "react": ["react", "reactjs", "react.js"],
  "next.js": ["next.js", "nextjs"],
  "postgresql": ["postgresql", "postgres", "psql"],
  "mongodb": ["mongodb", "mongo"]
}
```

Example:

```text
Resume:
ReactJS, JS, PostgreSQL, Mongo

EduMatch:
React
JavaScript
PostgreSQL
MongoDB
```

Do not classify every capitalized word as a skill.

---

## 33. Education extraction

Extract where available:

- institution
- degree
- field
- start year
- end year
- grade
- grade scale

Example:

```text
Manipal Institute of Technology
B.Tech in Computer Science
CGPA: 8.7/10
```

should become one education record.

Grade parsing must preserve the correct scale:

```text
8.7/10
```

→ grade `8.7`, scale `10`

not scale `1`.

---

## 34. Experience extraction

Extract:

- company/institution
- role/title
- dates
- description

Keep descriptions close to source content.

Do not rewrite them with an LLM.

Do not fabricate dates.

---

## 35. Project extraction

Extract:

- project name
- description
- technologies

Do not flush a project record before its description/technologies have been collected.

---

## 36. Section detection

Recognize common headings:

- Summary
- Profile
- Objective
- Education
- Academic Background
- Experience
- Work Experience
- Employment
- Skills
- Technical Skills
- Projects
- Academic Projects
- Certifications
- Courses
- Achievements
- Awards
- Publications

Be conservative.

Do not treat every short ALL-CAPS line as a heading.

Example:

```text
MIT
```

must not accidentally become a section heading.

---

## 37. Zod validation

Create/use:

```text
frontend/src/lib/educator/resume-import.ts
```

Include:

- `ProfileImport`
- parser response schema
- normalization helpers
- degree → enum mapping
- discipline mapping
- eligibility mapping
- fill-only-empty logic
- collection merge logic
- dedupe helpers
- warning generation

Never write an unvalidated Python object directly to Prisma.

---

## 38. `applyResumeImport()`

Create a reusable function similar to:

```ts
applyResumeImport(existingProfile, importedProfile)
```

It should:

1. Fill missing scalar fields.
2. Preserve non-empty fields.
3. Merge education.
4. Merge experience.
5. Merge skills.
6. Merge supported collections.
7. Deduplicate.
8. Normalize enums.
9. Apply conservative discipline inference.
10. Apply derived headline when allowed.
11. Produce `filled[]`.
12. Produce `warnings[]`.

Make this logic pure/testable where practical.

---

## 39. Prisma transaction

Use a Prisma transaction.

Conceptually:

```text
BEGIN
  ↓
read latest profile
  ↓
apply import rules
  ↓
update User if necessary
  ↓
update EducatorProfile
  ↓
merge education
  ↓
merge experience
  ↓
merge supported collections
  ↓
COMMIT
```

Any failure should roll back the entire import.

---

## 40. Race condition protection

Fetch the latest profile server-side before applying the import.

Do not use a stale client snapshot to decide whether a field is empty.

The server is authoritative.

---

## 41. Dockerfile

Create:

```text
resume-parser/Dockerfile
```

It should:

1. Use a stable Python base.
2. Install required system packages.
3. Install only required Python dependencies.
4. Pin `docling==2.132.0` unless a deliberate version change is made.
5. Install PyTorch only if the selected pipeline truly requires it.
6. Prefetch required model artifacts during build where supported.
7. Configure the service to use local artifacts.
8. Start FastAPI.
9. Prevent runtime model/dependency downloads.

Pin dependencies where practical.

---

## 42. Docker Compose

Create root:

```text
docker-compose.yml
```

Provide the parser as an internal service:

```text
Next.js
  |
  | internal Docker network
  v
resume-parser:8000
```

Do not expose the parser publicly unless required.

---

## 43. Health endpoint

Implement:

```text
GET /health
```

Response:

```json
{
  "status": "ok"
}
```

Use it for container health checks.

---

## 44. Environment variable

Add to `.env.example`:

```env
RESUME_PARSER_URL=http://resume-parser:8000
```

Do not hardcode the parser URL.

---

## 45. Logging

Good:

```text
resume import started
file type=pdf
file size=421KB
parse completed
duration_ms=1320
fields_extracted=14
warnings=2
```

Avoid logging:

```text
full resume text
full name
email
phone
```

unless specifically required during local debugging.

---

## 46. Frontend UX

Primary onboarding should be:

```text
Create your EduMatch profile

Upload your resume
PDF, DOC, DOCX • Max 5 MB

[ Upload Resume ]

or

[ Enter details manually ]
```

After import:

```text
We've filled in your profile from your resume.

✓ Basic information
✓ Education
✓ Skills
✓ Experience

[ Continue to EduMatch ]
```

Do not force the user to fill every profile field before entering the main application.

---

## 47. ResumeImportCard

Create/use a lightweight `ResumeImportCard`.

Place it in:

1. Minimal onboarding start page
2. Existing Step 6 area replacing "coming soon"
3. Dashboard/profile checklist as a secondary entry point

The feature should reduce onboarding work, not create another large wizard.

---

## 48. Loading state

Use something like:

```text
Reading your resume…
Extracting your profile…
```

Do not show fake percentage progress.

---

## 49. Error state

If parsing fails:

```text
We couldn't read that resume.

You can try another file or continue manually.
```

Actions:

```text
Try another resume
Continue manually
```

Do not expose stack traces or internal parser errors.

---

## 50. Partial extraction

An import succeeds even if some fields are unavailable.

Example:

```text
Name        ✓
Education   ✓
Skills      ✓
Experience  ✓
Phone       —
Headline    —
```

Do not force the user to retry because a few fields were not extracted.

---

## 51. Testing

Current Python parser state:

```text
41 passed
1 skipped
```

Keep the current suite green.

The skipped test is acceptable if it requires Docker/Docling, but it should be clearly labeled as integration/E2E.

Do not treat a permanently skipped integration test as complete coverage.

---

## 52. Frontend Vitest coverage

Test:

### Scalars
- empty → filled
- existing → preserved

### Skills
- aliases normalize
- duplicates removed

### Education
- duplicate not duplicated
- new row merged

### Experience
- duplicate not duplicated
- new row merged

### Headline
- explicit headline preferred
- derived headline when appropriate

### Discipline
- strong match → inferred
- ambiguous → blank

### Dates
- year-only remains year-only
- no fabricated months

### Warnings
- uncertainty generates warning

---

## 53. Integration/E2E

Run an actual Dockerized integration test:

```text
PDF upload
  ↓
Next.js route
  ↓
Python parser
  ↓
Docling
  ↓
Profile JSON
  ↓
Prisma transaction
  ↓
DB
  ↓
frontend response
```

Test:
- normal one-column PDF
- two-column PDF
- DOCX
- missing fields
- pre-existing profile values
- education + CGPA
- multiple experiences
- projects
- skills
- year-only dates
- scanned/image PDF if supported

---

## 54. Docker dependency decision

Use this exact policy:

```text
Does the selected Docling pipeline require PyTorch?
        |
        +-- NO
        |    → use the lighter stack
        |
        +-- YES
             |
             v
       Is the feature actually needed?
             |
             +-- NO
             |    → remove the feature
             |
             +-- YES
                  → keep PyTorch
                  → install only in Docker
                  → prebuild/prefetch once
                  → never download per request
```

---

# 55. Exact instruction to the coding agent

Continue the EduMatch resume-import implementation.

Before doing anything else, audit the current Docling installation because it attempted to install a roughly 3 GB PyTorch package.

Do NOT blindly reject PyTorch because it is large.

Do NOT blindly install it either.

Determine exactly:

1. What dependency is pulling PyTorch.
2. Which Docling feature/pipeline requires it.
3. Whether that feature is required for our resume-to-profile-prefill use case.
4. Whether the current Docling version supports a lighter installation/configuration.
5. Whether optional OCR/model dependencies are being installed unnecessarily.

If PyTorch is not required, reduce the dependency footprint.

If the chosen Docling pipeline genuinely requires PyTorch and removing it would materially break the intended resume parsing functionality, keep PyTorch and proceed.

A large Docker image is acceptable because this is a build/deployment dependency, not a dependency downloaded for every user upload.

In all cases:

- Install dependencies only in Docker.
- Prefetch required Docling model artifacts before serving requests.
- Do not download models during a user's resume upload.
- Do not install Python dependencies during a user's resume upload.
- Keep the parser as a long-running FastAPI service.
- Initialize expensive Docling state once during service startup where practical.
- Do not recreate the entire Docling converter on every request unless benchmarking proves it is necessary.
- Benchmark container startup, Docling initialization, first parse, and subsequent parse.
- Optimize runtime request latency, not merely image size.

Keep this architecture:

```text
Browser
→ Next.js POST /api/profile/import-resume
→ auth / validation / rate limit
→ internal Python FastAPI resume parser
→ Docling
→ deterministic extraction
→ ProfileImport JSON
→ Zod validation
→ Prisma transaction
```

Do NOT route through the unused Express backend.

Do NOT add an LLM.

Do NOT persist the uploaded resume.

Do NOT overwrite existing profile values.

Merge and deduplicate existing education/experience/projects/skills instead of replacing them.

Do NOT invent exact months for year-only experience dates.

Allow derived headline values, but mark them as derived.

Allow conservative discipline inference, but leave ambiguous disciplines empty.

Keep the current 41 passing Python tests green.

Keep Docker-dependent integration tests separate from local unit tests and make them runnable in CI/Docker.

Complete the remaining Docker, Next.js route, profile import logic, UI, environment, tests, and E2E work from the existing plan.
