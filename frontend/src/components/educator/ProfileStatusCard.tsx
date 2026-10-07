import Link from "next/link";
import { MatchRing } from "@/components/3d/MatchRing";
import type { MissingItem } from "@/lib/educator/completeness";

export function ProfileStatusCard({
  visibility,
  percent,
  missing,
}: {
  visibility: "DRAFT" | "PUBLISHED";
  percent: number;
  missing: MissingItem[];
}) {
  if (visibility === "PUBLISHED" && percent === 100) {
    return (
      <p className="mt-6 text-small text-ink-muted">
        Your profile is live and complete.
      </p>
    );
  }

  if (visibility === "DRAFT") {
    return (
      <div className="mt-8 w-full rounded-md border border-amber-600/30 bg-amber-50 p-5 text-left dark:bg-amber-950/20">
        <div className="flex items-center gap-4">
          <MatchRing value={percent} label="ready" size={64} />
          <div>
            <p className="text-small font-semibold text-ink">
              Your profile is ready to use.
            </p>
            <p className="mt-1 text-small text-ink-muted">
              {missing.length > 0
                ? `Your profile is taking shape — ${missing.length} useful detail${missing.length === 1 ? "" : "s"} remain${missing.length === 1 ? "s" : ""}.`
                : "A few details can improve it."}
            </p>
            {missing.length > 0 ? (
              <ul className="mt-1 space-y-0.5">
                {missing.slice(0, 2).map((item) => (
                  <li key={item.label}>
                    <Link
                      href={`/onboarding/educator/${item.step}`}
                      className="text-tiny font-medium text-accent hover:text-accent-deep"
                    >
                      → {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
        <Link
          href="/profile"
          className="mt-4 inline-block rounded-md bg-accent px-5 py-2.5 text-small font-semibold text-on-accent transition-colors hover:bg-accent-deep"
        >
          Complete your profile
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 w-full rounded-md border border-rule bg-paper p-5 text-left">
      <div className="flex items-center gap-4">
        <MatchRing value={percent} label="ready" size={64} />
        <div>
          <p className="text-small font-semibold text-ink">
            You&apos;re live. Profile readiness {percent}%.
          </p>
          {missing.length > 0 ? (
            <p className="mt-1 text-tiny text-ink-muted">
              {missing.length} useful detail{missing.length === 1 ? "" : "s"} remaining.
            </p>
          ) : null}
          {missing.length > 0 ? (
            <ul className="mt-1 space-y-0.5">
              {missing.slice(0, 2).map((item) => (
                <li key={item.label}>
                  <Link
                    href={`/onboarding/educator/${item.step}`}
                    className="text-tiny font-medium text-accent hover:text-accent-deep"
                  >
                    → {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
      <Link
        href="/profile"
        className="mt-4 inline-block rounded-md border border-rule px-5 py-2.5 text-small font-semibold text-ink transition-colors hover:bg-paper-deep"
      >
        Improve profile
      </Link>
    </div>
  );
}
