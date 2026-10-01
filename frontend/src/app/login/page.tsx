import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Log in",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <main className="grid min-h-[calc(100vh-4rem)] w-full lg:grid-cols-2">
        {/* Left Side: Image & Branding */}
        <div className="relative hidden flex-col justify-between bg-white p-12 lg:flex">
          <div className="relative z-10 max-w-md">
            <h2 className="font-serif text-h2 font-medium text-ink">
              Where India&apos;s faculties find each other.
            </h2>
            <p className="mt-4 text-lead text-ink-muted">
              Join thousands of educators and organizations transforming higher education hiring.
            </p>
          </div>
          
          <div className="relative flex-1 mt-8 min-h-[400px]">
            <img
              src="/login-illustration.jpg"
              alt="Person climbing a ladder of books"
              className="absolute inset-0 h-full w-full object-contain object-bottom"
            />
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex flex-col justify-center bg-[#e3d8c8] px-5 py-16 sm:px-12 lg:px-24 bg-[url('/grid.svg')]">
          <div className="mx-auto w-full max-w-md rounded-2xl bg-white/60 p-8 shadow-sm ring-1 ring-black/5 backdrop-blur-md sm:p-10">
            <p className="text-tiny font-semibold uppercase tracking-[0.18em] text-accent">
              Log in
            </p>
            <h1 className="mt-3 font-serif text-h3 font-medium text-ink">
              Welcome back.
            </h1>
            <p className="mt-3 text-small text-ink-muted">
              Sign in with your email to continue to your EduMatch account.
            </p>
            
            <div className="mt-8">
              <LoginForm />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
