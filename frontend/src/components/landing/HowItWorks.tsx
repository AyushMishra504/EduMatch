"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "@/hooks/useInView";

const STEPS = [
  {
    number: "01",
    title: "Create a profile",
    body: "Teaching, research, qualifications, and preferences in one place. Your CV attaches to it.",
    preview: (
      <div>
        <div className="flex items-center justify-between text-tiny text-ink-muted">
          <span>Profile completeness</span>
          <span className="font-semibold text-accent">72%</span>
        </div>
        <div className="mt-2 h-1.5 w-full rounded-full bg-rule overflow-hidden">
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: "72%", transition: "width 1s cubic-bezier(0.16,1,0.3,1)" }}
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {["Teaching", "Research", "NET", "Preferences"].map((chip, i) => (
            <span
              key={chip}
              className="rounded-full bg-paper px-3 py-1 text-tiny font-medium text-ink-muted border border-rule"
              style={{ animation: `fade-scale-in 0.4s cubic-bezier(0.16,1,0.3,1) ${i * 0.06}s both` }}
            >
              {chip}
            </span>
          ))}
        </div>
        <p className="mt-3 text-tiny text-ink-muted">
          Your profile is reused for every application — fill once.
        </p>
      </div>
    ),
  },
  {
    number: "02",
    title: "Get matched",
    body: "Institutions post roles. Matching surfaces the ones that fit your discipline, experience, and stated preferences.",
    preview: (
      <div className="space-y-2">
        {[
          { role: "Assistant Professor — Computational Sciences", fit: 94 },
          { role: "Faculty Fellow — Operations Research", fit: 91 },
          { role: "Associate Professor — Data Science", fit: 87 },
        ].map((match, i) => (
          <div
            key={match.role}
            className="flex items-center justify-between gap-3 rounded-md border border-rule bg-paper px-3 py-2.5 text-small text-ink"
            style={{
              animation: `slide-in-left 0.4s cubic-bezier(0.16,1,0.3,1) ${i * 0.08}s both`,
            }}
          >
            <span className="truncate">{match.role}</span>
            <span className="shrink-0 rounded-full bg-accent-tint px-2.5 py-0.5 text-tiny font-semibold text-accent">
              {match.fit}%
            </span>
          </div>
        ))}
      </div>
    ),
  },
  {
    number: "03",
    title: "Apply and connect",
    body: "Apply with your profile, and institutions review and respond — in the open, in one place.",
    preview: (
      <div className="space-y-3">
        <div className="max-w-[82%] rounded-xl rounded-tl-sm bg-paper border border-rule px-3.5 py-2.5 text-small text-ink shadow-sm">
          Applied with my profile — attached publications &amp; teaching portfolio.
        </div>
        <div className="ml-auto max-w-[82%] rounded-xl rounded-tr-sm bg-accent-tint border border-accent/20 px-3.5 py-2.5 text-small text-ink">
          Shortlisted. Your committee review is now open.
        </div>
        <div className="ml-auto max-w-[82%] rounded-xl rounded-tr-sm bg-accent px-3.5 py-2.5 text-small text-on-accent">
          Interview scheduled for Oct 12 — details attached.
        </div>
        <p className="pt-1 text-tiny text-ink-muted">
          Status updates in one thread — no silence, no guessing.
        </p>
      </div>
    ),
  },
];

export function HowItWorks() {
  const { ref: sectionRef, inView: headerInView } = useInView<HTMLDivElement>({ threshold: 0.2 });
  const [activeStep, setActiveStep] = useState(0);
  const [previewKey, setPreviewKey] = useState(0);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);

  // Observe each step trigger to auto-switch the active tab
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    stepRefs.current.forEach((el, index) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveStep(index);
            setPreviewKey((k) => k + 1);
          }
        },
        { rootMargin: "-30% 0px -50% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <section id="how-it-works" className="scroll-mt-16 border-t border-rule bg-[#e3d8c8] dark:bg-[#241d17]">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
        {/* Header */}
        <div
          ref={sectionRef}
          data-inview="slide-up"
          className={`flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between ${headerInView ? "in-view" : ""}`}
        >
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

        {/* Sticky scroll layout */}
        <div className="mt-14 lg:grid lg:grid-cols-12 lg:gap-12">
          {/* Left: step list (sticky) */}
          <ol className="relative lg:col-span-5 lg:sticky lg:top-24 lg:self-start">
            {/* Connector line */}
            <span
              className="absolute left-6 top-0 h-full w-px bg-rule max-sm:hidden"
              aria-hidden="true"
            />
            {/* Filled connector */}
            <span
              className="absolute left-6 top-0 w-px bg-accent max-sm:hidden origin-top"
              aria-hidden="true"
              style={{
                height: `${((activeStep + 1) / STEPS.length) * 100}%`,
                transition: "height 0.6s cubic-bezier(0.16,1,0.3,1)",
              }}
            />

            {STEPS.map((step, index) => {
              const isActive = activeStep === index;
              const isPast = index < activeStep;
              return (
                  <li
                  key={step.number}
                  ref={(el) => { stepRefs.current[index] = el; }}
                  className="relative grid gap-4 border-b border-rule py-8 sm:grid-cols-12 sm:gap-6 cursor-pointer lg:min-h-[45vh] lg:items-center"
                  onClick={() => {
                    setActiveStep(index);
                    setPreviewKey((k) => k + 1);
                  }}
                >
                  <div className="sm:col-span-2">
                    <span
                      className={`relative grid h-12 w-12 place-items-center rounded-full border font-serif text-lg font-medium transition-all duration-400 max-sm:hidden ${
                        isActive
                          ? "border-accent bg-accent text-on-accent shadow-glow-sm"
                          : isPast
                          ? "border-accent bg-accent-tint text-accent"
                          : "border-accent/40 bg-accent-tint text-accent"
                      }`}
                    >
                      {step.number}
                    </span>
                    <span className="font-serif text-2xl text-accent sm:hidden">
                      {step.number}
                    </span>
                  </div>
                  <div className="sm:col-span-10">
                    <h3
                      className={`font-serif text-h3 font-medium transition-colors duration-300 ${
                        isActive ? "text-ink" : "text-ink-muted"
                      }`}
                    >
                      {step.title}
                    </h3>
                    <p
                      className={`mt-2 text-small transition-all duration-300 ${
                        isActive
                          ? "max-h-20 opacity-100 text-ink-muted"
                          : "max-h-0 opacity-0 overflow-hidden"
                      } lg:max-h-none lg:opacity-100 lg:text-ink-muted`}
                    >
                      {step.body}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Right: preview (sticky on desktop, visible below step on mobile) */}
          <div className="hidden lg:col-span-7 lg:flex lg:flex-col lg:justify-center lg:sticky lg:top-24 lg:self-start">
            <div
              key={previewKey}
              className="rounded-xl border border-rule bg-paper-deep p-6 shadow-card"
              style={{
                animation: "fade-scale-in 0.45s cubic-bezier(0.16,1,0.3,1) both",
              }}
            >
              <p className="mb-4 text-tiny font-semibold uppercase tracking-[0.18em] text-accent">
                Step {STEPS[activeStep].number} — {STEPS[activeStep].title}
              </p>
              {STEPS[activeStep].preview}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}