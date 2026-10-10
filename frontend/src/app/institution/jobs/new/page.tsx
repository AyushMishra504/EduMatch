import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { InstitutionJobForm } from "@/components/institution/InstitutionJobForm";

export default async function NewInstitutionJobPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, institutionProfile: true },
  });

  if (!user || user.role !== "INSTITUTION") redirect("/onboarding");
  if (!user.institutionProfile) redirect("/institution/onboarding");

  return (
    <main className="mx-auto max-w-2xl px-5 py-10 sm:px-8 lg:py-16">
      <p className="text-tiny font-semibold uppercase tracking-[0.18em] text-accent">New role</p>
      <h1 className="mt-2 font-serif text-h2 font-medium text-ink">Create a vacancy</h1>

      <InstitutionJobForm />
    </main>
  );
}
