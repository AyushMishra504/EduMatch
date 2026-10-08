# AGENTS.md

EduMatch = two independent packages (no workspace manifest — install/lint/build inside each). `frontend/` is the product; `backend/` is a standalone Express skeleton **not wired to the frontend yet**.

## Commands (run inside the package dir)

`frontend/` (Next.js 16.3.5, App Router, Turbopack, React 19):

```bash
npm run db:local     # start dev Postgres first — see "Dev database" below
npm run dev          # :3000
npm run lint         # eslint
npm test             # vitest (unit, src/lib/educator/__tests__/)
npm run test:e2e     # playwright (e2e/, needs dev server + local DB + chromium)
npx tsc --noEmit     # no dedicated typecheck script
npm run build
npx prisma generate  # required after fresh `npm ci`, before typecheck/build
npx prisma migrate dev   # after editing prisma/schema.prisma
```

- **CI order to mirror** (`.github/workflows/ci.yml`, working-directory `frontend`): `npx prisma generate` → `npm run lint` → `npm test` → `npx tsc --noEmit` → `npm run build`. Needs secrets `DATABASE_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` (+ `AUTH_TRUST_HOST=true`).
- **Tests**: Vitest unit suite (`vitest.config.ts`, `src/lib/educator/__tests__/`) is in CI. Playwright E2E (`e2e/onboarding.spec.ts`, `playwright.config.ts`) is **local-only for now** — serial (`workers:1`), reuses an already-running dev server, `e2e/global-setup.ts` resets the dev educator profile by reading `DATABASE_URL` from `frontend/.env.local`. No CI browsers installed.

`backend/` (Express 5): `npm run dev` (:4000, `GET /health`), `npm run lint` (= `tsc --noEmit`), `npm run build`.

## Environment gotchas

- App env = `frontend/.env.local` (gitignored); template in `frontend/.env.example`.
- **`frontend/prisma/.env` also exists** — the Prisma CLI reads it *instead of* `.env.local`. Keep its `DATABASE_URL` in sync or bare `npx prisma migrate …` will hit the wrong database.
- Node is **Windows `node.exe`** invoked from WSL: bare `node` is not on the WSL PATH (use `npm run` / `node.exe`), WSL env vars do **not** pass into Windows processes (pass values as argv, not env), and the repo lives on `/mnt/c`.

## Dev database & latency (read before touching data access)

- Remote Postgres (Neon us-east-2) costs **~260ms per query** from this machine; with the legacy `?pgbouncer=true` URL flag on Prisma 6 it costs **~1260ms** (full reconnect handshake per statement — never re-add that flag).
- Recommended: `npm run db:local` (embedded Postgres, no Docker/sudo; `127.0.0.1:5433`, data in gitignored `.local-db/`, auto-runs `prisma migrate deploy`) with `DATABASE_URL` pointing at it → **0–1ms/query**. Measure any URL with `node scripts/latency.mjs <database-url>`.
- **Every serial `await` on a query is a full roundtrip.** Rules that keep pages fast:
  - `auth()` (next-auth v5) is **not** request-cached — each call is an Auth.js DB roundtrip. Never re-check session/role in a page that already goes through a gate.
  - `src/lib/educator/profile.ts` gates educator routes with one React-`cache()`ed load shared by layout + page (`requireEducatorProfile` / `requireEducatorWithUser`). New educator pages must use it, not raw `auth()` + `prisma.user.findUnique`.
  - Prisma `include`/relation `select` runs **one query per relation**, so "one" `findUnique` with nested includes is 3–5 statements.

## frontend architecture (non-obvious wiring)

- `src/proxy.ts` = Next 16 middleware (renamed from `middleware.ts`). It is a **cheap cookie-presence check** — no NextAuth/DB work at the edge — that redirects `/dashboard`, `/onboarding`, and `/profile` to `/login` when no session cookie is present. The page gates (`requireEducatorProfile` / the dashboard's own `auth()` + role check) remain the authoritative validation.
- Auth: Auth.js v5, database sessions, `src/auth.ts`, cookie `authjs.session-token`. Two real providers: **Google OAuth** and **email magic link** (custom `type:"email"` provider; `VerificationToken` Prisma model). With no `EMAIL_SERVER_*` env in dev the magic link is logged to the server console; production requires `EMAIL_SERVER_HOST` or sending throws. The `/login` + `/signup` pages are the Stitch "3D Flip Auth" design (`src/components/auth/AuthScreen.tsx`, dark Academic Night palette) with a dev-only bypass below.
- Onboarding: role gate → **minimal `/onboarding/educator/start`** (discipline + employment types, or explicit "Skip for now" that writes nothing) → `/dashboard?welcome=1`. The 6-step wizard lives in `src/app/onboarding/educator/(builder)/[step]/page.tsx` (`force-dynamic`). It uses **guided progression**, not free navigation: `maxReachableStep(profile)` (`src/lib/educator/wizard.ts`) unlocks steps in order, `completedThrough` derives progress from data validity (not a visited counter), required steps offer no "Skip", and published profiles are fully unlocked for editing. Future steps are locked in `BuilderShell`, and the dashboard deep-links to the exact resume step. Footer intents (`done(step, intent)`): no intent = next step, `exit` = dashboard, `profile` = `/profile`; step 5's "Any" levels card saves `desiredLevels=[]` (widest match estimate; levels never block publish — `requiredGaps` gates types/locations instead), shared `layout.tsx` renders `BuilderShell`, actions in `actions.ts`. `MinimalOnboardingForm` mirrors edits to sessionStorage (`edumatch.minimalOnboarding.v1`) so Back never loses input.
- Playwright baseURL must be `http://localhost:3000` — Next dev blocks `/_next/*` dev resources for the `127.0.0.1` origin, so React never hydrates there (clicks silently do nothing).
- **Server-action convention**: mutating actions must end in `redirect()` (or return *before* writing). The gate is React-cached per request — returning an `ActionState` after a write would re-render with stale profile data. Validation-failure paths must return before any write.
- Dev-only skip-login: `src/app/dev/actions.ts` + `src/components/DevSignInButton.tsx` — **delete both before launch** (hard-blocked when `NODE_ENV=production`).

## Instruction sources

- `frontend/AGENTS.md` — **auto-generated by `next dev`** (Next.js agent-rules block; re-added if removed). Don't strip it from diffs. Next 16 differs from older Next: read `frontend/node_modules/next/dist/docs/` before writing Next code.
- `frontend/CLAUDE.md` → just `@AGENTS.md` (the generated one).
- `PROJECT_STATUS.md` — authoritative current-state doc (features, gaps, run instructions, flow diagram). Trust it over `revamp.md` when they conflict.
- `revamp.md` — design/copy spec, not current state.

## Review pass (2026-10-07)

- `REPO_REVIEW.md` — repo review, ranked findings, and implementation status.
- `DEPLOYMENT.md` — service-boundary decision (Next = BFF, `backend/` reserved, parser separate) + Docker/compose usage.
- `contracts/parser-profile-fields.json` — frozen parser↔frontend field contract; both sides have a test against it.
- `frontend/package.json` → `npm run check:env` catches a `prisma/.env` vs `.env.local` `DATABASE_URL` mismatch before migrations hit the wrong database.
- CI additionally runs the `resume-parser` pytest suite (needs no Docling).
