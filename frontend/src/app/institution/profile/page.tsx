import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function InstitutionProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      role: true,
      institutionProfile: true,
    },
  });

  if (!user || user.role !== "INSTITUTION") redirect("/onboarding");
  if (!user.institutionProfile) redirect("/institution/onboarding");

  const profile = user.institutionProfile;

  return (
    <main className="mx-auto max-w-2xl px-5 py-10 sm:px-8 lg:py-16">
      <p className="text-tiny font-semibold uppercase tracking-[0.18em] text-accent">
        Institution profile
      </p>
      <h1 className="mt-2 font-serif text-3xl font-medium text-ink">
        {profile.name ?? "Your institution"}
      </h1>

      <div className="mt-8 space-y-5 rounded-md border border-rule bg-paper p-5">
        <p><span className="font-medium text-ink">Type:</span> {profile.institutionType ?? "Not added"}</p>
        <p><span className="font-medium text-ink">Location:</span> {profile.city && profile.state ? `${profile.city}, ${profile.state}` : profile.city ?? "Not added"}</p>
        <p><span className="font-medium text-ink">Website:</span> {profile.website ?? "Not added"}</p>
        <p><span className="font-medium text-ink">Contact:</span> {profile.contactName ?? "Not added"}</p>
        <p><span className="font-medium text-ink">Email:</span> {profile.contactEmail ?? "Not added"}</p>
        <p><span className="font-medium text-ink">Description:</span> {profile.description ?? "Not added"}</p>
      </div>

      <div className="mt-6 flex gap-3">
        <Link href="/institution/onboarding" className="rounded-md bg-accent px-5 py-3 text-small font-semibold text-on-accent hover:bg-accent-deep">
          Edit details
        </Link>
        <Link href="/institution/dashboard" className="rounded-md border border-rule px-5 py-3 text-small font-semibold text-ink hover:bg-paper-deep">
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
