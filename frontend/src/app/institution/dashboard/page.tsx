import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function InstitutionDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      role: true,
      name: true,
      email: true,
      institutionProfile: {
        include: { jobOpenings: { orderBy: { createdAt: "desc" } } },
      },
    },
  });

  if (!user || user.role !== "INSTITUTION") redirect("/onboarding");

  const profile = user.institutionProfile;
  if (!profile) redirect("/institution/onboarding");

  const jobs = profile.jobOpenings;
  const publishedJobs = jobs.filter((job) => job.status !== "DRAFT").length;

  return (
    <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8 lg:py-16">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-tiny font-semibold uppercase tracking-[0.18em] text-accent">
            Institution workspace
          </p>
          <h1 className="mt-2 font-serif text-3xl font-medium text-ink">
            {profile.name ?? "Your institution"}
          </h1>
        </div>
        <Link
          href="/institution/jobs/new"
          className="rounded-md bg-accent px-4 py-2 text-small font-semibold text-on-accent hover:bg-accent-deep"
        >
          Post a role
        </Link>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-md border border-rule bg-paper p-5">
          <p className="text-tiny uppercase tracking-[0.18em] text-ink-muted">Profiles</p>
          <p className="mt-3 font-serif text-h3 text-ink">0</p>
          <p className="mt-1 text-small text-ink-muted">Matches in your shortlist</p>
        </div>
        <div className="rounded-md border border-rule bg-paper p-5">
          <p className="text-tiny uppercase tracking-[0.18em] text-ink-muted">Open roles</p>
          <p className="mt-3 font-serif text-h3 text-ink">{profile.jobOpenings.length}</p>
          <p className="mt-1 text-small text-ink-muted">Drafts and published listings</p>
        </div>
        <div className="rounded-md border border-rule bg-paper p-5">
          <p className="text-tiny uppercase tracking-[0.18em] text-ink-muted">Published</p>
          <p className="mt-3 font-serif text-h3 text-ink">{publishedJobs}</p>
          <p className="mt-1 text-small text-ink-muted">Live opportunities</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <section className="rounded-md border border-rule bg-paper p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-medium text-ink">Recent roles</h2>
            <Link href="/institution/jobs" className="text-small font-semibold text-accent">
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {profile.jobOpenings.length > 0 ? (
              profile.jobOpenings.slice(0, 4).map((job) => (
                <div key={job.id} className="rounded-md border border-rule bg-paper-deep p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-ink">{job.title}</p>
                      <p className="text-small text-ink-muted">{job.department ?? "General"}</p>
                    </div>
                    <span className="rounded-full border border-rule px-2 py-1 text-tiny font-semibold text-ink-muted">
                      {job.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-small text-ink-muted">
                You have not posted any roles yet. Create your first opportunity to start matching educators.
              </p>
            )}
          </div>
        </section>

        <aside className="space-y-5">
          <div className="rounded-md border border-rule bg-paper p-5">
            <h2 className="font-serif text-xl font-medium text-ink">Profile</h2>
            <div className="mt-3 space-y-2 text-small text-ink-muted">
              <p>{profile.name ?? "Institution name not set"}</p>
              <p>{profile.city ?? "City not set"}</p>
              <p>{profile.contactEmail ?? user.email ?? "Contact email not set"}</p>
            </div>
            <Link href="/institution/profile" className="mt-4 inline-block text-small font-semibold text-accent">
              Edit institution profile
            </Link>
          </div>

          <div className="rounded-md border border-rule bg-paper p-5">
            <h2 className="font-serif text-xl font-medium text-ink">Next actions</h2>
            <ul className="mt-3 space-y-2 text-small text-ink-muted">
              <li>• Complete institution profile details</li>
              <li>• Post an opening to attract educators</li>
              <li>• Review matched educator profiles</li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}
