import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { AuthPlaceholder } from "@/components/AuthPlaceholder";

export const metadata: Metadata = {
  title: "Join the platform",
  robots: { index: false },
};

export default function SignupPage() {
  return (
    <>
      <Navbar />
      <AuthPlaceholder mode="signup" />
      <Footer />
    </>
  );
}