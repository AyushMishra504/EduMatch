"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, GraduationCap, FileText, Eye, Target } from "lucide-react";

const CARDS = [
  {
    icon: GraduationCap,
    title: "Start from an academic profile",
    body: "Teaching experience, qualifications, research, and preferences — filled in once, kept current.",
    hint: "Profile fields",
  },
  {
    icon: FileText,
    title: "Attach what matters",
    body: "Publications, courses taught, and documents live alongside your profile, ready when you are.",
    hint: "Documents",
  },
  {
    icon: Eye,
    title: "You decide who sees it",
    body: "Profile visibility is yours to control. Institutions only see what you choose to share.",
    hint: "Visibility",
  },
  {
    icon: Target,
    title: "Roles that actually fit",
    body: "Listings are matched to your discipline and preferences — not a cold blast of irrelevant openings.",
    hint: "Matches",
  },
];

function EducatorMock({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="space-y-3">
        {[
          "Teaching experience · 9 yrs",
          "Research & publications · 32",
          "Qualifications · Ph.D. + NET",
        ].map((row) => (
          <div
            key={row}
            className="flex items-center gap-3 rounded-sm border border-rule bg-paper px-3 py-2 text-small text-ink"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
            {row}
          </div>
        ))}
      </div>
    );
  }
  if (index === 1) {
    return (
      <div className="space-y-2">
        {["CV · Cover letter", "Publication list · ORCID-import", "Teaching certificates"].map(
          (doc) => (
            <div
              key={doc}
              className="flex items-center gap-3 rounded-sm border border-rule bg-paper px-3 py-2 text-small text-ink"
            >
              <FileText size={15} className="shrink-0 text-accent" aria-hidden="true" />
              {doc}
            </div>
          ),
        )}
        <p className="pt-1 text-tiny text-ink-muted">
          “Add publication” imports from ORCID/Scopus when connected.
        </p>
      </div>
    );
  }
  if (index === 2) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {["Institutions I shortlist", "Recruiters in my field", "Only after I approve"].map(
          (option, i) => (
            <span
              key={option}
              className={`rounded-sm px-3 py-2 text-small font-medium ${
                i === 0
                  ? "bg-accent text-on-accent"
                  : "border border-rule bg-paper text-ink-muted"
              }`}
            >
              {option}
            </span>
          ),
        )}
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {[
        { role: "Assistant Professor — Computational Sciences", pct: "94" },
        { role: "Faculty Fellow — Operations Research", pct: "91" },
      ].map((match) => (
        <div
          key={match.role}
          className="flex items-center justify-between gap-3 rounded-sm border border-rule bg-paper px-3 py-2 text-small text-ink"
        >
          <span>{match.role}</span>
          <span className="shrink-0 rounded-sm bg-accent-tint px-2 py-0.5 text-tiny font-semibold text-accent">
            {match.pct}% fit
          </span>
        </div>
      ))}
    </div>
  );
}

export function ForEducators() {
  const [active, setActive] = useState(0);

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

        <div className="lg:col-span-7 lg:col-start-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {CARDS.map(({ icon: Icon, title, body, hint }, index) => (
              <button
                key={title}
                type="button"
                onClick={() => setActive(index)}
                aria-pressed={active === index}
                className={`group rounded-md border p-4 text-left transition-colors ${
                  active === index
                    ? "border-accent bg-accent-tint"
                    : "border-rule bg-paper hover:border-accent/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon
                    size={18}
                    strokeWidth={1.75}
                    className="text-accent"
                    aria-hidden="true"
                  />
                  <span
                    className={`text-tiny font-semibold uppercase tracking-wider ${
                      active === index ? "text-accent" : "text-ink-muted"
                    }`}
                  >
                    {hint}
                  </span>
                </div>
                <h3 className="mt-3 font-serif text-h3 font-medium text-ink">
                  {title}
                </h3>
                <p className="mt-1.5 text-small text-ink-muted">{body}</p>
              </button>
            ))}
          </div>

          <div
            key={active}
            className="mt-3 animate-[fadein_220ms_ease-out] rounded-md border border-rule bg-paper-deep p-4 motion-reduce:animate-none"
          >
            <EducatorMock index={active} />
          </div>
        </div>
      </div>
    </section>
  );
}