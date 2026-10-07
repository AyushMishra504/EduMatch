import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Wordmark } from "@/components/Logo";
import { FirstRunChecklist } from "@/components/educator/FirstRunChecklist";
import { ProfileStatusCard } from "@/components/educator/ProfileStatusCard";
import { ResumeImportCard } from "@/components/educator/ResumeImportCard";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { computeCompleteness } from "@/lib/educator/completeness";
import { signOutAction } from "./actions";

export const metadata: Metadata = {
  title: "Dashboard",
};

const ROLE_LABEL: Record<string, string> = {
  EDUCATOR: "Educator",
  INSTITUTION: "Institution",
};

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ welcome?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, name: true, email: true, image: true },
  });

  if (!user || user.role === "UNSET") redirect("/onboarding");

  const params = searchParams ? await searchParams : undefined;

  let educatorBlock: React.ReactNode = null;
  if (user.role === "EDUCATOR") {
    const profile = await prisma.educatorProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        education: { orderBy: { sortOrder: "asc" } },
        experience: { orderBy: { sortOrder: "asc" } },
      },
    });
    if (profile) {
      const { percent, missing } = computeCompleteness(profile);
      const recentlyPublished =
        profile.publishedAt != null &&
        // eslint-disable-next-line react-hooks/purity
        Date.now() - profile.publishedAt.getTime() < SEVEN_DAYS_MS;
      const showChecklist =
        params?.welcome === "1" || recentlyPublished;
      educatorBlock = (
        <>
          <ProfileStatusCard
            visibility={profile.visibility}
            percent={percent}
            missing={missing}
          />
          <div className="mt-4 w-full text-left">
            <ResumeImportCard
              title="Upload your resume"
              description="Works at any stage — only empty fields are filled, nothing is overwritten."
              manualHref="/profile"
            />
          </div>
          {showChecklist ? (
            <FirstRunChecklist
              published={profile.visibility === "PUBLISHED"}
              hasResearch={
                profile.publicationsCount !== null ||
                profile.orcidId !== null ||
                profile.hIndex !== null
              }
            />
          ) : null}
        </>
      );
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-5 py-16 sm:px-0">
      <div className="flex items-center justify-between">
        <Link href="/" aria-label="EduMatch home">
          <Wordmark size={28} />
        </Link>
        <form action={signOutAction}>
          <button
            type="submit"
            className="rounded-md px-3 py-2 text-small font-semibold text-ink-muted transition-colors hover:text-ink"
          >
            Sign out
          </button>
        </form>
      </div>

      <div className="mt-20 flex flex-col items-center text-center">
        {user.image ? (
          <Image
            src={user.image}
            alt=""
            width={64}
            height={64}
            className="h-16 w-16 rounded-full border border-rule object-cover"
          />
        ) : (
          <span className="grid h-16 w-16 place-items-center rounded-full border border-rule bg-paper-deep font-serif text-h3 font-medium text-ink-muted">
            {(user.name ?? user.email ?? "U").charAt(0).toUpperCase()}
          </span>
        )}
        <h1 className="mt-5 font-serif text-h2 font-medium text-ink">
          {params?.welcome === "1" && user.name
            ? `You're all set, ${user.name.split(" ")[0]}.`
            : user.name
              ? `Welcome, ${user.name.split(" ")[0]}.`
              : "Welcome."}
        </h1>
        <span className="mt-3 inline-block rounded-full border border-accent/30 bg-accent-tint px-3 py-1 text-tiny font-semibold text-accent">
          {ROLE_LABEL[user.role] ?? user.role}
        </span>
        {user.role === "INSTITUTION" ? (
          <p className="mt-6 max-w-md text-body leading-relaxed text-ink-muted">
            Your workspace is on its way. Profiles, matching, and your full
            dashboard are being built — this is where they&apos;ll live.
          </p>
        ) : null}
        {educatorBlock}
        {params?.welcome === "1" && user.role === "EDUCATOR" ? (
          <Link
            href="/profile"
            className="mt-8 rounded-md bg-accent px-5 py-3 text-small font-semibold text-on-accent transition-colors hover:bg-accent-deep"
          >
            View profile
          </Link>
        ) : null}
        <Link
          href="/"
          className="mt-8 rounded-md border border-rule px-5 py-3 text-small font-semibold text-ink transition-colors hover:bg-paper-deep"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
