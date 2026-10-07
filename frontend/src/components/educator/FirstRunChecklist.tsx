import Link from "next/link";
import { Check, CircleDashed } from "lucide-react";

export function FirstRunChecklist({
  published,
  hasResearch,
}: {
  published: boolean;
  hasResearch: boolean;
}) {
  const items = [
    published
      ? {
          label: "Profile published",
          done: true,
          href: null as string | null,
          disabled: false,
        }
      : {
          // Shown after minimal onboarding too (welcome=1) — a fresh draft
          // must not claim it is already published.
          label: "Make your profile visible",
          done: false,
          href: "/profile" as string | null,
          disabled: false,
        },
    ...(hasResearch
      ? []
      : [
          {
            label: "Add your research output",
            done: false,
            href: "/profile#research" as string | null,
            disabled: false,
          },
        ]),
    {
      label: "Upload your resume",
      done: false,
      href: "/profile#resume" as string | null,
      disabled: false,
    },
    {
      label: "Explore how matching works",
      done: false,
      href: "/#how-it-works",
      disabled: false,
    },
  ];

  return (
    <div className="mt-8 w-full rounded-md border border-rule bg-paper p-5 text-left">
      <p className="text-small font-semibold text-ink">Getting started</p>
      <ul className="mt-3 space-y-2.5">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-3 text-small">
            {item.done ? (
              <Check size={16} className="shrink-0 text-accent" aria-hidden="true" />
            ) : (
              <CircleDashed
                size={16}
                className="shrink-0 text-ink-muted"
                aria-hidden="true"
              />
            )}
            {item.href && !item.disabled ? (
              <Link
                href={item.href}
                className="text-ink transition-colors hover:text-accent"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={
                  item.disabled ? "text-ink-muted" : "text-ink"
                }
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
