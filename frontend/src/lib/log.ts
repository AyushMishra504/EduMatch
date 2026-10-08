/**
 * Minimal structured logging for server-side events.
 *
 * One JSON object per line keeps logs greppable and machine-parseable without
 * pulling in a logging dependency. Never log resume contents, tokens, or PII
 * beyond opaque ids — this mirrors the parser service's safe-logging rule.
 */
export function logEvent(
  event: string,
  fields: Record<string, unknown> = {},
): void {
  console.info(
    JSON.stringify({
      event,
      ts: new Date().toISOString(),
      ...fields,
    }),
  );
}
