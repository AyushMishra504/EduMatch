"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, GraduationCap, FileText, Eye, Target } from "lucide-react";
import { useInView } from "@/hooks/useInView";

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
      <div className="space-y-4">
        {[
          "Teaching experience · 9 yrs",
          "Research & publications · 32",
          "Qualifications · Ph.D. + NET",
        ].map((row, i) => (
          <div
            key={row}
            className="flex items-center gap-3 rounded-lg border border-rule/80 bg-paper px-4 py-3 text-small text-ink shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none transition-colors hover:border-accent/40"
            style={{ animation: `slide-in-left 0.35s cubic-bezier(0.16,1,0.3,1) ${i * 0.06}s both` }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent ring-2 ring-accent/20" aria-hidden="true" />
            <span className="font-medium">{row}</span>
          </div>
        ))}
      </div>
    );
  }
  if (index === 1) {
    return (
      <div className="space-y-3">
        {["CV · Cover letter", "Publication list · ORCID-import", "Teaching certificates"].map(
          (doc, i) => (
            <div
              key={doc}
              className="flex items-center gap-3 rounded-lg border border-rule/80 bg-paper px-4 py-3 text-small text-ink shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none transition-colors hover:border-accent/40"
              style={{ animation: `slide-in-left 0.35s cubic-bezier(0.16,1,0.3,1) ${i * 0.06}s both` }}
            >
              <FileText size={16} className="shrink-0 text-accent" aria-hidden="true" />
              <span className="font-medium">{doc}</span>
            </div>
          ),
        )}
        <p className="pt-2 text-tiny text-ink-muted">
          "Add publication" imports from ORCID/Scopus when connected.
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
              className={`rounded-full px-4 py-2 text-small font-medium transition-colors ${
                i === 0
                  ? "bg-accent text-on-accent shadow-sm"
                  : "border border-rule/80 bg-paper text-ink-muted hover:text-ink hover:border-rule"
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
    <div className="space-y-3">
      {[
        { role: "Assistant Professor — Computational Sciences", pct: "94" },
        { role: "Faculty Fellow — Operations Research", pct: "91" },
      ].map((match, i) => (
        <div
          key={match.role}
          className="flex items-center justify-between gap-3 rounded-lg border border-rule/80 bg-paper px-4 py-3 text-small text-ink shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none transition-colors hover:border-accent/40"
          style={{ animation: `slide-in-left 0.35s cubic-bezier(0.16,1,0.3,1) ${i * 0.08}s both` }}
        >
          <span className="font-medium truncate">{match.role}</span>
          <span className="shrink-0 rounded-full bg-accent-tint px-3 py-1 text-tiny font-bold text-accent ring-1 ring-accent/20">
            {match.pct}% fit
          </span>
        </div>
      ))}
    </div>
  );
}

export function ForEducators() {
  const [active, setActive] = useState(0);
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <section id="for-educators" className="relative overflow-hidden scroll-mt-16 border-t border-rule bg-[#e3d8c8] dark:bg-[#241d17]">
      {/* Background Orb */}
      <div className="pointer-events-none absolute -left-[20%] top-[10%] h-[500px] w-[500px] rounded-full bg-accent/20 blur-[120px] animate-[orb-drift-slow_18s_ease-in-out_infinite_alternate] opacity-60 mix-blend-screen" aria-hidden="true" />
      
      <div ref={ref} className="relative z-10 mx-auto grid max-w-6xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-12 lg:py-28">
        <div className="lg:col-span-4">
          <p
            data-inview="slide-left"
            className={`text-tiny font-semibold uppercase tracking-[0.18em] text-accent ${inView ? "in-view" : ""}`}
          >
            01 — For Educators
          </p>
          <h2
            data-inview="slide-left"
            className={`mt-4 font-serif font-medium text-h2 text-ink ${inView ? "in-view" : ""}`}
            style={{ "--delay": "80ms" } as React.CSSProperties}
          >
            Build one profile that works for you.
          </h2>
          <p
            data-inview="slide-left"
            className={`mt-4 max-w-sm text-body text-ink-muted ${inView ? "in-view" : ""}`}
            style={{ "--delay": "140ms" } as React.CSSProperties}
          >
            Every application in EduMatch starts the same way: a profile that
            captures your teaching, your research, and what you&apos;re looking
            for next.
          </p>
          <Link
            href="/signup"
            data-inview="slide-left"
            className={`group mt-8 inline-flex items-center gap-2 text-small font-semibold text-accent transition-colors hover:text-accent-deep ${inView ? "in-view" : ""}`}
            style={{ "--delay": "200ms" } as React.CSSProperties}
          >
            Create Your Teaching Profile
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>

        <div className="lg:col-span-7 lg:col-start-6 flex flex-col">
          <div className="grid gap-4 sm:grid-cols-2 flex-1">
            {CARDS.map(({ icon: Icon, title, body, hint }, index) => (
              <button
                key={title}
                type="button"
                onClick={() => setActive(index)}
                aria-pressed={active === index}
                data-inview="fade-scale"
                className={`card-lift group rounded-2xl border p-5 text-left transition-all duration-300 ${
                  active === index
                    ? "border-accent/80 bg-accent-tint/40 shadow-glow-sm ring-1 ring-accent/30 translate-y-[-2px]"
                    : "border-rule bg-paper hover:border-accent/50 hover:bg-paper-deep"
                } ${inView ? "in-view" : ""}`}
                style={{ "--delay": `${160 + index * 70}ms` } as React.CSSProperties}
              >
                <div className="flex items-center justify-between">
                  <Icon
                    size={20}
                    strokeWidth={active === index ? 2.5 : 1.75}
                    className={`transition-colors duration-300 ${active === index ? "text-accent" : "text-ink-muted group-hover:text-accent/70"}`}
                    aria-hidden="true"
                  />
                  <span
                    className={`text-tiny font-semibold uppercase tracking-wider transition-colors duration-300 ${
                      active === index ? "text-accent" : "text-ink-muted"
                    }`}
                  >
                    {hint}
                  </span>
                </div>
                <h3 className="mt-4 font-serif text-h3 font-medium text-ink">
                  {title}
                </h3>
                <p className="mt-2 text-small text-ink-muted leading-relaxed">{body}</p>
              </button>
            ))}
          </div>

          <div
            key={active}
            className="mt-6 animate-[fadein_220ms_ease-out] rounded-2xl border border-rule/60 bg-gradient-to-br from-paper-deep/80 to-paper p-6 shadow-inner ring-1 ring-black/5 dark:ring-white/5 motion-reduce:animate-none"
          >
            <EducatorMock index={active} />
          </div>
        </div>
      </div>
    </section>
  );
}