"use client";

import {
  BookOpen,
  Building2,
  CheckCircle2,
  Eye,
  FileText,
  GraduationCap,
  Scale,
  Users,
} from "lucide-react";
import { useTilt } from "./useTilt";
import { MatchRing } from "./MatchRing";

export type DossierView = "educator" | "institution";

const EDU_FEATURES = [
  "Teaching focus",
  "Publications & research",
  "Documents & CV",
  "Pay expectations",
  "Visibility settings",
];

const INST_STEPS = ["Shortlist", "Interview", "Committee review"];

function Badge({ children }: { children: string }) {
  return (
    <span className="rounded-sm border border-accent/40 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
      {children}
    </span>
  );
}

export function InteractiveHeroCard3D({ view }: { view: DossierView }) {
  const tilt = useTilt<HTMLDivElement>();
  const isEducator = view === "educator";

  return (
    <div className="perspective-1200 relative mx-auto w-full max-w-md">
      <div
        {...tilt}
        className="tilt preserve-3d relative transition-transform duration-200 ease-out"
      >
        <div
          className="absolute -left-3 top-3 h-full w-full border border-rule bg-accent-tint/60"
          style={{ transform: "translateZ(-46px)" }}
          aria-hidden="true"
        />

        <div
          className="relative overflow-hidden rounded-lg border border-rule bg-paper shadow-card-lg"
          style={{ transform: "translateZ(0px)" }}
        >
          <div className="relative preserve-3d">
            <div style={{ transform: "translateZ(28px)" }}>
              <div
                key={view}
                className="animate-[fadein_220ms_ease-out] p-6 motion-reduce:animate-none sm:p-7"
              >
                {isEducator ? <EducatorFace /> : <InstitutionFace />}
              </div>
            </div>
          </div>
        </div>

        <div className="absolute -bottom-7 -right-4 animate-float motion-reduce:animate-none sm:-right-6">
          <div style={{ transform: "translateZ(72px)" }}>
            <MatchRing value={isEducator ? 96 : 94} />
          </div>
        </div>
      </div>
    </div>
  );
}

function EducatorFace() {
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent-tint text-accent">
            <GraduationCap size={20} strokeWidth={2} aria-hidden="true" />
          </span>
          <div>
            <p className="font-serif text-[20px] font-medium leading-tight text-ink">
              Dr. Ananya Sharma
            </p>
            <p className="text-tiny text-ink-muted">
              Ph.D. IIT Delhi · h-index 14
            </p>
          </div>
        </div>
        <Badge>Sample</Badge>
      </div>

      <div className="mt-5 border-b border-rule pb-4">
        <div className="flex items-center justify-between text-small">
          <span className="font-medium text-ink">Profile completeness</span>
          <span className="text-ink-muted">Teaching · Research · CV</span>
        </div>
        <div className="mt-2 h-1 w-full bg-rule">
          <div className="h-1 w-[84%] bg-accent" />
        </div>
      </div>

      <ul className="divide-y divide-rule">
        {EDU_FEATURES.map((feature) => (
          <li key={feature}>
            <div className="flex items-center gap-3 py-2.5 text-left">
              <BookOpen size={14} className="text-accent" aria-hidden="true" />
              <span className="text-small font-medium text-ink">{feature}</span>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex items-center gap-4 border-t border-rule pt-3 text-tiny text-ink-muted">
        <span className="flex items-center gap-1.5">
          <Eye size={13} className="text-accent" aria-hidden="true" />
          You control visibility
        </span>
        <span className="flex items-center gap-1.5">
          <Scale size={13} className="text-accent" aria-hidden="true" />
          Pay expectations set
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {["Applied AI", "Optimization", "ML theory"].map((chip) => (
          <span
            key={chip}
            className="rounded-sm bg-paper-deep px-2 py-1 text-tiny font-medium text-ink-muted"
          >
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}

function InstitutionFace() {
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent-tint text-accent">
            <Building2 size={20} strokeWidth={2} aria-hidden="true" />
          </span>
          <div>
            <p className="font-serif text-[20px] font-medium leading-tight text-ink">
              Associate Professor — CS &amp; AI
            </p>
            <p className="text-tiny text-ink-muted">
              Saraswati National University · NIRF-listed
            </p>
          </div>
        </div>
        <Badge>Demo</Badge>
      </div>

      <div className="mt-5 border-b border-rule pb-4">
        <div className="flex items-center justify-between text-small">
          <span className="font-medium text-ink">Cadre &amp; pay</span>
          <span className="text-ink-muted">Level 13A · 2 openings</span>
        </div>
        <div className="mt-2 h-1 w-full bg-rule">
          <div className="h-1 w-full bg-accent" />
        </div>
      </div>

      <div className="mt-4">
        <p className="text-tiny font-semibold uppercase tracking-[0.14em] text-ink-muted">
          Screening criteria
        </p>
        <ul className="mt-2 divide-y divide-rule">
          {[
            "PhD in Computer Science or allied field",
            "UGC-style API score met",
            "3+ publications in indexed venues / 3 yrs",
          ].map((criterion) => (
            <li key={criterion} className="flex items-center gap-3 py-2.5">
              <CheckCircle2
                size={14}
                className="text-accent"
                aria-hidden="true"
              />
              <span className="text-small font-medium text-ink">
                {criterion}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 border-t border-rule pt-3">
        <div className="flex items-center gap-2">
          {INST_STEPS.map((step, index) => (
            <div key={step} className="flex flex-1 items-center gap-2">
              <div className="flex-1 rounded-sm bg-paper-deep px-2 py-2 text-center">
                <p className="text-tiny font-semibold text-accent">
                  {index + 1}
                </p>
                <p className="truncate text-[10px] text-ink-muted">{step}</p>
              </div>
              {index < INST_STEPS.length - 1 && (
                <span className="h-px w-2 bg-rule" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-tiny text-ink-muted">
        <span className="flex items-center gap-1.5">
          <Users size={13} className="text-accent" aria-hidden="true" />
          Confidential review
        </span>
        <span className="flex items-center gap-1.5">
          <FileText size={13} className="text-accent" aria-hidden="true" />
          Pay band disclosed
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {["CS &amp; AI", "Computational sciences"].map((chip) => (
          <span
            key={chip}
            className="rounded-sm bg-paper-deep px-2 py-1 text-tiny font-medium text-ink-muted"
          >
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}