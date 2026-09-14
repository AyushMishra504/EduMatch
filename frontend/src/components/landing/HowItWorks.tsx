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
            No jargon and no magic — this is the flow we&apos;re building and
            testing with the early list.
          </p>
        </div>

        <ol className="mt-12 border-t border-rule">
          {STEPS.map((step) => (
            <li
              key={step.number}
              className="grid gap-2 border-b border-rule py-8 sm:grid-cols-[3.5rem_1fr] sm:gap-6 lg:grid-cols-12 lg:items-baseline"
            >
              <span className="font-serif text-2xl text-accent">
                {step.number}
              </span>
              <div className="lg:col-span-4">
                <h3 className="font-serif text-h3 font-medium text-ink">
                  {step.title}
                </h3>
              </div>
              <p className="text-body text-ink-muted lg:col-span-6 lg:col-start-8">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}