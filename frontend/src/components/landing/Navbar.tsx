"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Wordmark } from "@/components/Logo";

const SECTIONS = [
  { label: "For Educators", href: "#for-educators" },
  { label: "For Institutions", href: "#for-institutions" },
  { label: "How it works", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-rule bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" aria-label="EduMatch home">
          <Wordmark size={32} />
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {SECTIONS.map((section) => (
            <a
              key={section.href}
              href={section.href}
              className="text-small font-medium text-ink-muted transition-colors hover:text-ink"
            >
              {section.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="rounded-md px-3 py-2 text-small font-semibold text-ink transition-colors hover:text-accent"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="rounded-md bg-accent px-4 py-2 text-small font-semibold text-on-accent transition-colors hover:bg-accent-deep"
          >
            Join the Platform
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="grid h-9 w-9 place-items-center rounded-md text-ink md:hidden"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-rule bg-paper px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {SECTIONS.map((section) => (
              <a
                key={section.href}
                href={section.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2 text-small font-medium text-ink-muted transition-colors hover:bg-paper-deep hover:text-ink"
              >
                {section.label}
              </a>
            ))}
            <div className="mt-2 flex gap-2 border-t border-rule pt-3">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-md border border-rule py-2 text-center text-small font-semibold text-ink"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-md bg-accent py-2 text-center text-small font-semibold text-on-accent"
              >
                Join the Platform
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}