"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GooglePillButton } from "@/components/GoogleSignInButton";

const SECTIONS = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Matches", href: "#matches" },
  { label: "FAQ", href: "#faq" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E5E7EB] bg-white/90 backdrop-blur-md dark:border-[#1F1F1F] dark:bg-black/85">
      <div className="mx-auto flex h-[76px] max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          aria-label="EduMatch home"
          className="font-serif text-2xl font-medium tracking-tight text-[#09090B] transition-opacity hover:opacity-90 dark:text-white"
        >
          EduMatch
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {SECTIONS.map((section) => (
            <a
              key={section.href}
              href={section.href}
              className="text-[15px] font-medium text-[#4B5563] transition-colors hover:text-[#09090B] dark:text-[#A1A1AA] dark:hover:text-white"
            >
              {section.label}
            </a>
          ))}
          <Link
            href="/login"
            className="text-[15px] font-medium text-[#4B5563] transition-colors hover:text-[#09090B] dark:text-[#A1A1AA] dark:hover:text-white"
          >
            Log in
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <GooglePillButton size="sm" />
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="grid h-9 w-9 place-items-center rounded-full text-[#09090B] dark:text-white md:hidden"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-[#E5E7EB] bg-white px-6 py-4 md:hidden dark:border-[#1F1F1F] dark:bg-black">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {SECTIONS.map((section) => (
              <a
                key={section.href}
                href={section.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2 text-sm font-medium text-[#52525B] transition-colors hover:text-[#09090B] dark:text-[#A1A1AA] dark:hover:text-white"
              >
                {section.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-3 border-t border-[#E5E7EB] pt-4 dark:border-[#1F1F1F]">
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-full border border-[#E5E7EB] py-2 text-center text-sm font-medium text-[#09090B] dark:border-[#1F1F1F] dark:text-white"
                >
                  Log in
                </Link>
              </div>
              <GooglePillButton size="sm" className="w-full justify-center" />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}