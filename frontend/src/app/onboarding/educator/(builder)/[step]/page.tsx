import { notFound, redirect } from "next/navigation";
import { requireEducatorWithUser } from "@/lib/educator/profile";
import { TOTAL_STEPS } from "@/lib/educator/constants";
import { maxReachableStep, wizardModeFor } from "@/lib/educator/wizard";
import { Step1Basics } from "@/components/educator/steps/Step1Basics";
import { Step2Academics } from "@/components/educator/steps/Step2Academics";
import { Step3Experience } from "@/components/educator/steps/Step3Experience";
import { Step4Research } from "@/components/educator/steps/Step4Research";
import { Step5Preferences } from "@/components/educator/steps/Step5Preferences";
import { Step6Review } from "@/components/educator/steps/Step6Review";

export const dynamic = "force-dynamic";

export default async function EducatorStepPage({
  params,
}: {
  params: Promise<{ step: string }>;
}) {
  const { step } = await params;
  const n = Number(step);
  if (!Number.isInteger(n) || n < 1 || n > TOTAL_STEPS) notFound();

  const { profile, user } = await requireEducatorWithUser();
  const mode = wizardModeFor(profile.visibility);

  // Guided progression. Steps unlock in order: you cannot open a step past
  // the first one whose required facts are still missing, so the setup reads
  // as one path instead of a hop-anywhere editor. A deep link (or a stale
  // back-button URL) past the frontier snaps to the first incomplete step.
  // Completed steps stay editable, and published profiles are fully unlocked
  // — `maxReachableStep` returns the final step for them.
  const maxReachable = maxReachableStep(profile);
  if (n > maxReachable) redirect(`/onboarding/educator/${maxReachable}`);

  switch (n) {
    case 1:
      return <Step1Basics profile={profile} user={user} mode={mode} />;
    case 2:
      return <Step2Academics profile={profile} user={user} mode={mode} />;
    case 3:
      return <Step3Experience profile={profile} user={user} mode={mode} />;
    case 4:
      return <Step4Research profile={profile} user={user} mode={mode} />;
    case 5:
      return <Step5Preferences profile={profile} user={user} mode={mode} />;
    case 6:
      return <Step6Review profile={profile} user={user} mode={mode} />;
    default:
      notFound();
  }
}
