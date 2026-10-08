"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function setRole(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = formData.get("role");
  if (role !== "EDUCATOR" && role !== "INSTITUTION") return;

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: session.user.id }, data: { role } });
    if (role === "EDUCATOR") await tx.educatorProfile.upsert({ where: { userId: session.user.id }, create: { userId: session.user.id }, update: {} });
  });
  updateTag("profiles");
  redirect(role === "EDUCATOR" ? "/onboarding/educator/start" : "/dashboard");
}
