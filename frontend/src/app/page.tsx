import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Marquee } from "@/components/landing/Marquee";
import { ForEducators } from "@/components/landing/ForEducators";
import { ForInstitutions } from "@/components/landing/ForInstitutions";
import { WhoItsFor } from "@/components/landing/WhoItsFor";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Faq } from "@/components/landing/Faq";
import { Join } from "@/components/landing/Join";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <ForEducators />
        <ForInstitutions />
        <WhoItsFor />
        <HowItWorks />
        <Faq />
        <Join />
      </main>
      <Footer />
    </>
  );
}