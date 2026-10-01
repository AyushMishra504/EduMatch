"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Cpu,
  FlaskConical,
  GraduationCap,
  LineChart,
} from "lucide-react";
import { MatchRing } from "@/components/3d/MatchRing";

type Discipline = "cs" | "econ" | "bio" | "phys";
type Level = "assistant" | "associate" | "senior";

const DISCIPLINES: { value: Discipline; label: string; icon: typeof Cpu }[] = [
  { value: "cs", label: "Computer Science & AI", icon: Cpu },
  { value: "econ", label: "Economics", icon: LineChart },
  { value: "bio", label: "Biotechnology", icon: FlaskConical },
  { value: "phys", label: "Physics", icon: GraduationCap },
];

const LEVELS: { value: Level; label: string }[] = [
  { value: "assistant", label: "Assistant Professor" },
  { value: "associate", label: "Associate Professor" },
  { value: "senior", label: "Senior Professor" },
];

const CRITERIA_LABELS = [
  "Research alignment",
  "UGC norm fit",
  "Location fit",
  "Pay-band fit",
];

const CRITERIA_BASE: Record<Discipline, number[]> = {
  cs: [92, 88, 74, 90],
  econ: [84, 86, 78, 82],
  bio: [77, 90, 71, 79],
  phys: [80, 87, 82, 84],
};

const LEVEL_ADJUST: Record<Level, number> = {
  assistant: 0,
  associate: 2,
  senior: 4,
};

const ROLE_TITLES: Record<Discipline, string> = {
  cs: "Assistant/Associate Professor — Computational Sciences & Machine Learning",
  econ: "Assistant/Associate Professor — Applied Economics",
  bio: "Assistant Professor — Biotechnology & Life Sciences",
  phys: "Professor — Experimental & Applied Physics",
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div>
      <p className="text-tiny font-semibold uppercase tracking-[0.14em] text-ink-muted">
        {label}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={value === option.value}
            className={`rounded-md border px-3 py-2 text-small font-medium transition-colors ${
              value === option.value
                ? "border-accent bg-accent text-on-accent"
                : "border-rule bg-paper text-ink-muted hover:border-accent/50 hover:text-ink"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function MatchSimulator() {
  const [discipline, setDiscipline] = useState<Discipline>("cs");
  const [level, setLevel] = useState<Level>("assistant");

  const { criteria, score } = useMemo(() => {
    const criteria = CRITERIA_BASE[discipline].map((base) =>
      clamp(base + LEVEL_ADJUST[level], 70, 96),
    );
    const score = Math.round(
      criteria.reduce((sum, value) => sum + value, 0) / criteria.length,
    );
    return { criteria, score };
  }, [discipline, level]);

  return (
    <section id="match-sim" className="relative overflow-hidden scroll-mt-16 border-t border-rule bg-[#e3d8c8] dark:bg-[#241d17]">
      {/* Spotlight Orb */}
      <div className="pointer-events-none absolute left-[10%] top-[30%] h-[700px] w-[700px] rounded-full bg-accent/10 blur-[150px] animate-[orb-drift_20s_ease-in-out_infinite] mix-blend-screen" aria-hidden="true" />
      
      <div className="relative z-10 mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-tiny font-semibold uppercase tracking-[0.18em] text-accent">
              05 — Try the match
            </p>
            <h2 className="mt-4 font-serif font-medium text-h2 text-ink">
              See how a match is calculated.
            </h2>
          </div>
          <p className="max-w-md text-body text-ink-muted">
            A simplified demo — real matching weighs your actual dossier against
            each role&apos;s criteria. This shows the shape of it.
          </p>
        </div>

        <div className="mt-12 grid items-start gap-10 lg:grid-cols-12">
          <div className="card-lift space-y-7 rounded-md border border-rule bg-paper p-6 shadow-card sm:p-7 lg:col-span-7 hover:border-accent/30 group">
            <Segmented
              label="Discipline"
              value={discipline}
              options={DISCIPLINES.map(({ value, label }) => ({
                value,
                label,
              }))}
              onChange={setDiscipline}
            />

            <Segmented
              label="Level"
              value={level}
              options={LEVELS}
              onChange={setLevel}
            />

            <div>
              <p className="text-tiny font-semibold uppercase tracking-[0.14em] text-ink-muted">
                What feeds the score
              </p>
              <ul className="mt-3 space-y-3">
                {criteria.map((value, index) => (
                  <li
                    key={CRITERIA_LABELS[index]}
                    className="grid grid-cols-[9rem_1fr_2.5rem] items-center gap-3"
                  >
                    <span className="text-small text-ink">
                      {CRITERIA_LABELS[index]}
                    </span>
                    <span className="h-1.5 w-full bg-rule">
                      <span
                        className="block h-1.5 bg-accent transition-[width] duration-500"
                        style={{ width: `${value}%` }}
                      />
                    </span>
                    <span className="text-right text-small font-semibold text-accent">
                      {value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-tiny font-semibold uppercase tracking-[0.14em] text-ink-muted">
                Sample match
              </p>
              <div className="mt-3 flex items-center gap-4 rounded-md border border-rule bg-paper-deep p-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent-tint text-accent">
                  <Building2 size={18} strokeWidth={2} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-small font-medium text-ink">
                    {ROLE_TITLES[discipline]}
                  </p>
                  <p className="text-tiny text-ink-muted">
                    Sample institution · pay band disclosed
                  </p>
                </div>
                <span className="shrink-0 rounded-sm bg-accent px-2 py-1 text-tiny font-semibold text-on-accent">
                  {score}% fit
                </span>
              </div>
            </div>

            <p className="text-tiny text-ink-muted">
              Demo only — illustrative scores, not real rankings.
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="flex justify-center">
              <MatchRing
                value={score}
                label="match"
                size={172}
                className="shadow-card-lg"
              />
            </div>
            <p className="mt-6 text-center text-small text-ink-muted">
              {discipline === "cs" && "Strong research fit drives this score."}
              {discipline === "econ" && "Methods and teaching weigh heavily here."}
              {discipline === "bio" && "Lab facilities and grants move the needle."}
              {discipline === "phys" && "Publication depth keeps this high."}
            </p>
            <Link
              href="/signup"
              className="group mt-6 flex items-center justify-center gap-2 rounded-md bg-accent px-5 py-3 text-small font-semibold text-on-accent transition-colors hover:bg-accent-deep"
            >
              Match your real profile
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}