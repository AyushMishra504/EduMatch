"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { GraduationCap, Building2 } from "lucide-react";
import { setRole } from "@/app/onboarding/actions";

const OPTIONS = [
  {
    value: "EDUCATOR" as const,
    label: "I'm an educator",
    description:
      "Build a profile that showcases your research, teaching experience, and preferences — and get matched to roles that fit.",
    icon: GraduationCap,
  },
  {
    value: "INSTITUTION" as const,
    label: "I'm an institution",
    description:
      "Post roles, discover educator profiles that match your needs, and streamline your hiring workflow.",
    icon: Building2,
  },
];

function SubmitButton({ selected }: { selected: string | null }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={!selected || pending}
      className="mt-8 h-11 w-full rounded-md bg-accent text-small font-semibold text-on-accent transition-colors hover:bg-accent-deep disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Saving…" : "Start building your profile"}
    </button>
  );
}

export function RolePickerForm() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <form action={setRole}>
      <input type="hidden" name="role" value={selected ?? ""} />
      <div className="grid gap-4 sm:grid-cols-2">
        {OPTIONS.map((option) => {
          const active = selected === option.value;
          const Icon = option.icon;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setSelected(option.value)}
              className={`flex flex-col items-start gap-3 rounded-md border p-5 text-left transition-all ${
                active
                  ? "border-accent bg-accent-tint shadow-glow"
                  : "border-rule bg-paper hover:border-ink/30"
              }`}
            >
              <span
                className={`grid h-10 w-10 place-items-center rounded-md ${
                  active
                    ? "bg-accent text-on-accent"
                    : "bg-paper-deep text-ink-muted"
                }`}
              >
                <Icon size={20} strokeWidth={2.25} aria-hidden="true" />
              </span>
              <span className="font-serif text-h3 font-medium text-ink">
                {option.label}
              </span>
              <span className="text-small leading-relaxed text-ink-muted">
                {option.description}
              </span>
            </button>
          );
        })}
      </div>
      <SubmitButton selected={selected} />
    </form>
  );
}
