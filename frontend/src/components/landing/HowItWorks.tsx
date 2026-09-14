const STEPS = [
  {
    number: "01",
    title: "Create a profile",
    body: "Teaching, research, qualifications, and preferences in one place. Your CV attaches to it.",
  },
  {
    number: "02",
    title: "Get matched",
    body: "Institutions post roles. Matching surfaces the ones that fit your discipline, experience, and stated preferences.",
  },
  {
    number: "03",
    title: "Apply and connect",
    body: "Apply with your profile, and institutions review and respond — in the open, in one place.",
  },
];

function StepPreview({ step }: { step: number }) {
  return (
    <div className="rounded-md border border-rule bg-paper-deep p-4">
      {step === 0 && (
        <div>
          <div className="flex items-center justify-between text-tiny text-ink-muted">
            <span>Profile completeness</span>
            <span>72%</span>
          </div>
          <div className="mt-1.5 h-1 w-full bg-rule">
            <div className="h-1 w-[72%] bg-accent" />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {["Teaching", "Research", "NET", "Preferences"].map((chip) => (
              <span
                key={chip}
                className="rounded-sm bg-paper px-2 py-1 text-tiny font-medium text-ink-muted"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      )}
      {step === 1 && (
        <div className="space-y-2">
          {[
            { role: "Assistant Professor — Computational Sciences", fit: 94 },
            { role: "Faculty Fellow — Operations Research", fit: 91 },
          ].map((match) => (
            <div
              key={match.role}
              className="flex items-center justify-between gap-3 rounded-sm border border-rule bg-paper px-3 py-2 text-small text-ink"
            >
              <span>{match.role}</span>
              <span className="shrink-0 rounded-sm bg-accent-tint px-2 py-0.5 text-tiny font-semibold text-accent">
                {match.fit}% fit
              </span>
            </div>
          ))}
        </div>
      )}
      {step === 2 && (
        <div className="space-y-2">
          <div className="max-w-[80%] rounded-md rounded-tl-sm bg-paper px-3 py-2 text-tiny text-ink">
            Applied with my profile — attached publications.
          </div>
          <div className="ml-auto max-w-[80%] rounded-md rounded-tr-sm bg-accent-tint px-3 py-2 text-tiny text-ink">
            Shortlisted. Your committee review is now open.
          </div>
          <p className="pt-1 text-tiny text-ink-muted">
            Status updates land in the same thread — no silence.
          </p>
        </div>
      )}
    </div>
  );
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-16 border-t border-rule">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-tiny font-semibold uppercase tracking-[0.18em] text-accent">
              03 — How it works
            </p>
            <h2 className="mt-4 font-serif font-medium text-h2 text-ink">
              Three honest steps.
            </h2>
          </div>
          <p className="max-w-md text-body text-ink-muted">
            No jargon and no magic — a profile, a match, then a conversation
            that leads somewhere.
          </p>
        </div>

        <ol className="relative mt-12">
          <span
            className="absolute left-6 top-0 h-full w-px bg-rule max-sm:hidden"
            aria-hidden="true"
          />
          {STEPS.map((step, index) => (
            <li
              key={step.number}
              className="grid gap-4 border-b border-rule py-8 sm:grid-cols-12 sm:gap-6"
            >
              <div className="sm:col-span-2">
                <span className="relative grid h-12 w-12 place-items-center rounded-full border border-accent/40 bg-accent-tint font-serif text-lg font-medium text-accent max-sm:hidden">
                  {step.number}
                </span>
                <span className="font-serif text-2xl text-accent sm:hidden">
                  {step.number}
                </span>
              </div>
              <div className="sm:col-span-4">
                <h3 className="font-serif text-h3 font-medium text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-small text-ink-muted lg:max-w-sm">
                  {step.body}
                </p>
              </div>
              <div className="sm:col-span-6 sm:col-start-7">
                <StepPreview step={index} />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}