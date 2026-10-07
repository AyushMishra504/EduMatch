import Image from "next/image";

/**
 * Live profile preview — the emotional core of the builder. Shows what an
 * institution will see, updating immediately from client state (no submit
 * needed). Purely presentational: pass saved values merged with local edits.
 */
export function EducatorProfilePreview({
  name,
  imageUrl,
  headline,
  location,
  tags,
  footnote,
}: {
  name?: string | null;
  imageUrl?: string | null;
  headline?: string | null;
  location?: string | null;
  tags?: string[];
  footnote?: string | null;
}) {
  const initial = (name ?? "Y").trim().charAt(0).toUpperCase() || "Y";
  return (
    <div className="rounded-md border border-rule bg-paper p-6 text-center shadow-card">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt=""
          width={72}
          height={72}
          className="mx-auto h-[72px] w-[72px] rounded-full border border-rule object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className="mx-auto grid h-[72px] w-[72px] place-items-center rounded-full border border-rule bg-paper-deep font-serif text-h3 font-medium text-ink-muted"
        >
          {initial}
        </span>
      )}
      <p className="mt-3 font-serif text-xl font-medium text-ink">
        {name?.trim() || "Your name"}
      </p>
      {headline?.trim() ? (
        <p className="mt-1 text-small text-ink-muted">{headline.trim()}</p>
      ) : (
        <p className="mt-1 text-small italic text-ink-muted/70">
          Your headline will appear here
        </p>
      )}
      {location?.trim() ? (
        <p className="mt-2 text-small font-medium text-ink-muted">{location.trim()}</p>
      ) : null}
      {tags && tags.length > 0 ? (
        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          {tags.slice(0, 6).map((tag) => (
            <span
              key={tag}
              className="rounded-sm bg-accent-tint px-2 py-1 text-small font-medium text-accent"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
      {footnote?.trim() ? (
        <p className="mt-3 border-t border-rule pt-3 text-small leading-relaxed text-ink-muted">
          {footnote.trim()}
        </p>
      ) : null}
    </div>
  );
}
