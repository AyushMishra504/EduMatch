import Link from "next/link";
import { ArrowLeft, GraduationCap } from "lucide-react";

const COPY = {
  login: {
    eyebrow: "Log in",
    title: "Account access is opening soon.",
    body: "Log in opens with the platform's launch. Check back here when it's live.",
  },
  signup: {
    eyebrow: "Sign up",
    title: "Sign-ups open at launch.",
    body: "Educator and institution sign-up opens with the platform launch. Check back here to create an account.",
  },
};

export function AuthPlaceholder({ mode }: { mode: "login" | "signup" }) {
  const copy = COPY[mode];

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-5 py-16 sm:px-0">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-small font-medium text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft size={15} />
        Back to home
      </Link>

      <div className="mt-6 border border-rule bg-paper p-7 shadow-sm">
        <span className="grid h-11 w-11 place-items-center rounded-md bg-accent text-on-accent">
          <GraduationCap size={22} strokeWidth={2.25} aria-hidden="true" />
        </span>
        <p className="mt-6 text-tiny font-semibold uppercase tracking-[0.18em] text-accent">
          {copy.eyebrow}
        </p>
        <h1 className="mt-3 font-serif text-h3 font-medium text-ink">
          {copy.title}
        </h1>
        <p className="mt-3 text-small text-ink-muted">{copy.body}</p>
      </div>
    </main>
  );
}