import Link from "next/link";
import { ArrowRight, Eye, FileText, GraduationCap, Target } from "lucide-react";

const POINTS = [
  {
    icon: GraduationCap,
    title: "Start from an academic profile",
    body: "Teaching experience, qualifications, research, and preferences — filled in once, kept current.",
  },
  {
    icon: FileText,
    title: "Attach what matters",
    body: "Publications, courses taught, and documents live alongside your profile, ready when you are.",
  },
  {
    icon: Eye,
    title: "You decide who sees it",
    body: "Profile visibility is yours to control. Institutions only see what you choose to share.",
  },
  {
    icon: Target,
    title: "Roles that actually fit",
    body: "Listings are matched to your discipline and preferences — not a cold blast of irrelevant openings.",
  },
];

export function ForEducators() {
  return (
    <section id="for-educators" className="scroll-mt-16 border-t border-rule">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-12 lg:py-28">
        <div className="lg:col-span-4">
          <p className="text-tiny font-semibold uppercase tracking-[0.18em] text-accent">
            01 — For Educators
          </p>
          <h2 className="mt-4 font-serif font-medium text-h2 text-ink">
            Build one profile that works for you.
          </h2>
          <p className="mt-4 max-w-sm text-body text-ink-muted">
            Every application in EduMatch starts the same way: a profile that
            captures your teaching, your research, and what you&apos;re looking
            for next.
          </p>
          <Link
            href="/signup"
            className="group mt-8 inline-flex items-center gap-2 text-small font-semibold text-accent transition-colors hover:text-accent-deep"
          >
            Create Your Teaching Profile
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