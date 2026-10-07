import { describe, expect, it } from "vitest";
import {
  applyResumeImport,
  inferDiscipline,
  mapDegreeToHighestDegree,
  mapEligibilityHints,
  normalizePhone,
  splitLocation,
  type ExistingProfile,
  type ProfileImport,
} from "../resume-import";

const EMPTY: ExistingProfile = {
  userName: null,
  phone: null,
  city: null,
  state: null,
  headline: null,
  highestDegree: null,
  phdStatus: null,
  discipline: null,
  specializations: [],
  eligibility: [],
  education: [],
  experience: [],
};

function imported(overrides: Partial<ProfileImport> = {}): ProfileImport {
  return {
    personal: {},
    education: [],
    skills: [],
    experience: [],
    projects: [],
    certifications: [],
    eligibilityHints: [],
    ...overrides,
  };
}

describe("mapDegreeToHighestDegree", () => {
  it("maps common abbreviations", () => {
    expect(mapDegreeToHighestDegree("B.Tech")).toBe("BACHELORS");
    expect(mapDegreeToHighestDegree("M.Sc Physics")).toBe("MASTERS");
    expect(mapDegreeToHighestDegree("MBA")).toBe("MASTERS");
    expect(mapDegreeToHighestDegree("Ph.D.")).toBe("PHD");
    expect(mapDegreeToHighestDegree("Post-Doctoral Fellow")).toBe("POSTDOC");
    expect(mapDegreeToHighestDegree("B.Ed")).toBe("BACHELORS");
  });

  it("returns null when unclear", () => {
    expect(mapDegreeToHighestDegree(null)).toBeNull();
    expect(mapDegreeToHighestDegree("Diploma in Yoga")).toBeNull();
  });
});

describe("inferDiscipline", () => {
  it("infers a strong match", () => {
    expect(inferDiscipline(["Computer Science and Engineering"])).toBe(
      "COMPUTER_SCIENCE",
    );
    expect(inferDiscipline(["B.Tech", "Physics"])).toBe("PHYSICS");
  });

  it("leaves ambiguous or empty blank", () => {
    expect(inferDiscipline(["Bachelor of Technology"])).toBeNull();
    expect(inferDiscipline([])).toBeNull();
    expect(inferDiscipline(["Physics", "Chemistry"])).toBeNull();
  });
});

describe("mapEligibilityHints", () => {
  it("maps hint labels to enums", () => {
    expect(mapEligibilityHints(["UGC-NET", "JRF", "SET"])).toEqual([
      "UGC_NET",
      "JRF",
      "SET_SLET",
    ]);
  });

  it("drops unknown hints", () => {
    expect(mapEligibilityHints(["GATE", "something-else"])).toEqual(["GATE"]);
  });
});

describe("normalizePhone", () => {
  it("accepts E.164 and local Indian mobiles", () => {
    expect(normalizePhone("+919876543210")).toBe("9876543210");
    expect(normalizePhone("98765 43210")).toBe("9876543210");
  });

  it("rejects non-mobiles", () => {
    expect(normalizePhone("+1 555 123 4567")).toBeNull();
    expect(normalizePhone(null)).toBeNull();
  });
});

describe("splitLocation", () => {
  it("splits city and state", () => {
    expect(splitLocation("Pune, Maharashtra", null)).toEqual({
      city: "Pune",
      state: "Maharashtra",
    });
    expect(splitLocation("Pune, Maharashtra, India", null)).toEqual({
      city: "Pune",
      state: "Maharashtra",
    });
  });

  it("handles state-only and city-only", () => {
    expect(splitLocation("Maharashtra", null)).toEqual({
      city: null,
      state: "Maharashtra",
    });
    expect(splitLocation("Pune", null)).toEqual({ city: "Pune", state: null });
  });
});

describe("applyResumeImport", () => {
  const full = imported({
    personal: {
      name: "Ayush Mishra",
      phone: "+919876543210",
      location: "Pune, Maharashtra",
    },
    education: [
      {
        institution: "Manipal Institute of Technology",
        degree: "B.Tech",
        field: "Computer Science",
        startDate: "2022",
        endDate: "2026",
        grade: "8.7/10",
      },
    ],
    skills: ["Python", "React", "Python"],
    experience: [
      {
        company: "Google India",
        role: "Software Engineering Intern",
        startDate: "May 2025",
        endDate: "July 2025",
        description: null,
      },
    ],
    eligibilityHints: ["UGC-NET"],
  });

  it("fills empty fields and reports filled", () => {
    const result = applyResumeImport(EMPTY, full, "resume.pdf");
    expect(result.userPatch.name).toBe("Ayush Mishra");
    expect(result.profilePatch.phone).toBe("9876543210");
    expect(result.profilePatch.city).toBe("Pune");
    expect(result.profilePatch.state).toBe("Maharashtra");
    expect(result.profilePatch.highestDegree).toBe("BACHELORS");
    expect(result.profilePatch.discipline).toBe("COMPUTER_SCIENCE");
    expect(result.profilePatch.specializations).toEqual(["Python", "React"]);
    expect(result.profilePatch.eligibility).toEqual(["UGC_NET"]);
    expect(result.newEducation).toHaveLength(1);
    expect(result.newExperience).toHaveLength(1);
    expect(result.profilePatch.headline).toBe(
      "Software Engineering Intern at Google India",
    );
    expect(result.profilePatch.resumeFilename).toBe("resume.pdf");
    expect(result.filled.length).toBeGreaterThan(5);
  });

  it("preserves existing values", () => {
    const result = applyResumeImport(
      {
        ...EMPTY,
        userName: "Existing Name",
        phone: "9123456789",
        discipline: "PHYSICS",
        specializations: ["Python"],
      },
      full,
    );
    expect(result.userPatch).toEqual({});
    expect(result.profilePatch.phone).toBeUndefined();
    expect(result.profilePatch.discipline).toBeUndefined();
    // Python already present — only React merges in.
    expect(result.profilePatch.specializations).toEqual(["Python", "React"]);
  });

  it("does not duplicate education or experience rows", () => {
    const result = applyResumeImport(
      {
        ...EMPTY,
        education: [
          { institution: "Manipal Institute of Technology", degree: "BACHELORS" },
        ],
        experience: [
          { institution: "Google India", designation: "Software Engineering Intern" },
        ],
      },
      full,
    );
    expect(result.newEducation).toHaveLength(0);
    expect(result.newExperience).toHaveLength(0);
  });

  it("warns on year-only experience months instead of inventing them", () => {
    const result = applyResumeImport(
      EMPTY,
      imported({
        experience: [
          {
            company: "Acme College",
            role: "Assistant Professor",
            startDate: "2022",
            endDate: "2024",
            description: null,
          },
        ],
      }),
    );
    expect(result.newExperience).toHaveLength(1);
    expect(result.newExperience[0]!.monthsApproximate).toBe(true);
    expect(result.warnings.some((w) => w.includes("Exact months"))).toBe(true);
  });

  it("drops NONE eligibility when real eligibility arrives", () => {
    const result = applyResumeImport(
      { ...EMPTY, eligibility: ["NONE"] },
      imported({ eligibilityHints: ["GATE"] }),
    );
    expect(result.profilePatch.eligibility).toEqual(["GATE"]);
  });
});
