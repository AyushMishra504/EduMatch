-- CreateEnum
CREATE TYPE "VacancyStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED');

-- CreateTable
CREATE TABLE "InstitutionProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT,
    "website" TEXT,
    "city" TEXT,
    "state" TEXT,
    "description" TEXT,
    "institutionType" TEXT,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "phone" TEXT,
    "visibility" "ProfileVisibility" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstitutionProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobOpening" (
    "id" TEXT NOT NULL,
    "institutionProfileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "department" TEXT,
    "location" TEXT,
    "employmentType" "EmploymentType",
    "discipline" "Discipline",
    "facultyLevel" "FacultyLevel",
    "description" TEXT,
    "requirements" TEXT,
    "status" "VacancyStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobOpening_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InstitutionProfile_userId_key" ON "InstitutionProfile"("userId");

-- CreateIndex
CREATE INDEX "InstitutionProfile_visibility_city_idx" ON "InstitutionProfile"("visibility", "city");

-- CreateIndex
CREATE INDEX "JobOpening_institutionProfileId_status_idx" ON "JobOpening"("institutionProfileId", "status");

-- AddForeignKey
ALTER TABLE "InstitutionProfile" ADD CONSTRAINT "InstitutionProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobOpening" ADD CONSTRAINT "JobOpening_institutionProfileId_fkey" FOREIGN KEY ("institutionProfileId") REFERENCES "InstitutionProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
