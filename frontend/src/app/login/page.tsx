import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { AuthPlaceholder } from "@/components/AuthPlaceholder";

export const metadata: Metadata = {
  title: "Log in",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <AuthPlaceholder mode="login" />
      <Footer />
    </>
  );
}