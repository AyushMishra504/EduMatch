import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { SITE_NAME } from "@/lib/site";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="mx-auto flex max-w-6xl flex-col items-start px-5 py-24 sm:px-8 lg:py-32">
        <p className="text-tiny font-semibold uppercase tracking-[0.18em] text-accent">
          404
        </p>
        <h1 className="mt-4 font-serif font-medium text-h2 text-ink">
          This page doesn&apos;t exist.
        </h1>
        <p className="mt-4 max-w-md text-body text-ink-muted">
          The link may be outdated, or the page may still be on its way. Head
          back to the {SITE_NAME} home page to keep exploring.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center rounded-md bg-accent px-5 py-3 text-small font-semibold text-on-accent transition-colors hover:bg-accent-deep"
        >
          Back to home
        </Link>
      </main>
      <Footer />
    </>
  );
}