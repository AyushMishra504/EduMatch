/**
 * Small "Optional" marker so skippable work never looks mandatory.
 */
export function OptionalBadge() {
  return (
    <span className="rounded-full border border-rule bg-paper-deep px-2 py-0.5 text-small font-medium normal-case tracking-normal text-ink-muted">
      Optional
    </span>
  );
}
