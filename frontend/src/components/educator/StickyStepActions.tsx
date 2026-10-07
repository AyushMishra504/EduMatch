"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

/**
 * Reusable step footer. Must be rendered *inside* the step <form> so
 * useFormStatus reflects the real submit state — the status text never
 * claims a save the server hasn't confirmed.
 *
 * Destination intents: primary button = next step; intent=profile saves
 * then returns to /profile; intent=exit saves then goes to the dashboard.
 */
export function StickyStepActions({
  backHref,
  continueLabel,
  continueLabelShort,
  dirty,
  showSaveExit = true,
  showSaveProfile = false,
  showSkip = true,
  skipLabel = "Skip for now",
  extra,
}: {
  backHref: string;
  continueLabel: string;
  continueLabelShort: string;
  dirty: boolean;
  showSaveExit?: boolean;
  /** Renders "Save & back to profile" (intent=profile) — editing mode. */
  showSaveProfile?: boolean;
  /** Renders a "Skip for now" submit that saves nothing and advances. */
  showSkip?: boolean;
  skipLabel?: string;
  extra?: React.ReactNode;
}) {
  const { pending } = useFormStatus();
  const status = pending ? "Saving…" : dirty ? "Unsaved changes" : null;

  return (
    <div className="sticky bottom-0 -mx-5 border-t border-rule bg-paper/95 px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:px-0 lg:pb-0 lg:pt-2">
      {status ? (
        <p className="text-small text-ink-muted" aria-live="polite">
          {status}
        </p>
      ) : null}
      {extra}
      <nav className="mt-2 flex items-center justify-between gap-3">
        <Link
          href={backHref}
          className="rounded-md border border-rule px-4 py-2.5 text-base font-semibold text-ink transition-colors hover:bg-paper-deep sm:px-5 sm:py-3"
        >
          ← Back
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          {showSaveExit ? (
            <button
              type="submit"
              name="intent"
              value="exit"
              disabled={pending}
              className="hidden rounded-md px-3 py-2.5 text-base font-semibold text-ink-muted transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-60 sm:block sm:px-4 sm:py-3"
            >
              Save &amp; exit
            </button>
          ) : null}
          {showSaveProfile ? (
            <button
              type="submit"
              name="intent"
              value="profile"
              disabled={pending}
              className="rounded-md px-3 py-2.5 text-base font-semibold text-ink-muted transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:py-3"
            >
              <span className="hidden sm:inline">Save &amp; back to profile</span>
              <span className="sm:hidden">Save &amp; back</span>
            </button>
          ) : null}
          {showSkip ? (
            <button
              type="submit"
              name="intent"
              value="skip"
              disabled={pending}
              className="rounded-md px-3 py-2.5 text-base font-semibold text-ink-muted transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:py-3"
            >
              {skipLabel}
            </button>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-accent px-4 text-base font-semibold text-on-accent transition-colors hover:bg-accent-deep disabled:cursor-not-allowed disabled:opacity-60 sm:px-5"
          >
            {pending ? (
              <>
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                Saving…
              </>
            ) : (
              <>
                <span className="hidden sm:inline">{continueLabel}</span>
                <span className="sm:hidden">{continueLabelShort}</span>
              </>
            )}
          </button>
        </div>
      </nav>
    </div>
  );
}
