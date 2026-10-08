import type {
  EducationEntry,
  EducatorProfile,
  ExperienceEntry,
} from "@prisma/client";
import type { EducatorAccount } from "./profile";
import { requiredGaps, type CompletenessInput } from "./completeness";
import { TOTAL_STEPS } from "./constants";

/**
 * Client-safe wizard types. (profile.ts is server-only, so anything a
 * "use client" step needs is re-exported here from Prisma types only.)
 */

export type WizardMode = "onboarding" | "editing";

export type EducatorUser = EducatorAccount;

export type ProfileWithEducation = EducatorProfile & {
  education: EducationEntry[];
};

export type ProfileWithExperience = EducatorProfile & {
  experience: ExperienceEntry[];
};

export type FullProfile = EducatorProfile & {
  education: EducationEntry[];
  experience: ExperienceEntry[];
};

export function wizardModeFor(
  visibility: EducatorProfile["visibility"],
): WizardMode {
  return visibility === "PUBLISHED" ? "editing" : "onboarding";
}

/**
 * Publish-gap label that gates each step. `null` = the step is optional and
 * never blocks progress (Research), which is why step 4 is always passable.
 */
const STEP_GAP_LABEL: Record<number, string | null> = {
  1: "Basics",
  2: "Academics",
  3: "Experience",
  4: null,
  5: "Preferences",
};

/**
 * The last step whose *required* content is complete.
 *
 * Progress is derived from the data, not from a "visited" counter: a step
 * counts only once its publish-blocking facts are present. That is what makes
 * the flow guided — you cannot be "done" with Academics while it is empty.
 */
export function completedThrough(profile: CompletenessInput): number {
  const gaps = new Set(requiredGaps(profile));
  let through = 0;
  for (let step = 1; step <= TOTAL_STEPS - 1; step++) {
    const label = STEP_GAP_LABEL[step];
    if (label && gaps.has(label)) break;
    through = step;
  }
  return through;
}

/**
 * Furthest step a user is allowed to open. Future steps stay locked so the
 * setup reads as one ordered path; everything at or below this step stays
 * editable, and published profiles are fully unlocked for editing.
 */
export function maxReachableStep(
  profile: CompletenessInput & { visibility: EducatorProfile["visibility"] },
): number {
  if (profile.visibility === "PUBLISHED") return TOTAL_STEPS;
  return Math.min(completedThrough(profile) + 1, TOTAL_STEPS);
}
