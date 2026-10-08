import { BuilderShell } from "@/components/educator/BuilderShell";
import { requireEducatorProfile } from "@/lib/educator/profile";
import { completedThrough, maxReachableStep } from "@/lib/educator/wizard";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Note: no PUBLISHED redirect here — /profile Edit links reuse the wizard
  // for post-publish editing. The index resume route
  // (app/onboarding/educator/page.tsx) still bounces published users to
  // /dashboard, and save actions return published users to /profile.
  const profile = await requireEducatorProfile();
  return (
    <BuilderShell
      completedThrough={completedThrough(profile)}
      maxReachable={maxReachableStep(profile)}
    >
      {children}
    </BuilderShell>
  );
}
