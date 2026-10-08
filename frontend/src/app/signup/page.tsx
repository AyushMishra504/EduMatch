import type { Metadata } from "next";
import { AuthScreen } from "@/components/auth/AuthScreen";

export const metadata: Metadata = {
  title: "Sign up",
  robots: { index: false },
};

export default function SignupPage() {
  return <AuthScreen initialMode="register" />;
}
