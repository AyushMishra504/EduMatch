# EduMatch — Minimal Onboarding / Fast-to-Product UX Revamp
## Planning Brief for Coding Agent — PLAN ONLY, DO NOT IMPLEMENT

---

# 0. IMPORTANT INSTRUCTION

You are acting as a **senior product designer + UX researcher + senior frontend architect** reviewing the existing EduMatch repository.

## Your job in this task is NOT to implement anything.

Do not modify source code.
Do not modify Prisma.
Do not create migrations.
Do not install dependencies.
Do not rewrite components.

Your only job is to:

1. inspect the existing EduMatch implementation,
2. understand the current educator onboarding/profile architecture,
3. evaluate it against the product goal in this document,
4. identify what should change,
5. produce a **detailed implementation plan**,
6. identify technical risks and dependencies,
7. identify any product decisions that need my approval.

I will review your plan before giving you permission to implement it.

Do not say that something is implemented unless it already exists in the repository.

---

# 1. PRODUCT GOAL

The primary goal is:

> **Get a new educator user into the main EduMatch product as fast as possible.**

Profile setup should NOT feel like a form that the user must finish before they are allowed to use EduMatch.

The desired experience is:

```text
Sign up
↓
Choose role
↓
Answer only the minimum questions needed to make the
first product experience useful
↓
Enter the main educator experience
↓
Use EduMatch
↓
Later: verify / complete / enrich profile from /profile
```

The profile page becomes the user's ongoing place to:

- verify existing information
- correct mistakes
- add missing information
- improve profile completeness
- add optional information
- maintain their educator profile over time

The onboarding flow should therefore be treated as:

> **minimum viable profile creation**

rather than:

> **complete profile creation**

---

# 2. THE MOST IMPORTANT PRINCIPLE

Do NOT ask:

> "What information could we possibly collect before entering the dashboard?"

Ask:

> **"What is the absolute minimum information EduMatch genuinely needs before this user can enter the main product?"**

Every field currently asked during onboarding must be challenged.

For every field, determine:

### A. Required before entering the main product

The product literally cannot work correctly without it.

### B. Valuable for immediate personalization

It meaningfully changes what the user sees immediately.

### C. Useful later

Important, but can be collected from the profile page.

### D. Optional enrichment

Should not delay access to the product.

### E. Already known

The application can obtain it from authentication, existing profile state, or another trustworthy source.

Category D/E fields should generally NOT be part of initial onboarding.

---

# 3. NORTH-STAR EXPERIENCE

The ideal first-run experience should feel approximately like:

```text
Welcome to EduMatch

Let's get you started.
This will only take a moment.

[Continue]
```

Then:

```text
What brings you to EduMatch?

[ I'm an educator ]
[ I'm an institution ]
```

Then, for educator:

```text
Let's personalize your first experience.

What do you teach?

[ Computer Science ]
```

Then perhaps:

```text
What are you looking for?

[ Full-time ]
[ Visiting ]
[ Contract ]
[ Part-time ]
```

Then:

```text
You're ready.

Your profile has been created as a draft.
You can complete the rest anytime.

[Enter EduMatch →]
```

The exact fields are NOT predetermined by this example.

You must determine the true minimum based on the current repository and product logic.

---

# 4. HARD PRODUCT REQUIREMENT

## The user should NOT have to fully complete the current six-step educator wizard before entering the main product.

The current educator system has six conceptual areas:

```text
1. Basics
2. Academics
3. Experience
4. Research
5. Preferences
6. Review
```

These data domains can remain.

But they should NOT automatically remain six mandatory onboarding steps.

Instead, determine how to split them between:

### Initial onboarding

Only minimum required information.

### Profile page

Everything else.

Potentially:

```text
ONBOARDING

Identity
+
role/context
+
minimum personalization

↓

DASHBOARD

↓

PROFILE

Basics
Academics
Experience
Research
Preferences
Verification
Completion
```

Do not assume this exact structure is correct. Validate it against the existing code and data model.

---

# 5. CURRENT PROJECT CONTEXT

The repository currently contains:

- Next.js 16 App Router frontend
- React 19
- Auth.js v5
- Google OAuth
- Prisma + PostgreSQL
- Zod validation
- educator profile data model
- six-step educator profile wizard
- draft/publish state
- profile page
- dashboard
- completeness scoring
- review step
- profile editing via the wizard
- optional research step
- server actions for wizard persistence

The current educator wizard already persists draft information and has separate step save actions.

The current architecture should be reused wherever practical.

Do not assume it should be thrown away.

---

# 6. CURRENT EDUCATOR DATA DOMAINS

Audit the current schema and code and map these fields:

## Basics

- phone
- city
- state
- willingness to relocate
- headline
- bio

## Academics

- highest degree
- PhD status
- discipline
- specializations
- eligibility
- education history

## Experience

- fresher state
- teaching years
- industry years
- current institution
- current designation
- notice period
- experience history
- subjects

## Research

- publications count
- ORCID
- Scopus ID
- h-index

## Preferences

- desired faculty levels
- employment types
- preferred locations
- expected pay level

The exact current schema may differ. Verify the repository rather than trusting this list blindly.

---

# 7. FIRST TASK: AUDIT THE CURRENT USER JOURNEY

Before proposing changes, trace the exact current flow:

```text
signup
↓
Google OAuth
↓
/onboarding
↓
role selection
↓
educator profile creation
↓
/onboarding/educator
↓
step 1
↓
step 2
↓
step 3
↓
step 4
↓
step 5
↓
step 6
↓
publish
↓
dashboard
↓
profile
```

Document:

- where the user is blocked
- which fields are required to proceed
- which fields are required only to publish
- which fields are optional
- which values are already known from Google
- which values can be safely deferred
- what the dashboard expects
- what the profile page expects
- whether a draft profile can exist without all required sections
- whether any downstream component assumes a published profile
- whether any match/personalization UI currently requires specific fields

---

# 8. SECOND TASK: IDENTIFY THE TRUE MINIMUM ONBOARDING DATA

This is the most important analysis.

Create a table:

| Field | Currently asked when? | Actually required before main product? | Needed for immediate personalization? | Already known? | Can move to profile? | Recommendation |
|---|---|---:|---:|---:|---:|---|
| Name | ... | ... | ... | ... | ... | ... |
| Phone | ... | ... | ... | ... | ... | ... |
| Discipline | ... | ... | ... | ... | ... | ... |
| Research | ... | ... | ... | ... | ... | ... |

Do this for every relevant profile field.

Do not guess.

Trace the code and downstream dependencies.

---

# 9. USE A "GATE TEST" FOR EVERY ONBOARDING FIELD

For every field, ask:

> **If this field is empty, can the user still meaningfully enter and use the main product?**

If yes:

It should strongly be considered for the profile page rather than initial onboarding.

Also ask:

> **Can the product work with a draft profile?**

> **Can missing information simply reduce personalization until the user adds it later?**

> **Can the system show a sensible empty state instead of blocking the user?**

We want the product architecture to support incomplete-but-usable profiles.

---

# 10. SEPARATE "ACCESS" FROM "PROFILE COMPLETION"

This is a major product architecture concept.

Current system behavior appears to connect profile completion/publishing with access to the educator experience.

Evaluate whether the better architecture is:

```text
ROLE SELECTED
+
MINIMUM ONBOARDING DATA
↓
DRAFT PROFILE CREATED
↓
USER ENTERS DASHBOARD
```

instead of:

```text
ROLE SELECTED
↓
COMPLETE PROFILE
↓
PUBLISH
↓
DASHBOARD
```

The new desired model is:

```text
ACCESS ≠ PROFILE COMPLETION
```

A user can have:

```text
Draft
20% complete
```

and still use the product.

The profile page can then show:

```text
Your profile is 20% ready.

Add your academic background
Add your preferences
Add your experience

[Complete profile]
```

---

# 11. DETERMINE WHETHER "PUBLISH" SHOULD STILL EXIST

Do not automatically remove publishing.

Analyze what publishing currently means in the application.

Questions to answer:

- Does publishing mean "profile becomes visible to institutions"?
- Can the user browse the product before publishing?
- Can a draft profile still be used for personalization?
- What parts of the product should remain inaccessible while draft?
- Should profile visibility remain separate from profile completion?
- Should the user be able to enter the dashboard without publishing?
- Should publishing happen automatically after minimum onboarding, or remain a later explicit action?

Recommend the least-friction architecture that preserves the meaning of published/draft visibility.

Do not weaken visibility/security semantics just to make onboarding shorter.

---

# 12. DESIRED USER JOURNEY

Propose a redesigned first-run journey.

The default design goal is:

```text
SIGN UP
↓
ROLE
↓
MINIMUM PROFILE
↓
MAIN PRODUCT
```

Potential target:

```text
1. role/context
2. one or two high-value personalization questions
3. enter dashboard
```

Do NOT force this exact number.

Determine the minimum number based on actual product needs.

The output must explain:

> Why each onboarding question exists.

---

# 13. INITIAL ONBOARDING UX PRINCIPLES

Apply these principles:

## 1. Minimum viable profile

Collect only what is needed now.

## 2. Prefill

Use Google/authenticated information where appropriate.

## 3. Recognition over recall

Use selections instead of typing where practical.

## 4. Progressive disclosure

Do not expose advanced profile details.

## 5. Immediate value

The user should enter the actual product quickly.

## 6. Defer

Move useful-but-nonessential information to `/profile`.

## 7. No artificial blocking

Do not block dashboard access just because the profile is incomplete.

## 8. Clear progress

If onboarding is more than one tiny step, show truthful progress.

## 9. Clear reason

Every required onboarding question should have a clear purpose.

## 10. User control

The user should understand that they can complete the rest later.

---

# 14. THE MAIN PAGE IS THE GOAL

Treat the dashboard/main page as the reward.

The final onboarding action should say something like:

```text
You're ready.

[Enter EduMatch →]
```

or another product-specific CTA.

Do not end onboarding with:

```text
Submit profile
```

unless submitting is genuinely the product action the user wants.

The user's reward should be:

> **I can now use EduMatch.**

---

# 15. PROFILE PAGE BECOMES THE SECOND STAGE OF ONBOARDING

The `/profile` page should become much more important.

It should act as the user's:

> **profile workspace**

not just a read-only page with edit links.

Evaluate the current `/profile` implementation and propose how it should support:

- verifying information
- editing information
- adding missing information
- optional enrichment
- progressive completion
- profile visibility
- publish/unpublish
- profile readiness
- guidance on what to complete next

The user should be able to return here at any time.

---

# 16. PROFILE PAGE SHOULD BE ACTIONABLE

Instead of only:

```text
Basics
...
Edit →

Academics
...
Edit →

Experience
...
Edit →
```

consider:

```text
Your profile

72% ready

A stronger profile helps institutions
understand your background.

Priority improvements

+ Add your academic history
+ Add your teaching experience
+ Add your specializations

Optional

+ Add research information
+ Add a bio
```

But do not assume this exact structure.

Design the best information hierarchy based on the existing product.

---

# 17. PROFILE COMPLETION MUST NOT FEEL LIKE HOMEWORK

Avoid:

```text
YOU ARE ONLY 42% COMPLETE
```

Prefer:

```text
Your profile is taking shape.

3 useful details remain.
```

or another equivalent tone.

The user should feel:

> "I can improve this when I have time."

Not:

> "I am being prevented from using the product."

---

# 18. USE CONTEXTUAL PROFILE COMPLETION

A major recommendation to evaluate:

Do not ask every profile question upfront.

Ask later when it is relevant.

Examples:

### User visits matching-related area

```text
Add your preferred teaching level
to improve relevant opportunities.

[Add preference]
```

### User opens public profile

```text
Add a short bio so institutions
can learn more about you.

[Add bio]
```

### User opens research section

```text
Add your ORCID to make your academic
profile more complete.

[Add ORCID]
```

Profile enrichment should happen at moments of relevance.

---

# 19. DO NOT FORCE RESEARCH DURING INITIAL ONBOARDING

Research is explicitly optional in the existing system.

Preserve that principle.

Research should be:

```text
profile enrichment
```

not:

```text
onboarding gate
```

Evaluate whether it should disappear entirely from onboarding.

---

# 20. EDUCATION AND EXPERIENCE SHOULD PROBABLY MOVE LATER

Analyze whether detailed:

- education history
- teaching history
- experience history

are actually required to enter the main product.

Unless a downstream requirement genuinely blocks access, recommend making them profile-stage tasks.

The profile page can show:

```text
Academic background

Not completed yet

[Add education]
```

and:

```text
Teaching experience

Not completed yet

[Add experience]
```

The user can fill these after entering the product.

---

# 21. DO NOT LOSE THE USER'S PROFILE STATE

If a user enters only the minimum:

```text
name
discipline
preference
```

their profile should exist as a valid draft.

Do not force fake placeholder values.

Do not use fake data to make completeness appear higher.

Use:

```text
null
[]
DRAFT
```

where appropriate.

---

# 22. PREFILL STRATEGY

Audit all information available from:

- Google OAuth
- `Session`
- User record
- existing EducatorProfile

Determine:

### Known with high confidence

Safe to prefill automatically.

### Suggestable

Show as a suggestion the user can accept/change.

### Unknown

Ask.

### Sensitive/inferred

Do not silently assume.

Document this explicitly in your plan.

---

# 23. DO NOT ADD UNNECESSARY DATA COLLECTION

Do not add:

- extra demographic fields
- unnecessary contact information
- social links
- additional preferences
- detailed research questions
- long bios
- extra verification

unless the current product genuinely requires them.

The scope is to REMOVE friction, not create more fields.

---

# 24. UI STRUCTURE FOR MINIMAL ONBOARDING

Propose the exact screens.

For each screen provide:

```text
Screen name
Purpose
Fields
Which fields are prefilled
Which fields are required
Which fields are optional
Input type
Primary CTA
Secondary CTA
Conditional behavior
Validation
What happens after submission
```

Example format:

```text
SCREEN 1 — Welcome

Purpose:
Explain value and expected effort.

Content:
"Let's get you started."

CTA:
Continue

No data collection.
```

Then:

```text
SCREEN 2 — One high-value question

Purpose:
Personalize initial experience.

Question:
What do you teach?

Control:
Searchable selection.

CTA:
Continue
```

Do not use this example as a predetermined answer. Determine the actual best flow from the repository.

---

# 25. ONBOARDING SHOULD PROBABLY BE SHORTER THAN THE CURRENT WIZARD

Do not preserve six onboarding screens merely because six exist today.

The six-step model can remain internally for profile editing.

You may recommend:

```text
Onboarding = 1–3 screens
Profile = complete multi-section editor
```

This is the preferred direction to evaluate.

---

# 26. PROFILE EDITOR CAN REMAIN DETAILED

The profile page is a different context.

There, the user expects:

```text
Basics
Academics
Experience
Research
Preferences
```

and can spend more time.

The UX should support:

```text
quick edits
```

and:

```text
deep completion sessions
```

without forcing the full process during first entry.

---

# 27. VERIFY CURRENT ROUTING REQUIREMENTS

Trace:

```text
/onboarding
/onboarding/educator
/onboarding/educator/[step]
/dashboard
/profile
```

Determine:

- what each page currently assumes
- what redirects are currently triggered
- what requires a published profile
- what requires `completedSteps`
- what role checks exist
- what profile checks exist

Make a proposed routing state machine.

Example:

```text
UNSET
 ↓
ROLE_SELECTED
 ↓
MINIMAL_DRAFT
 ↓
DASHBOARD
 ↓
PROFILE_COMPLETION
 ↓
PUBLISHED
```

Do not assume this exact state machine is correct.

---

# 28. VERIFY SERVER ACTION BEHAVIOR

Trace:

```text
setRole
saveStep1
saveStep2
saveStep3
skipStep4
saveStep4
saveStep5
publishProfile
toggleVisibility
```

Determine which actions would need to change.

The plan should explicitly identify:

- actions to keep
- actions to modify
- actions to split
- actions that become profile-only
- new actions that may be needed

Do not implement them yet.

---

# 29. DATA MODEL IMPACT

Determine whether this UX can be achieved **without changing Prisma**.

Prefer no schema change.

If a schema change is required, explain exactly:

```text
Current problem
Why UX cannot be implemented safely
Proposed schema change
Migration implications
Backward compatibility
```

Do not recommend schema changes simply because they might be convenient.

---

# 30. VALIDATION STRATEGY

Separate:

### Minimal onboarding validation

Only rules necessary to create a usable draft and enter the product.

### Profile validation

Rules needed to save/edit specific fields.

### Publish validation

Rules required to make the profile visible to institutions.

This distinction is extremely important.

A field can be:

```text
not required for onboarding
but required for publishing
```

This is likely a central architectural change.

---

# 31. COMPLETENESS SCORE

Audit how `computeCompleteness()` is currently used.

Determine whether it should:

- remain unchanged
- be renamed
- be reworded in the UI
- stop blocking onboarding
- be used primarily on `/profile` and dashboard
- distinguish "minimum profile" from "complete profile"

Recommend the cleanest model.

The user's profile may legitimately be:

```text
18% complete
```

while still being fully usable inside the main product.

That is acceptable if the product architecture supports it.

---

# 32. DASHBOARD UX

Audit the current dashboard.

Determine what happens immediately after onboarding.

The dashboard should NOT greet a new user with:

```text
Finish your six-step profile before continuing.
```

Prefer a model such as:

```text
Welcome to EduMatch, Ayush.

Your profile is ready to use.

A few details can improve it later.

[Explore opportunities]

Profile
72% ready
[Complete profile]
```

Again, this is an example of the desired philosophy, not mandatory copy.

Make your own recommendation based on the existing dashboard.

---

# 33. POST-ONBOARDING PROFILE NUDGE

Design one subtle dashboard card for incomplete profiles.

It should:

- explain benefit
- show a small number of meaningful next actions
- not block use
- not nag repeatedly
- link directly to relevant profile sections

Example:

```text
Strengthen your profile

3 useful details remain.

[Add academic background]
[Add teaching experience]

View full profile →
```

Avoid turning the dashboard into a second onboarding wizard.

---

# 34. "NEXT BEST ACTION" MODEL

Consider whether `/profile` should determine one or a few priority actions.

For example:

```text
Your next step

Add your teaching experience.

Why:
Institutions can better understand
your background.

[Add experience]
```

This is better than presenting 17 incomplete fields simultaneously.

Analyze whether this is appropriate for EduMatch.

---

# 35. PROFILE PREVIEW

Evaluate whether the live profile preview belongs:

### During onboarding

Maybe a tiny preview only.

### On profile page

Full preview.

### Both

A compact onboarding preview + full editable profile.

Recommend one based on the "get to product fast" goal.

Do not add a giant preview that makes onboarding longer.

---

# 36. MATCH ESTIMATE

Audit the existing `MatchEstimate`.

It is currently heuristic rather than live marketplace matching.

Determine where it belongs after the revamp.

Possible destinations:

- profile page
- dashboard
- preferences section
- nowhere until real matching exists

Do not let a heuristic become another onboarding burden.

Do not present it as live job availability.

---

# 37. MOBILE-FIRST REQUIREMENT

The new onboarding must be extremely fast on mobile.

Plan for:

```text
375 × 812
390 × 844
430 × 932
```

The plan must address:

- minimal scrolling
- sticky action area
- large touch targets
- keyboard behavior
- no horizontal overflow
- simple selection controls
- short copy

---

# 38. DESKTOP REQUIREMENT

Desktop can use more context.

Potentially:

```text
main onboarding content
+
small supporting preview / reassurance
```

But do not create a complex dashboard-like layout for a 30-second onboarding flow.

---

# 39. ACCESSIBILITY

Plan for:

- semantic labels
- keyboard navigation
- visible focus
- accessible errors
- correct autocomplete
- correct input types
- accessible selection cards
- no clickable-div controls
- reduced motion
- sufficient contrast

Do not treat these as a later patch.

---

# 40. VISUAL DIRECTION

Use the existing EduMatch visual system.

Current project uses:

- Plus Jakarta Sans
- Newsreader
- Tailwind CSS 4
- Lucide
- light/dark theme

Do not introduce another design system.

The new onboarding should feel:

```text
minimal
calm
premium
academic
modern
fast
```

Avoid:

```text
bureaucratic
form-heavy
over-gamified
crowded
```

---

# 41. AVOID "FUN FORM" TRICKS

Do not try to compensate for a long onboarding flow using:

- confetti
- XP
- badges
- unnecessary animation
- gimmicky copy
- giant illustrations
- fake countdowns

The actual objective is:

> **less work**

not:

> **more decoration around the same work**

---

# 42. PROFILE COMPLETION COPY

Recommend language that reduces pressure.

Prefer concepts such as:

```text
Your profile is taking shape.
```

```text
You can complete the rest anytime.
```

```text
A few details can help institutions understand
your background better.
```

Avoid:

```text
Incomplete!
```

```text
You must finish your profile.
```

```text
Only 45% complete.
```

unless required for a specific, clearly communicated reason.

---

# 43. ERROR AND SAVE EXPERIENCE

The plan must cover:

- save state
- failed saves
- preserving entered input
- draft creation
- refresh/resume
- browser back
- abandoning onboarding
- re-entering later
- partial profile state

A user must never lose information simply because they leave the flow.

---

# 44. RESUME BEHAVIOR

Because the user can enter the main product before completing their profile, redesign resume behavior.

Instead of:

```text
Resume six-step onboarding
```

the model may become:

```text
Return to EduMatch
↓
Dashboard
↓
Profile card shows missing details
↓
User continues profile completion later
```

Determine whether the current `/onboarding/educator` resume router should remain relevant after the redesign.

Recommend the cleanest architecture.

---

# 45. PROFILE PAGE AS THE SOURCE OF COMPLETION

Consider making:

```text
/profile
```

the canonical place for profile completion.

The user could enter from:

```text
Dashboard
Profile menu
Profile card
Completion CTA
```

and go directly to the missing section.

The plan should define whether:

```text
/onboarding/educator/[step]
```

continues to power editing internally, or whether the profile page becomes the primary editing surface.

Prefer reuse over duplicate editors.

---

# 46. DO NOT DUPLICATE PROFILE DATA ENTRY UIs

Avoid having:

```text
onboarding form
+
profile form
```

that implement the same fields independently.

Ideally:

```text
Profile editor components
```

can be reused from onboarding where appropriate.

But initial onboarding should render only the minimum subset.

---

# 47. PROPOSE COMPONENT ARCHITECTURE

Before implementation, propose which components should:

- remain
- be refactored
- be removed
- be renamed
- be newly created

Analyze existing:

```text
WizardShell
CompletenessMeter
MatchEstimate
FormField
FieldError
StepIntent
SubmitButton
TagInput
RepeatableList
EducationRow
ExperienceRow
Step1Basics
Step2Academics
Step3Experience
Step4Research
Step5Preferences
Step6Review
```

Also review:

```text
/profile
/dashboard
```

Do not automatically create 15 new components.

Prefer a clean reusable architecture.

---

# 48. PROPOSE THE NEW STATE MODEL

Describe the intended profile states.

For example:

```text
UNSET
↓
ROLE_SELECTED
↓
DRAFT_MINIMAL
↓
ACTIVE_USER
↓
DRAFT_ENRICHED
↓
PUBLISHED
```

But verify the current semantics and recommend the smallest safe state model.

Do not introduce states that do not provide a real product benefit.

---

# 49. CRITICAL DISTINCTION: DRAFT VS ACTIVE

Analyze whether:

```text
DRAFT
```

currently means:

> "User cannot use EduMatch yet"

or:

> "Profile is not publicly visible yet"

Those are very different concepts.

If the current system conflates them, explicitly identify it.

A major goal is to allow:

```text
profile = DRAFT
user = active in product
```

while preserving:

```text
profile visibility = not visible to institutions
```

if that is appropriate.

---

# 50. PUBLISHING UX

The plan must specify where publishing should happen after the redesign.

A likely model is:

```text
Initial onboarding
→ enter dashboard

Profile page
→ complete details
→ review
→ publish
```

Evaluate this.

If the current product genuinely requires certain information before publication, identify those requirements and preserve them.

Do not make publishing automatic without understanding visibility implications.

---

# 51. SECURITY / AUTHORIZATION

Do not weaken authorization.

Audit:

- `/profile`
- `/dashboard`
- `/onboarding`
- educator routes
- server actions
- profile visibility changes

The UX may become more permissive for incomplete drafts, but it must not accidentally make private profile data public.

---

# 52. EXISTING PUBLISH-VALIDATION INCONSISTENCY

The current project notes an important issue:

`profile/actions.ts` can publish via visibility toggle without using exactly the same `requiredGaps` validation path as the wizard.

Your plan MUST address this.

Propose one canonical server-side publish validation function.

Potential model:

```ts
validateCanPublish(profile)
```

or an equivalent centralized helper.

Both:

```text
wizard publish
```

and:

```text
profile visibility toggle
```

must use the same business rule.

---

# 53. TESTING PLAN

The existing repository currently has no tests.

Your plan must propose the minimum useful automated test layer before/alongside this UX change.

At minimum:

## Unit tests

For:

- minimum onboarding validation
- publish validation
- completeness calculations
- relevant helpers

## E2E tests

For:

```text
new educator
→ minimum onboarding
→ dashboard
→ profile
→ complete missing information
→ publish
```

Also test:

```text
draft user
→ reload
→ still active
```

```text
published user
→ edit
→ save
→ profile remains consistent
```

```text
invalid publish
→ blocked
```

Do not propose excessive test infrastructure that isn't necessary.

---

# 54. VISUAL QA PLAN

Because this is a UX redesign, propose how the implementation should later be visually checked.

At minimum:

- desktop light
- desktop dark
- mobile light
- mobile dark
- every onboarding screen
- dashboard after onboarding
- profile page with incomplete profile
- profile page with complete profile
- publish state

Recommend screenshots or browser inspection where supported.

---

# 55. PERFORMANCE TARGET

The first-run flow should feel immediate.

Analyze:

- number of network operations
- unnecessary client bundles
- loading states
- server-action redirects
- profile creation timing
- image loading
- browser autofill
- input performance

The user should not wait around for profile setup to load multiple heavy components that they do not need.

---

# 56. DO NOT OVERENGINEER

Do not recommend:

- microservices
- agent frameworks
- new backend architecture
- complex state managers
- unnecessary schema abstraction
- large UI libraries

This is a UX/information-architecture refactor.

Use the existing stack unless there is a strong technical reason not to.

---

# 57. OUTPUT FORMAT — YOUR RESPONSE MUST BE A PLAN

Return your response in exactly these major sections:

## A. Executive Recommendation

In 5–10 paragraphs:

- what is wrong with the current onboarding model
- what you recommend
- how the user gets to the dashboard faster
- what moves to profile
- what remains mandatory

## B. Current Flow Audit

Show the actual current flow you found in the repository.

## C. Field-by-Field Classification

A complete table of relevant fields:

```text
Field
Current location
Current requirement
Required for main product?
Required for publication?
Already known?
Can defer?
Recommended destination
Reason
```

## D. Proposed New User Journey

Show the exact future flow:

```text
Signup
↓
Role
↓
Question 1
↓
Question 2
↓
Dashboard
↓
Profile completion later
```

## E. Proposed Onboarding Screens

For every screen:

- title
- purpose
- fields
- input controls
- prefill behavior
- required vs optional
- validation
- CTA
- skip behavior
- redirect behavior

## F. Proposed `/profile` Experience

Describe:

- hierarchy
- completion state
- sections
- missing data
- next-best-action behavior
- editing
- publishing
- contextual nudges

## G. Routing / State Machine

Show the proposed route and profile-state transitions.

## H. Server / Data Changes

List:

- actions to modify
- actions to keep
- schema changes, if any
- validation changes
- publish behavior
- draft behavior

## I. Component Architecture

For every relevant existing component:

```text
Keep
Refactor
Replace
Remove
New
```

with reasoning.

## J. Automated Testing Plan

Describe:

- unit tests
- E2E tests
- visual QA
- regression coverage

## K. Migration / Implementation Plan

Break implementation into logical milestones.

Prefer approximately:

```text
Milestone 1 — Architecture + routing
Milestone 2 — Minimum onboarding
Milestone 3 — Profile completion UX
Milestone 4 — Publish/visibility consistency
Milestone 5 — tests + visual QA
```

Do not turn this into dozens of tiny tasks.

## L. Risks / Edge Cases

Include:

- returning users
- partially completed users
- published users
- editing published profiles
- auth data differences
- missing Google profile image
- database nulls
- existing incomplete drafts
- browser refresh
- browser back
- mobile keyboard
- failed saves
- publish validation
- visibility/security

## M. Product Decisions Requiring My Approval

Only list questions that genuinely cannot be answered safely from the existing repository/spec.

Do not ask unnecessary questions.

---

# 58. IMPORTANT: DO NOT CODE

Again:

## DO NOT IMPLEMENT THIS YET.

Do not:

- edit files
- create files
- install packages
- change database schema
- run migrations
- modify routes
- change UI

The desired output is the **plan only**.

I will take your plan, review it, and then decide whether implementation should begin.

---

# 59. WHAT A GOOD PLAN LOOKS LIKE

A good plan should make it possible for me to say:

> "Yes, implement this exactly as planned."

It should not merely say:

> "Improve onboarding and make it shorter."

It must be concrete enough that the next coding phase can follow it without rediscovering the entire product.

---

# 60. DESIGN NORTH STAR

Everything in your recommendation should optimize for this:

```text
USER SIGNS UP
       ↓
MINIMAL QUESTIONS
       ↓
PROFILE DRAFT EXISTS
       ↓
USER ENTERS MAIN PRODUCT
       ↓
USER GETS VALUE
       ↓
PROFILE PAGE ENCOURAGES COMPLETION
       ↓
USER FILLS DETAILS WHEN READY
       ↓
PROFILE GETS STRONGER
       ↓
USER PUBLISHES WHEN READY
```

The user should never feel:

> "I need to finish my paperwork before I can use EduMatch."

They should feel:

> **"I'm already in EduMatch. I can improve my profile whenever I have a minute."**

That is the product experience this plan should optimize for.

---

# 61. FINAL PRINCIPLE

When deciding between:

### Option A

Collect more information now and provide a "complete" profile before dashboard access.

### Option B

Collect less information now, create a usable draft, get the user into the product, and collect/enrich profile data later.

Bias toward **Option B**, unless the repository proves that a specific field is genuinely required for the user's immediate product experience, authorization, security, or a core business rule.

The burden of proof should be on keeping a field in onboarding.

---

# 62. FINAL INSTRUCTION TO THE AGENT

Before finishing your response:

1. Inspect the relevant implementation thoroughly.
2. Trace actual dependencies rather than guessing.
3. Distinguish current behavior from your recommendation.
4. Explicitly identify any assumptions.
5. Produce the complete plan using the output format above.
6. Do NOT modify the repository.

Your entire output should be a **reviewable implementation plan for a future coding pass**, not code.
