import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function InstitutionJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      role: true,
      institutionProfile: {
        include: {
          jobOpenings: {
            where: { id },
          },
        },
      },
    },
  });

  if (!user || user.role !== "INSTITUTION") redirect("/onboarding");
  if (!user.institutionProfile) redirect("/institution/onboarding");

  const job = user.institutionProfile.jobOpenings[0];
  if (!job) redirect("/institution/jobs");

  return (
    <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8 lg:py-16">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-tiny font-semibold uppercase tracking-[0.18em] text-accent">Role details</p>
          <h1 className="mt-2 font-serif text-h2 font-medium text-ink">{job.title}</h1>
        </div>
        <Link href="/institution/jobs" className="rounded-md border border-rule px-4 py-2 text-small font-semibold text-ink hover:bg-paper-deep">
          Back to roles
        </Link>
      </div>

      <div className="mt-8 rounded-md border border-rule bg-paper p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <p><span className="font-medium text-ink">Status:</span> {job.status}</p>
          <p><span className="font-medium text-ink">Location:</span> {job.location ?? "Not specified"}</p>
          <p><span className="font-medium text-ink">Employment type:</span> {job.employmentType ?? "Not specified"}</p>
          <p><span className="font-medium text-ink">Department:</span> {job.department ?? "General"}</p>
        </div>
        <div className="mt-6">
          <p className="font-medium text-ink">Description</p>
          <p className="mt-2 text-small leading-7 text-ink-muted">
            {job.description ?? "No description has been added for this role yet."}
          </p>
        </div>
      </div>
    </main>
  );
}
