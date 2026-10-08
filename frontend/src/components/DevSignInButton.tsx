import { devSignIn } from "@/app/dev/actions";

// ---------------------------------------------------------------------------
// DEV ONLY — temporary "skip login" shortcut so the educator wizard and the
// Playwright suite can run without Google OAuth. Renders nothing in
// production. Remove together with src/app/dev/actions.ts when a real
// sign-in path is usable in automated tests.
// ---------------------------------------------------------------------------

export function DevSignInButton() {
  if (process.env.NODE_ENV === "production") return null;

  return (
    <div className="mt-4">
      <form action={devSignIn}>
        <button
          type="submit"
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-dashed text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50"
          style={{
            borderColor: "rgba(251,191,36,0.4)",
            backgroundColor: "rgba(251,191,36,0.06)",
            color: "#fcd34d",
          }}
        >
          Skip login → Educator setup
        </button>
      </form>
      <p className="mt-1.5 text-center text-[11px] text-slate-600">
        Dev only — signs in a local test account. Removed before launch.
      </p>
    </div>
  );
}
