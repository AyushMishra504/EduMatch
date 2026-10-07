import Link from "next/link";
import { SITE_EMAIL } from "@/lib/site";

const LINKS = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Contact", href: `mailto:${SITE_EMAIL}` },
];

export function Footer() {
  return (
    <footer className="w-full border-t border-[#E5E7EB] bg-white py-8 dark:border-[#1F1F1F] dark:bg-black">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-[#71717A] sm:flex-row">
        <div>
          <span className="font-medium text-[#09090B] dark:text-white">
            EduMatch
          </span>
          <span className="mx-1">©</span>
          <span>2026</span>
        </div>
        <div className="flex items-center gap-6">
          {LINKS.map((link) =>
            link.href.startsWith("mailto:") ? (
              <a
                key={link.label}
                href={link.href}
                className="transition-colors hover:text-[#09090B] dark:hover:text-white"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className="transition-colors hover:text-[#09090B] dark:hover:text-white"
              >
                {link.label}
              </Link>
            ),
          )}
        </div>
      </div>
    </footer>
  );
}