import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { SignupForm } from "./SignupForm";

export const metadata: Metadata = {
  title: "Sign up",
  robots: { index: false },
};

export default function SignupPage() {
  return (
    <>
      <Navbar />
      <main className="relative flex min-h-[calc(100vh-4rem)] flex-col justify-center items-center bg-[#040f08] px-5 py-16 sm:px-0">
        {/* Full-screen Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/signup-background.jpg"
            alt="Grand Library"
            className="h-full w-full object-cover opacity-30 mix-blend-luminosity"
          />
          {/* Subtle overlay to ensure the card stands out */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/80 backdrop-blur-[2px]"></div>
        </div>

        <div className="relative z-10 w-full max-w-md">
          <div className="rounded-2xl border border-white/10 bg-black/60 p-7 shadow-2xl backdrop-blur-md sm:p-9">
            <p className="text-tiny font-semibold uppercase tracking-[0.18em] text-accent">
              Sign up
            </p>
            <h1 className="mt-3 font-serif text-h3 font-medium text-white">
              Create your account.
            </h1>
            <p className="mt-3 text-small text-white/70">
              Sign up to get started as an educator or institution.
            </p>
            <SignupForm />
          </div>
        </div>
      </main>
    </>
  );
}
