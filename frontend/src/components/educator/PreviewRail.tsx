import { EducatorProfilePreview } from "./EducatorProfilePreview";

/**
 * Right rail (desktop) / stacked contextual card (mobile): live preview +
 * Profile-readiness progress + an optional one-line "why we ask" note +
 * step-specific extras (e.g. market signal). Encourages without grading.
 */
export function PreviewRail({
  name,
  imageUrl,
  headline,
  location,
  tags,
  footnote,
  percent,
  remaining,
  extra,
}: {
  name?: string | null;
  imageUrl?: string | null;
  headline?: string | null;
  location?: string | null;
  tags?: string[];
  footnote?: string | null;
  percent: number;
  remaining: number;
  extra?: React.ReactNode;
}) {
  const encouragement =
    remaining === 0
      ? "Ready to publish."
      : percent >= 70
        ? "Almost there."
        : `${remaining} detail${remaining === 1 ? "" : "s"} to go.`;

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-base font-semibold uppercase tracking-[0.18em] text-ink-muted">
          Your profile
        </p>
        <EducatorProfilePreview
          name={name}
          imageUrl={imageUrl}
          headline={headline}
          location={location}
          tags={tags}
          footnote={footnote}
        />
      </div>

      <div className="rounded-md border border-rule bg-paper p-4">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-base font-semibold text-ink">Profile readiness</p>
          <p className="font-serif text-xl font-medium text-ink">{percent}%</p>
        </div>
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-rule"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Profile readiness ${percent} percent`}
        >
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="mt-2 text-small leading-relaxed text-ink-muted">
          {encouragement}
        </p>
      </div>

      {extra}
    </div>
  );
}
