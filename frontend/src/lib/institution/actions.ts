"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/auth";
import { parseJobOpeningFormData } from "@/lib/institution/job-schema";
import { prisma } from "@/lib/prisma";

const institutionProfileSchema = z.object({
  name: z.string().trim().min(2).max(120).optional().or(z.literal("")),
  website: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  state: z.string().trim().max(80).optional().or(z.literal("")),
  institutionType: z.string().trim().max(80).optional().or(z.literal("")),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  contactName: z.string().trim().max(120).optional().or(z.literal("")),
  contactEmail: z.string().trim().email().max(160).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
});

function normalizePayload<T extends Record<string, unknown>>(payload: T) {
  const normalized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    normalized[key] = value === "" ? null : value;
  }
  return normalized as T;
}

export async function saveInstitutionProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = institutionProfileSchema.safeParse({
    name: formData.get("name"),
    website: formData.get("website"),
    city: formData.get("city"),
    state: formData.get("state"),
    institutionType: formData.get("institutionType"),
    description: formData.get("description"),
    contactName: formData.get("contactName"),
    contactEmail: formData.get("contactEmail"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    throw new Error("Invalid institution profile data");
  }

  const profile = await prisma.institutionProfile.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id },
    update: normalizePayload(parsed.data),
  });

  revalidatePath("/institution");
  updateTag("profiles");
  redirect(`/institution/dashboard?profile=${profile.id}`);
}

export type InstitutionJobFormState = {
  message: string | null;
  fieldErrors: Record<string, string>;
};

export async function createInstitutionJob(
  _previousState: InstitutionJobFormState,
  formData: FormData,
): Promise<InstitutionJobFormState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = parseJobOpeningFormData(formData);

  if (!parsed.success) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "Invalid institution job form submission",
        parsed.error.issues.map(({ path, code, message }) => ({
          field: path.join("."),
          code,
          message,
        })),
      );
    }

    return {
      message: "Please review the highlighted fields and try again.",
      fieldErrors: Object.fromEntries(
        parsed.error.issues.map((issue) => [String(issue.path[0] ?? "form"), issue.message]),
      ),
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      role: true,
      institutionProfile: { select: { id: true } },
    },
  });

  if (!user || user.role !== "INSTITUTION") redirect("/onboarding");
  if (!user.institutionProfile) redirect("/institution/onboarding");

  await prisma.jobOpening.create({
    data: {
      institutionProfile: { connect: { id: user.institutionProfile.id } },
      ...parsed.data,
      status: "PUBLISHED",
    },
  });

  revalidatePath("/institution/dashboard");
  revalidatePath("/institution/jobs");
  updateTag("profiles");
  redirect("/institution/dashboard");
}
