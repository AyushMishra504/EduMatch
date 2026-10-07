import Link from "next/link";
import { redirect } from "next/navigation";
import { requireEducatorProfile } from "@/lib/educator/profile";
import { STEPS, TOTAL_STEPS } from "@/lib/educator/constants";
import { computeCompleteness } from "@/lib/educator/completeness";
import { skipStep4 } from "../actions";

export default async function EducatorOnboarding() {
  const profile = await requireEducatorProfile();
  if (profile.visibility === "PUBLISHED") redirect("/dashboard");

  const next = Math.min(profile.completedSteps + 1, TOTAL_STEPS);
  // Fresh profiles skip the resume interstitial — they come back through
  // /dashboard (role gate) or /onboarding/educator/start (first run).
  if (profile.completedSteps === 0) redirect("/dashboard");

  const { percent } = computeCompleteness(profile);
  const stepLabel = STEPS[next - 1]?.label ?? "";

  return (
    <main className="mx-auto max-w-xl py-10">
      <p className="text-tiny font-semibold uppercase tracking-[0.18em] text-accent">
        Welcome back
      </p>
      <h1 className="mt-2 font-serif text-3xl font-medium text-ink">
        You&apos;re {percent}% through your profile.
      </h1>
      <p className="mt-2 text-small leading-relaxed text-ink-muted">
        {next === 4
          ? "You were on Research — that section is optional."
          : `You were on ${stepLabel}. Pick up right where you left off.`}
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link
          href={`/onboarding/educator/${next}`}
          className="rounded-md bg-accent px-5 py-3 text-small font-semibold text-on-accent transition-colors hover:bg-accent-deep"
        >
          Continue where you left off →
        </Link>
        {next === 4 ? (
          <form action={skipStep4}>
            <button
              type="submit"
              className="rounded-md border border-rule px-5 py-3 text-small font-semibold text-ink transition-colors hover:bg-paper-deep"
            >
              Skip research
            </button>
          </form>
        ) : null}
      </div>
    </main>
  );
}
