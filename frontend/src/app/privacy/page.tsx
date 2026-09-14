import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  robots: { index: true },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="September 2026"
      sections={[
        {
          heading: "This is a draft",
          body: "EduMatch is in development, so this policy is a working draft. It will be finalized with legal review before the platform publicly launches, and we'll let you know when it changes.",
        },
        {
          heading: "What we collect today",
          body: "During development, this site doesn't ask for personal information from visitors. Once sign-up opens, anything we ask for — such as account details or profile information — will be covered by this policy.",
        },
        {
          heading: "What we don't do",
          body: "We don't sell personal data, and we don't share it with third parties for their own purposes.",
        },
        {
          heading: "Your choices",
          body: "When accounts open, you'll control what your profile shows and what institutions can see. You'll also be able to export or delete your information on request.",
        },
      ]}
    />
  );
}