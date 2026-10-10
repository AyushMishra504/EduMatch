import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function InstitutionJobsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      role: true,
      institutionProfile: {
        include: {
          jobOpenings: {
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  if (!user || user.role !== "INSTITUTION") redirect("/onboarding");
  if (!user.institutionProfile) redirect("/institution/onboarding");

  const jobs = user.institutionProfile.jobOpenings;

  return (
    <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8 lg:py-16">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-tiny font-semibold uppercase tracking-[0.18em] text-accent">Roles</p>
          <h1 className="mt-2 font-serif text-h2 font-medium text-ink">Openings</h1>
        </div>
        <Link href="/institution/jobs/new" className="rounded-md bg-accent px-5 py-3 text-small font-semibold text-on-accent hover:bg-accent-deep">
          Post role
        </Link>
      </div>

      <div className="mt-8 space-y-4">
        {jobs.length === 0 ? (
          <div className="rounded-md border border-dashed border-rule bg-paper p-6 text-small text-ink-muted">
            No vacancies yet. Build your first teaching role posting.
          </div>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="rounded-md border border-rule bg-paper p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-ink">{job.title}</p>
                  <p className="text-small text-ink-muted">{job.location ?? "Remote"} • {job.employmentType ?? "Flexible"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-rule bg-white px-2 py-1 text-tiny font-medium text-ink-muted">{job.status}</span>
                  <Link href={`/institution/jobs/${job.id}`} className="text-small font-semibold text-accent">Manage</Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
