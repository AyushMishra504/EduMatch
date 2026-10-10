import { z } from "zod";

const employmentTypes = ["FULL_TIME", "CONTRACT", "VISITING", "PART_TIME"] as const;
const disciplines = [
  "COMPUTER_SCIENCE",
  "INFORMATION_TECHNOLOGY",
  "ELECTRONICS",
  "ELECTRICAL",
  "MECHANICAL",
  "CIVIL",
  "CHEMICAL",
  "BIOTECHNOLOGY",
  "MATHEMATICS",
  "PHYSICS",
  "CHEMISTRY",
  "BOTANY",
  "ZOOLOGY",
  "ECONOMICS",
  "COMMERCE",
  "MANAGEMENT",
  "ENGLISH",
  "HINDI",
  "HISTORY",
  "POLITICAL_SCIENCE",
  "SOCIOLOGY",
  "PSYCHOLOGY",
  "EDUCATION",
  "LAW",
] as const;
const facultyLevels = [
  "GUEST",
  "VISITING",
  "ASSISTANT_PROFESSOR",
  "ASSOCIATE_PROFESSOR",
  "PROFESSOR",
  "HOD",
] as const;

function emptyToUndefined(value: unknown) {
  if (value === null || (typeof value === "string" && value.trim() === "")) {
    return undefined;
  }
  return value;
}

const optionalText = (maxLength: number) =>
  z.preprocess(
    emptyToUndefined,
    z.string().trim().max(maxLength).optional(),
  );

const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess(emptyToUndefined, z.enum(values).optional());

export const jobOpeningFormSchema = z.object({
  title: z.string().trim().min(2, "Enter a role title.").max(120),
  department: optionalText(120),
  location: optionalText(120),
  employmentType: optionalEnum(employmentTypes),
  discipline: optionalEnum(disciplines),
  facultyLevel: optionalEnum(facultyLevels),
  description: z.string().trim().min(1, "Add a role description.").max(2500),
  requirements: optionalText(2500),
});

export function parseJobOpeningFormData(formData: FormData) {
  return jobOpeningFormSchema.safeParse({
    title: formData.get("title") ?? undefined,
    department: formData.get("department") ?? undefined,
    location: formData.get("location") ?? undefined,
    employmentType: formData.get("employmentType") ?? undefined,
    discipline: formData.get("discipline") ?? undefined,
    facultyLevel: formData.get("facultyLevel") ?? undefined,
    description: formData.get("description") ?? undefined,
    requirements: formData.get("requirements") ?? undefined,
  });
}
