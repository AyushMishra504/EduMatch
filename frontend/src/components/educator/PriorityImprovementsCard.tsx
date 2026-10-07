import Link from "next/link";
import type { MissingItem } from "@/lib/educator/completeness";

/**
 * Profile's "next best action" list. Reads the weight-sorted missing[]
 * from computeCompleteness (already a de-facto priority queue), so the
 * copy stays in one place. Deep-links land on the wizard step directly —
 * the step guard no longer redirects them.
 */
export function PriorityImprovementsCard({
  missing,
}: {
  missing: MissingItem[];
}) {
  if (missing.length === 0) return null;
  const top = missing.slice(0, 3);

  return (
    <section className="rounded-md border border-rule bg-paper p-5">
      <p className="text-small font-semibold text-ink">
        {top.length === 1 ? "One way to improve" : `${top.length} ways to improve`}
      </p>
      <p className="mt-1 text-tiny leading-relaxed text-ink-muted">
        Your next best improvements — each takes about a minute, and nothing
        here blocks using EduMatch.
      </p>
      <ul className="mt-3 space-y-2.5">
        {top.map((item) => (
          <li key={item.label}>
            <Link
              href={`/onboarding/educator/${item.step}`}
              className="group block rounded-md border border-transparent px-2 -mx-2 py-1.5 transition-colors hover:border-rule hover:bg-paper-deep"
            >
              <span className="text-small font-medium text-accent group-hover:text-accent-deep">
                + {item.label}
              </span>
              <span className="mt-0.5 block text-tiny leading-relaxed text-ink-muted">
                {item.why}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {missing.length > top.length ? (
        <p className="mt-3 text-tiny text-ink-muted">
          …and {missing.length - top.length} more once these are done.
        </p>
      ) : null}
    </section>
  );
}
