"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Wordmark } from "@/components/Logo";

const SECTIONS = [
  { label: "For Educators", href: "#for-educators", id: "for-educators" },
  { label: "For Organizations", href: "#for-institutions", id: "for-institutions" },
  { label: "How it works", href: "#how-it-works", id: "how-it-works" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Shrink on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Active section tracking
  useEffect(() => {
    const ids = SECTIONS.map((s) => s.id);
    const observers: IntersectionObserver[] = [];

    const activeMap = new Map<string, boolean>();

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          activeMap.set(id, entry.isIntersecting);
          // Pick the first currently intersecting section
          const found = ids.find((sid) => activeMap.get(sid)) ?? null;
          setActiveId(found);
        },
        { rootMargin: "-20% 0px -60% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <>
      <div className="h-16 w-full shrink-0" aria-hidden="true" />
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "h-12 border-b border-white/10 bg-black shadow-sm"
            : "h-16 border-b border-transparent bg-black"
        }`}
      >
        <div className="mx-auto flex h-full max-w-[1440px] w-full items-center justify-between px-5 sm:px-10 xl:px-12">
          <Link href="/" aria-label="EduMatch home" className="flex items-center text-white">
            <div
              className="origin-left transition-transform duration-300"
              style={{ transform: `scale(${scrolled ? 28 / 32 : 1})` }}
            >
              <Wordmark size={32} />
            </div>
          </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {SECTIONS.map((section) => {
            const isActive = activeId === section.id;
            return (
              <a
                key={section.href}
                href={section.href}
                className={`relative text-small font-medium transition-colors ${
                  isActive ? "text-white" : "text-white/70 hover:text-white"
                }`}
              >
                {section.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-1 left-0 right-0 h-px bg-white"
                    style={{ animation: "slide-in-left 0.3s cubic-bezier(0.16,1,0.3,1)" }}
                  />
                )}
              </a>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="rounded-full px-3 py-2 text-small font-semibold text-white/90 transition-colors hover:text-white"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-accent px-4 py-2 text-small font-semibold text-on-accent transition-all hover:bg-accent-deep hover:shadow-glow-sm"
          >
            Join the Platform
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="grid h-9 w-9 place-items-center rounded-md text-white/90 transition-colors hover:bg-white/10 md:hidden"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div
          className="border-t border-white/10 bg-black px-5 py-4 md:hidden"
          style={{ animation: "nav-slide-down 0.28s cubic-bezier(0.16,1,0.3,1)" }}
        >
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {SECTIONS.map((section, i) => (
              <a
                key={section.href}
                href={section.href}
                onClick={() => setOpen(false)}
                className={`rounded-md px-2 py-2 text-small font-medium transition-colors hover:bg-white/10 hover:text-white ${
                  activeId === section.id
                    ? "text-white"
                    : "text-white/70"
                }`}
                style={{
                  animation: `slide-up 0.3s cubic-bezier(0.16,1,0.3,1) ${i * 0.04}s both`,
                }}
              >
                {section.label}
              </a>
            ))}
            <div className="mt-2 flex items-center gap-2 border-t border-white/10 pt-3">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-full border border-white/20 py-2 text-center text-small font-semibold text-white hover:bg-white/5 transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-full bg-accent py-2 text-center text-small font-semibold text-on-accent transition-all hover:bg-accent-deep hover:shadow-glow-sm"
              >
                Join the Platform
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
    </>
  );
}