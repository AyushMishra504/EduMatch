import type {
  EducationEntry,
  EducatorProfile,
  ExperienceEntry,
} from "@prisma/client";
import type { EducatorAccount } from "./profile";

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
