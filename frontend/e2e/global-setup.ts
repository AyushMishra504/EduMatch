import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Resets the dev educator (dev@edumatch.local) to a fresh empty draft so
 * every run starts from the same state. Reads DATABASE_URL from
 * .env.local (the Prisma CLI reads prisma/.env instead — runtime code
 * only sees process.env, see AGENTS.md).
 */
function loadEnv() {
  const path = resolve(process.cwd(), ".env.local");
  let raw: string;
  try {
    raw = readFileSync(path, "utf8");
  } catch {
    return;
  }
  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const key = match[1]!;
    const value = match[2]!.trim().replace(/^["']|["']$/g, "");
    if (value && !process.env[key]) process.env[key] = value;
  }
}

export default async function globalSetup() {
  loadEnv();
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL missing — point frontend/.env.local at the local dev DB (npm run db:local).",
    );
  }

  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findUnique({
      where: { email: "dev@edumatch.local" },
      select: { id: true },
    });
    if (user) {
      await prisma.educatorProfile.update({
        where: { userId: user.id },
        data: {
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
        },
      });
    }
  } finally {
    await prisma.$disconnect();
  }
}
