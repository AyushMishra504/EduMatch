"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check } from "lucide-react";
import { Wordmark } from "@/components/Logo";
import { STEPS, TOTAL_STEPS } from "@/lib/educator/constants";
import { StepProgress } from "./StepProgress";

/**
 * Builder chrome: slim global header + compact progress + understated step
 * indicator. No giant six-step list — completed steps are quiet links,
 * the current step is highlighted, future steps stay muted and locked.
 */
export function BuilderShell({
  completedSteps,
  children,
}: {
  completedSteps: number;
  children: React.ReactNode;
}) {
  const segment = usePathname().split("/").at(-1);
  const current = Number(segment) || 1;
  const currentLabel = STEPS.find((s) => s.n === current)?.label ?? "";

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
        <ol className="mt-4 hidden flex-wrap gap-x-5 gap-y-1.5 lg:flex" aria-label="Setup progress">
          {STEPS.map((step) => {
            const complete = step.n <= completedSteps;
            const active = step.n === current;
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
                  {complete ? <Check size={11} strokeWidth={3} /> : step.n}
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
                {complete || active ? (
                  <Link
                    href={`/onboarding/educator/${step.n}`}
                    aria-current={active ? "step" : undefined}
                    className={`${cls} transition-colors hover:text-ink`}
                  >
                    {content}
                  </Link>
                ) : (
                  <span aria-disabled="true" className={`${cls} opacity-60`}>
                    {content}
                  </span>
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
