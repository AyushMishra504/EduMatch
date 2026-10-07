import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Regression lock for the publish-validation contract (plan §M4 / brief §52):
 * BOTH publish entry points must route through the canonical
 * `validateCanPublish` helper — never re-implement section checks inline.
 */
function srcPath(rel: string): string {
  // __tests__ is three levels under src/ (lib/educator/__tests__).
  return fileURLToPath(new URL(`../../../${rel}`, import.meta.url));
}

describe("publish validation is canonical (both call sites)", () => {
  it.each([
    ["wizard publishProfile", "app/onboarding/educator/actions.ts"],
    ["profile toggleVisibility", "app/profile/actions.ts"],
  ])("%s uses validateCanPublish", (_name, rel) => {
    const source = readFileSync(srcPath(rel), "utf8");
    expect(source).toContain("validateCanPublish(profile)");
    expect(source).not.toMatch(/requiredGaps\s*\(/);
  });

  it("validateCanPublish is exported from the single source of truth", () => {
    const source = readFileSync(
      srcPath("lib/educator/completeness.ts"),
      "utf8",
    );
    expect(source).toMatch(/export function validateCanPublish\s*\(/);
  });
});
