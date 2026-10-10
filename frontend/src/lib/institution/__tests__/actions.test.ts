import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  findUser: vi.fn(),
  createJob: vi.fn(),
  revalidatePath: vi.fn(),
  updateTag: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: mocks.findUser },
    jobOpening: { create: mocks.createJob },
  },
}));
vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
  updateTag: mocks.updateTag,
}));
vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

import { createInstitutionJob } from "@/lib/institution/actions";

const initialState = { message: null, fieldErrors: {} };

function validFormData() {
  const form = new FormData();
  form.set("title", "Assistant Professor");
  form.set("location", "Pune");
  form.set("employmentType", "FULL_TIME");
  form.set("description", "Teach and develop undergraduate courses.");
  return form;
}

describe("createInstitutionJob", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { id: "user-1" } });
    mocks.findUser.mockResolvedValue({
      role: "INSTITUTION",
      institutionProfile: { id: "institution-1" },
    });
    mocks.createJob.mockResolvedValue({ id: "job-1" });
    mocks.redirect.mockImplementation((path: string) => {
      throw new Error(`REDIRECT:${path}`);
    });
  });

  it("returns field errors for invalid input without creating a vacancy", async () => {
    const form = validFormData();
    form.set("employmentType", "UNKNOWN");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    const result = await createInstitutionJob(initialState, form);

    expect(result.message).toBe("Please review the highlighted fields and try again.");
    expect(result.fieldErrors.employmentType).toBeDefined();
    expect(mocks.createJob).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalled();
    expect(JSON.stringify(warn.mock.calls)).not.toContain("UNKNOWN");
    warn.mockRestore();
  });

  it("creates a published vacancy for the authenticated institution and refreshes its dashboard", async () => {
    await expect(createInstitutionJob(initialState, validFormData())).rejects.toThrow(
      "REDIRECT:/institution/dashboard",
    );

    expect(mocks.findUser).toHaveBeenCalledWith({
      where: { id: "user-1" },
      select: {
        role: true,
        institutionProfile: { select: { id: true } },
      },
    });
    expect(mocks.createJob).toHaveBeenCalledWith({
      data: {
        institutionProfile: { connect: { id: "institution-1" } },
        title: "Assistant Professor",
        location: "Pune",
        employmentType: "FULL_TIME",
        description: "Teach and develop undergraduate courses.",
        status: "PUBLISHED",
      },
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/institution/dashboard");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/institution/jobs");
  });
});
