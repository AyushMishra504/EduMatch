import { z } from "zod";
import {
  Discipline,
  Eligibility,
  EmploymentType,
  FacultyLevel,
  PhdStatus,
  UgcPayLevel,
  HighestDegree,
} from "@prisma/client";
import { INDIAN_STATES } from "./constants";

const CURRENT_YEAR = new Date().getFullYear();
const phoneRe = /^[6-9]\d{9}$/;
const orcidRe = /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/;

const text = (min: number, max: number) =>
  z.string().trim().min(min).max(max);

const optionalText = (max: number) =>
  z.preprocess(
    (v) => (v === undefined || v === null ? "" : v),
    z
      .string()
      .trim()
      .max(max)
      .transform((v) => v || null),
  );

/**
 * Onboarding is opt-in, not a gate: a blank or missing field becomes null
 * (the Prisma columns are all nullable) instead of rejecting the save. The
 * user can finish the profile from /profile later, so the wizard must never
 * trap them on a step.
 */
const blankToNull = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? null : (v ?? null);

/** Text that may be left blank; stored as null. */
const lenientText = (max: number) =>
  z.preprocess(blankToNull, z.string().trim().max(max).nullable());

/** Enum that may be left blank; stored as null. */
function lenientEnum<S extends z.ZodType>(schema: S) {
  return z.preprocess(blankToNull, schema.nullable());
}

const checkboxBool = z
  .union([
    z.literal("on"),
    z.literal(true),
    z.literal("true"),
    // Step 1's relocation radios submit value="false" as a STRING (FormData
    // never carries booleans) — without this literal, picking "No" failed
    // validation with a bare "Invalid input".
    z.literal("false"),
    z.literal(false),
    z.undefined(),
  ])
  .transform((v) => v === "on" || v === true || v === "true");

/** FormData repeats keys for checkbox groups: single value vs array vs missing. */
function toArray(v: unknown) {
  return Array.isArray(v) ? v : v === undefined ? [] : [v];
}

function jsonField<T extends z.ZodTypeAny>(schema: T) {
  return z
    .string()
    .transform((value, ctx) => {
      try {
        return JSON.parse(value) as unknown;
      } catch {
        ctx.addIssue({ code: "custom", message: "Invalid form data" });
        return z.NEVER;
      }
    })
    .pipe(schema);
}

function tagsField(max: number) {
  return jsonField(
    z
      .array(text(2, 40))
      .max(max)
      .superRefine((items, ctx) => {
        if (
          new Set(items.map((item) => item.toLowerCase())).size !== items.length
        ) {
          ctx.addIssue({ code: "custom", message: "Remove duplicate entries" });
        }
      }),
  );
}

function maybeInt(max: number) {
  return z
    .union([z.literal(""), z.literal(undefined), z.string().regex(/^\d+$/)])
    .transform((value) => (value === "" || value === undefined ? null : Number(value)))
    .refine(
      (value) => value === null || (value >= 0 && value <= max),
      `Enter a number between 0 and ${max}`,
    );
}

/** "": null. Anything else must be a valid 10-digit Indian mobile. */
function optionalPhone() {
  return z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? null : v),
    z
      .string()
      .regex(phoneRe, "Enter a valid 10-digit Indian mobile number")
      .nullable()
      .optional(),
  );
}

export const step1Schema = z.object({
  phone: optionalPhone(),
  city: lenientText(60),
  state: lenientEnum(z.enum(INDIAN_STATES)),
  willingToRelocate: checkboxBool,
  headline: lenientText(80),
  bio: optionalText(300),
});

const educationRowSchema = z
  .object({
    degree: z.nativeEnum(HighestDegree),
    field: text(2, 60),
    institution: text(2, 100),
    startYear: z.coerce.number().int().min(1960).max(CURRENT_YEAR),
    endYear: z
      .union([z.literal(""), z.coerce.number().int()])
      .transform((v) => (v === "" ? null : v))
      .optional(),
    isOngoing: z.coerce.boolean(),
    grade: optionalText(20),
  })
  .superRefine((entry, ctx) => {
    if (!entry.isOngoing && !entry.endYear) {
      ctx.addIssue({
        code: "custom",
        path: ["endYear"],
        message: "Add an end year or mark ongoing",
      });
    }
    if (
      entry.endYear &&
      (entry.endYear < entry.startYear || entry.endYear > CURRENT_YEAR + 6)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["endYear"],
        message: "Enter a valid end year",
      });
    }
  });

export const step2Schema = z
  .object({
    highestDegree: lenientEnum(z.nativeEnum(HighestDegree)),
    phdStatus: lenientEnum(z.nativeEnum(PhdStatus)),
    discipline: lenientEnum(z.nativeEnum(Discipline)),
    specializations: tagsField(8),
    eligibility: z.preprocess(
      toArray,
      z.array(z.nativeEnum(Eligibility)).max(12),
    ),
    // Empty rows are dropped by RepeatableList's "in use" flag on the client
    // (see rowHasContent), so an untouched education list is simply absent.
    education: jsonField(z.array(educationRowSchema).max(6)),
  })
  .superRefine((data, ctx) => {
    if (data.eligibility.includes("NONE") && data.eligibility.length > 1) {
      ctx.addIssue({
        code: "custom",
        path: ["eligibility"],
        message: "None cannot be selected with another eligibility",
      });
    }
    if (
      data.phdStatus === "AWARDED" &&
      data.highestDegree &&
      !["PHD", "POSTDOC"].includes(data.highestDegree)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["highestDegree"],
        message:
          "You marked a PhD as awarded — set your highest degree to PhD or higher.",
      });
    }
  });

const experienceRowSchema = z
  .object({
    designation: text(2, 60),
    institution: text(2, 100),
    startYear: z.coerce.number().int().min(1960).max(CURRENT_YEAR),
    startMonth: z.coerce.number().int().min(1).max(12),
    endYear: z
      .union([z.literal(""), z.coerce.number().int()])
      .transform((v) => (v === "" ? null : v))
      .optional(),
    endMonth: z
      .union([z.literal(""), z.coerce.number().int().min(1).max(12)])
      .transform((v) => (v === "" ? null : v))
      .optional(),
    isCurrent: z.coerce.boolean(),
    subjects: z.array(text(2, 40)).max(6),
  })
  .superRefine((entry, ctx) => {
    if (!entry.isCurrent && (!entry.endYear || !entry.endMonth)) {
      ctx.addIssue({
        code: "custom",
        path: ["endYear"],
        message: "Add an end date or mark current",
      });
    }
    if (
      entry.endYear &&
      (entry.endYear < entry.startYear ||
        (entry.endYear === entry.startYear &&
          (entry.endMonth ?? 0) < entry.startMonth))
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["endYear"],
        message: "End date must be after start date",
      });
    }
  });

/**
 * "path" is the Yes/Not-yet teaching-experience answer. It replaces the old
 * isFresher flag because a user who skips this step must not be silently
 * recorded as "has experience".
 */
export const step3Schema = z
  .object({
    path: z.preprocess(
      (v) => (v === "yes" || v === "no" ? v : null),
      z.enum(["yes", "no"]).nullable(),
    ),
    teachingYears: maybeInt(50),
    industryYears: maybeInt(50),
    currentInstitution: optionalText(100),
    currentDesignation: optionalText(60),
    noticePeriodDays: maybeInt(180),
    experience: jsonField(z.array(experienceRowSchema).max(10)),
  })
  .superRefine((data, ctx) => {
    if (data.path === "yes") {
      if (data.teachingYears === null) {
        ctx.addIssue({
          code: "custom",
          path: ["teachingYears"],
          message: "Add your teaching experience, or pick “Not yet”",
        });
      }
      if (
        data.experience.length > 0 &&
        data.experience.filter((row) => row.isCurrent).length > 1
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["experience"],
          message: "Only one role can be current",
        });
      }
    }
  });

export const step4Schema = z
  .object({
    publicationsCount: maybeInt(1000),
    orcidId: z
      .union([
        z.literal(""),
        z.string().regex(orcidRe, "ORCID looks like 0000-0002-1825-0097"),
      ])
      .transform((v) => v || null),
    scopusId: z
      .union([z.literal(""), z.string().regex(/^\d{8,16}$/)])
      .transform((v) => v || null),
    hIndex: maybeInt(200),
  })
  .superRefine((data, ctx) => {
    if ((data.hIndex ?? 0) > (data.publicationsCount ?? 0)) {
      ctx.addIssue({
        code: "custom",
        path: ["hIndex"],
        message: "h-index cannot exceed your publication count.",
      });
    }
  });

export const step5Schema = z
  .object({
    desiredLevels: z.preprocess(
      toArray,
      z.array(z.nativeEnum(FacultyLevel)).max(10),
    ),
    employmentTypes: z.preprocess(
      toArray,
      z.array(z.nativeEnum(EmploymentType)).max(10),
    ),
    preferredLocations: tagsField(5),
    expectedPayLevel: z
      .union([z.literal(""), z.nativeEnum(UgcPayLevel)])
      .transform((v) => v || null),
  })
  .superRefine((data, ctx) => {
    if (
      data.preferredLocations.includes("Anywhere in India") &&
      data.preferredLocations.length > 1
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["preferredLocations"],
        message: "Anywhere in India must be the only location",
      });
    }
  });

/**
 * Minimal onboarding (one screen): discipline is the only required answer —
 * it seeds the match estimate and is publish-required. Employment types are
 * optional multi-select. The skip path never runs this schema (it writes
 * nothing), so an empty draft is always a legitimate state.
 */
export const minimalOnboardingSchema = z.object({
  discipline: z.nativeEnum(Discipline, {
    message: "Choose the discipline you teach",
  }),
  employmentTypes: z.preprocess(
    toArray,
    z.array(z.nativeEnum(EmploymentType)).max(10),
  ),
});

export function formDataToObject(fd: FormData) {
  const value: Record<string, FormDataEntryValue | FormDataEntryValue[]> = {};
  for (const [key, item] of fd.entries()) {
    const prior = value[key];
    value[key] =
      prior === undefined
        ? item
        : Array.isArray(prior)
          ? [...prior, item]
          : [prior, item];
  }
  return value;
}
