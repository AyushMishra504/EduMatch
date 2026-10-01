"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { DossierView } from "@/components/landing/ProfileCard";

const STATS = [
  { value: "500+", label: "Educators" },
  { value: "120+", label: "Organizations" },
  { value: "Free", label: "to join" },
];

function PersonaSwitch({
  view,
  onChange,
}: {
  view: DossierView;
  onChange: (value: DossierView) => void;
}) {
  const options: { value: DossierView; label: string }[] = [
    { value: "educator", label: "I'm an Educator" },
    { value: "institution", label: "I'm an Organization" },
  ];

  return (
    <div
      className="relative inline-flex items-center gap-1 rounded-full border border-rule bg-paper-deep p-1 shadow-sm"
      role="group"
      aria-label="Choose who you are"
    >
      {/* sliding pill */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1 bottom-1 rounded-full bg-paper shadow-sm transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          left: view === "educator" ? "4px" : "calc(50%)",
          right: view === "educator" ? "calc(50%)" : "4px",
        }}
      />
      {options.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          aria-pressed={view === value}
          onClick={() => onChange(value)}
          className={`relative z-10 rounded-full px-4 py-1.5 text-tiny font-semibold transition-colors duration-200 ${
            view === value ? "text-accent" : "text-ink-muted hover:text-ink"
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
    <section className="relative overflow-hidden min-h-[82vh] flex items-center">
      <div className="absolute inset-0 z-0 bg-[#040f08]">
        <img
          src="/hero-image.jpg"
          alt="Classroom background"
          className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#040f08]/95 via-[#040f08]/80 to-transparent"></div>
      </div>
      {/* ── Background orbs ── */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden z-0"
        aria-hidden="true"
      >
        <div
          className="absolute -top-32 -left-20 h-[520px] w-[520px] rounded-full opacity-[0.07]"
          style={{
            background:
              "radial-gradient(circle, var(--color-accent) 0%, transparent 70%)",
            animation: "orb-drift 12s ease-in-out infinite",
          }}
        />
        <div
          className="absolute top-1/3 -right-32 h-[400px] w-[400px] rounded-full opacity-[0.05]"
          style={{
            background:
              "radial-gradient(circle, var(--color-accent) 0%, transparent 70%)",
            animation: "orb-drift-slow 18s ease-in-out infinite alternate",
          }}
        />
        <div
          className="absolute -bottom-20 left-1/3 h-[300px] w-[300px] rounded-full opacity-[0.04]"
          style={{
            background:
              "radial-gradient(circle, var(--color-accent) 0%, transparent 70%)",
            animation: "orb-drift 15s ease-in-out infinite reverse",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-20 pt-14 sm:px-8 lg:pb-24 lg:pt-20">
        <div className="max-w-2xl">
          <p
            className="text-tiny font-semibold uppercase tracking-[0.18em] text-accent"
            style={{ animation: "slide-up 0.5s cubic-bezier(0.16,1,0.3,1) both" }}
          >
            For educators, universities, and companies
          </p>

          <h1
            className="mt-5 font-serif font-medium text-display text-[#e3d8c8]"
            style={{
              animation: "slide-up 0.6s cubic-bezier(0.16,1,0.3,1) 0.08s both",
            }}
          >
            Where India&apos;s{" "}
            <span className="shimmer-text">faculties</span>{" "}
            find each other.
          </h1>

          <p
            className="mt-6 max-w-xl text-lead text-[#e3d8c8]/80"
            style={{
              animation: "slide-up 0.6s cubic-bezier(0.16,1,0.3,1) 0.16s both",
            }}
          >
            EduMatch pairs teaching professionals with universities, companies,
            and startups on teaching, research, and fit — one academic profile,
            matched to the roles that actually suit you. Built for both academic
            and corporate roles.
          </p>

          {/* Stat counters */}
          <div
            className="mt-7 flex items-center gap-6 border-y border-white/10 py-4"
            style={{
              animation: "slide-up 0.6s cubic-bezier(0.16,1,0.3,1) 0.22s both",
            }}
          >
            {STATS.map(({ value, label }, i) => (
              <div
                key={label}
                className="text-center"
                style={{
                  animation: `stat-pop 0.5s cubic-bezier(0.16,1,0.3,1) ${0.28 + i * 0.07}s both`,
                }}
              >
                <p className="font-serif text-2xl font-medium text-[#e3d8c8]">
                  {value}
                </p>
                <p className="text-tiny text-[#e3d8c8]/60">{label}</p>
              </div>
            ))}
          </div>

          <div
            className="mt-6"
            style={{
              animation: "slide-up 0.6s cubic-bezier(0.16,1,0.3,1) 0.28s both",
            }}
          >
            <PersonaSwitch view={view} onChange={setView} />
          </div>

          <div
            className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center"
            style={{
              animation: "slide-up 0.6s cubic-bezier(0.16,1,0.3,1) 0.34s both",
            }}
          >
            <Link
              href="#for-educators"
              className={`group inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-small font-semibold transition-all duration-200 ${
                educatorFirst
                  ? "bg-accent text-on-accent hover:bg-accent-deep hover:shadow-glow"
                  : "border border-white/20 bg-white/5 text-[#e3d8c8] hover:border-accent hover:text-accent backdrop-blur-sm"
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
              className={`group inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-small font-semibold transition-all duration-200 ${
                educatorFirst
                  ? "border border-white/20 bg-white/5 text-[#e3d8c8] hover:border-accent hover:text-accent backdrop-blur-sm"
                  : "bg-accent text-on-accent hover:bg-accent-deep hover:shadow-glow"
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

          <p
            className="mt-5 text-tiny text-[#e3d8c8]/60"
            style={{
              animation: "slide-up 0.6s cubic-bezier(0.16,1,0.3,1) 0.4s both",
            }}
          >
            Free to join. Sign in with Google and pick your path next.
          </p>
        </div>
      </div>
    </section>
  );
}