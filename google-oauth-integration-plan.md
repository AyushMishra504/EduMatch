# Google OAuth 2.0 Integration Plan — EduMatch

Context: Next.js 16 (App Router) frontend, Express 5 backend skeleton, no DB/auth yet.
Two user types: Educator and Institution. Goal: real Google sign-in replacing the
`AuthPlaceholder` pages.

---

## 1. Architecture decision

Two viable patterns. Recommendation: **Pattern A**.

**Pattern A — Auth.js (NextAuth v5) in the frontend, backend trusts a signed JWT**
- Next.js owns the OAuth dance with Google (redirect, callback, token exchange).
- Auth.js issues its own session (JWT, httpOnly cookie).
- Backend verifies that JWT on each API request (shared secret / JWKS) — backend never
  talks to Google directly.
- Least code, best fit for Next.js App Router, easy to add more providers later (Microsoft,
  email/password) without touching backend.

**Pattern B — Backend-owned OAuth (Express does the token exchange)**
- Frontend redirects to `backend/api/auth/google`, Express handles callback, sets its own
  session cookie, frontend just reads `/api/me`.
- Cleaner if you ever want a backend-agnostic frontend (e.g. mobile app later) since all auth
  logic lives in one place.
- More plumbing right now (CORS + cross-origin cookies between `frontend/` and `backend/`
  during dev, cookie domain config in prod).

Given the current repo (Next.js already doing SSR, no mobile client planned), **use Pattern A**.
If a mobile app becomes a real roadmap item, migrate auth to the backend later — the DB schema
below doesn't change either way.

---

## 2. Google Cloud Console setup

1. Create/select a project in [Google Cloud Console](https://console.cloud.google.com/).
2. **APIs & Services → OAuth consent screen**
   - User type: External (unless restricting to a Google Workspace org).
   - App name: EduMatch, support email, logo, authorized domains (`edumatch.<tld>`).
   - Scopes: `openid`, `email`, `profile` only — no need for anything broader.
   - Add test users while in "Testing" publishing status; move to "In production" before
     public launch (triggers Google's verification review if you request sensitive scopes —
     not needed here).
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
   - Application type: Web application.
   - Authorized JavaScript origins: `http://localhost:3000`, `https://edumatch.<tld>`.
   - Authorized redirect URIs:
     `http://localhost:3000/api/auth/callback/google`,
     `https://edumatch.<tld>/api/auth/callback/google`
     (this exact path is Auth.js's default callback route).
4. Save the generated **Client ID** and **Client Secret**.

---

## 3. Database — you need one before auth can persist anything

Current backend has no DB. Auth needs at minimum a `users` table. Recommend Postgres +
Prisma (works cleanly with both Next.js and Express, typed).

```prisma
// backend/prisma/schema.prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  image         String?
  role          Role     @default(UNSET)   // EDUCATOR | INSTITUTION | UNSET
  googleId      String   @unique
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Auth.js required tables when using the Prisma adapter:
  accounts      Account[]
  sessions      Session[]
}

enum Role {
  UNSET
  EDUCATOR
  INSTITUTION
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

- Where this DB lives is your call (Neon/Supabase/RDS Postgres are the common free-tier
  starting points). Point both `frontend/.env` and `backend/.env` at the same `DATABASE_URL`
  if the backend also needs to query users directly (e.g. for role-based listing access).
- If you'd rather not stand up Postgres yet, Auth.js can run in **JWT session mode with no
  adapter/DB** — sessions live entirely in the signed cookie, and you persist `User` rows
  lazily via a `signIn` callback into whatever store you do have. Simpler to start, but you
  lose built-in session revocation. Given EduMatch will need a `users`/`profiles` table
  regardless (educator dossiers, institution roles), stand up Postgres now and use the
  Prisma adapter — you won't need a second migration later.

---

## 4. Frontend implementation (`frontend/`)

1. **Install**
   ```bash
   npm install next-auth@beta @auth/prisma-adapter @prisma/client
   npm install -D prisma
   ```

2. **Env vars** — `frontend/.env.local`
   ```
   AUTH_SECRET=<openssl rand -base64 33>
   AUTH_GOOGLE_ID=<client id>
   AUTH_GOOGLE_SECRET=<client secret>
   DATABASE_URL=postgresql://...
   NEXTAUTH_URL=http://localhost:3000   # https://edumatch.<tld> in prod
   ```

3. **Auth config** — `frontend/auth.ts`
   ```ts
   import NextAuth from "next-auth";
   import Google from "next-auth/providers/google";
   import { PrismaAdapter } from "@auth/prisma-adapter";
   import { prisma } from "@/lib/prisma";

   export const { handlers, auth, signIn, signOut } = NextAuth({
     adapter: PrismaAdapter(prisma),
     providers: [
       Google({
         authorization: { params: { prompt: "select_account" } },
       }),
     ],
     session: { strategy: "database" }, // switch to "jwt" if you skip the DB
     callbacks: {
       async session({ session, user }) {
         session.user.id = user.id;
         session.user.role = user.role; // EDUCATOR | INSTITUTION | UNSET
         return session;
       },
     },
     pages: {
       signIn: "/login",   // reuse your existing route, replace AuthPlaceholder content
     },
   });
   ```

4. **Route handler** — `frontend/app/api/auth/[...nextauth]/route.ts`
   ```ts
   export { GET, POST } from "@/auth";
   ```

5. **Replace `AuthPlaceholder`** on `/login` and `/signup` with a real sign-in button:
   ```tsx
   "use client";
   import { signIn } from "next-auth/react"; // or server action calling the exported signIn

   <button onClick={() => signIn("google", { callbackUrl: "/onboarding" })}>
     Continue with Google
   </button>
   ```
   Wrap the app in `<SessionProvider>` (client component) if using `useSession()` anywhere,
   or read `auth()` server-side in server components/layouts instead — simpler in App Router.

6. **Post-signup role selection**: since your persona switch (Educator/Institution) currently
   lives only in the marketing Hero, the real account needs the same choice once. Add an
   `/onboarding` route: first login → `role === "UNSET"` → force redirect there → server
   action sets `role` on the `User` row → redirect to the real dashboard (not built yet, but
   the auth layer should already gate for it).

7. **Route protection** — `frontend/middleware.ts`
   ```ts
   export { auth as middleware } from "@/auth";
   export const config = { matcher: ["/dashboard/:path*", "/onboarding"] };
   ```

8. **Update `robots.ts` / `sitemap.xml`** — once `/login` is a real auth entry point (not a
   "coming soon" page), decide whether it should stay disallowed or become indexable.

---

## 5. Backend implementation (`backend/`)

Backend needs to authenticate incoming API requests without re-doing the OAuth handshake.

1. **Shared secret verification (simplest, matches Pattern A):**
   - Auth.js session cookie is a JWE, only decryptable with `AUTH_SECRET`. Two options:
     - **Simplest:** Next.js API routes/server actions are the only thing that talks to the
       DB — Express backend stays purely internal (cron jobs, matching engine, heavy compute)
       and is called *from* the Next.js server, not from the browser. No token verification
       needed in Express at all. Given the backend is currently just health checks, this is
       the least-work path.
     - **If the browser must call Express directly** (e.g. you want the matching engine as a
       public API): have the frontend fetch a short-lived signed token from
       `/api/auth/token` (a Next.js route that calls `auth()` and mints a JWT with
       `jsonwebtoken` using a second `API_SECRET`), send it as `Authorization: Bearer <token>`
       to Express, and verify with `jsonwebtoken.verify()` there.

2. **Middleware** — `backend/src/middleware/auth.ts`
   ```ts
   import jwt from "jsonwebtoken";
   import type { Request, Response, NextFunction } from "express";

   export function requireAuth(req: Request, res: Response, next: NextFunction) {
     const header = req.headers.authorization;
     if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
     try {
       req.user = jwt.verify(header.slice(7), process.env.API_SECRET!);
       next();
     } catch {
       res.status(401).json({ error: "Invalid or expired token" });
     }
   }
   ```

3. **Env vars** — `backend/.env`
   ```
   API_SECRET=<same value used to mint tokens in frontend, or a JWKS URL if you go asymmetric>
   DATABASE_URL=postgresql://...   # only if backend queries users directly
   ```

4. Apply `requireAuth` to any route that needs a known user (profile CRUD, role listings,
   applications) once those exist. `/health` and `/api/health` stay public.

---

## 6. CI updates (`.github/workflows/ci.yml`)

- Add `DATABASE_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `API_SECRET` as
  repo secrets; inject into the frontend job so `next build` (which evaluates `auth.ts` at
  build time) doesn't fail on missing env vars.
- If using Prisma, add `npx prisma generate` before `build` in both jobs that touch the schema.

---

## 7. Security checklist

- [ ] `AUTH_SECRET` / `API_SECRET` are strong random values, never committed, different per
      environment (dev/staging/prod).
- [ ] Google Cloud redirect URIs list only real domains — no wildcards.
- [ ] Cookies: `httpOnly`, `secure` (prod), `sameSite: "lax"` (Auth.js defaults already do this).
- [ ] Rate-limit `/api/auth/*` and `/onboarding` role-set endpoint to stop abuse.
- [ ] Don't trust `role` from the client on the role-selection form — set it via a server
      action that reads the authenticated session, not a client-supplied field.
- [ ] CORS on Express stays locked to `FRONTEND_URL` only (already the case per your skeleton).
- [ ] Plan for account deletion / GDPR-style data export before public launch, since you're
      now storing real PII (name, email, Google profile photo).

---

## 8. Rollout order

1. Stand up Postgres + Prisma schema, run first migration.
2. Wire Auth.js in `frontend/`, get Google sign-in working end-to-end locally against
   `localhost:3000`.
3. Build `/onboarding` (role selection) — first real "logged in" screen.
4. Add production OAuth client + redirect URIs in Google Cloud Console, deploy, verify prod
   login.
5. Only then decide on backend token verification (skip entirely if Express stays
   server-to-server, per §5.1).
6. Flip `robots.ts` / remove "opens at launch" copy once `/login` is real.

---

## 9. Effort estimate

| Step | Rough time |
|---|---|
| Google Cloud Console setup | 30 min |
| DB + Prisma schema + migration | 1–2 hrs |
| Auth.js wiring (frontend) | 2–3 hrs |
| Onboarding/role-selection flow | 2–3 hrs |
| Backend token verification (if needed) | 1–2 hrs |
| Testing (dev + prod OAuth, edge cases) | 2 hrs |
