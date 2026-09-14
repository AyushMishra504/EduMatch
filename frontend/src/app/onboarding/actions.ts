"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function setRole(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = formData.get("role");
  if (role !== "EDUCATOR" && role !== "INSTITUTION") return;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { role },
  });
  redirect("/dashboard");
}
