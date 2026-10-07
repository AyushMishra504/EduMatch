import type {
  Discipline,
  EmploymentType,
  FacultyLevel,
  HighestDegree,
} from "@prisma/client";

const DISCIPLINE_DEMAND: Record<Discipline, number> = {
  COMPUTER_SCIENCE: 40,
  INFORMATION_TECHNOLOGY: 35,
  MANAGEMENT: 34,
  ECONOMICS: 24,
  COMMERCE: 22,
  LAW: 22,
  EDUCATION: 18,
  ENGLISH: 14,
  MATHEMATICS: 16,
  PHYSICS: 14,
  CHEMISTRY: 13,
  BIOTECHNOLOGY: 12,
  ELECTRONICS: 15,
  ELECTRICAL: 13,
  MECHANICAL: 12,
  CIVIL: 11,
  CHEMICAL: 10,
  BOTANY: 12,
  ZOOLOGY: 10,
  HINDI: 10,
  HISTORY: 9,
  POLITICAL_SCIENCE: 11,
  SOCIOLOGY: 10,
  PSYCHOLOGY: 12,
};

export function estimateMatches(input: {
  discipline?: Discipline | null;
  desiredLevels: FacultyLevel[];
  employmentTypes: EmploymentType[];
  preferredLocations: string[];
  highestDegree?: HighestDegree | null;
}): { count: number; note: string } {
  const base = input.discipline
    ? (DISCIPLINE_DEMAND[input.discipline] ?? 12)
    : 12;
  // Empty desiredLevels = "Any" → widest factor, same as 3+ levels.
  const levelFactor =
    input.desiredLevels.length === 0 || input.desiredLevels.length >= 3
      ? 1.0
      : input.desiredLevels.length === 2
        ? 0.8
        : 0.55;
  const typeFactor = input.employmentTypes.includes("FULL_TIME") ? 1.0 : 0.7;
  const locationFactor = input.preferredLocations.includes("Anywhere in India")
    ? 1.3
    : input.preferredLocations.length >= 4
      ? 1.0
      : input.preferredLocations.length >= 2
        ? 0.75
        : 0.5;
  const degreeFactor =
    input.highestDegree === "PHD" || input.highestDegree === "POSTDOC"
      ? 1.2
      : input.highestDegree === "MPHIL"
        ? 1.0
        : input.highestDegree === "MASTERS"
          ? 0.85
          : input.highestDegree === "BACHELORS"
            ? 0.5
            : 1.0;

  return {
    count: Math.max(
      1,
      Math.round(base * levelFactor * typeFactor * locationFactor * degreeFactor),
    ),
    note: "Estimated from typical demand in your field. Live listings open soon.",
  };
}
