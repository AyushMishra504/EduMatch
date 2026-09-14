import Link from "next/link";
import { ArrowRight, Building2, CheckCircle2, Scale, Users } from "lucide-react";

const POINTS = [
  {
    icon: Building2,
    title: "Clear role listings",
    body: "Post roles with requirements, pay scale, and process up front, so candidates self-select.",
  },
  {
    icon: Users,
    title: "A profile-based candidate pool",
    body: "Educators apply with complete profiles rather than ad-hoc CVs — review stays consistent.",
  },
  {
    icon: CheckCircle2,
    title: "Review in one place",
    body: "Evaluations, shortlists, and feedback for a role live together instead of scattered across email.",
  },
  {
    icon: Scale,
    title: "Norms-friendly by design",
    body: "Structured to sit comfortably alongside UGC and institute hiring norms as you run your process.",
  },
];

export function ForInstitutions() {
  return (
    <section id="for-institutions" className="scroll-mt-16 border-t border-rule">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-12 lg:py-28">
        <div className="lg:col-span-4">
          <p className="text-tiny font-semibold uppercase tracking-[0.18em] text-accent">
            02 — For Institutions
          </p>
          <h2 className="mt-4 font-serif font-medium text-h2 text-ink">
            Publish a role. Find the educator for it.
          </h2>
          <p className="mt-4 max-w-sm text-body text-ink-muted">
            Post clear openings, respond to structured profiles, and keep your
            committee&apos;s evaluation in one place.
          </p>
          <Link
            href="/signup"
            className="group mt-8 inline-flex items-center gap-2 text-small font-semibold text-accent transition-colors hover:text-accent-deep"
          >
            Discover Faculty Candidates
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>

        <ul className="divide-y divide-rule lg:col-span-7 lg:col-start-6">
          {POINTS.map(({ icon: Icon, title, body }) => (
            <li key={title} className="grid grid-cols-[2rem_1fr] gap-4 py-7">
              <Icon
                size={20}
                strokeWidth={1.75}
                className="mt-1 text-accent"
                aria-hidden="true"
              />
              <div>
                <h3 className="font-serif text-h3 font-medium text-ink">
                  {title}
                </h3>
                <p className="mt-1.5 max-w-lg text-small text-ink-muted">
                  {body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}