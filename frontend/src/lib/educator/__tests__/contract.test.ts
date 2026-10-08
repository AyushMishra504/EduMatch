import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parserResponseSchema, profileImportSchema } from "../resume-import";

/**
 * Contract mirror of `resume-parser/tests/test_contract_fields.py`.
 *
 * Both sides compare their declared schema against the same frozen file
 * (`contracts/parser-profile-fields.json`), so renaming a field in either the
 * Python parser or the zod import layer fails CI instead of silently
 * rejecting every resume.
 *
 * We read the *declared* shape (not parsed output) because `.nullish()` fields
 * are optional and simply vanish from a parsed result — inspecting the output
 * would pass even if a field were missing from the schema.
 */
const contract = JSON.parse(
  readFileSync(
    new URL("../../../../../contracts/parser-profile-fields.json", import.meta.url),
    "utf-8",
  ),
) as Record<string, string[]>;

type AnyZod = {
  shape?: Record<string, unknown>;
  element?: unknown;
  def?: {
    innerType?: unknown;
    element?: unknown;
    shape?: Record<string, unknown>;
  };
};

/** Follow optional/nullable/default wrappers down to the inner schema. */
function unwrap(schema: unknown): AnyZod {
  let current = schema as AnyZod | undefined;
  let guard = 0;
  while (current?.def?.innerType && guard < 10) {
    current = current.def.innerType as AnyZod;
    guard += 1;
  }
  return current ?? {};
}

function objectKeys(schema: unknown): string[] {
  const inner = unwrap(schema);
  const shape = inner.shape ?? inner.def?.shape;
  return shape ? Object.keys(shape).sort() : [];
}

function elementKeys(schema: unknown): string[] {
  const inner = unwrap(schema);
  return objectKeys(inner.element ?? inner.def?.element);
}

const expected = (field: string) => [...contract[field]!].sort();

describe("parser/frontend contract", () => {
  const shape = (profileImportSchema as unknown as AnyZod).shape!;

  it("top-level profile fields match the contract", () => {
    expect(objectKeys(profileImportSchema)).toEqual(expected("profile"));
  });

  it("personal fields match the contract", () => {
    expect(objectKeys(shape.personal)).toEqual(expected("personal"));
  });

  it("education row fields match the contract", () => {
    expect(elementKeys(shape.education)).toEqual(expected("educationItem"));
  });

  it("experience row fields match the contract", () => {
    expect(elementKeys(shape.experience)).toEqual(expected("experienceItem"));
  });

  it("project row fields match the contract", () => {
    expect(elementKeys(shape.projects)).toEqual(expected("projectItem"));
  });

  it("response envelope and meta match the contract", () => {
    const responseShape = (parserResponseSchema as unknown as AnyZod).shape!;
    expect(objectKeys(parserResponseSchema)).toEqual(expected("parseResponse"));
    expect(objectKeys(responseShape.meta)).toEqual(expected("meta"));
    expect(objectKeys(responseShape.profile)).toEqual(expected("profile"));
  });

  it("accepts parser-style certification objects (regression)", () => {
    const result = profileImportSchema.safeParse({
      certifications: [{ name: "UGC-NET", issuer: "UGC", date: "2021" }],
    });
    expect(result.success).toBe(true);
  });

  it("accepts a bare-string certification too (back-compat)", () => {
    const result = profileImportSchema.safeParse({ certifications: ["GATE"] });
    expect(result.success).toBe(true);
  });
});
