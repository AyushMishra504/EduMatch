import Link from "next/link";
import { redirect } from "next/navigation";
import { requireEducatorWithUser } from "@/lib/educator/profile";
import { Wordmark } from "@/components/Logo";
import { MinimalOnboardingForm } from "@/components/onboarding/MinimalOnboardingForm";
import { ResumeImportCard } from "@/components/educator/ResumeImportCard";

export const dynamic = "force-dynamic";

/**
 * Minimal educator onboarding — the single screen between role selection
 * and the product. Collects only what pays off immediately: discipline
 * (required, seeds the match estimate) and employment types (optional).
 * Everything else is enriched later from /profile.
 *
 * Reachable only via setRole's redirect (or a browser Back after it); the
 * /onboarding role gate sends returning educators straight to /dashboard.
 */
export default async function MinimalOnboardingPage() {
  const { profile } = await requireEducatorWithUser();
  // Published profiles are done with setup — publishing stays editable
  // from /profile, never re-entered here.
  if (profile.visibility === "PUBLISHED") redirect("/dashboard");

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col px-5 py-8 sm:px-0">
      <header className="flex items-center justify-between border-b border-rule py-4">
        <Link href="/" aria-label="EduMatch home">
          <Wordmark size={24} />
        </Link>
        <Link
          href="/dashboard"
          className="text-small font-semibold text-accent transition-colors hover:text-accent-deep"
        >
          Finish later →
        </Link>
      </header>

      <div className="flex flex-1 flex-col justify-center gap-4 py-10">
        <ResumeImportCard
          title="Have your CV handy?"
          description="Upload it once — we'll prefill what we can. Review and edit everything below."
        />
        <div className="border border-rule bg-paper p-7 shadow-card sm:p-9">
          <p className="text-tiny font-semibold uppercase tracking-[0.18em] text-accent">
            You&apos;re almost in
          </p>
          <h1 className="mt-3 font-serif text-h3 font-medium text-ink">
            What do you teach?
          </h1>
          <p className="mt-3 text-small leading-relaxed text-ink-muted">
            One quick answer shapes what you see first — you can change it
            anytime from your profile.
          </p>
          <MinimalOnboardingForm
            key={profile.updatedAt.getTime()}
            initialDiscipline={profile.discipline}
            initialEmploymentTypes={[...profile.employmentTypes]}
            savedAtMs={profile.updatedAt.getTime()}
          />
        </div>
      </div>
    </main>
  );
}
