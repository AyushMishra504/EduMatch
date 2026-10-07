"use client";

import { useEffect, useRef } from "react";
import { ErrorSummary } from "./ErrorSummary";
import type { ActionState } from "@/lib/educator/action-state";

/**
 * Wraps a step's server-action form. Renders the error summary at the top and
 * moves focus to it whenever a new error set arrives, so a rejected save is
 * impossible to miss (previously an off-screen error looked like a no-op).
 *
 * `onDirty` is intentionally NOT used — callers pass their own formAction, so
 * this only owns the error presentation.
 */
export function ValidatedForm({
  state,
  formAction,
  onDirty,
  className,
  children,
}: {
  state: ActionState;
  formAction: (payload: FormData) => void;
  onDirty: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  const summaryRef = useRef<HTMLDivElement>(null);
  const errorCount = Object.values(state.fieldErrors ?? {}).filter(
    (m) => m?.[0],
  ).length;
  const signature = `${errorCount}:${state.formError ?? ""}`;

  useEffect(() => {
    if (errorCount === 0 && !state.formError) return;
    summaryRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    summaryRef.current?.focus();
  }, [signature, errorCount, state.formError]);

  return (
    <form action={formAction} onChange={onDirty} className={className}>
      <div ref={summaryRef} tabIndex={-1} className="focus:outline-none">
        <ErrorSummary errors={state.fieldErrors} formError={state.formError} />
      </div>
      {children}
    </form>
  );
}