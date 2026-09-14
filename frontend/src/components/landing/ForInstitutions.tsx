"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Users,
  CheckCircle2,
  Scale,
} from "lucide-react";

const CARDS = [
  {
    icon: Building2,
    title: "Clear role listings",
    body: "Post roles with requirements, pay scale, and process up front, so candidates self-select.",
    hint: "Listing",
  },
  {
    icon: Users,
    title: "A profile-based candidate pool",
    body: "Educators apply with complete profiles rather than ad-hoc CVs — review stays consistent.",
    hint: "Candidates",
  },
  {
    icon: CheckCircle2,
    title: "Review in one place",
    body: "Evaluations, shortlists, and feedback for a role live together instead of scattered across email.",
    hint: "Committee",
  },
  {
    icon: Scale,
    title: "Norms-friendly by design",
    body: "Structured to sit comfortably alongside UGC and institute hiring norms as you run your process.",
    hint: "Fit",
  },
];

function InstitutionMock({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="space-y-3">
        <div className="rounded-sm border border-rule bg-paper px-3 py-3">
          <p className="text-small font-medium text-ink">
            Associate Professor — Computer Science &amp; AI
          </p>
          <p className="mt-1 text-tiny text-ink-muted">
            Level 13A · Pay band disclosed · 2 openings
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {["PhD required", "API score met", "Research record"].map((c) => (
              <span
                key={c}
                className="rounded-sm bg-paper-deep px-2 py-0.5 text-tiny text-ink-muted"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
        <p className="text-tiny text-ink-muted">
          Pay scale and process shown up front — candidates filter themselves.
        </p>
      </div>
    );
  }
  if (index === 1) {
    return (
      <div className="space-y-2">
        {[
          { name: "Dr. Ananya Sharma", tag: "Profile 8.8" },
          { name: "Dr. Rohan Iyer", tag: "Profile 8.4" },
        ].map((candidate) => (
          <div
            key={candidate.name}
            className="flex items-center justify-between gap-3 rounded-sm border border-rule bg-paper px-3 py-2 text-small text-ink"
          >
            <span className="flex items-center gap-2">
              <Users size={15} className="shrink-0 text-accent" aria-hidden="true" />
              {candidate.name}
            </span>
            <span className="shrink-0 rounded-sm bg-accent-tint px-2 py-0.5 text-tiny font-semibold text-accent">
              {candidate.tag}
            </span>
          </div>
        ))}
      </div>
    );
  }
  if (index === 2) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {["Shortlist", "Interview", "Committee review"].map((step, i) => (
            <div key={step}>
              <div
                className={`rounded-sm px-3 py-2 text-tiny font-semibold ${
                  i < 2
                    ? "bg-accent text-on-accent"
                    : "border border-rule bg-paper text-ink-muted"
                }`}
              >
                {step}
              </div>
              {i < 2 && (
                <p className="mt-1 text-[10px] text-ink-muted">
                  {i === 0 ? "6 shortlisted" : "2 invited"}
                </p>
              )}
            </div>
          ))}
        </div>
        <p className="text-tiny text-ink-muted">
          Each stage updates candidates in the open — fewer “no response” dead
          ends.
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {[
        "UGC-style scoring fields on each profile",
        "Norms checklist attached to the role",
        "Audit trail of committee review",
      ].map((row) => (
        <div
          key={row}
          className="flex items-center gap-3 rounded-sm border border-rule bg-paper px-3 py-2 text-small text-ink"
        >
          <Scale size={15} className="shrink-0 text-accent" aria-hidden="true" />
          {row}
        </div>
      ))}
    </div>
  );
}

export function ForInstitutions() {
  const [active, setActive] = useState(0);

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
            <InstitutionMock index={active} />
          </div>
        </div>
      </div>
    </section>
  );
}