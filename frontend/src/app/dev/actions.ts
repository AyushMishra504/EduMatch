"use server";

import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// DEV ONLY — temporary shortcut so the educator wizard can be previewed
// without going through Google OAuth on every change.
// Delete this file + DevSignInButton when real auth testing resumes.
// It is hard-blocked in production (see guard below) and the button
// component also renders null when NODE_ENV === "production".
// ---------------------------------------------------------------------------

const DEV_EMAIL = "dev@edumatch.local";
const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;
// Same cookie Auth.js v5 (database strategy) reads on plain-http dev.
const SESSION_COOKIE = "authjs.session-token";

type StepSource = {
  discipline: string | null;
  visibility: string;
};

/**
 * Mirror the real onboarding journey: a fresh educator starts at the
 * minimal screen (/onboarding/educator/start); everyone else — mid-wizard
 * or published — lands on the dashboard, which is where the product now
 * routes after first run.
 */
function targetPath(profile: StepSource | null): string {
  if (profile?.visibility === "PUBLISHED") return "/dashboard";
  if (!profile?.discipline) return "/onboarding/educator/start";
  return "/dashboard";
}

export async function devSignIn() {
  if (process.env.NODE_ENV === "production") redirect("/login");

  const cookieStore = await cookies();

  // Fast path: an unexpired dev session already exists — reuse it and skip
  // every write (one read instead of the two write waves below).
  const existingToken = cookieStore.get(SESSION_COOKIE)?.value;
  if (existingToken) {
    const existing = await prisma.session.findUnique({
      where: { sessionToken: existingToken },
      select: {
        expires: true,
        user: {
          select: {
            email: true,
            educatorProfile: {
              select: { discipline: true, visibility: true },
            },
          },
        },
      },
    });
    if (
      existing &&
      existing.expires > new Date() &&
      existing.user.email === DEV_EMAIL
    ) {
      redirect(targetPath(existing.user.educatorProfile));
    }
  }

  const sessionToken = randomUUID();

  // Wave 1: one roundtrip returns the user id and whether the profile row
  // already exists, so wave 2 knows what to create.
  const user = await prisma.user.upsert({
    where: { email: DEV_EMAIL },
    create: { email: DEV_EMAIL, name: "Dev Educator", role: "EDUCATOR" },
    update: { role: "EDUCATOR" },
    select: {
      id: true,
      educatorProfile: { select: { discipline: true, visibility: true } },
    },
  });

  // Wave 2: independent writes run in parallel (1 roundtrip). The
  // deleteMany must exclude the token being created, otherwise it can race
  // the insert and delete the session we just made.
  const profile = user.educatorProfile;
  await Promise.all([
    prisma.session.deleteMany({
      where: { userId: user.id, sessionToken: { not: sessionToken } },
    }),
    prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expires: new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000),
      },
    }),
    profile ? null : prisma.educatorProfile.create({ data: { userId: user.id } }),
  ]);

  cookieStore.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  redirect(targetPath(profile));
}
