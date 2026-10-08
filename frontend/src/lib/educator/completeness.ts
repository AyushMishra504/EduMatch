import type { EducatorProfile } from "@prisma/client";
import type { ProfileWithRelations } from "./profile";

export type MissingItem = {
  label: string;
  /** One-line "why this matters" for nudge surfaces (profile priorities). */
  why: string;
  step: number;
  weight: number;
};

/**
 * Education/experience can be either the relation rows (a full profile) or a
 * plain count (Prisma `_count`). Surfaces that only need "has the user added
 * any?" can fetch counts and skip one query per relation — the dashboard does
 * exactly that, which saves two Postgres roundtrips per load.
 */
type Sized = { length: number } | number;

function sizeOf(value: Sized): number {
  return typeof value === "number" ? value : value.length;
}

/**
 * The single structural input for completeness. Every scalar the scorer reads
 * is picked from the profile row; the two relations accept rows or counts.
 * `NonNullable<ProfileWithRelations>` is assignable, so existing callers keep
 * working, and count-based callers use `withRelationCounts`.
 */
export type CompletenessInput = Pick<
  EducatorProfile,
  | "phone"
  | "city"
  | "state"
  | "headline"
  | "completedSteps"
  | "highestDegree"
  | "phdStatus"
  | "discipline"
  | "specializations"
  | "eligibility"
  | "isFresher"
  | "teachingYears"
  | "currentDesignation"
  | "noticePeriodDays"
  | "publicationsCount"
  | "orcidId"
  | "hIndex"
  | "desiredLevels"
  | "employmentTypes"
  | "preferredLocations"
  | "expectedPayLevel"
> & {
  education: Sized;
  experience: Sized;
};

/**
 * Flatten a profile whose relations were fetched via Prisma `_count` into a
 * `CompletenessInput`. Keeps the "one query, no relation fetches" path honest
 * without casting at the call site.
 */
export function withRelationCounts(
  profile: Omit<CompletenessInput, "education" | "experience">,
  counts: { education: number; experience: number },
): CompletenessInput {
  return {
    ...profile,
    education: counts.education,
    experience: counts.experience,
  };
}

function add(
  missing: MissingItem[],
  condition: unknown,
  label: string,
  why: string,
  step: number,
  weight: number,
) {
  if (!condition) missing.push({ label, why, step, weight });
}

/**
 * Weights sum to exactly 100. Weighted by matching impact, not field count.
 * Experience is either a single 20-point fresher answer or 5+5+7+3 = 20.
 */
export function computeCompleteness(p: CompletenessInput): {
  percent: number;
  missing: MissingItem[];
} {
  const missing: MissingItem[] = [];

  // Basics — 15
  add(missing, p.phone, "Add your phone number", "Institutions contact shortlisted candidates by phone.", 1, 3);
  add(missing, p.city && p.state, "Add your city and state", "Location decides which roles you appear in.", 1, 4);
  add(missing, p.headline, "Add a profile headline", "Your headline is the first thing institutions read.", 1, 5);
  add(missing, p.completedSteps >= 1, "Confirm relocation preference", "Relocation answers widen out-of-city matches.", 1, 3);

  // Academics — 30
  add(missing, p.highestDegree, "Add your highest degree", "Degree is one of the first filters institutions apply.", 2, 6);
  add(missing, p.phdStatus, "Add your PhD status", "PhD status affects eligibility for senior roles.", 2, 4);
  add(missing, p.discipline, "Choose your discipline", "Discipline drives your match estimate.", 2, 8);
  add(missing, p.specializations.length > 0, "Add specializations", "Subjects are matched against what institutions need taught.", 2, 6);
  add(missing, p.eligibility.length > 0, "Add eligibility details", "UGC-NET is mandatory for most Assistant Professor posts.", 2, 3);
  add(missing, sizeOf(p.education) > 0, "Add education history", "Institutions check qualifications before shortlisting.", 2, 3);

  // Experience — 20
  if (p.isFresher) {
    add(
      missing,
      p.completedSteps >= 3,
      "Confirm you are new to teaching",
      "Confirms your experience level for matching.",
      3,
      20,
    );
  } else if (p.teachingYears !== null || p.currentDesignation || sizeOf(p.experience) > 0) {
    add(missing, p.teachingYears !== null, "Add teaching experience", "Teaching years set your experience level.", 3, 5);
    add(missing, p.currentDesignation, "Add current designation", "Your current role gives recruiters context.", 3, 5);
    add(missing, sizeOf(p.experience) > 0, "Add teaching roles", "Roles show where you have taught.", 3, 7);
    add(missing, p.noticePeriodDays !== null, "Add notice period", "Notice period helps institutions plan hiring.", 3, 3);
  }
  // If nothing answered on step 3, treat as intentionally skipped — no loss.

  // Research — 10 (all optional, never publish-blocking)
  add(missing, p.publicationsCount !== null, "Add publication count", "Publication count signals research output.", 4, 4);
  add(missing, p.orcidId, "Add ORCID", "ORCID links your verified research profile.", 4, 3);
  add(missing, p.hIndex !== null, "Add h-index", "h-index is a common research-impact signal.", 4, 3);

  // Preferences — 25
  // Empty desiredLevels = "Any" once step 5 has been saved (the Any card is
  // the default there); until then it still nudges.
  add(missing, p.desiredLevels.length > 0 || p.completedSteps >= 5, "Choose desired faculty levels", "Levels shape which roles you are matched to.", 5, 10);
  add(missing, p.employmentTypes.length > 0, "Choose employment types", "Work preferences personalise your matches.", 5, 5);
  add(
    missing,
    p.preferredLocations.length > 0,
    "Add preferred locations",
    "Locations filter where you would work.",
    5,
    7,
  );
  add(missing, p.expectedPayLevel, "Add pay preference", "Pay preference sets expectations early.", 5, 3);

  const percent = Math.max(
    0,
    Math.min(100, 100 - missing.reduce((sum, item) => sum + item.weight, 0)),
  );
  return {
    percent: Math.round(percent),
    missing: missing.sort((a, b) => b.weight - a.weight),
  };
}

/** Only the publish blockers: steps 1, 2, 5 fully valid + step 3 answered. */
export function requiredGaps(p: CompletenessInput): string[] {
  const missing: string[] = [];
  if (!p.phone || !p.city || !p.state || !p.headline) missing.push("Basics");
  if (
    !p.highestDegree ||
    !p.phdStatus ||
    !p.discipline ||
    p.specializations.length === 0 ||
    p.eligibility.length === 0 ||
    sizeOf(p.education) === 0
  )
    missing.push("Academics");
  if (p.completedSteps < 3) missing.push("Experience");
  // desiredLevels not gated: empty = "Any" (a valid answer on step 5).
  if (p.employmentTypes.length === 0 || p.preferredLocations.length === 0)
    missing.push("Preferences");
  return missing;
}

export type PublishGap = { label: string; step: number };

/** Wizard step each publish-blocking section maps to (for deep-links). */
const GAP_STEPS: Record<string, number> = {
  Basics: 1,
  Academics: 2,
  Experience: 3,
  Preferences: 5,
};

/**
 * Canonical server-side publish validation. Both the wizard publish action
 * and the /profile visibility toggle must use this — never gate publishing
 * on client state alone.
 */
export function validateCanPublish(p: CompletenessInput): PublishGap[] {
  return requiredGaps(p).map((label) => ({
    label,
    step: GAP_STEPS[label] ?? 1,
  }));
}

/** Re-export for callers that still type against the full profile shape. */
export type { ProfileWithRelations };
