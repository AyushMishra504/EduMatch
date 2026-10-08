"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, Lock } from "lucide-react";
import { Wordmark } from "@/components/Logo";
import { STEPS, TOTAL_STEPS } from "@/lib/educator/constants";
import { StepProgress } from "./StepProgress";

/**
 * Builder chrome: slim global header + progress + an ordered step indicator.
 *
 * The flow is guided, not free-roam: steps past `maxReachable` are rendered
 * as locked (no link), completed steps are quiet links you can revisit, the
 * active step is highlighted, and optional steps never show a completion tick.
 * A caption names the next thing to unlock so the path is always obvious.
 */
export function BuilderShell({
  completedThrough,
  maxReachable,
  children,
}: {
  /** Last step whose required facts are complete (drives the ticks). */
  completedThrough: number;
  /** Furthest step the user may open. */
  maxReachable: number;
  children: React.ReactNode;
}) {
  const segment = usePathname().split("/").at(-1);
  const current = Number(segment) || 1;
  const currentLabel = STEPS.find((s) => s.n === current)?.label ?? "";
  const nextLocked = STEPS.find((s) => s.n === maxReachable + 1);

  return (
    <div className="mx-auto max-w-6xl px-5 pb-16 sm:px-8">
      <header className="flex items-center justify-between gap-3 border-b border-rule py-4">
        <Link href="/" aria-label="EduMatch home">
          <Wordmark size={24} />
        </Link>
        <div className="flex items-center gap-4">
          <p className="hidden text-small font-medium text-ink-muted sm:block">
            Profile setup
          </p>
          <Link
            href="/dashboard"
            className="text-small font-semibold text-accent transition-colors hover:text-accent-deep"
          >
            Finish later →
          </Link>
        </div>
      </header>

      <div className="mt-6">
        <StepProgress current={current} total={TOTAL_STEPS} label={currentLabel} />
        {nextLocked ? (
          <p className="mt-2 text-small text-ink-muted">
            Finish this step to unlock{" "}
            <span className="font-medium text-ink">{nextLocked.label}</span>
            {nextLocked.required ? "" : " (optional)"}.
          </p>
        ) : (
          <p className="mt-2 text-small text-ink-muted">
            Every section is unlocked — review and publish when you&apos;re ready.
          </p>
        )}
        <ol
          className="mt-4 hidden flex-wrap gap-x-5 gap-y-1.5 lg:flex"
          aria-label="Setup progress"
        >
          {STEPS.map((step) => {
            const complete = step.required && step.n <= completedThrough;
            const active = step.n === current;
            const isLocked = step.n > maxReachable;
            const content = (
              <>
                <span
                  aria-hidden="true"
                  className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-small font-semibold ${
                    complete
                      ? "bg-accent text-on-accent"
                      : active
                        ? "border-2 border-accent text-accent"
                        : "border border-rule text-ink-muted"
                  }`}
                >
                  {complete ? (
                    <Check size={11} strokeWidth={3} />
                  ) : isLocked ? (
                    <Lock size={10} strokeWidth={2.5} />
                  ) : (
                    step.n
                  )}
                </span>
                <span>{step.label}</span>
                {!step.required ? (
                  <span className="text-small text-ink-muted">· Optional</span>
                ) : null}
              </>
            );
            const cls = `flex items-center gap-1.5 text-small font-medium ${
              active ? "text-accent" : "text-ink-muted"
            }`;
            return (
              <li key={step.n}>
                {isLocked ? (
                  <span
                    aria-disabled="true"
                    title="Finish the earlier steps to unlock this one"
                    className={`${cls} opacity-50`}
                  >
                    {content}
                  </span>
                ) : (
                  <Link
                    href={`/onboarding/educator/${step.n}`}
                    aria-current={active ? "step" : undefined}
                    className={`${cls} transition-colors hover:text-ink`}
                  >
                    {content}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mt-8">{children}</div>
    </div>
  );
}
