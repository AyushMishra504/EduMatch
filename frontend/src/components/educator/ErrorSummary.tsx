/**
 * Shown when a step's server action returns field errors. Without this, a
 * validation failure is invisible if the offending input is off-screen — the
 * form looks like it did nothing. Focuses the summary on appearance and
 * lists every error as a link to its field.
 */
export function ErrorSummary({
  errors,
  formError,
}: {
  errors?: Record<string, string[] | undefined>;
  formError?: string;
}) {
  const entries = Object.entries(errors ?? {}).filter(([, msgs]) => msgs?.[0]);
  if (entries.length === 0 && !formError) return null;

  return (
    <div
      tabIndex={-1}
      role="alert"
      aria-labelledby="error-summary-heading"
      className="rounded-md border border-red-700/25 bg-red-50 p-4 dark:bg-red-950/20"
    >
      <h2
        id="error-summary-heading"
        className="text-base font-semibold text-ink"
      >
        {entries.length > 1
          ? `${entries.length} things need fixing.`
          : "One thing needs fixing."}
      </h2>
      {formError ? (
        <p className="mt-1 text-small text-ink-muted">{formError}</p>
      ) : null}
      {entries.length > 0 ? (
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {entries.map(([field, msgs]) => (
            <li key={field} className="text-small">
              <a
                href={`#${field}`}
                className="font-medium text-red-700 underline underline-offset-2 hover:text-red-800"
              >
                {msgs![0]}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}