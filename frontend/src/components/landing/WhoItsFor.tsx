const AUDIENCES = [
  "Central & State Universities",
  "Institutes of National Importance",
  "Deemed & Private Universities",
  "Autonomous & Affiliated Colleges",
  "Career educators & researchers",
];

export function WhoItsFor() {
  return (
    <section className="border-t border-rule bg-paper-deep">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
        <p className="text-tiny font-semibold uppercase tracking-[0.18em] text-accent">
          Who it&apos;s for
        </p>
        <h2 className="mt-4 max-w-2xl font-serif font-medium text-h2 text-ink">
          Being built with Indian higher education in mind.
        </h2>
        <p className="mt-4 max-w-xl text-body text-ink-muted">
          We&apos;re designing EduMatch to serve the institutions and people who
          make up faculties across the country — not a few famous names.
        </p>

        <ul className="mt-10 grid gap-x-10 gap-y-4 border-t border-rule pt-8 sm:grid-cols-2 lg:grid-cols-3">
          {AUDIENCES.map((audience) => (
            <li key={audience} className="flex items-center gap-3 text-small">
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                aria-hidden="true"
              />
              <span className="font-medium text-ink">{audience}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}