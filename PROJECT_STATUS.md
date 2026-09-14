# EduMatch — Project Status

EduMatch connects educators and institutions across Indian higher education: one academic
profile, matched to the teaching/research roles that actually fit. Built with Indian
higher-ed hiring norms (UGC, NIRF, ORCID/Scopus dossiers) in mind.

## Current status
- Landing/marketing site **fully built** (the product story, interactive demos, legal pages).
- **Launch not open yet** — Login/Sign-up are placeholder pages ("opens at launch").
- **No real product yet** — no accounts, profiles, role listings, matching engine, or
  applications. All demos are illustrative, hard-coded samples.
- Backend is a minimal Express skeleton (health endpoints only, no database).

## Repository layout
Monorepo with two Node/TypeScript apps:
- `frontend/` — Next.js 16 (App Router) marketing site
- `backend/` — Express 5 API skeleton
- `.github/workflows/ci.yml` — CI for both

---

## Frontend

**Stack:** Next.js 16.3.5 · React 19 · Tailwind CSS v4 · TypeScript · `lucide-react` icons ·
`next/font` (Plus Jakarta Sans + Newsreader) · ESLint (`next/core-web-vitals` + `typescript`).

### Pages
| Route | Purpose |
|---|---|
| `/` | Landing page (see sections below) |
| `/login`, `/signup` | Placeholder auth pages (`AuthPlaceholder`) — no-robots |
| `/terms`, `/privacy` | Draft legal pages (`LegalPage`) |
| 404 | Custom not-found page |

### Landing page sections (top → bottom, `page.tsx`)
1. **Navbar** — sticky header: wordmark, anchor links, theme switch, Log In / Join; responsive mobile menu.
2. **Hero** — headline, persona switch (Educator / Institution), two CTAs, and the animated **ProfileCard**.
3. **Marquee** — scrolling value props (UGC-style hiring, ORCID/Scopus dossiers, NIRF-aware criteria, confidential search, transparent pay-bands).
4. **For Educators** — 4 feature cards with an interactive mock preview (profile fields, documents, visibility, matches).
5. **For Institutions** — 4 feature cards with interactive mock (role listing, candidate pool, committee review, norms fit).
6. **Who it's for** — target audiences (universities, deemed/private universities, colleges, career researchers).
7. **How it works** — profile → matched → apply, 3 steps with mock previews.
8. **Why change** — traditional hiring vs EduMatch comparison table.
9. **Try the match** (`MatchSimulator`) — interactive match-score demo: pick discipline × level, see 4 criteria bars + overall ring score.
10. **FAQ** — accordion (6 items).
11. **Join** — accent CTA banner (Join as Educator / Institution).
12. **Footer** — link columns + legal links.

### ProfileCard (the animated hero card) — `components/landing/ProfileCard.tsx`
2D card (no tilt/3D). Fixed identity header + a fixed-height central panel that cycles info:
- **Educator card:** Dr. Ananya Sharma (Ph.D., IIT Delhi) · match ring · *View Profile*.
  Cycles: Teaching expertise → Research profile → Professional experience → Career preferences.
- **Institution card:** Reader — Biotechnology (Deccan Institute of Life Sciences, 2 openings) · match ring · *Apply for Role*.
  Cycles: Screening criteria → Role details → Compensation → Hiring process.
- **Animation:** heading types in character-by-character with a thin blinking teal caret,
  details stagger-fade up, hold ~2.5s, then the heading **backspaces** out before the next
  state types in. Details fade/match score ring animate; anonymous when reduced-motion is set.
- **Controls:** 4 clickable progress dots (jump to a category); pauses on hover/keyboard focus.

### Theme system
- `lib/theme.ts` — preference stored in `localStorage["theme"]`; values `system | light | dark`;
  **default is `system`**; follows OS changes while on system mode.
- `components/ThemeToggle.tsx` — compact sliding switch (System / Light / Dark) with a thumb
  that slides to the active theme; segment buttons for system, light, dark.
- `layout.tsx` — inline script applies saved/system theme before hydration (avoids flash).
- `globals.css` — design tokens (`paper`, `ink`, `accent`), light + dark palettes, font sizes,
  shadows, keyframes (`float`, `fadein`, `marquee`, `caret-blink`), custom utilities.

### Shared lib/UI
- `lib/site.ts` — site name, tagline, description, URL, contact email.
- `components/Logo.tsx` — `Logo` (grad cap mark) + `Wordmark`.
- `components/AuthPlaceholder.tsx`, `LegalPage.tsx` — placeholder/login/signup and legal shells.
- `components/3d/` — `MatchRing` (SVG radial ring w/ count-up, used by card + simulator),
  `NetworkCanvas3D` (candidate canvas — currently **not wired into any page**),
  `usePrefersReducedMotion` hook.

### SEO / static exports
- `metadata` + `opengraph-image.tsx` (1200×630 OG image via `next/og`)
- `robots.ts` (disallows `/login`, `/signup`), `sitemap.xml`, `manifest.ts`
- `next.config.ts` — turbopack, allows Google avatar images (for future Google sign-in)

---

## Backend (`backend/`)

Express 5 + TypeScript (ESM, `tsx` dev runner). Minimal skeleton — **no DB, no auth, no models**:

| File | Purpose |
|---|---|
| `src/config/env.ts` | Env config: `PORT` (default 4000), `FRONTEND_URL` (default http://localhost:3000), `NODE_ENV` |
| `src/app.ts` | Express app: CORS (only frontend origin), JSON parsing, `GET /health`, `/api/health`, JSON 404 handler |
| `src/routes/health.ts` | `GET /api/health` → `{ status, service, timestamp }` |
| `src/index.ts` | Server bootstrap |

Scripts: `dev` (`tsx watch`), `build` (`tsc`), `start` / `start:prod`, `lint` (`tsc --noEmit`).

---

## CI — `.github/workflows/ci.yml`
On push/PR to `main`: parallel `frontend` job (lint → `tsc --noEmit` → build) and `backend` job
(type check → build), Node 22.

---

## Not built yet / known gaps
- No authentication or accounts (even though icons/config hint at future Google sign-in).
- No profiles, role posting, search, matching logic, applications, or messaging.
- Backend has no persistence layer.
- `NetworkCanvas3D` comp exists but is unused.
- Sign-up/login and all "join" CTAs are intentionally gated behind launch.