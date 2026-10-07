import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { SampleMatches } from "@/components/landing/SampleMatches";
import { Faq } from "@/components/landing/Faq";
import { Join } from "@/components/landing/Join";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "EduMatch — Upload your CV. Get matched to faculty roles.",
  description:
    "Build one academic profile, upload your CV, and preview faculty roles across India that fit your qualifications and experience.",
};

export default function Home() {
  return (
    <>
      {/* The scroll reveals are progressive enhancement only — without JS every
          section renders immediately in its final state. */}
      <noscript
        dangerouslySetInnerHTML={{
          __html:
            '<style>[data-reveal="out"]{opacity:1 !important;transform:none !important}</style>',
        }}
      />
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <SampleMatches />
        <Faq />
        <Join />
      </main>
      <Footer />
    </>
  );
}