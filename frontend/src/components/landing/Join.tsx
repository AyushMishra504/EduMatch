import Link from "next/link";
import { GooglePillButton } from "@/components/GoogleSignInButton";
import { Reveal } from "@/components/landing/Reveal";

export function Join() {
  return (
    <section id="join" className="scroll-mt-20 bg-white py-28 dark:bg-black lg:py-36">
      <Reveal className="mx-auto max-w-6xl px-6">
        <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-transparent bg-gradient-to-b from-[#D6EDE7] via-[#EDF7F4] to-white p-12 text-center lg:p-16 dark:border-[#1F1F1F] dark:from-[#0E1F1B] dark:via-[#08110F] dark:to-black">
          <h2 className="relative z-10 mb-8 font-serif text-[34px] font-normal tracking-tight text-[#09090B] dark:text-white sm:text-[44px]">
            Turn your CV into{" "}
            <em className="font-normal italic text-[#1F8F7E]">
              opportunities.
            </em>
          </h2>
          <div className="relative z-10">
            <GooglePillButton />
          </div>
          <Link
            href="/signup"
            className="relative z-10 mt-5 inline-block text-sm font-medium text-[#52525B] transition-colors hover:text-[#09090B] dark:text-[#A1A1AA] dark:hover:text-white"
          >
            Hiring faculty? Get early access →
          </Link>
        </div>
      </Reveal>
    </section>
  );
}