"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  ProfileCard,
  type DossierView,
} from "@/components/landing/ProfileCard";

function PersonaSwitch({
  view,
  onChange,
}: {
  view: DossierView;
  onChange: (value: DossierView) => void;
}) {
  const options: { value: DossierView; label: string }[] = [
    { value: "educator", label: "I’m an Educator" },
    { value: "institution", label: "I’m an Institution" },
  ];

  return (
    <div
      className="inline-flex items-center gap-1 rounded-md border border-rule bg-paper-deep p-1"
      role="group"
      aria-label="Choose who you are"
    >
      {options.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          aria-pressed={view === value}
          onClick={() => onChange(value)}
          className={`rounded-sm px-3 py-1.5 text-tiny font-semibold transition-colors ${
            view === value
              ? "bg-paper text-accent shadow-sm"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function Hero() {
  const [view, setView] = useState<DossierView>("educator");
  const educatorFirst = view === "educator";

  return (
    <section className="relative overflow-hidden">
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-14 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-12 lg:min-h-[82vh] lg:items-center lg:gap-10 lg:pb-24 lg:pt-20">
        <div className="lg:col-span-7">
          <p className="text-tiny font-semibold uppercase tracking-[0.18em] text-accent">
            For educators &amp; institutions in Indian higher education
          </p>

          <h1 className="mt-5 font-serif font-medium text-display text-ink">
            Where India’s faculties find each other.
          </h1>

          <p className="mt-6 max-w-xl text-lead text-ink-muted">
            EduMatch pairs educators and universities on teaching, research,
            and fit — one academic profile, matched to the roles that actually
            suit you. Built with Indian higher-ed hiring norms in mind.
          </p>

          <div className="mt-8">
            <PersonaSwitch view={view} onChange={setView} />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="#for-educators"
              className={`group inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 text-small font-semibold transition-colors ${
                educatorFirst
                  ? "bg-accent text-on-accent hover:bg-accent-deep"
                  : "border border-rule bg-transparent text-ink hover:border-accent hover:text-accent"
              }`}
            >
              Find Teaching Opportunities
              {educatorFirst && (
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              )}
            </Link>
            <Link
              href="#for-institutions"
              className={`group inline-flex items-center justify-center rounded-md px-5 py-3 text-small font-semibold transition-colors ${
                educatorFirst
                  ? "border border-rule bg-transparent text-ink hover:border-accent hover:text-accent"
                  : "bg-accent text-on-accent hover:bg-accent-deep"
              }`}
            >
              Hire Qualified Educators
              {!educatorFirst && (
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              )}
            </Link>
          </div>

          <p className="mt-6 text-tiny text-ink-muted">
            Free to join. Sign in with Google and pick your path next.
          </p>
        </div>

        <div className="relative lg:col-span-5">
          <ProfileCard key={view} variant={view} />
        </div>
      </div>
    </section>
  );
}