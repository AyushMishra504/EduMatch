import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service",
  robots: { index: true },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="September 2026"
      sections={[
        {
          heading: "This is a draft",
          body: "EduMatch is in development. These terms are a working draft and will be finalized with legal review before the platform publicly launches.",
        },
        {
          heading: "Browsing the site",
          body: "Until sign-up opens, using this website involves no account and no obligations. Nothing on the site is an offer or promise that any specific feature, role, or institution will be available at launch.",
        },
        {
          heading: "Using EduMatch",
          body: "When accounts open, using EduMatch will create a profile governed by these terms. You'll be expected to keep your information accurate and to use the platform lawfully.",
        },
        {
          heading: "Changes",
          body: "We may revise these terms as the product develops. Material changes will be shared before they take effect.",
        },
      ]}
    />
  );
}