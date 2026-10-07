import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  applyResumeImport,
  parserResponseSchema,
} from "@/lib/educator/resume-import";

export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set([".pdf", ".docx"]);

// Per-user rate limit (§21): accidental double-uploads and abuse protection.
// In-memory is enough for a single long-running instance; a multi-instance
// deployment should move this to Redis/DB.
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const attempts = new Map<string, number[]>();

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const recent = (attempts.get(userId) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS,
  );
  if (recent.length >= RATE_LIMIT_MAX) {
    attempts.set(userId, recent);
    return true;
  }
  recent.push(now);
  attempts.set(userId, recent);
  return false;
}

function parserBaseUrl(): string {
  return process.env.RESUME_PARSER_URL ?? "http://localhost:8000";
}

function fail(
  status: number,
  code: string,
  message: string,
  warnings: string[] = [],
) {
  return NextResponse.json(
    { success: false, error: { code, message }, warnings },
    { status },
  );
}

/**
 * POST /api/profile/import-resume — authenticated resume import (§18).
 *
 * Multipart `file` → internal parser → Zod-validated ProfileImport →
 * fill-only-empty merge in one Prisma transaction. The uploaded file is
 * never persisted; only the extracted fields (and the filename) are kept.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return fail(401, "UNAUTHENTICATED", "Please sign in to upload a resume.");
  }

  // Server is authoritative: role + profile come from the session/DB, never
  // from client-provided IDs (§20, §40).
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, name: true },
  });
  if (!user || user.role !== "EDUCATOR") {
    return fail(403, "FORBIDDEN", "Resume import is available for educators.");
  }

  let profile = await prisma.educatorProfile.findUnique({
    where: { userId: user.id },
    include: { education: true, experience: true },
  });
  if (!profile) {
    profile = await prisma.educatorProfile.create({
      data: { userId: user.id },
      include: { education: true, experience: true },
    });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail(400, "NO_FILE", "No file was uploaded.");
  }
  const upload = form.get("file");
  if (
    !upload ||
    typeof upload !== "object" ||
    typeof (upload as File).arrayBuffer !== "function"
  ) {
    return fail(400, "NO_FILE", "No file was uploaded.");
  }
  const file = upload as File;
  const filename = (file.name || "resume").slice(0, 200);
  const extension = filename.toLowerCase().slice(filename.lastIndexOf("."));
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    return fail(415, "UNSUPPORTED_FORMAT", "Only PDF and DOCX files are supported.");
  }
  if (file.size === 0) {
    return fail(422, "EMPTY_FILE", "The uploaded file is empty.");
  }
  if (file.size > MAX_BYTES) {
    return fail(413, "FILE_TOO_LARGE", "Resume is too large (max 5 MB).");
  }

  if (isRateLimited(user.id)) {
    return fail(
      429,
      "RATE_LIMITED",
      "Too many uploads in a short time. Please wait a few minutes and try again.",
    );
  }

  // Forward to the internal parser (§18.6). It knows nothing about the user.
  let parserBody: unknown;
  try {
    const forward = new FormData();
    forward.append("file", file, filename);
    const response = await fetch(`${parserBaseUrl()}/parse`, {
      method: "POST",
      body: forward,
      signal: AbortSignal.timeout(120_000),
    });
    parserBody = await response.json();
  } catch {
    return fail(
      502,
      "PARSER_UNAVAILABLE",
      "The resume service is not reachable right now. You can enter your details manually.",
    );
  }

  // The parser returns safe, user-facing messages — forward them, never raw
  // internals. Validate the success shape before touching Prisma (§37).
  const parsed = parserResponseSchema.safeParse(parserBody);
  if (!parsed.success) {
    return fail(
      422,
      "UNREADABLE_RESUME",
      "We couldn't read that resume. You can try another file or continue manually.",
    );
  }
  if (!parsed.data.success || !parsed.data.profile) {
    const parserError =
      (parserBody as { error?: { message?: string } })?.error?.message ??
      "We couldn't read that resume. You can try another file or continue manually.";
    return fail(422, "UNREADABLE_RESUME", parserError);
  }

  const result = applyResumeImport(
    {
      userName: user.name,
      phone: profile.phone,
      city: profile.city,
      state: profile.state,
      headline: profile.headline,
      highestDegree: profile.highestDegree,
      phdStatus: profile.phdStatus,
      discipline: profile.discipline,
      specializations: [...profile.specializations],
      eligibility: [...profile.eligibility],
      education: profile.education.map((e) => ({
        institution: e.institution,
        degree: e.degree,
      })),
      experience: profile.experience.map((e) => ({
        institution: e.institution,
        designation: e.designation,
      })),
    },
    parsed.data.profile,
    filename,
  );

  const { headlineDerived: _derived, ...profileScalars } = result.profilePatch;
  void _derived;

  const eduBase = profile.education.length;
  const expBase = profile.experience.length;

  try {
    await prisma.$transaction(async (tx) => {
      if (result.userPatch.name) {
        await tx.user.update({
          where: { id: user.id },
          data: { name: result.userPatch.name },
        });
      }
      if (Object.keys(profileScalars).length > 0) {
        await tx.educatorProfile.update({
          where: { id: profile!.id },
          data: profileScalars,
        });
      }
      if (result.newEducation.length > 0) {
        await tx.educationEntry.createMany({
          data: result.newEducation.map((row, index) => ({
            profileId: profile!.id,
            degree: row.degree,
            field: row.field,
            institution: row.institution,
            startYear: row.startYear,
            endYear: row.endYear,
            isOngoing: row.isOngoing,
            grade: row.grade,
            sortOrder: eduBase + index,
          })),
        });
      }
      if (result.newExperience.length > 0) {
        await tx.experienceEntry.createMany({
          data: result.newExperience.map((row, index) => ({
            profileId: profile!.id,
            designation: row.designation,
            institution: row.institution,
            startYear: row.startYear,
            startMonth: row.startMonth,
            endYear: row.endYear,
            endMonth: row.endMonth,
            isCurrent: row.isCurrent,
            subjects: [],
            sortOrder: expBase + index,
          })),
        });
      }
    });
  } catch {
    return fail(
      500,
      "IMPORT_FAILED",
      "We couldn't save the extracted details. You can enter them manually.",
    );
  }

  return NextResponse.json({
    success: true,
    filled: result.filled,
    warnings: [...parsed.data.meta.warnings, ...result.warnings],
    meta: {
      ocrUsed: parsed.data.meta.ocrUsed,
      sourceFormat: parsed.data.meta.sourceFormat,
      processingTimeMs: parsed.data.meta.processingTimeMs,
    },
  });
}
