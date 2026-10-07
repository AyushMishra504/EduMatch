import type { EducationEntry, ExperienceEntry } from "@prisma/client";
import type { ProfileWithRelations } from "../profile";

type Profile = NonNullable<ProfileWithRelations>;

const now = new Date("2026-01-01T00:00:00.000Z");

export function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: "profile-1",
    userId: "user-1",
    phone: null,
    city: null,
    state: null,
    willingToRelocate: false,
    headline: null,
    bio: null,
    highestDegree: null,
    phdStatus: null,
    discipline: null,
    specializations: [],
    eligibility: [],
    isFresher: false,
    teachingYears: null,
    industryYears: null,
    currentInstitution: null,
    currentDesignation: null,
    noticePeriodDays: null,
    publicationsCount: null,
    orcidId: null,
    scopusId: null,
    hIndex: null,
    desiredLevels: [],
    employmentTypes: [],
    preferredLocations: [],
    expectedPayLevel: null,
    resumeUrl: null,
    resumeFilename: null,
    visibility: "DRAFT",
    completedSteps: 0,
    publishedAt: null,
    createdAt: now,
    updatedAt: now,
    education: [],
    experience: [],
    ...overrides,
  };
}

export const educationEntry: EducationEntry = {
  id: "edu-1",
  profileId: "profile-1",
  degree: "PHD",
  field: "Computer Science",
  institution: "IIT Bombay",
  startYear: 2015,
  endYear: 2020,
  isOngoing: false,
  grade: null,
  sortOrder: 0,
};

export const experienceEntry: ExperienceEntry = {
  id: "exp-1",
  profileId: "profile-1",
  designation: "Assistant Professor",
  institution: "BITS Pilani",
  startYear: 2021,
  startMonth: 7,
  endYear: null,
  endMonth: null,
  isCurrent: true,
  subjects: ["Data Structures"],
  sortOrder: 0,
};

/**
 * Satisfies every publish requirement (validateCanPublish → []) with the
 * minimum data the real wizard would have collected.
 */
export function publishableProfile(overrides: Partial<Profile> = {}): Profile {
  return makeProfile({
    phone: "9876543210",
    city: "Pune",
    state: "Maharashtra",
    headline: "Assistant Professor, Computer Science",
    highestDegree: "PHD",
    phdStatus: "AWARDED",
    discipline: "COMPUTER_SCIENCE",
    specializations: ["Machine Learning"],
    eligibility: ["UGC_NET"],
    education: [educationEntry],
    completedSteps: 5,
    desiredLevels: ["ASSISTANT_PROFESSOR"],
    employmentTypes: ["FULL_TIME"],
    preferredLocations: ["Pune"],
    ...overrides,
  });
}
