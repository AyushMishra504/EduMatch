import { describe, expect, it } from "vitest";
import type {
  EmploymentType,
  FacultyLevel,
} from "@prisma/client";
import { estimateMatches } from "../match-estimate";

const empty: {
  desiredLevels: FacultyLevel[];
  employmentTypes: EmploymentType[];
  preferredLocations: string[];
} = {
  desiredLevels: [],
  employmentTypes: [],
  preferredLocations: [],
};

describe("estimateMatches (honest heuristic)", () => {
  it("is deterministic for identical input", () => {
    const input = {
      discipline: "COMPUTER_SCIENCE" as const,
      desiredLevels: ["ASSISTANT_PROFESSOR"] as FacultyLevel[],
      employmentTypes: ["FULL_TIME"] as EmploymentType[],
      preferredLocations: ["Anywhere in India"],
      highestDegree: "PHD" as const,
    };
    expect(estimateMatches(input)).toEqual(estimateMatches(input));
  });

  it("never returns zero, even with no answers", () => {
    const { count } = estimateMatches(empty);
    expect(count).toBeGreaterThanOrEqual(1);
  });

  it("rewards broader preferences with a higher estimate", () => {
    const narrow = estimateMatches({
      discipline: "BOTANY",
      desiredLevels: ["GUEST"] as FacultyLevel[],
      employmentTypes: ["PART_TIME"] as EmploymentType[],
      preferredLocations: ["Pune"],
      highestDegree: "BACHELORS",
    });
    const broad = estimateMatches({
      discipline: "COMPUTER_SCIENCE",
      desiredLevels: [
        "ASSISTANT_PROFESSOR",
        "ASSOCIATE_PROFESSOR",
        "PROFESSOR",
      ] as FacultyLevel[],
      employmentTypes: ["FULL_TIME"] as EmploymentType[],
      preferredLocations: ["Anywhere in India"],
      highestDegree: "PHD",
    });
    expect(broad.count).toBeGreaterThan(narrow.count);
  });

  it("treats empty desiredLevels (the Any card) as wide as 3+ levels", () => {
    const base = {
      discipline: "COMPUTER_SCIENCE" as const,
      employmentTypes: ["FULL_TIME"] as EmploymentType[],
      preferredLocations: ["Anywhere in India"],
      highestDegree: "PHD" as const,
    };
    const anyLevels = estimateMatches({ ...base, desiredLevels: [] });
    const threeLevels = estimateMatches({
      ...base,
      desiredLevels: [
        "ASSISTANT_PROFESSOR",
        "ASSOCIATE_PROFESSOR",
        "PROFESSOR",
      ] as FacultyLevel[],
    });
    expect(anyLevels.count).toBe(threeLevels.count);
    expect(anyLevels.count).toBeGreaterThan(
      estimateMatches({
        ...base,
        desiredLevels: ["GUEST"] as FacultyLevel[],
      }).count,
    );
  });

  it("labels itself as an estimate, not live listings", () => {
    const { note } = estimateMatches(empty);
    expect(note).toMatch(/estimated from typical demand/i);
    expect(note).toMatch(/live listings open soon/i);
  });
});
