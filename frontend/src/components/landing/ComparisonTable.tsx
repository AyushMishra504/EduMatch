"use client";

import { CheckCircle2, X } from "lucide-react";
import { useInView } from "@/hooks/useInView";

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
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <section id="why-choose" className="relative scroll-mt-16 border-t border-rule bg-[#195532]">
      {/* Dot Grid Background */}
      <div className="pointer-events-none absolute inset-0 dot-grid opacity-10" aria-hidden="true" />
      
      <div ref={ref} className="relative z-10 mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
        <div
          data-inview="slide-up"
          className={`flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between ${inView ? "in-view" : ""}`}
        >
          <div>
            <p className="text-tiny font-semibold uppercase tracking-[0.18em] text-[#e3d8c8]/60">
              04 — Why change
            </p>
            <h2 className="mt-4 font-serif font-medium text-h2 text-[#e3d8c8]">
              Hiring faculty shouldn&apos;t take a season.
            </h2>
          </div>
          <p className="max-w-md text-body text-[#e3d8c8]/80">
            The old route works — slowly, opaquely, and on paper. EduMatch
            keeps the rigor, norms, and human review. It just removes the
            noise around them.
          </p>
        </div>

        <div className="mt-12 rounded-3xl bg-white/[0.03] p-6 shadow-2xl ring-1 ring-white/10 backdrop-blur-sm sm:p-10">
          <div className="hidden grid-cols-12 gap-4 text-tiny font-semibold uppercase tracking-[0.16em] lg:grid pb-4">
            <div className="col-span-2" aria-hidden="true" />
            <div className="col-span-5 text-[#e3d8c8]/50">Traditional hiring</div>
            <div className="col-span-5 text-[#e3d8c8]">EduMatch</div>
          </div>

          <ul className="divide-y divide-white/10">
            {ROWS.map(({ criteria, traditional, edumatch }, i) => (
              <li
                key={criteria}
                data-inview="slide-up"
                className={`grid gap-4 py-5 lg:grid-cols-12 lg:items-start lg:gap-4 px-4 -mx-4 rounded-xl transition-all duration-300 hover:bg-black/10 hover:shadow-md ${inView ? "in-view" : ""}`}
                style={{ "--delay": `${100 + i * 60}ms` } as React.CSSProperties}
              >
                <div className="lg:col-span-2">
                  <p className="text-small font-semibold capitalize text-[#e3d8c8]">
                    {criteria}
                  </p>
                </div>

                <div className="flex gap-3 lg:col-span-5">
                  <X
                    size={16}
                    className="mt-0.5 shrink-0 text-[#e3d8c8]/40"
                    aria-hidden="true"
                  />
                  <p className="text-small text-[#e3d8c8]/60 line-through decoration-white/30">
                    {traditional}
                  </p>
                </div>

                <div className="flex gap-3 lg:col-span-5">
                  <CheckCircle2
                    size={16}
                    className="mt-0.5 shrink-0 text-[#e3d8c8]"
                    aria-hidden="true"
                  />
                  <p className="text-small font-medium text-[#e3d8c8]">{edumatch}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}