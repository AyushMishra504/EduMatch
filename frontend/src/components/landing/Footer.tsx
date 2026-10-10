import Link from "next/link";
import { Wordmark } from "@/components/Logo";

const COLUMNS: {
  heading: string;
  links: { label: string; href: string }[];
}[] = [
  {
    heading: "For Educators",
    links: [
      { label: "Find Opportunities", href: "#for-educators" },
      { label: "Create Your Profile", href: "/signup" },
      { label: "Career Resources", href: "#match-sim" },
      { label: "How It Works", href: "#how-it-works" },
    ],
  },
  {
    heading: "For Institutions",
    links: [
      { label: "Discover Educators", href: "#for-institutions" },
      { label: "Post an Opening", href: "/signup" },
      { label: "Institution Verification", href: "#why-choose" },
      { label: "Hiring Resources", href: "#how-it-works" },
    ],
  },
  {
    heading: "Company & Support",
    links: [
      { label: "About Us", href: "/" },
      { label: "Contact Us", href: "#join" },
      { label: "Help Centre", href: "#faq" },
      { label: "Report a Problem", href: "#join" },
    ],
  },
];

const LEGAL = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Cookie Policy", href: "/privacy" },
  { label: "Accessibility", href: "/privacy" },
];

export function Footer() {
  return (
    <footer className="border-t border-rule bg-paper-deep">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" aria-label="EduMatch home">
              <Wordmark size={30} />
            </Link>
            <p className="mt-4 max-w-xs text-small text-ink-muted">
              Connecting talented educators with institutions where they can
              make an impact.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <p className="text-tiny font-semibold uppercase tracking-[0.16em] text-ink">
                {column.heading}
              </p>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-small text-ink-muted transition-colors hover:text-accent"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="border-t border-rule">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-6 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-tiny text-ink-muted">
            &copy; 2026 EduMatch. All rights reserved.
          </p>
          <nav
            aria-label="Legal"
            className="flex flex-wrap gap-x-6 gap-y-2"
          >
            {LEGAL.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-tiny text-ink-muted transition-colors hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}