import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { MarqueeTop, MarqueeBottom } from "@/components/landing/Marquee";
import { ForEducators } from "@/components/landing/ForEducators";
import { ForInstitutions } from "@/components/landing/ForInstitutions";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ComparisonTable } from "@/components/landing/ComparisonTable";
import { MatchSimulator } from "@/components/landing/MatchSimulator";
import { FloatingChatbot } from "@/components/landing/FloatingChatbot";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <MarqueeTop />
        <ForEducators />
        <MarqueeBottom />
        <ForInstitutions />
        <HowItWorks />
        <ComparisonTable />
        <MatchSimulator />
      </main>
      <FloatingChatbot />
      <Footer />
    </>
  );
}