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
import { useInView } from "@/hooks/useInView";

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
      <div className="space-y-4">
        <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-5 shadow-lg backdrop-blur-md">
          <p className="text-small font-medium text-[#e3d8c8]">
            Associate Professor — Computer Science &amp; AI
          </p>
          <p className="mt-1.5 text-tiny text-[#e3d8c8]/60">
            Level 13A · Pay band disclosed · 2 openings
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["PhD required", "API score met", "Research record"].map((c) => (
              <span
                key={c}
                className="rounded-md bg-white/10 px-3 py-1 text-[11px] font-medium text-[#e3d8c8]/80 border border-white/10"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
        <p className="text-tiny text-[#e3d8c8]/70 leading-relaxed px-1">
          Pay scale and process shown up front — candidates filter themselves.
        </p>
      </div>
    );
  }
  if (index === 1) {
    return (
      <div className="space-y-3">
        {[
          { name: "Dr. Ananya Sharma", tag: "Profile 8.8" },
          { name: "Dr. Rohan Iyer", tag: "Profile 8.4" },
        ].map((candidate, i) => (
          <div
            key={candidate.name}
            className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-5 py-4 text-small text-[#e3d8c8] shadow-lg backdrop-blur-sm transition-colors hover:bg-white/10"
            style={{ animation: `slide-in-right 0.35s cubic-bezier(0.16,1,0.3,1) ${i * 0.08}s both` }}
          >
            <span className="flex items-center gap-3 font-medium">
              <Users size={18} className="shrink-0 text-[#e3d8c8]/80" aria-hidden="true" />
              {candidate.name}
            </span>
            <span className="shrink-0 rounded-full bg-white/20 px-3 py-1 text-tiny font-bold text-[#e3d8c8] ring-1 ring-white/30">
              {candidate.tag}
            </span>
          </div>
        ))}
      </div>
    );
  }
  if (index === 2) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          {["Shortlist", "Interview", "Committee review"].map((step, i) => (
            <div key={step} className="flex-1">
              <div
                className={`flex justify-center rounded-full px-4 py-2 text-tiny font-semibold transition-colors ${
                  i < 2
                    ? "bg-white text-black shadow-md"
                    : "border border-white/20 bg-white/5 text-[#e3d8c8]/60"
                }`}
              >
                {step}
              </div>
              {i < 2 && (
                <p className="mt-2 text-[11px] text-[#e3d8c8]/60 text-center font-medium">
                  {i === 0 ? "6 shortlisted" : "2 invited"}
                </p>
              )}
            </div>
          ))}
        </div>
        <p className="text-tiny text-[#e3d8c8]/70 leading-relaxed px-1 text-center">
          Each stage updates candidates in the open — fewer "no response" dead
          ends.
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {[
        "UGC-style scoring fields on each profile",
        "Norms checklist attached to the role",
        "Audit trail of committee review",
      ].map((row, i) => (
        <div
          key={row}
          className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 px-5 py-4 text-small font-medium text-[#e3d8c8] shadow-lg backdrop-blur-sm transition-colors hover:bg-white/10"
          style={{ animation: `slide-in-right 0.35s cubic-bezier(0.16,1,0.3,1) ${i * 0.06}s both` }}
        >
          <Scale size={18} className="shrink-0 text-[#e3d8c8]/80" aria-hidden="true" />
          <span>{row}</span>
        </div>
      ))}
    </div>
  );
}

export function ForInstitutions() {
  const [active, setActive] = useState(0);
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <section id="for-institutions" className="relative overflow-hidden scroll-mt-16 border-t border-rule bg-[#195532]">
      {/* Background Orb */}
      <div className="pointer-events-none absolute -right-[20%] bottom-[10%] h-[600px] w-[600px] rounded-full bg-accent/20 blur-[140px] animate-[orb-drift-slow_22s_ease-in-out_infinite_alternate-reverse] opacity-60 mix-blend-screen" aria-hidden="true" />

      <div ref={ref} className="relative z-10 mx-auto grid max-w-6xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-12 lg:py-28">
        <div className="lg:col-span-4">
          <p
            data-inview="slide-right"
            className={`text-tiny font-semibold uppercase tracking-[0.18em] text-[#e3d8c8]/60 ${inView ? "in-view" : ""}`}
          >
            02 — For Universities &amp; Companies
          </p>
          <h2
            data-inview="slide-right"
            className={`mt-4 font-serif font-medium text-h2 text-[#e3d8c8] ${inView ? "in-view" : ""}`}
            style={{ "--delay": "80ms" } as React.CSSProperties}
          >
            Publish a role. Find the educator for it.
          </h2>
          <p
            data-inview="slide-right"
            className={`mt-4 max-w-sm text-body text-[#e3d8c8]/80 ${inView ? "in-view" : ""}`}
            style={{ "--delay": "140ms" } as React.CSSProperties}
          >
            Post clear openings, respond to structured profiles, and keep your
            committee&apos;s evaluation in one place.
          </p>
          <Link
            href="/signup"
            data-inview="slide-right"
            className={`group mt-8 inline-flex items-center gap-2 text-small font-semibold text-[#e3d8c8] transition-colors hover:text-[#e3d8c8]/70 ${inView ? "in-view" : ""}`}
            style={{ "--delay": "200ms" } as React.CSSProperties}
          >
            Discover Faculty Candidates
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
                    ? "border-white/40 bg-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] ring-1 ring-white/20 translate-y-[-2px] backdrop-blur-md"
                    : "border-white/10 bg-black/20 hover:bg-black/30 hover:border-white/20 backdrop-blur-sm"
                } ${inView ? "in-view" : ""}`}
                style={{ "--delay": `${160 + index * 70}ms` } as React.CSSProperties}
              >
                <div className="flex items-center justify-between">
                  <Icon
                    size={20}
                    strokeWidth={active === index ? 2.5 : 2}
                    className={`transition-colors duration-300 ${active === index ? "text-[#e3d8c8]" : "text-[#e3d8c8]/60 group-hover:text-[#e3d8c8]"}`}
                    aria-hidden="true"
                  />
                  <span
                    className={`text-tiny font-semibold uppercase tracking-wider transition-colors duration-300 ${
                      active === index ? "text-[#e3d8c8]" : "text-[#e3d8c8]/60"
                    }`}
                  >
                    {hint}
                  </span>
                </div>
                <h3 className={`mt-4 font-serif text-h3 font-medium transition-colors ${active === index ? "text-[#e3d8c8]" : "text-[#e3d8c8]/90"}`}>
                  {title}
                </h3>
                <p className={`mt-2 text-small leading-relaxed transition-colors ${active === index ? "text-[#e3d8c8]/90" : "text-[#e3d8c8]/60"}`}>{body}</p>
              </button>
            ))}
          </div>

          <div
            key={active}
            className="mt-6 animate-[fadein_220ms_ease-out] rounded-2xl border border-white/10 bg-black/20 p-8 shadow-2xl ring-1 ring-white/5 backdrop-blur-md motion-reduce:animate-none"
          >
            <InstitutionMock index={active} />
          </div>
        </div>
      </div>
    </section>
  );
}