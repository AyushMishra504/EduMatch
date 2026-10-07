import { devSignIn } from "@/app/dev/actions";

// ---------------------------------------------------------------------------
// DEV ONLY — temporary "skip login" shortcut for previewing the educator
// profile wizard without Google OAuth. Renders nothing in production.
// Delete this file + src/app/dev/actions.ts when done.
// ---------------------------------------------------------------------------

export function DevSignInButton() {
  if (process.env.NODE_ENV === "production") return null;

  return (
    <div className="mt-4">
      <div className="flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-rule" />
        <span className="text-tiny font-semibold uppercase tracking-[0.18em] text-ink-muted">
          Dev only
        </span>
        <span className="h-px flex-1 bg-rule" />
      </div>
      <form action={devSignIn} className="mt-4">
        <button
          type="submit"
          className="flex h-11 w-full items-center justify-center gap-2 rounded-md border border-dashed border-amber-600/50 bg-amber-50 text-small font-semibold text-ink transition-colors hover:bg-amber-100 dark:bg-amber-950/20 dark:hover:bg-amber-950/40"
        >
          Skip login → Educator setup
        </button>
      </form>
      <p className="mt-2 text-center text-tiny leading-relaxed text-ink-muted">
        Temporary shortcut. Signs in a local dev account — remove before
        launch.
      </p>
    </div>
  );
}
