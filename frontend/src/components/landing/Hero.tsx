import Link from "next/link";
import { Check } from "lucide-react";
import { GooglePillButton } from "@/components/GoogleSignInButton";
import { CampusVisual } from "@/components/landing/CampusVisual";

const ASSURANCES = [
  "Upload your CV or fill a short form",
  "Edit anything",
  "You choose who sees it",
];

export function Hero() {
  return (
    <section className="hero-dot-grid relative overflow-hidden border-b border-[#E5E7EB] bg-white dark:border-[#1F1F1F]/60 dark:bg-black">
      <div
        className="hero-aurora pointer-events-none absolute inset-0 motion-reduce:animate-none animate-sweep"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[70%] bg-gradient-to-b from-white/85 to-transparent dark:from-transparent"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-6 pb-28 pt-20 lg:grid-cols-12 lg:gap-14 lg:pb-32 lg:pt-28">
        <div className="flex flex-col items-start lg:col-span-7">
          <span className="motion-reduce:animate-none animate-rise mb-6 inline-flex items-center rounded-full border border-[#1F8F7E]/30 bg-[#1F8F7E]/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#12796B] dark:border-transparent dark:bg-transparent dark:px-0 dark:py-0 dark:text-[#1F8F7E]">
            For faculty and educators in India
          </span>
          <h1 className="motion-reduce:animate-none animate-rise mb-8 font-serif text-[46px] font-normal leading-[1.06] tracking-tight text-[#09090B] [animation-delay:80ms] sm:text-[58px] lg:text-[66px] dark:text-white">
            The right faculty role,{" "}
            <span className="font-normal italic text-[#12796B] dark:text-[#1F8F7E]">
              matched to you.
            </span>
          </h1>
          <p className="motion-reduce:animate-none animate-rise mb-9 max-w-xl text-[17px] font-normal leading-relaxed text-[#52525B] [animation-delay:160ms] sm:text-[18px] dark:text-[#A1A1AA]">
            EduMatch connects educators with universities across India. Build
            one academic profile, or upload your CV, and see the roles that
            fit.
          </p>

          <div className="motion-reduce:animate-none animate-rise [animation-delay:240ms]">
            <GooglePillButton />
          </div>

          <div className="motion-reduce:animate-none animate-rise mt-6 flex flex-wrap items-center gap-x-7 gap-y-2.5 text-[14px] text-[#4B5563] [animation-delay:320ms] dark:text-[#A1A1AA]">
            {ASSURANCES.map((assurance) => (
              <span key={assurance} className="inline-flex items-center gap-2">
                <Check
                  size={15}
                  strokeWidth={2.5}
                  aria-hidden="true"
                  className="shrink-0 text-[#1F8F7E]"
                />
                {assurance}
              </span>
            ))}
          </div>

          <Link
            href="/signup"
            className="motion-reduce:animate-none animate-rise mt-9 inline-block text-[15px] font-medium text-[#374151] transition-colors [animation-delay:400ms] hover:text-[#09090B] dark:text-[#A1A1AA] dark:hover:text-white"
          >
            Hiring faculty? Get early access →
          </Link>
        </div>

        <div className="flex justify-center lg:col-span-5">
          <CampusVisual />
        </div>
      </div>
    </section>
  );
}
