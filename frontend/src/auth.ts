import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Google from "next-auth/providers/google";
import nodemailer from "nodemailer";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

const EMAIL_FROM = process.env.EMAIL_FROM ?? "EduMatch <no-reply@edumatch.app>";

function signInEmailHtml(url: string): string {
  return `<!doctype html>
<html><body style="margin:0;background:#090d16;font-family:'Plus Jakarta Sans',Segoe UI,Arial,sans-serif;padding:32px">
  <div style="max-width:480px;margin:0 auto;background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:32px">
    <p style="color:#6bd8cb;font-size:12px;letter-spacing:.18em;text-transform:uppercase;margin:0 0 12px">EduMatch</p>
    <h1 style="color:#f1f5f9;font-family:Georgia,serif;font-size:22px;font-weight:500;margin:0 0 8px">Your sign-in link</h1>
    <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 24px">
      Click the button below to sign in. This link expires in 24 hours and can be used once.
    </p>
    <a href="${url}" style="display:inline-block;background:#6bd8cb;color:#062019;font-size:14px;font-weight:600;padding:12px 24px;border-radius:8px;text-decoration:none">Sign in to EduMatch</a>
    <p style="color:#64748b;font-size:12px;line-height:1.6;margin:24px 0 0">
      Didn't request this? You can safely ignore this email — no account changes were made.
    </p>
  </div>
</body></html>`;
}

/**
 * Sends the Auth.js magic-link email.
 *
 * - SMTP configured (EMAIL_SERVER_*) → real email via nodemailer.
 * - No SMTP in dev → the link is logged to the server console so local
 *   flows stay testable without an email provider account.
 * - No SMTP in production → hard error: sign-in must never silently no-op.
 */
async function sendVerificationRequest({
  identifier,
  url,
}: {
  identifier: string;
  url: string;
}) {
  const host = process.env.EMAIL_SERVER_HOST;
  if (!host) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "EMAIL_SERVER_HOST is not configured — cannot send sign-in emails",
      );
    }
    console.log(`[auth] magic link for ${identifier}: ${url}`);
    return;
  }

  const transport = nodemailer.createTransport({
    host,
    port: Number(process.env.EMAIL_SERVER_PORT ?? 587),
    secure: process.env.EMAIL_SERVER_PORT === "465",
    auth: process.env.EMAIL_SERVER_USER
      ? {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        }
      : undefined,
  });

  await transport.sendMail({
    to: identifier,
    from: EMAIL_FROM,
    subject: "Your EduMatch sign-in link",
    text: `Sign in to EduMatch:\n${url}\n\nThis link expires in 24 hours and can be used once.`,
    html: signInEmailHtml(url),
  });
}

// Custom Auth.js Email provider — unlike the Nodemailer wrapper, this does
// not require SMTP configuration at import time (we handle "no SMTP" inside
// sendVerificationRequest). Provider id is "email".
const MagicLink: Provider = {
  id: "email",
  name: "Email",
  type: "email",
  from: EMAIL_FROM,
  maxAge: 24 * 60 * 60, // the emailed link expires after one day
  sendVerificationRequest,
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  providers: [
    Google({
      authorization: { params: { prompt: "select_account" } },
    }),
    MagicLink,
  ],
  pages: { signIn: "/login" },
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role;
      }
      return session;
    },
    redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
});
