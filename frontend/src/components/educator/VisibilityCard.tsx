"use client";

import Link from "next/link";
import { useActionState } from "react";
import { toggleVisibility } from "@/app/profile/actions";

/**
 * Profile visibility card. Publishing from here runs the same
 * server-side validation as the wizard — blocking sections surface as
 * deep-links instead of a silent publish.
 */
export function VisibilityCard({ published }: { published: boolean }) {
  const [state, formAction] = useActionState(toggleVisibility, { ok: false });

  const gaps = state.missingSteps ?? [];

  return (
    <section className="rounded-md border border-rule bg-paper p-5">
      <h2 className="font-serif text-lg font-medium text-ink">Visibility</h2>
      <p className="mt-1 text-small leading-relaxed text-ink-muted">
        {published
          ? "Institutions will stop seeing your profile. You can publish again anytime."
          : "Nothing is visible to any institution until you publish."}
      </p>
      <form action={formAction} className="mt-4">
        {gaps.length > 0 ? (
          <div role="alert" className="mb-4 rounded-md border border-amber-600/30 bg-amber-50 p-4 dark:bg-amber-950/20">
            <p className="text-small font-semibold text-ink">
              Your profile needs {gaps.length} more detail
              {gaps.length === 1 ? "" : "s"} before publishing
            </p>
            <ul className="mt-2 space-y-1">
              {gaps.map((gap) => (
                <li key={gap.label}>
                  <Link
                    href={`/onboarding/educator/${gap.step}`}
                    className="text-small font-medium text-accent hover:text-accent-deep"
                  >
                    Fix: {gap.label} →
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : state.formError ? (
          <p role="alert" className="mb-4 text-small font-medium text-red-700">
            {state.formError}
          </p>
        ) : null}
        <button
          type="submit"
          className="rounded-md border border-rule px-5 py-2.5 text-small font-semibold text-ink transition-colors hover:bg-paper-deep"
        >
          {published ? "Unpublish profile" : "Publish profile"}
        </button>
        {published ? null : (
          <Link
            href="/onboarding/educator/6"
            className="ml-3 text-small font-semibold text-accent transition-colors hover:text-accent-deep"
          >
            Review before publishing →
          </Link>
        )}
      </form>
    </section>
  );
}
