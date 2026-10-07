"use client";

import { TrendingUp } from "lucide-react";
import { estimateMatches } from "@/lib/educator/match-estimate";
import type {
  Discipline,
  EmploymentType,
  FacultyLevel,
  HighestDegree,
} from "@prisma/client";

/**
 * Honest market signal — a demand-table heuristic, explicitly not live
 * listings. Secondary reinforcement, never the main reason to continue.
 */
export function MatchEstimate({
  discipline,
  desiredLevels,
  employmentTypes,
  preferredLocations,
  highestDegree,
}: {
  discipline?: Discipline | null;
  desiredLevels: FacultyLevel[];
  employmentTypes: EmploymentType[];
  preferredLocations: string[];
  highestDegree?: HighestDegree | null;
}) {
  const { count } = estimateMatches({
    discipline,
    desiredLevels,
    employmentTypes,
    preferredLocations,
    highestDegree,
  });
  return (
    <div className="flex items-start gap-3 rounded-md border border-rule bg-paper-deep p-4">
      <TrendingUp size={18} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
      <div>
        <p className="text-small font-semibold text-ink">Market signal</p>
        <p className="mt-1 text-small leading-relaxed text-ink-muted">
          Your current choices align with around{" "}
          <strong className="font-semibold text-ink">~{count} potential role types</strong>.
          Broader preferences usually mean more opportunities you may fit.
        </p>
        <p className="mt-1 text-small text-ink-muted">
          Illustrative estimate — not live listings.
        </p>
      </div>
    </div>
  );
}
