import { describe, expect, it } from "vitest";
import { parseJobOpeningFormData } from "@/lib/institution/job-schema";

function formData(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

describe("parseJobOpeningFormData", () => {
  it("accepts the fields submitted by the vacancy form and absent optional fields", () => {
    const result = parseJobOpeningFormData(
      formData({
        title: "Assistant Professor",
        location: "Pune, Maharashtra",
        employmentType: "FULL_TIME",
        description: "Teach and develop undergraduate courses.",
      }),
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toMatchObject({
        title: "Assistant Professor",
        location: "Pune, Maharashtra",
        employmentType: "FULL_TIME",
        description: "Teach and develop undergraduate courses.",
      });
      expect(result.data.department).toBeUndefined();
    }
  });

  it("treats empty optional fields as omitted", () => {
    const result = parseJobOpeningFormData(
      formData({
        title: "Lecturer",
        location: "",
        employmentType: "",
        description: "Teach introductory courses.",
      }),
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.location).toBeUndefined();
      expect(result.data.employmentType).toBeUndefined();
    }
  });

  it("rejects missing required fields and unknown enum values", () => {
    const result = parseJobOpeningFormData(
      formData({
        title: "",
        employmentType: "REMOTE",
        description: "",
      }),
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path[0])).toEqual(
        expect.arrayContaining(["title", "employmentType", "description"]),
      );
    }
  });
});
