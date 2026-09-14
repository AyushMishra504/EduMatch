import { Wordmark } from "@/components/Logo";

const LINKS = [
  { text: "For Educators", href: "#for-educators" },
  { text: "For Institutions", href: "#for-institutions" },
  { text: "How it works", href: "#how-it-works" },
  { text: "FAQ", href: "#faq" },
  { text: "Privacy", href: "/privacy" },
  { text: "Terms", href: "/terms" },
];

export function Footer() {
  return (
    <footer className="border-t border-rule bg-paper-deep">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div>
          <Wordmark size={30} />
          <p className="mt-3 max-w-xs text-small text-ink-muted">
            Educators and institutions, connected across Indian higher
            education.
          </p>
        </div>
        <nav
          aria-label="Footer"
          className="flex flex-wrap gap-x-6 gap-y-2.5"
        >
          {LINKS.map((link) => (
            <a
              key={link.text}
              href={link.href}
              className="text-small text-ink-muted transition-colors hover:text-ink"
            >
              {link.text}
            </a>
          ))}
        </nav>
      </div>
      <div className="border-t border-rule">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-5 text-tiny text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>&copy; 2026 EduMatch. All rights reserved.</p>
          <p>Built for Indian higher education.</p>
        </div>
      </div>
    </footer>
  );
}