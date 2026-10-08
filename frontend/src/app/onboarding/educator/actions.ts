"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireEducatorProfile } from "@/lib/educator/profile";
import {
  formDataToObject,
  minimalOnboardingSchema,
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
} from "@/lib/educator/schema";
import {
  validateCanPublish,
} from "@/lib/educator/completeness";
import { type ActionState } from "@/lib/educator/action-state";

export type { ActionState } from "@/lib/educator/action-state";

function toState(error: {
  flatten(): { fieldErrors: Record<string, string[] | undefined> };
}): ActionState {
  return { ok: false, fieldErrors: error.flatten().fieldErrors };
}

type Profile = Awaited<ReturnType<typeof requireEducatorProfile>>;

/**
 * Destination after a successful save, driven by the submit button's
 * `intent`: "exit" → dashboard, "profile" → /profile (save & review),
 * default → the next wizard step. (Published profiles are no longer
 * force-bounced to /profile — the editor chooses continue vs review.)
 */
async function done(step: number, intent: FormDataEntryValue | null = null): Promise<never> {
  revalidatePath("/onboarding/educator", "layout");
  // The dashboard's cached profile read is tagged "profiles".
  updateTag("profiles");
  if (intent === "exit") redirect("/dashboard");
  if (intent === "profile") redirect("/profile");
  if (step === 6) redirect("/dashboard?welcome=1");
  redirect(`/onboarding/educator/${step + 1}`);
}

/**
 * Skip = advance without saving this step's fields. Still marks the step
 * complete so the progress bar and guard don't send the user back here.
 * Lets a user reach the dashboard in seconds and finish from /profile.
 */
async function skipStep(profile: Profile, step: number): Promise<never> {
  await prisma.educatorProfile.update({
    where: { id: profile.id },
    data: { completedSteps: Math.max(profile.completedSteps, step) },
  });
  return done(step);
}

const displayNameSchema = z.string().trim().min(2, "Enter your full name").max(100);

/**
 * Minimal onboarding (one screen after role selection). Writes only what
 * was answered — validation failures return BEFORE any write, and every
 * success path ends in redirect() (server-action convention: the gate is
 * React-cached per request, so a stale re-render after a write would show
 * old data). `intent=skip` writes nothing at all: an honest empty draft
 * that the user can enrich from /profile.
 */
export async function completeMinimalOnboarding(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await requireEducatorProfile();
  if (formData.get("intent") === "skip") redirect("/dashboard?welcome=1");

  const parsed = minimalOnboardingSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return toState(parsed.error);

  await prisma.educatorProfile.update({
    where: { id: profile.id },
    data: parsed.data,
  });
  updateTag("profiles");
  redirect("/dashboard?welcome=1");
}

export async function saveStep1(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await requireEducatorProfile();
  const intent = formData.get("intent");
  if (intent === "skip") return skipStep(profile, 1);
  const parsed = step1Schema.safeParse(formDataToObject(formData));
  if (!parsed.success) return toState(parsed.error);
  // Full name lives on User (prefilled from Google) — not in step1Schema,
  // so validate + persist it separately. Never wipe it on empty input.
  const rawName = formData.get("displayName");
  const displayName =
    typeof rawName === "string" && rawName.trim() ? rawName : undefined;
  if (displayName !== undefined) {
    const nameResult = displayNameSchema.safeParse(displayName);
    if (!nameResult.success) {
      return {
        ok: false,
        fieldErrors: { displayName: nameResult.error.flatten().formErrors },
      };
    }
    await prisma.$transaction([
      prisma.user.update({
        where: { id: profile.userId },
        data: { name: nameResult.data },
      }),
      prisma.educatorProfile.update({
        where: { id: profile.id },
        data: {
          ...parsed.data,
          completedSteps: Math.max(profile.completedSteps, 1),
        },
      }),
    ]);
    return done(1, intent);
  }
  await prisma.educatorProfile.update({
    where: { id: profile.id },
    data: {
      ...parsed.data,
      completedSteps: Math.max(profile.completedSteps, 1),
    },
  });
  return done(1, intent);
}

export async function saveStep2(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await requireEducatorProfile();
  const intent = formData.get("intent");
  if (intent === "skip") return skipStep(profile, 2);
  const parsed = step2Schema.safeParse(formDataToObject(formData));
  if (!parsed.success) return toState(parsed.error);
  const { education, ...data } = parsed.data;
  await prisma.$transaction([
    prisma.educationEntry.deleteMany({ where: { profileId: profile.id } }),
    prisma.educatorProfile.update({
      where: { id: profile.id },
      data: { ...data, completedSteps: Math.max(profile.completedSteps, 2) },
    }),
    ...(education.length > 0
      ? [
          prisma.educationEntry.createMany({
            data: education.map((row, sortOrder) => ({
              ...row,
              profileId: profile.id,
              sortOrder,
            })),
          }),
        ]
      : []),
  ]);
  return done(2, intent);
}

export async function saveStep3(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await requireEducatorProfile();
  const intent = formData.get("intent");
  if (intent === "skip") return skipStep(profile, 3);
  const parsed = step3Schema.safeParse(formDataToObject(formData));
  if (!parsed.success) return toState(parsed.error);
  const { experience, path, ...data } = parsed.data;
  // Null path = user skipped this step: record nothing rather than guessing
  // that they are a fresher.
  const isFresher = path === "no" ? true : path === "yes" ? false : undefined;
  const roles = isFresher ? [] : experience;
  await prisma.$transaction([
    prisma.experienceEntry.deleteMany({ where: { profileId: profile.id } }),
    prisma.educatorProfile.update({
      where: { id: profile.id },
      data: {
        ...data,
        ...(isFresher === undefined ? {} : { isFresher }),
        completedSteps: Math.max(profile.completedSteps, 3),
      },
    }),
    ...(roles.length > 0
      ? [
          prisma.experienceEntry.createMany({
            data: roles.map((row, sortOrder) => ({
              ...row,
              profileId: profile.id,
              sortOrder,
            })),
          }),
        ]
      : []),
  ]);
  return done(3, intent);
}

export async function saveStep4(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await requireEducatorProfile();
  const intent = formData.get("intent");
  if (intent === "skip") return skipStep(profile, 4);
  const parsed = step4Schema.safeParse(formDataToObject(formData));
  if (!parsed.success) return toState(parsed.error);
  await prisma.educatorProfile.update({
    where: { id: profile.id },
    data: {
      ...parsed.data,
      completedSteps: Math.max(profile.completedSteps, 4),
    },
  });
  return done(4, intent);
}

export async function skipStep4(): Promise<never> {
  const profile = await requireEducatorProfile();
  return skipStep(profile, 4);
}

export async function saveStep5(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await requireEducatorProfile();
  const intent = formData.get("intent");
  if (intent === "skip") return skipStep(profile, 5);
  const parsed = step5Schema.safeParse(formDataToObject(formData));
  if (!parsed.success) return toState(parsed.error);
  await prisma.educatorProfile.update({
    where: { id: profile.id },
    data: {
      ...parsed.data,
      completedSteps: Math.max(profile.completedSteps, 5),
    },
  });
  return done(5, intent);
}

export async function publishProfile(): Promise<ActionState> {
  const profile = await requireEducatorProfile();
  const gaps = validateCanPublish(profile);
  if (gaps.length > 0) {
    return {
      ok: false,
      formError: `Still missing: ${gaps.map((g) => g.label).join(", ")}`,
      missingSteps: gaps,
    };
  }
  await prisma.educatorProfile.update({
    where: { id: profile.id },
    data: {
      visibility: "PUBLISHED",
      publishedAt: profile.publishedAt ?? new Date(),
      completedSteps: 6,
    },
  });
  revalidatePath("/dashboard");
  updateTag("profiles");
  redirect("/dashboard?welcome=1");
}
