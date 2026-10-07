"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireEducatorProfile } from "@/lib/educator/profile";
import {
  validateCanPublish,
  type PublishGap,
} from "@/lib/educator/completeness";

export type VisibilityState = {
  ok: boolean;
  formError?: string;
  missingSteps?: PublishGap[];
};

/**
 * Visibility toggle obeying the same canonical publish validation as the
 * wizard publish action. Unpublishing is always allowed; publishing an
 * incomplete profile returns the blocking sections instead of redirecting.
 */
export async function toggleVisibility(): Promise<VisibilityState | never> {
  const profile = await requireEducatorProfile();
  if (profile.visibility === "PUBLISHED") {
    await prisma.educatorProfile.update({
      where: { id: profile.id },
      data: { visibility: "DRAFT" },
    });
    revalidatePath("/profile");
    revalidatePath("/dashboard");
    redirect("/profile");
  }
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
  revalidatePath("/profile");
  revalidatePath("/dashboard");
  redirect("/profile");
}
