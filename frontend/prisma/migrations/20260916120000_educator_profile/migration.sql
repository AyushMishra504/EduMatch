-- CreateEnum
CREATE TYPE "ProfileVisibility" AS ENUM ('DRAFT', 'PUBLISHED');
CREATE TYPE "HighestDegree" AS ENUM ('BACHELORS', 'MASTERS', 'MPHIL', 'PHD', 'POSTDOC');
CREATE TYPE "PhdStatus" AS ENUM ('NONE', 'PURSUING', 'SUBMITTED', 'AWARDED');
CREATE TYPE "Discipline" AS ENUM ('COMPUTER_SCIENCE', 'INFORMATION_TECHNOLOGY', 'ELECTRONICS', 'ELECTRICAL', 'MECHANICAL', 'CIVIL', 'CHEMICAL', 'BIOTECHNOLOGY', 'MATHEMATICS', 'PHYSICS', 'CHEMISTRY', 'BOTANY', 'ZOOLOGY', 'ECONOMICS', 'COMMERCE', 'MANAGEMENT', 'ENGLISH', 'HINDI', 'HISTORY', 'POLITICAL_SCIENCE', 'SOCIOLOGY', 'PSYCHOLOGY', 'EDUCATION', 'LAW');
CREATE TYPE "Eligibility" AS ENUM ('UGC_NET', 'CSIR_NET', 'SET_SLET', 'JRF', 'GATE', 'NONE');
CREATE TYPE "FacultyLevel" AS ENUM ('GUEST', 'VISITING', 'ASSISTANT_PROFESSOR', 'ASSOCIATE_PROFESSOR', 'PROFESSOR', 'HOD');
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'CONTRACT', 'VISITING', 'PART_TIME');
CREATE TYPE "UgcPayLevel" AS ENUM ('LEVEL_10', 'LEVEL_11', 'LEVEL_12', 'LEVEL_13A', 'LEVEL_14', 'CONSOLIDATED', 'NEGOTIABLE');

CREATE TABLE "EducatorProfile" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "phone" TEXT, "city" TEXT, "state" TEXT,
  "willingToRelocate" BOOLEAN NOT NULL DEFAULT false, "headline" TEXT, "bio" TEXT,
  "highestDegree" "HighestDegree", "phdStatus" "PhdStatus", "discipline" "Discipline",
  "specializations" TEXT[] DEFAULT ARRAY[]::TEXT[], "eligibility" "Eligibility"[] DEFAULT ARRAY[]::"Eligibility"[],
  "isFresher" BOOLEAN NOT NULL DEFAULT false, "teachingYears" INTEGER, "industryYears" INTEGER,
  "currentInstitution" TEXT, "currentDesignation" TEXT, "noticePeriodDays" INTEGER,
  "publicationsCount" INTEGER, "orcidId" TEXT, "scopusId" TEXT, "hIndex" INTEGER,
  "desiredLevels" "FacultyLevel"[] DEFAULT ARRAY[]::"FacultyLevel"[], "employmentTypes" "EmploymentType"[] DEFAULT ARRAY[]::"EmploymentType"[],
  "preferredLocations" TEXT[] DEFAULT ARRAY[]::TEXT[], "expectedPayLevel" "UgcPayLevel",
  "resumeUrl" TEXT, "resumeFilename" TEXT, "visibility" "ProfileVisibility" NOT NULL DEFAULT 'DRAFT',
  "completedSteps" INTEGER NOT NULL DEFAULT 0, "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EducatorProfile_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "EducationEntry" (
  "id" TEXT NOT NULL, "profileId" TEXT NOT NULL, "degree" "HighestDegree" NOT NULL, "field" TEXT NOT NULL,
  "institution" TEXT NOT NULL, "startYear" INTEGER NOT NULL, "endYear" INTEGER, "isOngoing" BOOLEAN NOT NULL DEFAULT false,
  "grade" TEXT, "sortOrder" INTEGER NOT NULL DEFAULT 0, CONSTRAINT "EducationEntry_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ExperienceEntry" (
  "id" TEXT NOT NULL, "profileId" TEXT NOT NULL, "designation" TEXT NOT NULL, "institution" TEXT NOT NULL,
  "startYear" INTEGER NOT NULL, "startMonth" INTEGER NOT NULL, "endYear" INTEGER, "endMonth" INTEGER,
  "isCurrent" BOOLEAN NOT NULL DEFAULT false, "subjects" TEXT[] DEFAULT ARRAY[]::TEXT[], "sortOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "ExperienceEntry_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "EducatorProfile_userId_key" ON "EducatorProfile"("userId");
CREATE INDEX "EducatorProfile_visibility_discipline_idx" ON "EducatorProfile"("visibility", "discipline");
CREATE INDEX "EducationEntry_profileId_idx" ON "EducationEntry"("profileId");
CREATE INDEX "ExperienceEntry_profileId_idx" ON "ExperienceEntry"("profileId");
ALTER TABLE "EducatorProfile" ADD CONSTRAINT "EducatorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EducationEntry" ADD CONSTRAINT "EducationEntry_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "EducatorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExperienceEntry" ADD CONSTRAINT "ExperienceEntry_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "EducatorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
