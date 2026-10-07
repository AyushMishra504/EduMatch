/**
 * Slim progress indicator: "Step N of 6" + bar. Deliberately not a giant
 * list of all six steps — the user should feel guided, not processed.
 */
export function StepProgress({
  current,
  total,
  label,
}: {
  current: number;
  total: number;
  label: string;
}) {
  const pct = Math.round((current / total) * 100);
  return (
    <div>
      <p className="text-small font-medium text-ink">
        Step {current} of {total} · {label}
      </p>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-rule"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`Step ${current} of ${total}: ${label}`}
      >
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
