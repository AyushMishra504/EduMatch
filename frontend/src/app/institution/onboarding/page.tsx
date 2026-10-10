import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { saveInstitutionProfile } from "@/lib/institution/actions";

export const dynamic = "force-dynamic";

export default async function InstitutionOnboardingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, institutionProfile: true },
  });

  if (!user || user.role !== "INSTITUTION") redirect("/onboarding");

  if (user.institutionProfile) {
    redirect("/institution/dashboard");
  }

  return (
    <main className="mx-auto max-w-2xl px-5 py-12 sm:px-8">
      <p className="text-tiny font-semibold uppercase tracking-[0.18em] text-accent">
        Institution setup
      </p>
      <h1 className="mt-3 font-serif text-h2 font-medium text-ink">
        Tell us about your institution
      </h1>
      <p className="mt-3 text-small text-ink-muted">
        Add the basics so we can match your hiring needs with relevant educators.
      </p>

      <form action={saveInstitutionProfile} className="mt-8 space-y-5 rounded-md border border-rule bg-paper p-6">
        <div>
          <label className="mb-1 block text-small font-medium text-ink">Institution name</label>
          <input name="name" className="w-full rounded-md border border-rule bg-white px-3 py-2 text-small text-ink" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-small font-medium text-ink">City</label>
            <input name="city" className="w-full rounded-md border border-rule bg-white px-3 py-2 text-small text-ink" />
          </div>
          <div>
            <label className="mb-1 block text-small font-medium text-ink">State</label>
            <input name="state" className="w-full rounded-md border border-rule bg-white px-3 py-2 text-small text-ink" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-small font-medium text-ink">Institution type</label>
          <input name="institutionType" placeholder="University, college, school network..." className="w-full rounded-md border border-rule bg-white px-3 py-2 text-small text-ink" />
        </div>
        <div>
          <label className="mb-1 block text-small font-medium text-ink">Website</label>
          <input name="website" type="url" className="w-full rounded-md border border-rule bg-white px-3 py-2 text-small text-ink" />
        </div>
        <div>
          <label className="mb-1 block text-small font-medium text-ink">Description</label>
          <textarea name="description" rows={5} className="w-full rounded-md border border-rule bg-white px-3 py-2 text-small text-ink" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-small font-medium text-ink">Contact name</label>
            <input name="contactName" className="w-full rounded-md border border-rule bg-white px-3 py-2 text-small text-ink" />
          </div>
          <div>
            <label className="mb-1 block text-small font-medium text-ink">Contact email</label>
            <input name="contactEmail" type="email" className="w-full rounded-md border border-rule bg-white px-3 py-2 text-small text-ink" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-small font-medium text-ink">Phone</label>
          <input name="phone" className="w-full rounded-md border border-rule bg-white px-3 py-2 text-small text-ink" />
        </div>
        <button type="submit" className="rounded-md bg-accent px-5 py-3 text-small font-semibold text-on-accent hover:bg-accent-deep">
          Save and continue
        </button>
      </form>
    </main>
  );
}
