# EduMatch — Complete Educator Profile Setup UX Revamp

## ROLE

You are a senior product designer + senior frontend engineer working directly inside the existing EduMatch repository.

Your task is to **completely revamp the educator profile setup experience**.

Do not merely restyle the existing wizard.

The goal is to redesign the interaction model using expert form UX principles:

- drastically reduce perceived effort
- minimize unnecessary typing
- prefill anything the system already knows
- replace typing with selections wherever appropriate
- progressively disclose complexity
- show only relevant questions
- create momentum between steps
- make the result visible while the user is building it
- make optional information genuinely optional
- make progress feel tangible
- make validation immediate and helpful
- preserve user control
- make the flow feel fast and modern rather than like an application form

The desired reaction from a user is:

> "That was surprisingly easy."

NOT:

> "I just filled out a six-page form."

---

# 1. IMPORTANT: UNDERSTAND THE EXISTING SYSTEM BEFORE CHANGING IT

The educator wizard already exists and is functional.

Current architecture:

`/onboarding/educator`
→ resume router  
→ `/onboarding/educator/[step]`
→ `WizardShell`
→ Step1 through Step6
→ server actions
→ Zod validation
→ Prisma

The current domain implementation already supports:

- draft educator profiles
- six-step wizard
- resume from incomplete step
- back-navigation
- step guards
- Zod validation
- education repeatable entries
- experience repeatable entries
- optional research step
- publish flow
- profile completeness
- profile editing after publishing
- profile visibility
- dashboard profile status
- review screen
- per-section edit links

Preserve this working architecture unless a UX requirement genuinely requires a change.

Do NOT rewrite the authentication architecture.

Do NOT move the profile domain into Express.

Do NOT replace Prisma.

Do NOT replace Zod.

Do NOT create a second profile system.

Do NOT break the existing draft/publish workflow.

The current educator data model and wizard domain logic are already established.

---

# 2. PRIMARY FILES TO WORK ON

Inspect these files first:

```text
frontend/src/app/onboarding/educator/layout.tsx
frontend/src/app/onboarding/educator/page.tsx
frontend/src/app/onboarding/educator/[step]/page.tsx
frontend/src/app/onboarding/educator/actions.ts

frontend/src/components/educator/WizardShell.tsx
frontend/src/components/educator/CompletenessMeter.tsx
frontend/src/components/educator/MatchEstimate.tsx
frontend/src/components/educator/FormField.tsx
frontend/src/components/educator/FieldError.tsx
frontend/src/components/educator/StepIntent.tsx
frontend/src/components/educator/SubmitButton.tsx
frontend/src/components/educator/TagInput.tsx
frontend/src/components/educator/RepeatableList.tsx
frontend/src/components/educator/EducationRow.tsx
frontend/src/components/educator/ExperienceRow.tsx

frontend/src/components/educator/steps/Step1Basics.tsx
frontend/src/components/educator/steps/Step2Academics.tsx
frontend/src/components/educator/steps/Step3Experience.tsx
frontend/src/components/educator/steps/Step4Research.tsx
frontend/src/components/educator/steps/Step5Preferences.tsx
frontend/src/components/educator/steps/Step6Review.tsx

frontend/src/app/profile/page.tsx
frontend/src/app/dashboard/page.tsx

frontend/src/app/globals.css
```

The current `/profile` page uses per-section edit links back into the wizard, so the new wizard must continue working for both initial onboarding and post-publish editing.

---

# 3. CORE UX DIRECTION

The new experience should feel like:

```text
guided profile builder
+
smart defaults
+
progressive disclosure
+
live preview
+
small decisions
+
minimal typing
```

It should NOT feel like:

```text
government application
+
database input form
+
six giant screens
```

The user's mental model should be:

> "I'm building my educator profile."

not:

> "I'm entering information into EduMatch's database."

---

# 4. DO NOT CHANGE THE SIX DATA CONCEPTS

Keep the conceptual structure:

```text
1. Basics
2. Academics
3. Experience
4. Research
5. Preferences
6. Review
```

But redesign the presentation completely.

Use these user-facing names:

```text
1. About you
2. Academic background
3. Teaching & experience
4. Research
5. What you're looking for
6. Review profile
```

The UI should use human language rather than database terminology.

---

# 5. NEW OVERALL LAYOUT

## Desktop

Create a modern two-column profile-builder layout.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ EduMatch                          Profile setup             Saved ✓         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  About you                           Your profile                           │
│  Step 1 of 6                         ┌───────────────────────────────┐       │
│                                      │            A                  │       │
│  Let's start with the basics         │      Ayush Mishra             │       │
│                                      │                               │       │
│  Tell us a little about yourself.    │  Computer Science Educator    │       │
│  This helps institutions understand  │                               │       │
│  who you are.                        │  Bengaluru · Karnataka        │       │
│                                      │                               │       │
│  Full name                           │  AI · Backend · ML             │       │
│  [ Ayush Mishra              ]       │                               │       │
│                                      └───────────────────────────────┘       │
│  Mobile number                                                               │
│  [ +91 __________            ]       Profile readiness                       │
│                                      ███████████░░ 68%                       │
│  ...                                                                         │
│                                      3 useful details remaining              │
│                                                                             │
│                                      [Why we ask this]                       │
│                                                                             │
│  ← Back                         Continue →                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

Desktop proportions:

```text
Main content: ~65%
Right rail: ~35%
```

The form must have comfortable max-width.

Do not create a huge full-screen form spanning the entire viewport.

---

# 6. MOBILE LAYOUT

On mobile:

Do NOT retain the desktop side panel.

Use:

```text
Header
Progress
Step title
Intent text
Form
Optional contextual preview
Sticky bottom navigation
```

Example:

```text
←                           1 of 6

About you

Let's start with the basics.
This takes about 30 seconds.

Full name
[ Ayush Mishra ]

Mobile number
[ +91 __________ ]

City
[ Bengaluru ]

State
[ Karnataka ▾ ]

...

────────────────────────────
← Back             Continue →
────────────────────────────
```

The bottom action area should be sticky.

Ensure it does not cover form fields.

---

# 7. GLOBAL HEADER

Replace the current heavy wizard navigation treatment with a simpler header.

Top:

```text
EduMatch                         Profile setup
```

Below it:

```text
About you
━━━━━━━━━━░░░░░░░░░░░
1 of 6
```

On desktop, the progress navigation can remain in a small side area or horizontal stepper.

On mobile, use only:

```text
Step 1 of 6
██████░░░░░░
```

Do not expose a giant list of all six steps.

The user should never feel like they are entering "Step 1 of 6 pages of paperwork."

---

# 8. CHANGE THE PURPOSE OF THE COMPLETENESS METER

The existing `CompletenessMeter` uses the `MatchRing` percentage and missing-field links.

Do NOT prominently frame this as:

> "Match score"

or:

> "You are only 62% complete"

That can feel like a grade.

Rename the concept in the UI to:

> **Profile readiness**

or:

> **Profile progress**

Use:

```text
Profile readiness
68%

3 useful details remaining
```

The explanation should be:

> Complete a few more details to help institutions understand your background and preferences.

Do not imply that the percentage is a probability of matching.

The current completeness implementation is weighted around matching impact, but it is still a completeness heuristic. Keep the underlying calculation unless there is a strong technical reason to change it.

---

# 9. LIVE PROFILE PREVIEW

Create a new component:

```text
frontend/src/components/educator/EducatorProfilePreview.tsx
```

This is one of the most important changes.

While the user fills out the wizard, show a small live profile preview.

Example:

```text
┌─────────────────────────────────┐
│                                 │
│             [ A ]               │
│                                 │
│        Ayush Mishra             │
│   Computer Science Educator     │
│                                 │
│  Bengaluru · Karnataka          │
│                                 │
│  AI · Machine Learning           │
│  Backend Development             │
│                                 │
└─────────────────────────────────┘
```

Update it immediately when the user changes relevant fields.

Examples:

Name changes → preview changes.

Headline changes → preview changes.

Specializations change → tags change.

City changes → location changes.

Profile image → avatar updates.

Do NOT require the user to submit the form before seeing the result.

This is crucial.

The user is building something visible instead of entering abstract data.

---

# 10. USE EXISTING GOOGLE USER DATA

The current User model already has:

```text
name?
email?
image?
```

and authentication is Google-based.

Use that information.

Do not ask the user to manually re-enter information the system already has.

For initial profile setup:

```text
name = session.user.name
image = session.user.image
email = session.user.email
```

where applicable.

The user should never see:

> Enter your email

because authentication already established their email.

The email can appear as non-editable account information only if it is useful.

Example:

```text
Signed in as
ayush@example.com
```

But don't make it look like a form field.

---

# 11. PROFILE IMAGE

The current Google image should automatically populate the preview when available.

Do not add a mandatory photo upload.

Display:

```text
Your profile photo

[Google profile photo]

Looks good? Keep it

Change photo
```

But because the project currently has no actual resume/file upload implementation, do not invent a profile-image upload backend unless you explicitly need one.

For now:

- use Google profile image when available
- generate initials when unavailable
- make the field optional

Never block profile creation because there is no image.

---

# 12. EVERY STEP NEEDS A CLEAR PURPOSE

At the beginning of every step:

```text
Eyebrow
Step title
One-sentence reason
Approximate effort
```

Example:

```text
STEP 2 OF 6

Academic background

Tell us what you studied so institutions can understand
your teaching qualifications.

~45 seconds
```

Do NOT write large instructional paragraphs.

Keep explanations to 1–2 sentences.

---

# 13. STEP 1 — ABOUT YOU

Current data includes:

- phone
- city
- state
- willingness to relocate
- headline
- bio

Keep the same underlying data.

But completely redesign the experience.

## Header

```text
About you

Let's start with the basics.
These details help institutions identify and understand you.

~30 seconds
```

## Field 1

Use:

```text
Full name

[ Ayush Mishra ]
```

Do not ask for first name and last name separately.

The name comes from the authenticated user.

If the user wants to change it, provide:

```text
Edit
```

or allow editing if your product permits it.

---

## Phone

```text
Mobile number

[ +91 98765 43210 ]

Used for professional contact.
```

Use:

```html
inputMode="tel"
type="tel"
autocomplete="tel"
```

Keep the Indian phone validation already implemented.

Do not make the user type country code if India is the only relevant market at this stage.

---

## Location

Do not make users manually enter everything.

Use:

```text
City
[ Search city... ]
```

and:

```text
State
[ Karnataka ▾ ]
```

If a reliable city → state relationship is implemented, selecting a city should suggest/populate state.

Do not silently guess a location from IP.

Never invent personal data.

A suggestion should look like:

```text
We think you're in Bengaluru

Use Bengaluru
Change
```

Only implement this if the underlying source is actually available.

Otherwise use a searchable city field.

---

## Relocation

Do NOT display this as a boring checkbox.

Use:

```text
Are you open to relocating?

○ Yes, I'm open to relocation
○ Maybe — depends on the opportunity
○ No, I'd prefer to stay where I am
```

Use clear cards/radio options if the existing data model can represent these choices.

IMPORTANT:

If the existing schema currently only supports boolean `willingToRelocate`, do not silently invent new database semantics.

If you cannot add a tri-state cleanly, retain:

```text
Would you consider relocating?

[ Yes ]
[ No ]
```

as a two-card selection.

---

## Headline

Use:

```text
How would you describe yourself professionally?

[ Assistant Professor of Computer Science ]

A short headline institutions will see first.
```

Show character count:

```text
42 / 80
```

Do not make users discover character limits through an error.

---

## Bio

Do not present the bio as a large boring text field.

Use:

```text
Tell institutions a little about you

[Write a short introduction...]

0 / 300
```

Add a lightweight assisted-writing option:

```text
✨ Help me write it
```

When clicked, generate a draft from data already entered.

Example:

```text
Based on your profile:

"Computer science educator with experience in
machine learning and backend development..."

[Use this] [Edit]
```

Do not automatically save generated text without user approval.

Do not add an AI API unless the project already has one configured for this purpose. The UX can include the affordance only if the agent can implement it with an existing provider; otherwise leave the button out rather than creating fake behavior.

---

# 14. STEP 2 — ACADEMIC BACKGROUND

This step currently contains:

- highest degree
- PhD status
- discipline
- specializations
- eligibility
- education history

The current implementation uses selects, tag inputs, checkboxes and repeatable education rows.

Redesign it into a guided sequence.

---

## Step 2 opening

```text
Academic background

Start with your highest qualification, then we'll
ask for the details that matter.

~45 seconds
```

---

## Highest degree

Instead of a generic dropdown:

```text
Highest degree
[ Select... ]
```

use large selectable cards:

```text
What is your highest qualification?

┌──────────┐ ┌──────────┐ ┌──────────┐
│Bachelor's│ │ Master's │ │  M.Phil  │
└──────────┘ └──────────┘ └──────────┘

┌──────────┐ ┌──────────┐
│   PhD    │ │ Postdoc  │
└──────────┘ └──────────┘
```

There are only five options, so don't hide them in a dropdown.

---

# 15. CONDITIONAL PHD QUESTION

Only show PhD status when it is relevant.

For example:

If:

```text
highestDegree = PHD
```

show:

```text
What's your PhD status?

○ Pursuing
○ Submitted
○ Awarded
```

If the user selected Bachelor's or Master's and your data model does not require a PhD status, don't visually waste space on it.

If the existing validation requires it regardless, preserve the underlying requirement but use contextual presentation.

---

# 16. DISCIPLINE

There are 24 discipline enum options.

Do NOT use a giant native `<select>` as the primary interaction.

Use a searchable combobox:

```text
What do you teach?

[ Search discipline... ]

Computer Science
Computer Engineering
Electrical Engineering
Mathematics
Physics
...
```

After selecting:

```text
✓ Computer Science
```

This is faster and easier to scan.

---

# 17. SPECIALIZATIONS

Use chips.

```text
What are your areas of specialization?

[ Machine Learning × ]
[ Artificial Intelligence × ]

+ Add specialization
```

Provide contextual suggestions based on selected discipline.

For Computer Science:

```text
Machine Learning
Artificial Intelligence
Data Science
Cybersecurity
Computer Networks
Databases
Software Engineering
Cloud Computing
```

Suggestions should be selectable.

Do NOT force users to type every specialization manually.

Keep the existing duplicate prevention and 1–8 constraints.

---

# 18. ELIGIBILITY

Turn the current checkbox grid into clear cards.

```text
Which eligibility qualifications do you hold?

[ UGC NET ]
[ CSIR NET ]
[ SET / SLET ]
[ JRF ]
[ GATE ]
[ None of these ]
```

Make selected state obvious.

Keep the existing `NONE` exclusivity rule.

Do not display all options as tiny checkboxes.

---

# 19. EDUCATION HISTORY

The existing education history is a repeatable list.

Do not dump several empty forms onto the screen.

Initially show only:

```text
Education

Your most recent qualification

┌────────────────────────────────────┐
│ Master's                            │
│                                    │
│ Field                               │
│ [ Computer Science ]                │
│                                    │
│ Institution                         │
│ [ MIT Bengaluru ]                  │
│                                    │
│ 2023 ── 2025                        │
└────────────────────────────────────┘

+ Add another qualification
```

Clicking:

```text
+ Add another qualification
```

creates another card.

Existing entries should be collapsed when there are multiple.

Example:

```text
Education

Master's · Computer Science
MIT Bengaluru · 2023–2025                    Edit

Bachelor's · Computer Science
Manipal Institute of Technology · 2020–2024  Edit

+ Add qualification
```

This reduces visual overload significantly.

---

# 20. SMART DEFAULTS FOR EDUCATION

When adding a new education entry:

- default start/end year intelligently only when safe
- default `ongoing = false`
- keep current values when editing
- never overwrite user-entered data

Do NOT fabricate institution names, degrees or years.

---

# 21. STEP 3 — TEACHING & EXPERIENCE

Current implementation supports:

- fresher toggle
- teaching years
- current designation
- current institution
- notice period
- repeatable experience
- subjects

This should become dramatically more intuitive.

---

## First question

Do not immediately show six input fields.

Ask:

```text
Do you have teaching experience?

┌──────────────────────────────┐
│ Yes                          │
│ I have taught at an           │
│ institution or organization.  │
└──────────────────────────────┘

┌──────────────────────────────┐
│ Not yet                      │
│ I'm starting my teaching     │
│ career.                       │
└──────────────────────────────┘
```

---

## Fresher branch

If the user selects:

```text
Not yet
```

show:

```text
That's completely fine.

We'll mark you as a fresher and tailor
your profile accordingly.

✓ Fresher profile
```

Then immediately:

```text
Continue →
```

Do NOT make a fresher fill unnecessary empty experience fields.

Keep the existing fresher representation.

---

# 22. EXPERIENCED BRANCH

Only after choosing "Yes":

```text
Great. Tell us about your teaching background.
```

Then:

```text
How many years have you been teaching?

[ 4 ] years
```

Then:

```text
Your current role

Designation
[ Assistant Professor ]

Institution
[ ABC University ]

Notice period
[ 30 days ▾ ]
```

Do not show these if they are irrelevant to the selected path.

---

# 23. EXPERIENCE HISTORY

Use card-based entries.

Initial state:

```text
Teaching experience

+ Add teaching experience
```

Existing entry:

```text
Assistant Professor
ABC University

Aug 2022 — Present

Computer Science · Machine Learning · AI

Edit
```

When adding:

```text
Add experience

Designation
[ Assistant Professor ]

Institution
[ ABC University ]

Start date
[ Aug 2022 ]

☐ I currently work here

End date
[ ... ]

Subjects taught
[ AI × ] [ Machine Learning × ]

+ Add subject
```

Do not show end date when "currently work here" is selected.

Preserve the current rule that only one experience may be marked current.

---

# 24. SUBJECTS

Make this easy.

Use:

```text
Subjects / areas taught

[ Machine Learning × ]
[ Artificial Intelligence × ]

Suggestions:

+ Data Structures
+ Databases
+ Computer Networks
+ Python
```

Clicking suggestions adds chips.

Keep the existing maximum of six subjects.

---

# 25. STEP 4 — RESEARCH

This step is optional and should visually communicate that.

Current product logic already makes research non-blocking and provides a skip action. Keep that behavior.

At the top:

```text
Research

Optional — you can always add this later.

Adding research details can help institutions
understand your academic profile.

~20 seconds
```

Immediately provide:

```text
Skip for now
```

as a visible secondary action.

Do not make "skip" visually tiny.

---

# 26. RESEARCH INPUTS

Current fields:

- publications count
- ORCID
- Scopus ID
- h-index

Use a compact structure:

```text
Research output

Publications
[ 12 ]

ORCID
[ 0000-0000-0000-0000 ]

Scopus Author ID
[ __________ ]

h-index
[ 5 ]
```

Use explanatory text only when necessary.

Example:

```text
ORCID
Your persistent researcher identifier.
```

Do not force users to understand ORCID/Scopus during onboarding.

---

# 27. OPTIONAL RESEARCH SUMMARY CARD

If the user enters research:

```text
Research profile

12 publications
h-index 5
ORCID connected
```

If empty:

```text
Research

Not added yet

You can add this later from your profile.
```

This makes skipping feel legitimate rather than like failure.

---

# 28. STEP 5 — WHAT YOU'RE LOOKING FOR

This step should feel like personalization, not configuration.

Current data includes:

- desired faculty levels
- employment types
- preferred locations
- expected pay level

The existing `MatchEstimate` uses these values along with discipline/degree to calculate an estimate.

---

## Step header

```text
What are you looking for?

Tell us what kinds of teaching opportunities
fit you best.

~30 seconds
```

---

# 29. FACULTY LEVELS

Use large cards:

```text
What level are you interested in?

[ Guest Faculty ]
[ Visiting Faculty ]
[ Assistant Professor ]
[ Associate Professor ]
[ Professor ]
[ HOD ]
```

Allow multiple where the existing schema allows it.

Selected cards get a clear visual state.

---

# 30. EMPLOYMENT TYPE

```text
How would you like to work?

[ Full-time ]
[ Contract ]
[ Visiting ]
[ Part-time ]
```

Use cards.

No generic dropdown.

---

# 31. LOCATION PREFERENCES

This should be especially frictionless.

Start with:

```text
Where would you like to work?

[ Anywhere in India ]
```

then:

```text
or choose specific locations

[ Search city / state... ]

Bengaluru
Hyderabad
Mumbai
Pune
Delhi NCR
Chennai
...
```

If:

```text
Anywhere in India
```

is selected, clear specific locations automatically.

Preserve the existing `Anywhere in India` exclusivity behavior.

---

# 32. EXPECTED PAY LEVEL

Because there are seven existing pay enums, don't force a tiny dropdown onto the screen.

Use a compact select/combobox:

```text
Preferred pay level
[ Level 10 ▾ ]
```

But if this field is optional, make that obvious.

Do not invent additional salary values without changing the data model intentionally.

---

# 33. REPOSITION MATCH ESTIMATE

The existing `MatchEstimate` is a demand-table heuristic, not a live job feed. The current project status explicitly notes that real matching/listings do not exist yet.

Therefore:

DO NOT make the estimator look like live marketplace data.

Do not say:

> "17 jobs available near you"

unless there are actually 17 live database-backed jobs.

Instead use language such as:

```text
Market signal

Based on the preferences you've chosen,
your profile aligns with a broader set of
potential teaching opportunities.

~12 potential role types

Illustrative estimate — not live listings.
```

Or:

```text
Your profile is becoming more flexible

Broader location preferences and employment
types can increase the number of opportunities
you may fit.
```

The estimator should be a secondary reinforcement, not the main reason to complete a step.

---

# 34. STEP 6 — REVIEW PROFILE

This step should be the emotional payoff.

The current review step displays per-section summaries and edit links. Keep that structure but redesign it as a polished profile preview.

---

## Top

```text
Your profile is ready

Here's what institutions will see.
You can change anything before publishing.
```

Then show a polished profile card.

---

# 35. REVIEW LAYOUT

Use:

```text
┌────────────────────────────────────────────┐
│                  [ A ]                     │
│                                            │
│              Ayush Mishra                  │
│     Assistant Professor of Computer        │
│                   Science                  │
│                                            │
│       Bengaluru · Karnataka                │
│                                            │
│ AI · Machine Learning · Backend             │
└────────────────────────────────────────────┘

ABOUT YOU
Short bio...

ACADEMIC BACKGROUND
PhD · Computer Science
MIT Bengaluru · 2024
...
                                      Edit →

TEACHING & EXPERIENCE
4 years
Assistant Professor · ABC University
                                      Edit →

RESEARCH
12 publications · h-index 5
                                      Edit →

LOOKING FOR
Assistant Professor · Full-time
Bengaluru · Hyderabad
                                      Edit →
```

Do not show raw JSON-like summaries.

Do not show database terminology.

---

# 36. PUBLISH SECTION

At the bottom:

```text
Ready to publish?

Publishing makes your educator profile available
for relevant EduMatch opportunities.

You can change your profile later.
```

Then:

```text
[ Publish my profile ]
```

Secondary:

```text
← Back
```

Do not use:

```text
SUBMIT
```

"Publish my profile" communicates the actual action.

---

# 37. PUBLISH VALIDATION

Preserve the existing `requiredGaps()` and publish validation.

Do not weaken server-side validation simply because the UI was redesigned.

If required information is missing:

show:

```text
Your profile needs 2 more details

• Add your academic discipline
• Choose where you'd like to work

Fix these →
```

Deep-link to the relevant step.

Do not dump a giant generic error at the top.

The current backend publish flow already validates required profile sections; keep that as the source of truth.

---

# 38. IMPORTANT UX CHANGE — NEVER MAKE ERRORS FEEL LIKE FAILURE

Current `FieldError` / validation behavior should be preserved technically but redesigned visually.

Bad:

```text
Invalid input
```

Better:

```text
Enter a valid 10-digit mobile number.
```

Better:

```text
Mobile number

[ 1234 ]

Please enter a 10-digit Indian mobile number.
Example: 9876543210
```

Never erase any values the user has already entered.

---

# 39. INLINE VALIDATION

Use validation at the right moment.

Do NOT validate on every keystroke.

Bad:

```text
A
✗ Too short

Ay
✗ Too short

Ayu
✗ Too short
```

Instead validate on:

- blur
- completion
- submit
- or when enough input exists to determine correctness

For example:

```text
Username unavailable
```

only after the user has actually entered a meaningful username.

---

# 40. KEEP LABELS ALWAYS VISIBLE

Never build:

```text
[ Enter your headline here ]
```

as the sole field identifier.

Always:

```text
Professional headline

[ Assistant Professor of Computer Science ]
```

Placeholder text can provide an example, but it is never the label.

---

# 41. FIELD HELP TEXT

Keep help text to one line.

Bad:

> Your professional headline is used in various places throughout the application and is intended to provide institutions with a concise overview...

Good:

> A short headline institutions will see first.

---

# 42. BUTTON SYSTEM

Replace generic navigation where possible.

Avoid:

```text
Next
Next
Next
Next
Finish
```

Use contextual CTA copy.

Examples:

Step 1:

```text
Continue to academics →
```

Step 2:

```text
Continue to experience →
```

Step 3:

```text
Continue to research →
```

Step 4:

```text
Continue to preferences →
```

Step 5:

```text
Review my profile →
```

Step 6:

```text
Publish my profile
```

On mobile, keep labels concise:

```text
Continue →
Review →
Publish
```

---

# 43. BACK BUTTON

Always provide:

```text
← Back
```

Do not make the browser back button the only way.

When going back:

- preserve entered values
- preserve repeatable entries
- preserve selected chips
- preserve scroll position when practical
- do not reset the form

---

# 44. SAVE BEHAVIOR

The system already persists profile steps using server actions.

Improve the perception of saving.

Show a small header state:

```text
Saved ✓
```

When saving:

```text
Saving...
```

Then:

```text
Saved just now ✓
```

Never use a giant toast for every save.

Do not create fake saving states.

The indicator must reflect actual server persistence.

---

# 45. "SAVE & EXIT"

Add:

```text
Save & exit
```

as a secondary action where appropriate.

Important:

If the current step has unsaved changes and the user clicks Save & exit, persist the current valid state before leaving.

If the current state cannot be saved because required information is invalid:

```text
We couldn't save these changes yet.

Your previously saved profile is safe.
Fix the highlighted field or stay here.
```

Do not destroy their input.

If implementing true automatic draft persistence is too invasive for the current architecture, prefer a reliable explicit save action instead of pretending autosave exists.

---

# 46. PREVENT ACCIDENTAL DATA LOSS

Add dirty-state protection.

If a user tries to leave with unsaved changes:

```text
Leave profile setup?

Your latest changes haven't been saved.

[Stay]
[Leave]
```

Use browser-level beforeunload protection where appropriate.

Do not overdo this for already-saved states.

---

# 47. PROGRESS SHOULD SHOW MEANING, NOT JUST NUMBERS

Instead of only:

```text
60%
```

show:

```text
Profile readiness
60%

2 key details remaining
```

Or:

```text
You're almost there
2 useful details left
```

The progress UI should reassure the user.

Do not make it feel like a grade.

---

# 48. PROGRESS NAVIGATION

Completed steps:

```text
✓ About you
✓ Academic background
✓ Teaching & experience
```

Current:

```text
4  Research
```

Future:

```text
5  What you're looking for
6  Review
```

However:

Do not make future steps visually huge or intimidating.

A small, understated indicator is enough.

Research is clearly labeled:

```text
Research · Optional
```

---

# 49. OPTIONAL MEANS OPTIONAL

Any optional field or step must visually communicate that it is optional.

Particularly:

```text
Research
Optional
```

and:

```text
Profile photo
Optional
```

Use:

```text
Skip for now
```

where appropriate.

Do not make optional fields look like mandatory work.

---

# 50. PROGRESSIVE DISCLOSURE RULE

This is a hard requirement.

Do not show a field until it becomes relevant.

Examples:

If fresher:

```text
Hide teaching history.
Hide current institution.
Hide notice period.
```

If no PhD:

```text
Don't unnecessarily emphasize PhD status.
```

If current job:

```text
Show current experience fields.
Hide end-date input.
```

If not current:

```text
Show end date.
```

If "Anywhere in India":

```text
Hide specific location chips.
```

If specific locations are selected:

```text
Show selected locations and search/add interface.
```

This should significantly reduce cognitive load.

---

# 51. CHOICE CONTROLS SHOULD MATCH THE DATA

Use:

```text
Cards/radios
```

for 2–6 meaningful choices.

Use:

```text
Chips
```

for multiple selections.

Use:

```text
Searchable combobox
```

for large lists.

Use:

```text
Text input
```

only when free-form text is genuinely necessary.

Use:

```text
Textarea
```

only for actual prose.

Use:

```text
Native select
```

when there is genuinely a compact list or where it is more appropriate.

Do NOT default every field to `<select>`.

---

# 52. TAG INPUT UX

Current `TagInput` supports Enter, comma and blur commit.

Keep that functionality.

Improve the UX:

```text
[ Machine Learning × ]
[ Artificial Intelligence × ]

Type an area and press Enter

Suggestions:
Machine Vision
NLP
Deep Learning
```

A typed tag should never disappear because the user forgot to press Enter.

Add clear selected state.

Allow keyboard deletion.

Support:

```text
Backspace → remove last chip
```

when input is empty.

---

# 53. REPEATABLE LIST UX

Current generic `RepeatableList` should not render empty repeated forms by default.

Use:

```text
Experience

No experience added yet.

[ + Add experience ]
```

rather than:

```text
Experience #1
20 empty fields
```

For existing entries, collapse them.

Example:

```text
Assistant Professor
ABC University · 2022–Present
[Edit] [Remove]
```

Then editing opens the full form.

This is one of the biggest ways to reduce perceived form length.

---

# 54. INTERACTION DESIGN

Use subtle animation.

Good:

- progress indicator smoothly updates
- cards transition into selected state
- new conditional content expands
- preview updates smoothly
- chips animate into place
- step transition is short and subtle

Bad:

- excessive bouncing
- giant confetti
- slow page transitions
- animation before every field
- decorative animation that delays completion

Respect:

```text
prefers-reduced-motion
```

The existing project already has a reduced-motion utility/component. Reuse it.

---

# 55. VISUAL DESIGN

Use the existing EduMatch visual language.

The project already uses:

- Plus Jakarta Sans
- Newsreader
- dark/light theme
- custom Tailwind tokens
- Lucide icons

Do not introduce a second visual design system.

The wizard should feel like a natural extension of the existing application.

---

# 56. FORM VISUAL STYLE

Target aesthetic:

```text
minimal
editorial
premium
academic
calm
modern
```

Avoid:

```text
dashboard-heavy
enterprise-bureaucratic
over-gamified
neon
crowded
```

Use:

- generous whitespace
- strong typographic hierarchy
- soft borders
- restrained shadows
- clear selected states
- consistent corner radius
- strong focus states
- high contrast
- subtle background surfaces

---

# 57. DARK MODE

Everything must work in both themes.

Do not simply invert colors.

Check:

- field borders
- placeholder text
- selected cards
- chips
- error messages
- success states
- progress bars
- right-rail cards
- sticky mobile action area
- profile preview
- disabled states

The project already supports a dark/light theme.

---

# 58. ACCESSIBILITY

Treat accessibility as part of the design, not as a later patch.

Every form control needs:

- real `<label>`
- correct `htmlFor`
- accessible error association
- keyboard interaction
- visible focus state
- logical tab order
- adequate target size
- appropriate `aria-*` only where necessary

Use:

```text
autocomplete
inputMode
type
```

correctly.

Examples:

```html
autocomplete="tel"
inputMode="tel"
```

for phone.

Use:

```text
aria-live
```

for meaningful dynamic status/errors.

Do not use color alone to indicate errors or selected states.

---

# 59. KEYBOARD UX

Make the whole wizard keyboard friendly.

Required:

```text
Tab → field
Shift+Tab → previous
Enter → sensible submission
Escape → close relevant popup
Arrow keys → radio/card groups where appropriate
Backspace → remove last tag
```

Don't create custom clickable `<div>` components without proper keyboard semantics.

---

# 60. MOBILE UX

Target mobile-first usability.

Check:

- keyboard does not cover inputs
- sticky navigation doesn't obscure content
- field spacing is comfortable
- touch targets are sufficiently large
- dropdowns aren't tiny
- chips wrap naturally
- cards stack vertically
- profile preview doesn't dominate the screen
- no horizontal overflow
- long labels wrap gracefully

Test at least:

```text
375 × 812
390 × 844
430 × 932
```

---

# 61. DO NOT SHOW ALL INFORMATION AT ONCE

This is the most important visual rule.

Do NOT create giant forms like:

```text
Step 2

Highest degree
PhD status
Discipline
Specialization
Eligibility
Education #1
Education #2
Education #3
...
```

Instead:

```text
Highest qualification
↓
discipline
↓
specializations
↓
eligibility
↓
education history
```

with sections appearing only when the previous interaction makes them relevant.

---

# 62. MICROCOPY STYLE

Use friendly professional language.

Good:

```text
Let's start with the basics.
```

```text
What do you teach?
```

```text
What are you looking for?
```

```text
You can add research later.
```

```text
Here's what your profile will look like.
```

Avoid:

```text
Enter your information below.
```

```text
Fill out the following fields.
```

```text
Profile Data
```

```text
Submit Form
```

```text
Mandatory Input
```

The application is for educators, so the tone should feel intelligent and professional, not childish.

---

# 63. DO NOT OVER-GAMIFY

No:

```text
🔥 Level up!
🏆 Profile master
+20 XP
🎉 Amazing!
```

The product should feel credible and professional.

Progress itself is enough.

---

# 64. PROFILE READINESS MICROCOPY

Use progress as encouragement.

Examples:

```text
Profile readiness
72%

You're almost there.
```

```text
Profile readiness
86%

Just your preferences remain.
```

```text
Profile readiness
100%

Your profile is ready to publish.
```

Avoid:

```text
Your score: 72/100
```

---

# 65. DASHBOARD INTEGRATION

Do not redesign the dashboard unnecessarily.

But make sure the post-onboarding experience still makes sense.

Current dashboard already has:

- profile status
- completeness
- welcome state
- first-run checklist

Keep these capabilities.

After publication:

```text
You're all set, Ayush.

Your educator profile is live.

[View profile]
```

If incomplete:

```text
Your profile is 72% ready.

3 useful details remain.

[Continue setup]
```

Do not show contradictory states between the wizard and dashboard.

---

# 66. PROFILE EDITING AFTER PUBLICATION

The wizard is reused for editing after publishing.

The current architecture deliberately allows the wizard to be reused from `/profile` edit links. Preserve this behavior.

When editing an existing profile:

Do not show onboarding copy such as:

```text
Welcome to EduMatch!
```

Instead:

```text
Edit your profile

Make changes to your educator profile.
```

The same components should support both:

```text
initial setup
```

and:

```text
post-publish editing
```

Use context from the route/profile state.

---

# 67. EDIT MODE CTA

During editing:

Instead of:

```text
Publish
```

the step CTA should usually be:

```text
Save changes
```

On the review step:

```text
Save changes
```

unless the user is actually moving from DRAFT → PUBLISHED.

Never accidentally republish/unpublish simply because they edited a field.

Preserve existing visibility semantics.

---

# 68. IMPORTANT EXISTING BUG / SECURITY-STYLE CONSISTENCY ISSUE

Review:

```text
frontend/src/app/profile/actions.ts
```

The current `toggleVisibility` behavior can publish a profile without running the same `requiredGaps` validation used by the wizard publish action.

The project status explicitly notes this inconsistency.

Fix this during the revamp.

There must be exactly one canonical publish-validation rule.

Create/reuse one server-side helper:

```ts
validateCanPublish(profile)
```

or reuse `requiredGaps()` directly.

Both:

```text
wizard publish
```

and:

```text
profile visibility toggle
```

must obey the same publish requirements.

Do not rely on client validation for this.

---

# 69. DO NOT FAKE REAL MATCHING

The project currently has no real listings/matching backend.

The current `MatchEstimate` is a heuristic demand-table estimate.

Therefore:

Do not add copy such as:

```text
12 jobs found
```

Do not imply live inventory.

Do not claim:

```text
You're matched with 16 institutions
```

unless that functionality actually exists.

The UX should communicate the estimator as:

```text
illustrative market signal
```

or:

```text
profile alignment estimate
```

with honest copy.

---

# 70. PROFILE PREVIEW SHOULD NOT CLAIM THINGS THAT ARE NOT SAVED

The live preview is allowed to show the current client state.

But when the user leaves the step:

- all saved values must come from actual persisted data
- don't fabricate profile fields
- don't show stale preview values after save failure

If saving fails:

```text
We couldn't save your changes.
Your information is still here.
Try again.
```

---

# 71. STEP TRANSITIONS

When a user clicks Continue:

1. validate
2. show field errors if invalid
3. if valid, save
4. show saving state
5. update saved indicator
6. transition to next step

Do not navigate before the server confirms success.

Do not show:

```text
Saved!
```

when Prisma actually failed.

---

# 72. SERVER ACTIONS

Keep the current server-action architecture.

Existing `saveStep1` through `saveStep5` should remain the authoritative persistence functions.

Do not duplicate database writes in client components.

Client components should:

```text
collect UI state
→ submit FormData
→ server action
→ validation
→ Prisma
→ response/redirect
```

The project currently uses `useActionState`, Zod, server actions and Prisma for this. Preserve that architecture.

---

# 73. VALIDATION

Do not move business rules exclusively to the frontend.

Keep Zod schemas as the server-side source of truth.

The frontend can provide:

- immediate feedback
- required indicators
- character counts
- conditional visibility
- friendly messages

But server validation must remain authoritative.

---

# 74. NEW COMPONENTS TO ADD

Prefer a small number of reusable components.

Suggested additions:

```text
frontend/src/components/educator/
  EducatorProfilePreview.tsx
  StepHeader.tsx
  StepProgress.tsx
  SelectionCard.tsx
  SelectionCardGroup.tsx
  SearchableSelect.tsx
  SaveStatus.tsx
  StickyStepActions.tsx
  CollapsibleProfileSection.tsx
  OptionalBadge.tsx
  EmptyState.tsx
```

Do not create a component for every three lines of JSX.

Keep the component structure understandable.

---

# 75. `SelectionCard`

Build a reusable component for choices such as:

```text
Highest degree
Role
Employment type
Faculty level
Fresher / experienced
```

API should support:

```ts
label
description?
icon?
selected
disabled?
onClick
multiple?
```

Ensure semantic keyboard behavior.

Don't use arbitrary clickable divs.

---

# 76. `SearchableSelect`

Use for:

```text
discipline
city
possibly institution
```

It should support:

- keyboard navigation
- search
- selected value
- clear
- empty state
- focus management
- accessible role/aria
- mobile usability

Do not install a giant dependency just to build a basic searchable field unless necessary.

Prefer a lightweight local implementation consistent with the existing stack.

---

# 77. `StepHeader`

Create one standard component:

```tsx
<StepHeader
  eyebrow="Step 2 of 6"
  title="Academic background"
  description="..."
  optional={false}
  estimatedTime="~45 seconds"
/>
```

This ensures every screen feels consistent.

---

# 78. `StickyStepActions`

Create a reusable action footer.

Desktop:

```text
← Back                     Continue →
```

Mobile:

```text
────────────────────────────
← Back                 Continue →
────────────────────────────
```

Optional:

```text
Save & exit
```

Handle loading states.

---

# 79. `SaveStatus`

Top-right:

```text
Saved ✓
```

Possible states:

```text
Saving...
Saved just now ✓
Couldn't save
```

Keep this subtle.

---

# 80. RESUME FLOW

The current resume router sends an incomplete profile to:

```text
completedSteps + 1
```

Preserve this behavior.

Improve the UI on resume:

```text
Welcome back

You're 68% through your profile.

Continue where you left off →
```

If the user previously stopped on Research:

```text
You were on Research

This section is optional.

[Continue]
[Skip research]
```

Do not throw them back to the beginning.

---

# 81. STEP-ACCESS RULE

The current wizard prevents skipping ahead.

Keep that safety rule unless there is a strong UX reason to change it.

Allow:

```text
completed step → revisit
current step → continue
future step → locked
```

Once a step is completed, its navigation item should be clickable.

Example:

```text
✓ About you
✓ Academic background
3 Teaching & experience
4 Research · Optional
5 What you're looking for
6 Review
```

---

# 82. COMPLETED STEP UI

When a step is complete:

```text
✓ Academic background
```

Do not show:

```text
Academic background — COMPLETE!!!! 🎉
```

Keep it professional.

---

# 83. EMPTY STATES

Repeatable sections must have purposeful empty states.

Education:

```text
No education history added yet.

Add your highest qualification first.

[ + Add qualification ]
```

Experience:

```text
No teaching experience added.

You can mark yourself as a fresher above.

[ + Add experience ]
```

Research:

```text
No research details yet.

You can add these later.

[Skip for now]
```

Never show an empty area with no explanation.

---

# 84. SMALL "WHY THIS MATTERS" CARDS

Do not add explanations everywhere.

Use them only where the user may question why you're collecting information.

Example:

```text
Why we ask

Your teaching preferences help us understand
which opportunities are relevant to you.
```

Use this for:

- relocation
- teaching preferences
- research identifiers
- expected pay
- availability

Keep it one or two lines.

---

# 85. DON'T ASK THE USER TO KNOW THE INTERNAL DATA MODEL

Never expose:

```text
FacultyLevel
EmploymentType
ProfileVisibility
HighestDegree
```

These are implementation concepts.

The UI should say:

```text
Teaching level
How would you like to work?
```

etc.

---

# 86. FORM ORDER

Within each step use:

```text
easy
→ familiar
→ interesting
→ more detailed
```

Avoid starting with the most annoying question.

For example:

### Good

```text
What is your highest degree?
↓
What do you teach?
↓
What are your specializations?
↓
Which eligibility qualifications do you hold?
↓
Education history
```

### Bad

```text
Add education history
↓
Add second education history
↓
Add third education history
↓
PhD status
↓
discipline
```

---

# 87. KEEP INPUT COUNT LOW VISUALLY

Even when the underlying data is extensive, the user should never see more than a manageable number of active decisions.

Target:

```text
3–6 visible controls at once
```

not:

```text
15–25 visible controls
```

Repeatable data should be collapsed.

Conditional data should be hidden.

Optional data should be deferred.

---

# 88. USE "RECOGNIZE, DON'T RECALL"

Whenever practical, offer a list of likely answers.

Examples:

Instead of:

```text
Enter subject
```

offer:

```text
Machine Learning
Artificial Intelligence
Data Structures
Databases
Computer Networks
```

Instead of:

```text
Enter specialization
```

offer discipline-specific suggestions.

Instead of:

```text
Enter location
```

offer search suggestions.

Don't make the user remember exact values.

---

# 89. PROFILE SETUP SHOULD FEEL FAST

Each step should have an estimated effort.

Use understated copy:

```text
~30 seconds
```

```text
~45 seconds
```

Do not show:

```text
Estimated completion time:
00:00:57
```

Keep it human.

---

# 90. THE FINAL EXPERIENCE SHOULD LOOK LIKE THIS

### Entry

```text
Let's build your educator profile

We'll use a few details to help institutions
understand your background and preferences.

About 2 minutes.

[Get started]
```

### Step 1

```text
About you
~30 seconds

Let's start with the basics.

Full name
[ Ayush Mishra ]

Mobile number
[ +91 ... ]

City
[ Bengaluru ]

State
[ Karnataka ]

Professional headline
[ ... ]

Continue to academics →
```

### Step 2

```text
Academic background
~45 seconds

What is your highest qualification?

[ Bachelor's ]
[ Master's ]
[ M.Phil ]
[ PhD ]
[ Postdoc ]

...
```

### Step 3

```text
Teaching & experience

Do you have teaching experience?

[ Yes ]
[ I'm starting my career ]
```

### Step 4

```text
Research · Optional

Want to add your research profile?

Publications [12]
ORCID [ ... ]
h-index [5]

[Skip for now]
[Continue]
```

### Step 5

```text
What are you looking for?

Preferred teaching level
[ Assistant Professor ]
[ Associate Professor ]

Work type
[ Full-time ]
[ Visiting ]

Location
[ Anywhere in India ]

Review my profile →
```

### Step 6

```text
Your profile is ready

┌─────────────────────────────────┐
│          [ A ]                  │
│                                 │
│       Ayush Mishra              │
│       Assistant Professor       │
│       Computer Science          │
│                                 │
│ Bengaluru · Karnataka           │
│ AI · ML · Backend               │
└─────────────────────────────────┘

Academic background          Edit →
Experience                   Edit →
Research                    Edit →
Preferences                 Edit →

Ready to publish?

[ Publish my profile ]
```

That is the target experience.

---

# 91. PERFORMANCE

Do not make the new UX slow.

Avoid:

- unnecessary client-side bundles
- giant UI libraries
- excessive API requests
- image loading that blocks form interaction
- network request on every keystroke

The profile preview should be local client state.

Server persistence should happen through the existing server actions.

---

# 92. ERROR RECOVERY

If a server action fails:

Keep all current values.

Show a clear form-level message:

```text
Something went wrong while saving.

Your information is still here.
Try again.
```

Do not:

- redirect
- clear form
- reset state
- show a generic HTTP error
- dump a stack trace to the user

Log useful information server-side where appropriate.

---

# 93. DO NOT BREAK THE DATABASE

Before modifying Prisma:

Ask:

> Is this actually necessary for the UX?

The new UX can be implemented almost entirely using the existing schema.

Only change the schema if a UX requirement cannot be represented safely with the current data model.

If you do change the schema:

1. update Prisma schema
2. create a migration
3. update Zod schemas
4. update server actions
5. update components
6. test draft save
7. test publish
8. test edit
9. test unpublish/re-publish

Do not casually modify existing enums.

---

# 94. DO NOT BREAK EXISTING VALIDATION RULES

Current rules include things such as:

- Indian mobile format
- headline length
- bio maximum length
- specialization counts
- education-year validation
- PhD/degrees consistency
- experience date validation
- maximum experience entries
- research validation
- h-index relation
- minimum preferences
- `Anywhere in India` exclusivity

Preserve these business rules unless there is a clear product reason to change them.

The redesign is primarily a UX transformation.

---

# 95. TEST THE COMPLETE FLOW

After implementation, test:

```text
New user
→ Google login
→ role selection
→ educator wizard
→ all steps
→ publish
→ dashboard
→ profile
→ edit section
→ return to wizard
→ save changes
→ profile update
```

Then test:

```text
New user
→ enter step 1
→ leave
→ return
→ resume at correct step
```

Then:

```text
Research skipped
→ publish successfully
```

Then:

```text
Missing required field
→ publish blocked
→ deep-link to missing field
```

Then:

```text
Published profile
→ edit step
→ save
→ still correctly published
```

Then:

```text
Unpublish
→ verify visibility
→ republish
→ required validation still enforced
```

---

# 96. TEST MOBILE

Manually inspect at:

```text
375 × 812
390 × 844
430 × 932
```

Pay special attention to:

- sticky buttons
- keyboard
- chip wrapping
- card selection
- search fields
- long labels
- education cards
- experience cards
- review screen

---

# 97. TEST DARK MODE

Every new component must work in:

```text
light
dark
```

Check selected cards carefully.

A selected card must have enough contrast without relying purely on color.

---

# 98. TEST ACCESSIBILITY

Keyboard-only test:

```text
Tab through every field
Enter on every choice
Arrow through options
Backspace on tags
Escape search menus
```

Screen-reader semantics should be sensible.

No inaccessible custom dropdowns.

No clickable divs pretending to be buttons.

---

# 99. REUSE EXISTING PROJECT UTILITIES

Reuse:

```text
theme system
Lucide icons
MatchRing where appropriate
reduced-motion hook
existing form utilities
existing server action patterns
existing validation helpers
existing Prisma helpers
```

Do not introduce competing solutions.

---

# 100. CLEAN UP THE OLD UX

After implementing the new experience, remove obsolete UI.

Do NOT leave:

- duplicated progress indicators
- old sidebar + new header simultaneously
- duplicate completeness cards
- redundant intent panels
- old giant dropdowns
- stale placeholder copy
- generic "Next" buttons
- duplicated match estimates
- conflicting save indicators

There should be one coherent design.

---

# 101. IMPORTANT: DON'T JUST MAKE THE CURRENT DESIGN PRETTIER

This requirement is critical.

A successful implementation is NOT:

```text
same form
+ rounded corners
+ nicer colors
+ gradients
+ shadows
```

A successful implementation is:

```text
same underlying profile data
+
different information architecture
+
progressive disclosure
+
smarter controls
+
fewer visible fields
+
live preview
+
better progression
+
better optionality
+
better error recovery
+
better mobile UX
```

The interaction model matters more than the decoration.

---

# 102. PRIORITY ORDER

When deciding where to spend engineering/design effort, prioritize:

```text
1. Reduce unnecessary user input
2. Prefill existing user data
3. Progressive disclosure
4. Replace awkward inputs
5. Improve step structure
6. Live profile preview
7. Save/error behavior
8. Mobile UX
9. Accessibility
10. Visual polish
```

Do not spend an hour making shadows prettier while users still have to fill ten unnecessary fields.

---

# 103. ACCEPTANCE CRITERIA

The revamp is complete only when all of the following are true.

### UX

The wizard feels like a profile builder rather than a form.

The user is never confronted with a giant wall of fields.

The user can understand why each major section exists.

Optional research can be skipped without feeling like failure.

Relevant fields appear conditionally.

Cards/chips/search are used where they are more intuitive than typing or dropdowns.

The profile preview updates while the user works.

The user always knows approximately where they are.

The user always knows what happens when they press the primary button.

---

### Data

All existing educator profile fields continue to save correctly.

All existing validation rules continue to function.

Education entries continue to work.

Experience entries continue to work.

Fresher logic continues to work.

Research skip continues to work.

Publish continues to work.

Edit-after-publish continues to work.

Profile visibility continues to work.

Resume routing continues to work.

---

### Reliability

No form data disappears unexpectedly.

Failed saves do not clear user input.

The UI never claims something was saved when the server rejected it.

Publishing uses one canonical required-field validation path.

---

### Accessibility

Keyboard navigation works.

Focus states are visible.

Labels are persistent.

Errors are accessible.

Selected controls are distinguishable without color alone.

Reduced motion is respected.

---

### Responsive

The experience works cleanly on desktop and mobile.

Sticky controls do not obscure content.

No horizontal scrolling.

No clipped cards.

No broken dialogs.

---

# 104. IMPLEMENTATION PROCESS

Do this in the following order.

## Phase 1

Inspect the existing wizard and understand every field/state transition.

Do not start editing blindly.

## Phase 2

Refactor the wizard shell:

```text
WizardShell
StepHeader
StepProgress
SaveStatus
StickyStepActions
```

## Phase 3

Build:

```text
SelectionCard
SearchableSelect
EducatorProfilePreview
CollapsibleProfileSection
```

## Phase 4

Redesign Step 1.

## Phase 5

Redesign Step 2.

## Phase 6

Redesign Step 3.

## Phase 7

Redesign Step 4.

## Phase 8

Redesign Step 5.

## Phase 9

Redesign Step 6.

## Phase 10

Fix publish-validation consistency.

## Phase 11

Verify `/profile`, `/dashboard`, and resume flow.

## Phase 12

Run:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Fix every error before considering the work complete.

---

# 105. WHAT NOT TO DO

Do not:

```text
rewrite the whole repository
```

Do not:

```text
replace Next.js with another framework
```

Do not:

```text
replace Prisma
```

Do not:

```text
move the wizard to Express
```

Do not:

```text
add a fake matching backend
```

Do not:

```text
invent profile data
```

Do not:

```text
make research mandatory
```

Do not:

```text
force profile photo upload
```

Do not:

```text
add unnecessary gamification
```

Do not:

```text
make every step a giant animation
```

Do not:

```text
hide required validation
```

Do not:

```text
remove existing safeguards to make the UI appear simpler
```

---

# 106. THE DESIGN NORTH STAR

The finished product should feel like this:

> **EduMatch knows what it already knows.**
>
> **It asks only what it needs.**
>
> **It explains why important questions matter.**
>
> **It gives the user easy choices instead of making them type.**
>
> **It adapts based on previous answers.**
>
> **It shows the profile being created in real time.**
>
> **It lets optional information wait.**
>
> **It saves safely.**
>
> **It never makes the user feel stupid for making a mistake.**
>
> **And it gets the user into the actual product as quickly as possible.**

The final test is simple:

### Imagine a user has 90 seconds of patience.

Can they get meaningfully through this profile setup without thinking:

> "Why the hell am I filling this out?"

If the answer is no, keep reducing friction.

---

# FINAL DELIVERABLE

Implement the complete UX revamp in the repository.

Do not return a design proposal only.

Actually modify the existing components/pages/styles needed to implement this.

After implementation, provide:

1. a concise summary of what changed
2. the files changed
3. any schema changes, if any
4. any new components
5. validation/build results
6. any remaining UX limitations caused by existing backend/product functionality

Do not claim functionality exists unless it actually works.