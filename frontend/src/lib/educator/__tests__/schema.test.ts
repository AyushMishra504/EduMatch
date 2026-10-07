import { describe, expect, it } from "vitest";
import {
  formDataToObject,
  minimalOnboardingSchema,
  step1Schema,
  step5Schema,
} from "../schema";

function fd(entries: Record<string, string | string[]>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    if (Array.isArray(value)) value.forEach((v) => data.append(key, v));
    else data.set(key, value);
  }
  return data;
}

describe("minimalOnboardingSchema (one-screen onboarding)", () => {
  it("accepts discipline alone (employment types optional)", () => {
    const result = minimalOnboardingSchema.safeParse(
      formDataToObject(fd({ discipline: "COMPUTER_SCIENCE" })),
    );
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.employmentTypes).toEqual([]);
  });

  it("accepts discipline + multiple employment types", () => {
    const result = minimalOnboardingSchema.safeParse(
      formDataToObject(
        fd({
          discipline: "MATHEMATICS",
          employmentTypes: ["FULL_TIME", "VISITING"],
        }),
      ),
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.employmentTypes).toEqual(["FULL_TIME", "VISITING"]);
    }
  });

  it("rejects a missing discipline with a field error", () => {
    const result = minimalOnboardingSchema.safeParse(
      formDataToObject(fd({ employmentTypes: ["FULL_TIME"] })),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      expect(fieldErrors.discipline?.length).toBeGreaterThan(0);
    }
  });

  it("rejects an unknown discipline", () => {
    const result = minimalOnboardingSchema.safeParse(
      formDataToObject(fd({ discipline: "ASTRONOMY" })),
    );
    expect(result.success).toBe(false);
  });
});

describe("step schemas stay lenient (blank → null, never trap the user)", () => {
  it("step1: blank strings become null instead of failing", () => {
    // Mirrors the real form: the relocation radio pair always submits a
    // value ("true"/"false"), so the key is never absent in production.
    const result = step1Schema.safeParse(
      formDataToObject(
        fd({
          phone: "",
          city: "",
          state: "",
          headline: "",
          bio: "",
          willingToRelocate: "false",
        }),
      ),
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBeNull();
      expect(result.data.city).toBeNull();
      expect(result.data.state).toBeNull();
      expect(result.data.headline).toBeNull();
      expect(result.data.bio).toBeNull();
      // Regression: radio value "false" (string) must parse as false —
      // picking "No" used to fail the whole save.
      expect(result.data.willingToRelocate).toBe(false);
    }
  });

  it("step5: empty preference arrays are valid (skip paths allowed)", () => {
    const result = step5Schema.safeParse(
      formDataToObject(
        fd({ preferredLocations: "[]", expectedPayLevel: "" }),
      ),
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.desiredLevels).toEqual([]);
      expect(result.data.employmentTypes).toEqual([]);
      expect(result.data.preferredLocations).toEqual([]);
      expect(result.data.expectedPayLevel).toBeNull();
    }
  });
});
