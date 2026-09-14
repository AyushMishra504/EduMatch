"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  Briefcase,
  Building2,
  FileText,
  GraduationCap,
  IndianRupee,
  ListChecks,
  MapPin,
  ShieldCheck,
  Star,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { MatchRing } from "@/components/3d/MatchRing";
import { usePrefersReducedMotion } from "@/components/3d/usePrefersReducedMotion";

export type DossierView = "educator" | "institution";

type PanelState = {
  heading: string;
  details: string[];
  metaIcon: LucideIcon;
  meta: string;
};

const EDU_STATES: PanelState[] = [
  {
    heading: "Teaching expertise",
    details: [
      "Applied Artificial Intelligence",
      "Machine Learning",
      "Data Structures",
    ],
    metaIcon: Star,
    meta: "4.8/5 student rating",
  },
  {
    heading: "Research profile",
    details: [
      "22 indexed publications",
      "h-index of 14",
      "Research focus: Responsible AI",
    ],
    metaIcon: FileText,
    meta: "22 publications",
  },
  {
    heading: "Professional experience",
    details: [
      "8 years of teaching",
      "2 years of industry experience",
      "Previously led an AI research lab",
    ],
    metaIcon: Briefcase,
    meta: "10 years combined",
  },
  {
    heading: "Career preferences",
    details: [
      "Seeking Associate Professor roles",
      "Bengaluru or Hyderabad",
      "Available within 30 days",
    ],
    metaIcon: MapPin,
    meta: "Available in 30 days",
  },
];

const INST_STATES: PanelState[] = [
  {
    heading: "Screening criteria",
    details: [
      "PhD in Biotechnology or Life Sciences",
      "5+ years of teaching experience",
      "3+ indexed publications",
    ],
    metaIcon: ShieldCheck,
    meta: "Confidential review",
  },
  {
    heading: "Role details",
    details: [
      "Full-time, on-campus position",
      "Bengaluru, Karnataka",
      "Joining within 60 days preferred",
    ],
    metaIcon: Building2,
    meta: "Two positions available",
  },
  {
    heading: "What the role offers",
    details: [
      "₹14–18 LPA salary range",
      "Research funding available",
      "Campus accommodation assistance",
    ],
    metaIcon: IndianRupee,
    meta: "Pay band disclosed",
  },
  {
    heading: "Hiring process",
    details: [
      "Profile shortlist",
      "Teaching demonstration",
      "Committee interview",
    ],
    metaIcon: ListChecks,
    meta: "Three-stage selection",
  },
];

const WAIT_BEFORE_TYPE = 260;
const TYPE_MS = 42;
const DELETE_MS = 28;
const FADE_MS = 300;
const STAGGER_MS = 150;
const HOLD_MS = 2500;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

type Phase = "typing" | "hold" | "deleting";

function CyclingPanel({
  states,
  action,
}: {
  states: PanelState[];
  action: ReactNode;
}) {
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("typing");
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    let started = false;
    let last = 0;
    let currentElapsed = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (paused) {
        started = false;
        return;
      }
      if (!started) {
        started = true;
        last = now;
        return;
      }
      const dt = Math.min(now - last, 120);
      last = now;
      currentElapsed += dt;
      const state = states[index];
      const headLen = state.heading.length;
      const detailCount = state.details.length;
      const typeEnd = WAIT_BEFORE_TYPE + headLen * TYPE_MS;
      const revealEnd = typeEnd + detailCount * STAGGER_MS + FADE_MS;
      const holdEnd = revealEnd + HOLD_MS;
      const deleteEnd = holdEnd + headLen * DELETE_MS;
      if (phase === "typing" && currentElapsed >= holdEnd) {
        setPhase("deleting");
      } else if (phase === "deleting" && currentElapsed >= deleteEnd) {
        currentElapsed = 0;
        setPhase("typing");
        setIndex((current) => (current + 1) % states.length);
      }
      setElapsed(currentElapsed);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [paused, phase, index, states, reduced]);

  const state = states[index];
  const headLen = state.heading.length;
  const detailCount = state.details.length;
  const e = elapsed;
  const typeEnd = WAIT_BEFORE_TYPE + headLen * TYPE_MS;
  const holdEnd = typeEnd + detailCount * STAGGER_MS + FADE_MS + HOLD_MS;

  let headingChars: number;
  if (reduced) {
    headingChars = headLen;
  } else if (phase === "typing") {
    headingChars = clamp(
      Math.floor((e - WAIT_BEFORE_TYPE) / TYPE_MS) + 1,
      0,
      headLen,
    );
  } else if (phase === "deleting") {
    headingChars = clamp(
      headLen - Math.ceil((e - holdEnd) / DELETE_MS),
      0,
      headLen,
    );
  } else {
    headingChars = headLen;
  }

  const isRevealed = (detailIndex: number) => {
    if (reduced) return true;
    if (phase === "deleting") {
      return e < holdEnd + (detailIndex + 1) * STAGGER_MS;
    }
    return e >= typeEnd + (detailIndex + 1) * STAGGER_MS;
  };

  const jumpTo = (target: number) => {
    setIndex(target);
    setPhase("typing");
    setElapsed(0);
  };

  const showCaret = !reduced && phase !== "hold";

  return (
    <div
      className="select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (
          event.relatedTarget &&
          !event.currentTarget.contains(event.relatedTarget as Node)
        ) {
          setPaused(false);
        }
      }}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="flex items-center gap-1.5"
          role="group"
          aria-label="Information categories"
        >
          {states.map((s, i) => (
            <button
              key={s.heading}
              type="button"
              aria-pressed={i === index}
              aria-label={`Show ${s.heading}`}
              onClick={() => jumpTo(i)}
              className={`h-2 w-2 rounded-full transition-colors duration-200 ${
                i === index ? "bg-accent" : "bg-rule hover:bg-accent/60"
              }`}
            />
          ))}
        </div>
        <h3 className="flex min-h-6 min-w-0 items-center text-tiny font-semibold uppercase tracking-[0.16em] text-ink-muted">
          <span className="truncate text-ink">
            {state.heading.slice(0, headingChars)}
          </span>
          {showCaret && (
            <span
              aria-hidden="true"
              className="animate-caret ml-0.5 inline-block h-[1.05em] w-px translate-y-[0.08em] bg-accent"
            />
          )}
        </h3>
      </div>

      <ol className="mt-3 flex min-h-[96px] flex-col gap-y-1.5">
        {state.details.map((detail, detailIndex) => {
          const revealed = isRevealed(detailIndex);
          return (
            <li key={detailIndex} className="flex h-7 items-center gap-2">
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60 transition-opacity duration-300"
                style={{
                  opacity: revealed ? 1 : 0,
                  transitionDelay: `${detailIndex * 100}ms`,
                }}
              />
              <span
                className={`text-small text-ink transition-[opacity,transform] duration-300 ${
                  revealed
                    ? "translate-y-0 opacity-100"
                    : "translate-y-1 opacity-0"
                }`}
                style={{ transitionDelay: `${detailIndex * 100}ms` }}
              >
                {detail}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-rule pt-3">
        <span
          key={state.heading}
          className="animate-[fadein_300ms_ease-out] flex items-center gap-1.5 text-tiny text-ink-muted motion-reduce:animate-none"
        >
          <state.metaIcon size={13} className="text-accent" aria-hidden="true" />
          {state.meta}
        </span>
        {action}
      </div>
    </div>
  );
}

const BUTTON_CLASS =
  "rounded-md border border-rule bg-paper-deep px-3 py-1.5 text-small font-semibold text-ink transition-colors hover:border-accent hover:text-accent";

export function ProfileCard({ variant }: { variant: DossierView }) {
  const educator = variant === "educator";
  const states = educator ? EDU_STATES : INST_STATES;
  const action = (
    <Link
      href={educator ? "#for-educators" : "#for-institutions"}
      className={BUTTON_CLASS}
    >
      {educator ? "View Profile" : "Apply for Role"}
    </Link>
  );

  return (
    <article className="mx-auto w-full max-w-md rounded-lg border border-rule bg-paper shadow-card-lg">
      <div className="border-b border-rule p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent-tint text-accent">
              {educator ? (
                <GraduationCap size={20} strokeWidth={2} aria-hidden="true" />
              ) : (
                <Building2 size={20} strokeWidth={2} aria-hidden="true" />
              )}
            </span>
            <div className="min-w-0">
              <p className="font-serif text-[20px] font-medium leading-tight text-ink">
                {educator ? "Dr. Ananya Sharma" : "Reader — Biotechnology"}
              </p>
              <p className="mt-0.5 text-tiny text-ink-muted">
                {educator
                  ? "Ph.D., IIT Delhi"
                  : "Deccan Institute of Life Sciences · 2 openings"}
              </p>
            </div>
          </div>
          <MatchRing value={educator ? 96 : 94} size={64} className="shrink-0" />
        </div>
      </div>

      <div className="px-5 py-4 sm:px-6 sm:py-5">
        <CyclingPanel states={states} action={action} />
      </div>
    </article>
  );
}