import { z } from "zod";
import type {
  Discipline,
  Eligibility,
  HighestDegree,
  PhdStatus,
} from "@prisma/client";
import { INDIAN_STATES } from "./constants";

// ---------------------------------------------------------------------------
// Parser contract (resume-parser/app/schemas.py). Every field is optional —
// the extractor never invents values, so the import layer must treat the
// whole payload as untrusted and validate it before touching Prisma (§37).
// ---------------------------------------------------------------------------

const personalSchema = z.object({
  name: z.string().nullish(),
  email: z.string().nullish(),
  phone: z.string().nullish(),
  location: z.string().nullish(),
  linkedin: z.string().nullish(),
  github: z.string().nullish(),
  portfolio: z.string().nullish(),
  orcid: z.string().nullish(),
});

const educationItemSchema = z.object({
  institution: z.string().nullish(),
  degree: z.string().nullish(),
  field: z.string().nullish(),
  startDate: z.string().nullish(),
  endDate: z.string().nullish(),
  grade: z.string().nullish(),
});

const experienceItemSchema = z.object({
  company: z.string().nullish(),
  role: z.string().nullish(),
  startDate: z.string().nullish(),
  endDate: z.string().nullish(),
  description: z.string().nullish(),
});

const projectItemSchema = z.object({
  name: z.string().nullish(),
  description: z.string().nullish(),
  technologies: z.array(z.string()).default([]),
});

// The parser emits certification OBJECTS (schemas.py: CertificationItem). A
// bare string is still accepted for forward/backward compatibility, but the
// object form must not fail validation — that would reject the whole payload
// and turn a readable resume into a 422.
const certificationItemSchema = z.object({
  name: z.string().nullish(),
  issuer: z.string().nullish(),
  date: z.string().nullish(),
});

export const profileImportSchema = z.object({
  personal: personalSchema.default({}),
  education: z.array(educationItemSchema).default([]),
  skills: z.array(z.string()).default([]),
  experience: z.array(experienceItemSchema).default([]),
  projects: z.array(projectItemSchema).default([]),
  certifications: z
    .array(z.union([z.string(), certificationItemSchema]))
    .default([]),
  eligibilityHints: z.array(z.string()).default([]),
});

export type ProfileImport = z.infer<typeof profileImportSchema>;

export const parserResponseSchema = z.object({
  success: z.boolean(),
  profile: profileImportSchema.nullish(),
  meta: z
    .object({
      ocrUsed: z.boolean().default(false),
      sourceFormat: z.string().default(""),
      processingTimeMs: z.number().default(0),
      warnings: z.array(z.string()).default([]),
    })
    .default({ ocrUsed: false, sourceFormat: "", processingTimeMs: 0, warnings: [] }),
});

export type ParserResponse = z.infer<typeof parserResponseSchema>;

// ---------------------------------------------------------------------------
// Normalization helpers
// ---------------------------------------------------------------------------

const CURRENT_YEAR = new Date().getFullYear();

function clean(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

/** Empty per §23: null, undefined, "", whitespace-only. Nothing else. */
export function isEmpty(value: unknown): boolean {
  return value === null || value === undefined ||
    (typeof value === "string" && value.trim() === "");
}

function normKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

// --- Degree → HighestDegree -------------------------------------------------

const DEGREE_RANK: HighestDegree[] = [
  "BACHELORS",
  "MASTERS",
  "MPHIL",
  "PHD",
  "POSTDOC",
];

const DEGREE_PATTERNS: { re: RegExp; degree: HighestDegree }[] = [
  { re: /post[\s-]?doc/i, degree: "POSTDOC" },
  { re: /ph\.?\s?d|d\.?\s?phil|doctorate|doctoral/i, degree: "PHD" },
  { re: /m\.?\s?phil/i, degree: "MPHIL" },
  { re: /\bmba\b/i, degree: "MASTERS" },
  {
    re: /\bm\.?\s?tech|\bm\.?\s?e\.?\b|\bm\.?\s?sc\b|\bm\.?\s?com\b|\bm\.?\s?a\.?\b|\bm\.?\s?arch|\bm\.?\s?ed\b|\bm\.?\s?des\b|\bms\b|\bm\.?d\.?\b|\bmbbs\b/i,
    degree: "MASTERS",
  },
  { re: /\bmaster'?s\b/i, degree: "MASTERS" },
  {
    re: /\bb\.?\s?tech|\bb\.?\s?e\.?\b|\bb\.?\s?sc\b|\bb\.?\s?com\b|\bb\.?\s?a\.?\b|\bb\.?\s?arch|\bb\.?\s?ed\b|\bb\.?\s?pharm|\bb\.?\s?des\b/i,
    degree: "BACHELORS",
  },
  { re: /\bbachelor'?s\b/i, degree: "BACHELORS" },
];

export function mapDegreeToHighestDegree(raw: string | null | undefined): HighestDegree | null {
  if (!raw) return null;
  let best: HighestDegree | null = null;
  for (const { re, degree } of DEGREE_PATTERNS) {
    if (re.test(raw)) {
      if (!best || DEGREE_RANK.indexOf(degree) > DEGREE_RANK.indexOf(best)) {
        best = degree;
      }
    }
  }
  return best;
}

export function inferPhdStatus(degreeLines: string[]): PhdStatus | null {
  const joined = degreeLines.join(" ");
  if (!/ph\.?\s?d|doctorate|doctoral/i.test(joined)) return null;
  if (/pursuing|ongoing|scholar|candidate/i.test(joined)) return "PURSUING";
  return "AWARDED";
}

// --- Discipline inference (§28, conservative) --------------------------------

const DISCIPLINE_KEYWORDS: { re: RegExp; discipline: Discipline }[] = [
  { re: /computer science|computer application|software engineering|\bcse\b|computer engineering/i, discipline: "COMPUTER_SCIENCE" },
  { re: /information technology|informatics/i, discipline: "INFORMATION_TECHNOLOGY" },
  { re: /electrical|\beee\b/i, discipline: "ELECTRICAL" },
  { re: /electronic|\bece\b/i, discipline: "ELECTRONICS" },
  { re: /mechanical/i, discipline: "MECHANICAL" },
  { re: /civil/i, discipline: "CIVIL" },
  { re: /chemical/i, discipline: "CHEMICAL" },
  { re: /biotech|bioinformatics|biomedical/i, discipline: "BIOTECHNOLOGY" },
  { re: /mathematic/i, discipline: "MATHEMATICS" },
  { re: /physics/i, discipline: "PHYSICS" },
  { re: /chemistry/i, discipline: "CHEMISTRY" },
  { re: /botan/i, discipline: "BOTANY" },
  { re: /zoolog/i, discipline: "ZOOLOGY" },
  { re: /economic/i, discipline: "ECONOMICS" },
  { re: /commerce|accounting/i, discipline: "COMMERCE" },
  { re: /\bmba\b|management|business administration/i, discipline: "MANAGEMENT" },
  { re: /english/i, discipline: "ENGLISH" },
  { re: /hindi/i, discipline: "HINDI" },
  { re: /histor/i, discipline: "HISTORY" },
  { re: /political/i, discipline: "POLITICAL_SCIENCE" },
  { re: /sociolog/i, discipline: "SOCIOLOGY" },
  { re: /psycholog/i, discipline: "PSYCHOLOGY" },
  { re: /\bb\.?\s?ed\b|\bm\.?\s?ed\b|\beducation\b/i, discipline: "EDUCATION" },
  { re: /\bllb\b|\bllm\b|\blaw\b/i, discipline: "LAW" },
];

/**
 * Conservative discipline inference (§28): explicit field first, then degree
 * lines. Multiple distinct matches (or none) → null. Never guesses.
 */
export function inferDiscipline(candidates: string[]): Discipline | null {
  const hits = new Set<Discipline>();
  for (const text of candidates) {
    if (!text) continue;
    for (const { re, discipline } of DISCIPLINE_KEYWORDS) {
      if (re.test(text)) hits.add(discipline);
    }
  }
  return hits.size === 1 ? [...hits][0]! : null;
}

// --- Eligibility hints → enum ------------------------------------------------

const ELIGIBILITY_MAP: Record<string, Eligibility> = {
  "UGC-NET": "UGC_NET",
  "CSIR-NET": "CSIR_NET",
  JRF: "JRF",
  GATE: "GATE",
  SET: "SET_SLET",
};

export function mapEligibilityHints(hints: string[]): Eligibility[] {
  const out: Eligibility[] = [];
  for (const hint of hints) {
    const mapped = ELIGIBILITY_MAP[hint.trim().toUpperCase()];
    if (mapped && !out.includes(mapped)) out.push(mapped);
  }
  return out;
}

// --- Location "City, State" → { city, state } --------------------------------

const STATE_ALIASES: Record<string, string> = {
  orissa: "Odisha",
  pondicherry: "Puducherry",
};

const STATE_BY_CASEFOLD = new Map<string, string>();
for (const state of INDIAN_STATES) STATE_BY_CASEFOLD.set(state.toLowerCase(), state);
for (const [alias, proper] of Object.entries(STATE_ALIASES)) {
  STATE_BY_CASEFOLD.set(alias, proper);
}

export function splitLocation(
  location: string | null | undefined,
  name: string | null | undefined,
): { city: string | null; state: string | null } {
  const empty = { city: null, state: null };
  if (!location) return empty;
  const parts = location.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return empty;
  if (
    parts.length > 1 &&
    ["india", "indian"].includes(parts[parts.length - 1]!.toLowerCase())
  ) {
    parts.pop();
  }
  if (parts.length === 0) return empty;
  const maybeState = STATE_BY_CASEFOLD.get(parts[parts.length - 1]!.toLowerCase());
  if (maybeState) {
    const city = parts.slice(0, -1).join(", ").trim();
    if (
      city &&
      city.length >= 2 &&
      city.length <= 60 &&
      city.toLowerCase() !== (name ?? "").toLowerCase()
    ) {
      return { city, state: maybeState };
    }
    return { city: null, state: maybeState };
  }
  if (parts.length === 1 && parts[0]!.length >= 3 && parts[0]!.length <= 60) {
    if (name && parts[0]!.toLowerCase() === name.toLowerCase()) return empty;
    return { city: parts[0]!, state: null };
  }
  return empty;
}

// --- Phone E.164 → 10-digit Indian mobile ------------------------------------

export function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  const national =
    digits.length === 12 && digits.startsWith("91")
      ? digits.slice(2)
      : digits.length === 11 && digits.startsWith("0")
        ? digits.slice(1)
        : digits;
  return /^[6-9]\d{9}$/.test(national) ? national : null;
}

// --- Derived headline (§27) --------------------------------------------------

export function deriveHeadline(
  role: string | null | undefined,
  company: string | null | undefined,
): string | null {
  if (!role || !company) return null;
  const headline = `${role.trim()} at ${company.trim()}`.slice(0, 80).trim();
  return headline.length >= 10 ? headline : null;
}

// ---------------------------------------------------------------------------
// applyResumeImport — pure merge (spec §38)
// ---------------------------------------------------------------------------

export type ExistingEducationKey = {
  institution: string;
  degree: string;
};

export type ExistingExperienceKey = {
  institution: string;
  designation: string;
};

export type ExistingProfile = {
  userName: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  headline: string | null;
  highestDegree: HighestDegree | null;
  phdStatus: PhdStatus | null;
  discipline: Discipline | null;
  specializations: string[];
  eligibility: Eligibility[];
  education: ExistingEducationKey[];
  experience: ExistingExperienceKey[];
};

export type NewEducationRow = {
  degree: HighestDegree;
  field: string;
  institution: string;
  startYear: number;
  endYear: number | null;
  isOngoing: boolean;
  grade: string | null;
};

export type NewExperienceRow = {
  designation: string;
  institution: string;
  startYear: number;
  startMonth: number;
  endYear: number | null;
  endMonth: number | null;
  isCurrent: boolean;
  monthsApproximate: boolean;
};

export type ResumeImportResult = {
  userPatch: { name?: string };
  profilePatch: {
    phone?: string;
    city?: string | null;
    state?: string | null;
    headline?: string;
    headlineDerived?: boolean;
    highestDegree?: HighestDegree;
    phdStatus?: PhdStatus;
    discipline?: Discipline;
    specializations?: string[];
    eligibility?: Eligibility[];
    resumeFilename?: string;
  };
  newEducation: NewEducationRow[];
  newExperience: NewExperienceRow[];
  filled: string[];
  warnings: string[];
};

const MAX_SPECIALIZATIONS = 8;
const MAX_EDUCATION_ROWS = 6;
const MAX_EXPERIENCE_ROWS = 10;

function parseYearMonth(
  value: string | null | undefined,
): { y: number; m: number | null } | null {
  if (!value) return null;
  const match = value.match(/\b(19\d{2}|20\d{2})(?:-(\d{2}))?/);
  if (!match) return null;
  const y = Number(match[1]);
  if (y < 1960 || y > CURRENT_YEAR + 6) return null;
  const m = match[2] ? Number(match[2]) : null;
  return { y, m: m && m >= 1 && m <= 12 ? m : null };
}

export function applyResumeImport(
  existing: ExistingProfile,
  imported: ProfileImport,
  resumeFilename?: string,
): ResumeImportResult {
  const filled: string[] = [];
  const warnings: string[] = [];
  const userPatch: ResumeImportResult["userPatch"] = {};
  const profilePatch: ResumeImportResult["profilePatch"] = {};
  const newEducation: NewEducationRow[] = [];
  const newExperience: NewExperienceRow[] = [];

  // --- Name → User.name (fill-only-empty) ---
  const name = clean(imported.personal.name, 100);
  if (name && isEmpty(existing.userName)) {
    userPatch.name = name;
    filled.push("Name");
  }

  // --- Phone ---
  const phone = normalizePhone(imported.personal.phone);
  if (imported.personal.phone && !phone) {
    warnings.push("The phone number on your resume could not be read — you can add it manually.");
  } else if (phone && isEmpty(existing.phone)) {
    profilePatch.phone = phone;
    filled.push("Phone");
  }

  // --- Location ---
  const { city, state } = splitLocation(imported.personal.location, name);
  if (city && isEmpty(existing.city)) {
    profilePatch.city = city;
    filled.push("City");
  }
  if (state && isEmpty(existing.state)) {
    profilePatch.state = state;
    filled.push("State");
  } else if (imported.personal.location && !city && !state) {
    warnings.push("The location on your resume could not be mapped to a city or state.");
  }

  // --- Degree / PhD status ---
  const degreeLines = imported.education
    .map((e) => [e.degree, e.field].filter(Boolean).join(" "))
    .filter(Boolean);
  let highest: HighestDegree | null = null;
  for (const line of degreeLines) {
    const mapped = mapDegreeToHighestDegree(line);
    if (mapped && (!highest || DEGREE_RANK.indexOf(mapped) > DEGREE_RANK.indexOf(highest))) {
      highest = mapped;
    }
  }
  if (highest && isEmpty(existing.highestDegree)) {
    profilePatch.highestDegree = highest;
    filled.push("Highest degree");
  }
  const phdStatus = inferPhdStatus(degreeLines);
  if (phdStatus && isEmpty(existing.phdStatus)) {
    if (phdStatus === "AWARDED" && highest && !["PHD", "POSTDOC"].includes(highest)) {
      warnings.push("Your resume mentions a PhD, but the highest degree found was lower — degree left for you to confirm.");
    } else {
      profilePatch.phdStatus = phdStatus;
      filled.push("PhD status");
    }
  }

  // --- Discipline (conservative, §28) ---
  const fieldCandidates = imported.education
    .map((e) => e.field ?? "")
    .concat(degreeLines);
  const discipline = inferDiscipline(fieldCandidates);
  if (discipline && isEmpty(existing.discipline)) {
    profilePatch.discipline = discipline;
    filled.push("Discipline");
  }

  // --- Specializations ← canonical skills (merge, dedupe, cap) ---
  const seenSpecs = new Set(existing.specializations.map((s) => s.toLowerCase()));
  const mergedSpecs = [...existing.specializations];
  let specsAdded = 0;
  for (const skill of imported.skills) {
    const skillClean = clean(skill, 40);
    if (!skillClean || skillClean.length < 2) continue;
    if (seenSpecs.has(skillClean.toLowerCase())) continue;
    if (mergedSpecs.length >= MAX_SPECIALIZATIONS) break;
    seenSpecs.add(skillClean.toLowerCase());
    mergedSpecs.push(skillClean);
    specsAdded += 1;
  }
  if (specsAdded > 0) {
    profilePatch.specializations = mergedSpecs;
    filled.push(`Specializations (${specsAdded} new)`);
  }

  // --- Eligibility (merge; NONE never coexists) ---
  const mappedEligibility = mapEligibilityHints(imported.eligibilityHints);
  const newEligibility = mappedEligibility.filter((e) => !existing.eligibility.includes(e));
  if (newEligibility.length > 0) {
    const merged = [...existing.eligibility, ...newEligibility].slice(0, 12);
    profilePatch.eligibility = merged.includes("UGC_NET") || merged.includes("CSIR_NET") || merged.includes("JRF") || merged.includes("GATE") || merged.includes("SET_SLET")
      ? merged.filter((e) => e !== "NONE")
      : merged;
    filled.push("Eligibility");
  }

  // --- Education rows (merge by institution + degree) ---
  const knownEdu = new Set(
    existing.education.map((e) => `${normKey(e.institution)}|${normKey(e.degree)}`),
  );
  for (const item of imported.education) {
    if (existing.education.length + newEducation.length >= MAX_EDUCATION_ROWS) break;
    const degree = mapDegreeToHighestDegree(item.degree ?? "");
    const field = clean(item.field, 60);
    const institution = clean(item.institution, 100);
    const start = parseYearMonth(item.startDate);
    if (!degree || !field || field.length < 2 || !institution || institution.length < 2 || !start) {
      continue;
    }
    if (knownEdu.has(`${normKey(institution)}|${normKey(degree)}`)) continue;
    knownEdu.add(`${normKey(institution)}|${normKey(degree)}`);
    const end = parseYearMonth(item.endDate);
    const present = !item.endDate || /present|current|now|till/i.test(item.endDate);
    const endYear = present ? null : (end && end.y >= start.y ? end.y : null);
    newEducation.push({
      degree,
      field,
      institution,
      startYear: start.y,
      endYear,
      isOngoing: endYear === null,
      grade: clean(item.grade, 20),
    });
  }
  if (newEducation.length > 0) filled.push(`Education (${newEducation.length} new)`);

  // --- Experience rows (merge by company + role) ---
  const knownExp = new Set(
    existing.experience.map((e) => `${normKey(e.institution)}|${normKey(e.designation)}`),
  );
  for (const item of imported.experience) {
    if (existing.experience.length + newExperience.length >= MAX_EXPERIENCE_ROWS) break;
    const designation = clean(item.role, 60);
    const institution = clean(item.company, 100);
    const start = parseYearMonth(item.startDate);
    if (!designation || designation.length < 2 || !institution || institution.length < 2 || !start) {
      continue;
    }
    if (knownExp.has(`${normKey(institution)}|${normKey(designation)}`)) continue;
    knownExp.add(`${normKey(institution)}|${normKey(designation)}`);
    const end = parseYearMonth(item.endDate);
    const isCurrent = !item.endDate || /present|current|now|till/i.test(item.endDate ?? "");
    const monthsApproximate = start.m === null || (!isCurrent && end?.m === null);
    if (monthsApproximate) {
      warnings.push(
        "Exact months were not provided in the resume — dates were added as estimates. Please verify them.",
      );
    }
    const endYear = isCurrent ? null : (end && end.y >= start.y ? end.y : null);
    newExperience.push({
      designation,
      institution,
      startYear: start.y,
      startMonth: start.m ?? 1,
      endYear,
      endMonth: isCurrent ? null : (end?.m ?? 12),
      isCurrent,
      monthsApproximate,
    });
  }
  if (newExperience.length > 0) filled.push(`Experience (${newExperience.length} new)`);

  // --- Derived headline (§27, only from a real role + company) ---
  if (isEmpty(existing.headline) && newExperience.length > 0) {
    const first = newExperience[0]!;
    const headline = deriveHeadline(first.designation, first.institution);
    if (headline) {
      profilePatch.headline = headline;
      profilePatch.headlineDerived = true;
      filled.push("Headline (derived — you can edit it)");
    }
  }

  if (resumeFilename) profilePatch.resumeFilename = resumeFilename.slice(0, 200);

  return { userPatch, profilePatch, newEducation, newExperience, filled, warnings };
}
