import { CheckCircle2, X } from "lucide-react";

const ROWS = [
  {
    criteria: "Applying",
    traditional: "Newspaper ads and a printed 50-page dossier, posted by hand.",
    edumatch: "One cloud profile used for every application.",
  },
  {
    criteria: "Verification",
    traditional: "Paper claims you verify again and again.",
    edumatch: "Credentials structured, syncable to ORCID and Scopus.",
  },
  {
    criteria: "Fit",
    traditional: "Hundreds of CVs sorted by committee members by hand.",
    edumatch: "Criteria-based matching on teaching, research, and location.",
  },
  {
    criteria: "Pay",
    traditional: "Pay band revealed only at the interview stage.",
    edumatch: "Pay scale disclosed on the role itself.",
  },
  {
    criteria: "Communication",
    traditional: "Months of silence after you apply.",
    edumatch: "Committee status updates in the open.",
  },
  {
    criteria: "Discretion",
    traditional: "A scouting search is hard to keep quiet.",
    edumatch: "Confidential search mode for sensitive roles.",
  },
];

export function ComparisonTable() {
  return (
    <section id="why-choose" className="scroll-mt-16 border-t border-rule">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-tiny font-semibold uppercase tracking-[0.18em] text-accent">
              04 — Why change
            </p>
            <h2 className="mt-4 font-serif font-medium text-h2 text-ink">
              Hiring faculty shouldn’t take a season.
            </h2>
          </div>
          <p className="max-w-md text-body text-ink-muted">
            The old route works — slowly, opaquely, and on paper. EduMatch
            keeps the rigor, norms, and human review. It just removes the
            noise around them.
          </p>
        </div>

        <div className="mt-10 hidden grid-cols-12 gap-4 text-tiny font-semibold uppercase tracking-[0.16em] lg:grid">
          <div className="col-span-2" aria-hidden="true" />
          <div className="col-span-5 text-ink-muted">Traditional hiring</div>
          <div className="col-span-5 text-accent">EduMatch</div>
        </div>

        <ul className="mt-4 divide-y divide-rule border-y border-rule">
          {ROWS.map(({ criteria, traditional, edumatch }) => (
            <li
              key={criteria}
              className="grid gap-4 py-5 lg:grid-cols-12 lg:items-start lg:gap-4"
            >
              <div className="lg:col-span-2">
                <p className="text-small font-semibold capitalize text-ink">
                  {criteria}
                </p>
              </div>

              <div className="flex gap-3 lg:col-span-5">
                <X
                  size={16}
                  className="mt-0.5 shrink-0 text-ink-muted/70"
                  aria-hidden="true"
                />
                <p className="text-small text-ink-muted line-through decoration-ink-muted/40">
                  {traditional}
                </p>
              </div>

              <div className="flex gap-3 lg:col-span-5">
                <CheckCircle2
                  size={16}
                  className="mt-0.5 shrink-0 text-accent"
                  aria-hidden="true"
                />
                <p className="text-small font-medium text-ink">{edumatch}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}