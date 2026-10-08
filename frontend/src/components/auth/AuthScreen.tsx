"use client";

import { useState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { signIn } from "next-auth/react";
import { SITE_EMAIL } from "@/lib/site";
import { requestMagicLink } from "@/app/login/actions";
import { DevSignInButton } from "@/components/DevSignInButton";

// ---------------------------------------------------------------------------
// Stitch screen: "EduMatch — 3D Flip Auth (Sign In & Register)"
// (project 8974542002797412135, "Academic Prestige" / Academic Night theme).
// Dark, two-column auth screen: 3D-flip card (Login ⇄ Create Account) on the
// left, institutional marketing panel on the right.
// Theme tokens: canvas #090d16 · surface #0f172a · card #162032 ·
// border #1e293b · primary #6bd8cb · Newsreader (serif) + Plus Jakarta Sans.
// ---------------------------------------------------------------------------

type Mode = "login" | "register";

const C = {
  canvas: "#090d16",
  surface: "#0f172a",
  card: "#162032",
  border: "#1e293b",
  mint: "#6bd8cb",
  mintInk: "#05201b",
};

function GoogleMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

function GoogleButton() {
  return (
    <button
      type="button"
      onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
      className="flex h-11 w-full items-center justify-center gap-3 rounded-lg border bg-[#162032] text-sm font-semibold text-slate-100 transition-colors hover:bg-[#1c2940] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6bd8cb]/40"
      style={{ borderColor: C.border }}
    >
      <GoogleMark className="h-[18px] w-[18px]" />
      Continue with Google
    </button>
  );
}

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6bd8cb]/50 disabled:opacity-60"
      style={{ backgroundColor: C.mint, color: C.mintInk }}
    >
      {pending ? "Sending link…" : children}
    </button>
  );
}

function ModeTabs({
  mode,
  onChange,
  idPrefix,
}: {
  mode: Mode;
  onChange: (mode: Mode) => void;
  idPrefix: string;
}) {
  return (
    <div
      className="grid grid-cols-2 gap-1 rounded-full border p-1"
      style={{ borderColor: C.border, backgroundColor: C.card }}
      role="tablist"
      aria-label="Authentication mode"
    >
      {(["login", "register"] as const).map((value) => {
        const active = mode === value;
        return (
          <button
            key={value}
            id={`${idPrefix}-${value}`}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(value)}
            className={`rounded-full py-2 text-sm font-semibold transition-colors ${
              active
                ? "bg-[#e2e8f0] text-[#0f172a]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {value === "login" ? "Login" : "Create Account"}
          </button>
        );
      })}
    </div>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3" aria-hidden="true">
      <span className="h-px flex-1" style={{ backgroundColor: C.border }} />
      <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
        or continue via email
      </span>
      <span className="h-px flex-1" style={{ backgroundColor: C.border }} />
    </div>
  );
}

function EmailField({ id }: { id: string }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400"
      >
        Institutional or academic email
      </label>
      <div className="relative mt-2">
        <span
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500"
          aria-hidden="true"
        >
          @
        </span>
        <input
          id={id}
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="prof.sharma@iisc.ac.in"
          className="h-11 w-full rounded-lg border bg-[#090d16] pl-9 pr-3 text-base text-slate-100 placeholder:text-slate-600 focus:border-[#6bd8cb]/60 focus:outline-none focus:ring-2 focus:ring-[#6bd8cb]/20"
          style={{ borderColor: C.border }}
        />
      </div>
      <p className="mt-2 text-xs leading-relaxed text-slate-500">
        We&apos;ll email you a one-time sign-in link — no password to remember.
      </p>
    </div>
  );
}

function Face({
  mode,
  onToggle,
  idPrefix,
}: {
  mode: Mode;
  onToggle: () => void;
  idPrefix: string;
}) {
  const register = mode === "register";
  return (
    <div
      className="backface-hidden rounded-2xl border p-6 sm:p-8"
      style={{
        borderColor: C.border,
        backgroundColor: C.surface,
        boxShadow: "0 24px 48px -16px rgb(0 0 0 / 0.5)",
      }}
    >
      <ModeTabs mode={mode} onChange={(m) => m !== mode && onToggle()} idPrefix={idPrefix} />

      <div className="mt-6">
        <GoogleButton />
        <p className="mt-2 text-center text-[11px] leading-relaxed text-slate-500">
          Fast, confidential sign-in with your academic or personal Google
          account.
        </p>
      </div>

      <div className="my-6">
        <Divider />
      </div>

      <form action={requestMagicLink}>
        <input type="hidden" name="mode" value={mode} />
        <EmailField id={`${idPrefix}-email`} />
        <div className="mt-5">
          <SubmitButton>
            {register ? "Create my account →" : "Email me a sign-in link →"}
          </SubmitButton>
        </div>
      </form>

      <p className="mt-5 text-center text-xs text-slate-500">
        {register ? (
          <>
            Already have an account?{" "}
            <button
              type="button"
              onClick={onToggle}
              className="font-semibold hover:underline"
              style={{ color: C.mint }}
            >
              Sign in instead
            </button>
          </>
        ) : (
          <>
            First time visiting EduMatch?{" "}
            <button
              type="button"
              onClick={onToggle}
              className="font-semibold hover:underline"
              style={{ color: C.mint }}
            >
              Create a faculty or university profile
            </button>
          </>
        )}
      </p>

      <p className="mt-3 text-center text-[11px] text-slate-600">
        By continuing you agree to our{" "}
        <Link href="/terms" className="underline-offset-2 hover:underline">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline-offset-2 hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}

function Banner({
  kind,
  email,
}: {
  kind: "sent" | "email" | "send";
  email?: string;
}) {
  if (kind === "sent") {
    return (
      <div
        className="mb-4 rounded-xl border p-4 text-sm leading-relaxed"
        style={{
          borderColor: "rgba(107,216,203,0.35)",
          backgroundColor: "rgba(107,216,203,0.08)",
          color: "#c9f5ee",
        }}
        role="status"
      >
        <span className="mr-1">✓</span> Sign-in link sent
        {email ? (
          <>
            {" "}
            to <span className="font-semibold">{email}</span>
          </>
        ) : null}
        . Check your inbox — and your spam folder. The link expires in 24
        hours.
      </div>
    );
  }
  return (
    <div
      className="mb-4 rounded-xl border p-4 text-sm leading-relaxed"
      style={{
        borderColor: "rgba(248,113,113,0.4)",
        backgroundColor: "rgba(248,113,113,0.08)",
        color: "#fecaca",
      }}
      role="alert"
    >
      {kind === "email"
        ? "Please enter a valid email address."
        : "We couldn't send the sign-in email right now. Please try again, or continue with Google."}
    </div>
  );
}

const FEATURES = [
  {
    title: "Direct UGC & NET alignment",
    body: "Profiles mapped to UGC pay levels, NET eligibility, and H-index benchmarks.",
  },
  {
    title: "Discreet discovery mode",
    body: "Browse open chairs without alerting your current registrar or sponsor.",
  },
  {
    title: "Retraction & Scopus awareness",
    body: "Publications and conference proceedings flagged with citation context.",
  },
];

function MarketingPanel() {
  return (
    <div className="flex flex-col gap-6 lg:pl-4">
      <p
        className="text-[11px] font-semibold uppercase tracking-[0.24em]"
        style={{ color: C.mint }}
      >
        Higher-education matching system
      </p>
      <div>
        <h1 className="font-serif text-4xl font-medium leading-[1.12] tracking-tight text-[#f1f5f9] sm:text-[2.6rem]">
          Your scholarly trajectory, curated with institutional dignity.
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-slate-400">
          Connect directly with selection committees across institutes of
          national importance, central universities, and premier research
          clusters — without the bureaucratic friction.
        </p>
      </div>

      <div
        className="flex items-start gap-4 rounded-xl border p-4"
        style={{ borderColor: C.border, backgroundColor: C.surface }}
      >
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-xs font-bold text-[#05201b]"
          style={{ background: "linear-gradient(135deg, #6bd8cb, #38bdf8)" }}
          aria-hidden="true"
        >
          AS
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-100">
            Dr. Ananya Sharma
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            IIT Bombay · Computer Science &amp; Engineering
          </p>
          <p className="mt-2 text-xs leading-relaxed text-slate-400">
            &ldquo;The matching pipeline surfaced three committees I would
            never have found on my own.&rdquo;
          </p>
        </div>
        <span
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 text-[11px] font-bold"
          style={{ borderColor: C.mint, color: C.mint }}
          aria-label="97% profile match"
        >
          97%
        </span>
      </div>

      <ul className="flex flex-wrap gap-2">
        {["UGC-NET aligned", "Scopus-aware", "24 disciplines"].map((chip) => (
          <li
            key={chip}
            className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium text-slate-300"
            style={{ borderColor: C.border, backgroundColor: C.card }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: C.mint }}
              aria-hidden="true"
            />
            {chip}
          </li>
        ))}
      </ul>

      <ul className="flex flex-col gap-4">
        {FEATURES.map((feature) => (
          <li key={feature.title} className="flex gap-3">
            <span
              className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-bold"
              style={{
                backgroundColor: "rgba(107,216,203,0.15)",
                color: C.mint,
              }}
              aria-hidden="true"
            >
              ✓
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-100">
                {feature.title}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                {feature.body}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <blockquote
        className="rounded-r-xl border-l-2 p-4"
        style={{
          borderLeftColor: "rgba(107,216,203,0.6)",
          backgroundColor: "rgba(22, 32, 50, 0.6)",
        }}
      >
        <p className="font-serif text-[15px] italic leading-relaxed text-slate-300">
          &ldquo;EduMatch eliminated months of tedious paperwork and redundant
          follow-ups.&rdquo;
        </p>
        <footer className="mt-2 text-xs text-slate-500">
          Prof. Somnath Banerjee · IIT Delhi · Humanities &amp; Social Sciences
        </footer>
      </blockquote>

      <p className="flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-slate-600">
        <span>🛡 GDPR-compliant data handling</span>
        <span>🔒 End-to-end encrypted sessions</span>
      </p>
    </div>
  );
}

export function AuthScreen({
  initialMode = "login",
  sentEmail,
  errorKind,
}: {
  initialMode?: Mode;
  sentEmail?: string;
  errorKind?: "sent" | "email" | "send";
}) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const flipped = mode === "register";

  return (
    <div
      className="relative flex min-h-screen flex-col"
      style={{ backgroundColor: C.canvas, colorScheme: "dark" }}
    >
      {/* Ambient teal glow, echoing the Stitch artwork */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(52% 42% at 78% 8%, rgba(13,148,136,0.16), transparent 70%), radial-gradient(40% 34% at 8% 88%, rgba(56,189,248,0.08), transparent 70%)",
        }}
      />

      <header
        className="relative z-10 border-b"
        style={{ borderColor: `${C.border}80` }}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-6">
          <Link
            href="/"
            aria-label="EduMatch home"
            className="flex items-center gap-2"
          >
            <span
              className="grid h-7 w-7 place-items-center rounded-md text-xs font-bold"
              style={{
                backgroundColor: "rgba(107,216,203,0.15)",
                color: C.mint,
              }}
              aria-hidden="true"
            >
              ✦
            </span>
            <span className="font-serif text-xl font-medium tracking-tight text-[#f1f5f9]">
              EduMatch
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-slate-400 transition-colors hover:text-slate-200"
          >
            ← Back to EduMatch
          </Link>
        </div>
      </header>

      <div
        className="relative z-10 border-b"
        style={{ borderColor: `${C.border}80`, backgroundColor: "rgba(15,23,42,0.4)" }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-2 sm:px-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            🔒 Campus-verified portal · sessions encrypted (256-bit)
          </p>
          <p className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 sm:block">
            Need institutional access?{" "}
            <a
              href={`mailto:${SITE_EMAIL}`}
              className="hover:underline"
              style={{ color: C.mint }}
            >
              Contact the dean&apos;s desk →
            </a>
          </p>
        </div>
      </div>

      <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-6 sm:py-14">
        <div className="grid items-start gap-12 lg:grid-cols-[420px_1fr]">
          {/* Flip card column */}
          <div>
            {errorKind && <Banner kind={errorKind} email={sentEmail} />}
            <div style={{ perspective: "1200px" }}>
              <div
                className="preserve-3d relative transition-transform duration-700 ease-out"
                style={{
                  transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  transformStyle: "preserve-3d",
                }}
              >
                <div
                  className="backface-hidden"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <Face
                    mode="login"
                    onToggle={() => setMode("register")}
                    idPrefix="login"
                  />
                </div>
                <div
                  className="absolute inset-0"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  <Face
                    mode="register"
                    onToggle={() => setMode("login")}
                    idPrefix="register"
                  />
                </div>
              </div>
            </div>
            {/* Dev-only skip-login shortcut; renders nothing in production. */}
            <DevSignInButton />
          </div>

          {/* Marketing panel */}
          <div className="order-last lg:order-none">
            <MarketingPanel />
          </div>
        </div>
      </main>

      <footer
        className="relative z-10 border-t"
        style={{ borderColor: `${C.border}80` }}
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-6 text-xs text-slate-500 sm:flex-row sm:px-6">
          <p>EduMatch © 2026 · Higher-education &amp; doctoral recruitment network</p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="transition-colors hover:text-slate-300">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-slate-300">
              Terms of Service
            </Link>
            <a
              href={`mailto:${SITE_EMAIL}`}
              className="transition-colors hover:text-slate-300"
            >
              Help &amp; Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
