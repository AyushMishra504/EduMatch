import { OptionalBadge } from "./OptionalBadge";

/**
 * Standard step intro: eyebrow + title + one-line reason + effort.
 * Keeps every screen consistent; explanations stay at 1–2 sentences.
 */
export function StepHeader({
  eyebrow,
  title,
  description,
  optional,
}: {
  eyebrow: string;
  title: string;
  description: string;
  optional?: boolean;
}) {
  return (
    <div>
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-small font-semibold uppercase tracking-[0.18em] text-accent">
        <span>{eyebrow}</span>
        {optional ? <OptionalBadge /> : null}
      </p>
      <h1 className="mt-2 font-serif text-3xl font-medium text-ink">{title}</h1>
      <p className="mt-2 max-w-xl text-base leading-relaxed text-ink-muted">
        {description}
      </p>
    </div>
  );
}
