import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { RolePickerForm } from "@/components/onboarding/RolePickerForm";

export const metadata: Metadata = {
  title: "Set up your profile",
};

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  // Roles are decided once; the minimal screen (/onboarding/educator/start)
  // is only reachable through setRole's redirect, so a returning user lands
  // straight in the product.
  if (user && user.role !== "UNSET") redirect("/dashboard");

  return (
    <>
      <Navbar />
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl flex-col justify-center px-5 py-16 sm:px-0">
        <div className="border border-rule bg-paper p-7 shadow-card sm:p-9">
          <p className="text-tiny font-semibold uppercase tracking-[0.18em] text-accent">
            Almost there
          </p>
          <h1 className="mt-3 font-serif text-h3 font-medium text-ink">
            Which path are you on?
          </h1>
          <p className="mt-3 text-small text-ink-muted">
            Pick the role that best describes you. You can always tell us more
            later — this just helps us personalise your experience from the
            start.
          </p>
          <div className="mt-7">
            <RolePickerForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
