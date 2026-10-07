import { describe, expect, it } from "vitest";
import {
  computeCompleteness,
  requiredGaps,
  validateCanPublish,
} from "../completeness";
import { makeProfile, publishableProfile } from "./fixtures";

describe("computeCompleteness", () => {
  it("scores an empty draft honestly (experience intentionally skipped, no fake data)", () => {
    const { percent, missing } = computeCompleteness(makeProfile());
    // Unanswered weights: basics 15 + academics 30 + research 10 +
    // preferences 25 = 80 → 20%. Experience is skipped-not-answered.
    expect(percent).toBe(20);
    expect(missing.length).toBeGreaterThan(0);
  });

  it("sorts missing items by weight (next best action first)", () => {
    const { missing } = computeCompleteness(makeProfile());
    const weights = missing.map((m) => m.weight);
    expect(weights).toEqual([...weights].sort((a, b) => b - a));
    expect(missing[0]!.label).toBe("Choose desired faculty levels");
  });

  it("carries a why on every missing item (profile priority copy)", () => {
    const { missing } = computeCompleteness(makeProfile());
    for (const item of missing) {
      expect(item.why.length).toBeGreaterThan(0);
    }
  });

  it("raises the score when discipline is answered", () => {
    const before = computeCompleteness(makeProfile());
    const after = computeCompleteness(
      makeProfile({ discipline: "COMPUTER_SCIENCE" }),
    );
    expect(after.percent).toBeGreaterThan(before.percent);
    expect(after.missing.map((m) => m.label)).not.toContain(
      "Choose your discipline",
    );
  });

  it("stays within 0–100", () => {
    const { percent } = computeCompleteness(
      publishableProfile({ completedSteps: 6 }),
    );
    expect(percent).toBeGreaterThanOrEqual(0);
    expect(percent).toBeLessThanOrEqual(100);
  });
});

describe("requiredGaps / validateCanPublish (canonical publish rules)", () => {
  it("blocks an empty draft with all four sections", () => {
    expect(requiredGaps(makeProfile())).toEqual([
      "Basics",
      "Academics",
      "Experience",
      "Preferences",
    ]);
  });

  it("maps every gap to its wizard step for deep-links", () => {
    expect(validateCanPublish(makeProfile())).toEqual([
      { label: "Basics", step: 1 },
      { label: "Academics", step: 2 },
      { label: "Experience", step: 3 },
      { label: "Preferences", step: 5 },
    ]);
  });

  it("allows a fully satisfied profile", () => {
    expect(requiredGaps(publishableProfile())).toEqual([]);
    expect(validateCanPublish(publishableProfile())).toEqual([]);
  });

  it("drops a gap as soon as its section is satisfied", () => {
    const noBasics = makeProfile({ headline: "Hi" });
    expect(requiredGaps(noBasics)).toContain("Basics");

    const basicsDone = makeProfile({
      phone: "9876543210",
      city: "Pune",
      state: "Maharashtra",
      headline: "Hi",
    });
    expect(requiredGaps(basicsDone)).not.toContain("Basics");
  });

  it("never blocks on research (step 4 is fully optional)", () => {
    const publishable = publishableProfile({
      publicationsCount: null,
      orcidId: null,
      scopusId: null,
      hIndex: null,
    });
    expect(requiredGaps(publishable)).toEqual([]);
  });

  it("blocks when experience was never answered (completedSteps < 3)", () => {
    expect(requiredGaps(publishableProfile({ completedSteps: 2 }))).toEqual([
      "Experience",
    ]);
  });
});
