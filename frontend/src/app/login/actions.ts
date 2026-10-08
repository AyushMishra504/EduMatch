"use server";

import { redirect } from "next/navigation";
import { signIn } from "@/auth";

// ---------------------------------------------------------------------------
// Magic-link sign-in. Validation failures redirect back to /login with an
// error flag BEFORE any write; success always ends in a redirect()
// (server-action convention: mutating actions never return an ActionState
// after writing — the profile gate re-renders with stale data).
// ---------------------------------------------------------------------------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function requestMagicLink(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const mode = String(formData.get("mode") ?? "login");

  if (!EMAIL_RE.test(email) || email.length > 320) {
    redirect(`/login?error=email&mode=${encodeURIComponent(mode)}`);
  }

  // Sends the verification email. The custom provider in src/auth.ts has
  // id "email". With redirect: false the flow resolves without navigating,
  // so we can land on the "check your inbox" state ourselves.
  try {
    await signIn("email", { email, redirect: false });
  } catch (error) {
    // A Next.js redirect thrown inside the flow must keep propagating.
    const digest = (error as { digest?: string } | null)?.digest;
    if (typeof digest === "string" && digest.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    redirect(`/login?error=send&mode=${encodeURIComponent(mode)}`);
  }

  redirect(
    `/login?sent=1&email=${encodeURIComponent(email)}&mode=${encodeURIComponent(mode)}`,
  );
}
