import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const include = { education: { orderBy: { sortOrder: "asc" as const } }, experience: { orderBy: { sortOrder: "asc" as const } } };
export type ProfileWithRelations = Awaited<ReturnType<typeof getProfileWithRelations>>;

export async function ensureProfile(userId: string) {
  return prisma.educatorProfile.upsert({ where: { userId }, create: { userId }, update: {} });
}
export async function getProfileWithRelations(userId: string) {
  return prisma.educatorProfile.findUnique({ where: { userId }, include });
}

export type EducatorAccount = {
  name: string | null;
  email: string | null;
  image: string | null;
};

/**
 * The single gate for educator-only routes.
 *
 * Two hard-won performance rules live here — do not "simplify" them away:
 *
 * 1. React `cache()` dedupes this across layout + page + step page of the
 *    same request. Without it every `require*` call re-runs `auth()` (which
 *    is NOT request-cached by next-auth v5) plus its own queries — the old
 *    layout+page pair cost 8 serial roundtrips.
 * 2. One Prisma query fetches user + role + profile + relations. The Postgres
 *    instance is remote (~265ms per roundtrip), so serial awaits dominate
 *    page latency. Only a *missing* profile triggers a second write.
 */
const loadEducatorGate = cache(async (): Promise<{
  profile: NonNullable<ProfileWithRelations>;
  user: EducatorAccount;
}> => {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const account = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      image: true,
      role: true,
      educatorProfile: { include },
    },
  });
  if (!account || account.role !== "EDUCATOR") redirect("/onboarding");

  let profile = account.educatorProfile;
  if (!profile) {
    profile = await prisma.educatorProfile.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id },
      update: {},
      include,
    });
  }
  if (!profile) redirect("/onboarding");

  return {
    profile,
    user: { name: account.name, email: account.email, image: account.image },
  };
});

export async function requireEducatorProfile() {
  const { profile } = await loadEducatorGate();
  return profile;
}

/**
 * Same gate, plus the Google account fields so the wizard can prefill
 * without asking the user to re-enter what auth already knows. Shares the
 * cached gate with `requireEducatorProfile`, so combining both in one
 * render costs no extra roundtrip.
 */
export async function requireEducatorWithUser(): Promise<{
  profile: NonNullable<ProfileWithRelations>;
  user: EducatorAccount;
}> {
  return loadEducatorGate();
}
