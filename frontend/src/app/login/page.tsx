import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";

export const metadata: Metadata = {
  title: "Log in",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-5 py-16 sm:px-0">
        <div className="border border-rule bg-paper p-7 shadow-card sm:p-9">
          <p className="text-tiny font-semibold uppercase tracking-[0.18em] text-accent">
            Log in
          </p>
          <h1 className="mt-3 font-serif text-h3 font-medium text-ink">
            Welcome back.
          </h1>
          <p className="mt-3 text-small text-ink-muted">
            Sign in with Google to continue to your EduMatch account.
          </p>
          <div className="mt-7">
            <GoogleSignInButton />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
