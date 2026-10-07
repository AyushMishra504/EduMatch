import { Reveal } from "@/components/landing/Reveal";

const STEPS = [
  { number: "1", label: "Upload your CV", active: true },
  { number: "2", label: "Review and edit", active: false },
  { number: "3", label: "See matching roles", active: false },
];

const CV_HIGHLIGHTS = [
  { label: "Education:", value: "Ph.D., Computer Science" },
  { label: "Experience:", value: "9 years teaching experience" },
  { label: "Publications:", value: "32 publications (Scopus / IEEE)" },
];

const PROFILE_ROWS = [
  { label: "Name", value: "Dr. Ananya Sharma" },
  { label: "Qualification", value: "Ph.D., Computer Science" },
  { label: "Eligibility", value: "UGC-NET & JRF Qualified" },
  { label: "Teaching Exp.", value: "9 yrs" },
  { label: "Publications", value: "32 indexed" },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 border-b border-[#E5E7EB] bg-[#FAFAFA] py-28 dark:border-[#1F1F1F] dark:bg-[#0A0A0A] lg:py-36"
    >
      <div className="mx-auto max-w-6xl px-6">
        <span className="mb-3 block text-xs font-semibold uppercase tracking-wider text-[#1F8F7E]">
          How it works
        </span>
        <h2 className="mb-8 font-serif text-[38px] font-normal tracking-tight text-[#09090B] dark:text-white sm:text-[44px]">
          From CV to profile in{" "}
          <em className="font-normal italic text-[#1F8F7E]">three steps.</em>
        </h2>

        <div className="grid grid-cols-1 gap-5 border-b border-[#E5E7EB] pb-10 md:grid-cols-3 dark:border-[#1F1F1F]">
          {STEPS.map((step) => (
            <div key={step.number} className="flex items-center gap-3">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-[13px] font-semibold transition-colors ${
                  step.active
                    ? "border-transparent bg-[#1F8F7E] text-white dark:border-[#1F8F7E]/70 dark:bg-transparent dark:text-[#1F8F7E]"
                    : "border-[#E4E4E7] bg-white text-[#71717A] dark:border-[#27272A] dark:bg-transparent dark:text-[#71717A]"
                }`}
              >
                {step.number}
              </span>
              <span
                className={`text-[15px] ${
                  step.active
                    ? "font-semibold text-[#09090B] dark:text-white"
                    : "font-normal text-[#52525B] dark:text-[#A1A1AA]"
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>

        <Reveal className="mt-10">
          <div className="relative overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white p-8 shadow-[0_18px_40px_-32px_rgb(15_23_42/0.35)] lg:p-12 dark:border-[#1F1F1F] dark:bg-black/70 dark:shadow-none">
            <div className="mx-auto grid max-w-[900px] grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_auto_1fr] lg:gap-10">
              {/* The CV stays on paper — white — in both themes, as in the design. */}
              <div className="-rotate-1 rounded-xl border border-[#E5E7EB] bg-white p-6 text-slate-900 shadow-[0_16px_34px_-26px_rgb(15_23_42/0.4)] transition-transform duration-300 hover:rotate-0">
                <div className="mb-4 border-b border-[#E5E7EB] pb-3">
                  <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Curriculum Vitae
                  </span>
                  <h4 className="mt-2 inline-block rounded-md bg-[#D3E9E4] px-2 py-0.5 text-[19px] font-semibold leading-tight text-[#0E5D52]">
                    Dr. Ananya Sharma
                  </h4>
                </div>
                <div className="space-y-3 text-xs leading-relaxed text-slate-600">
                  {CV_HIGHLIGHTS.map((highlight, index) => (
                    <div key={highlight.label}>
                      <div>
                        <span className="font-semibold text-slate-800">
                          {highlight.label}
                        </span>
                        <span className="ml-1.5 inline-block rounded-md bg-[#D3E9E4] px-2 py-0.5 font-medium text-[#0E5D52]">
                          {highlight.value}
                        </span>
                      </div>
                      {index < CV_HIGHLIGHTS.length ? (
                        <div
                          className={`mt-3 h-2 rounded bg-[#E2E8F0] ${
                            index === 0 ? "w-3/4" : index === 1 ? "w-4/5" : "w-2/3"
                          }`}
                          aria-hidden="true"
                        />
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center justify-center py-2">
                <div
                  className="mb-2 hidden h-8 w-px border-l border-dashed border-[#1F8F7E]/40 lg:block"
                  aria-hidden="true"
                />
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-[#1F8F7E]/40 bg-[#1F8F7E]/10 text-[#1F8F7E]">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-[11px] font-medium text-[#52525B] dark:border-[#27272A] dark:bg-[#121212] dark:text-[#A1A1AA]">
                  PDF or Word
                </span>
                <div
                  className="mt-2 hidden h-8 w-px border-l border-dashed border-[#1F8F7E]/40 lg:block"
                  aria-hidden="true"
                />
              </div>

              <div className="space-y-4 rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-[0_16px_34px_-30px_rgb(15_23_42/0.35)] dark:border-[#1F1F1F] dark:bg-[#0A0A0A] dark:shadow-none">
                <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3 dark:border-[#1F1F1F]">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#52525B] dark:text-[#71717A]">
                    Parsed Profile
                  </span>
                  <span className="rounded-full border border-[#1F8F7E]/25 bg-[#D3E9E4] px-2.5 py-0.5 text-[11px] font-medium text-[#0E5D52] dark:border-[#1F8F7E]/40 dark:bg-[#1F8F7E]/10 dark:text-[#1F8F7E]">
                    Active
                  </span>
                </div>
                <div className="space-y-2.5 text-sm">
                  {PROFILE_ROWS.map((row, index) => (
                    <div
                      key={row.label}
                      className={`flex justify-between py-1 ${
                        index < PROFILE_ROWS.length - 1
                          ? "border-b border-[#E5E7EB] dark:border-[#141414]"
                          : ""
                      }`}
                    >
                      <span className="text-[13px] text-[#64748B] dark:text-[#71717A]">
                        {row.label}
                      </span>
                      <span className="text-[13px] font-medium text-[#09090B] dark:text-white">
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[#E5E7EB] pt-3 dark:border-[#1F1F1F]">
                  <div className="mb-2 flex justify-between text-[13px]">
                    <span className="font-medium text-[#52525B] dark:text-[#A1A1AA]">
                      Profile 72% complete
                    </span>
                    <span className="font-semibold text-[#12796B] dark:text-[#1F8F7E]">
                      Ready to match
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#E2E8F0] dark:bg-[#1F1F1F]">
                    <div className="h-full w-0 rounded-full bg-[#12796B] transition-[width] duration-[900ms] ease-out [[data-reveal=in]_&]:w-[72%] dark:bg-[#1F8F7E]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <p className="mt-8 text-center text-[15px] text-[#71717A]">
          Don&apos;t have your CV handy? Fill in a short form instead. You can
          add details later.
        </p>
      </div>
    </section>
  );
}