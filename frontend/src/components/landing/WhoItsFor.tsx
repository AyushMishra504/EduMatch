"use client";

import { useInView } from "@/hooks/useInView";

const AUDIENCES = [
  "Central & State Universities",
  "Institutes of National Importance",
  "Deemed & Private Universities",
  "Autonomous & Affiliated Colleges",
  "Career educators & researchers",
];

export function WhoItsFor() {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <section className="relative border-t border-rule bg-gradient-to-b from-paper to-paper-deep">
      <div
        ref={ref}
        className="relative z-10 mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24"
      >
        <p
          data-inview="slide-up"
          className={`text-tiny font-semibold uppercase tracking-[0.18em] text-accent ${inView ? "in-view" : ""}`}
          style={{ "--delay": "0ms" } as React.CSSProperties}
        >
          Who it&apos;s for
        </p>
        <h2
          data-inview="slide-up"
          className={`mt-4 max-w-2xl font-serif font-medium text-h2 text-ink ${inView ? "in-view" : ""}`}
          style={{ "--delay": "80ms" } as React.CSSProperties}
        >
          Being built with Indian higher education in mind.
        </h2>
        <p
          data-inview="slide-up"
          className={`mt-4 max-w-xl text-body text-ink-muted ${inView ? "in-view" : ""}`}
          style={{ "--delay": "140ms" } as React.CSSProperties}
        >
          We&apos;re designing EduMatch to serve the institutions and people who
          make up faculties across the country — not a few famous names.
        </p>

        <ul className="mt-10 grid gap-x-10 gap-y-4 border-t border-rule pt-8 sm:grid-cols-2 lg:grid-cols-3">
          {AUDIENCES.map((audience, i) => (
            <li
              key={audience}
              data-inview="fade-scale"
              className={`flex items-center gap-3 text-small ${inView ? "in-view" : ""}`}
              style={{ "--delay": `${200 + i * 60}ms` } as React.CSSProperties}
            >
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