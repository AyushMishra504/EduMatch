"use client";

import { useState } from "react";
import { GooglePillButton } from "@/components/GoogleSignInButton";
import { Reveal } from "@/components/landing/Reveal";

const DISCIPLINES = [
  "Computer Science",
  "Economics",
  "Biotechnology",
  "Physics",
] as const;

type Discipline = (typeof DISCIPLINES)[number];

type SampleRole = {
  title: string;
  organization: string;
  match: string;
  detail: string;
};

const SAMPLE_ROLES: Record<Discipline, SampleRole[]> = {
  "Computer Science": [
    {
      title: "Assistant Professor, Computer Science",
      organization: "Sample University, Bengaluru",
      match: "92% match",
      detail: "Matches your Ph.D., NET and 9 years of teaching",
    },
    {
      title: "Associate Professor, School of Computing",
      organization: "National Institute, Hyderabad",
      match: "86% match",
      detail: "Matches your publication record and research focus",
    },
    {
      title: "Assistant Professor (Selection Grade), AI & Data",
      organization: "Central University, New Delhi",
      match: "79% match",
      detail: "Matches your teaching domain and eligibility criteria",
    },
  ],
  Economics: [
    {
      title: "Assistant Professor, Economics",
      organization: "Sample University, Mumbai",
      match: "90% match",
      detail: "Matches your econometrics, teaching, and research record",
    },
    {
      title: "Associate Professor, School of Public Policy",
      organization: "National Institute, New Delhi",
      match: "84% match",
      detail: "Matches your research focus and policy experience",
    },
    {
      title: "Assistant Professor, Finance & Economics",
      organization: "Central University, Chennai",
      match: "78% match",
      detail: "Matches your teaching domain and eligibility criteria",
    },
  ],
  Biotechnology: [
    {
      title: "Assistant Professor, Biotechnology",
      organization: "Sample University, Pune",
      match: "88% match",
      detail: "Matches your laboratory, teaching, and research record",
    },
    {
      title: "Associate Professor, School of Life Sciences",
      organization: "National Institute, Hyderabad",
      match: "82% match",
      detail: "Matches your publication record and research focus",
    },
    {
      title: "Assistant Professor, Genetics & Cell Biology",
      organization: "Central University, Bengaluru",
      match: "76% match",
      detail: "Matches your teaching domain and eligibility criteria",
    },
  ],
  Physics: [
    {
      title: "Assistant Professor, Physics",
      organization: "Sample University, New Delhi",
      match: "89% match",
      detail: "Matches your research depth and teaching experience",
    },
    {
      title: "Associate Professor, School of Physical Sciences",
      organization: "National Institute, Mumbai",
      match: "83% match",
      detail: "Matches your publication record and research focus",
    },
    {
      title: "Assistant Professor, Applied Physics & Materials",
      organization: "Central University, Hyderabad",
      match: "77% match",
      detail: "Matches your teaching domain and eligibility criteria",
    },
  ],
};

export function SampleMatches() {
  const [discipline, setDiscipline] = useState<Discipline>("Computer Science");

  return (
    <section
      id="matches"
      className="scroll-mt-20 border-b border-[#E5E7EB] bg-white py-28 dark:border-[#1F1F1F] dark:bg-black lg:py-36"
    >
      <div className="mx-auto max-w-6xl px-6">
        <span className="mb-3 block text-xs font-semibold uppercase tracking-wider text-[#1F8F7E]">
          Sample matches
        </span>
        <h2 className="mb-2 font-serif text-[38px] font-normal tracking-tight text-[#09090B] dark:text-white sm:text-[44px]">
          Roles that fit your{" "}
          <em className="font-normal italic text-[#1F8F7E]">background.</em>
        </h2>
        <p className="mb-8 text-sm text-[#71717A]">
          Sample data for illustration.
        </p>

        <div
          className="mb-10 flex flex-wrap gap-2.5"
          role="group"
          aria-label="Choose a sample discipline"
        >
          {DISCIPLINES.map((option) => {
            const active = option === discipline;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setDiscipline(option)}
                aria-pressed={active}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  active
                    ? "border border-transparent bg-[#1F8F7E] text-white shadow-xs"
                    : "border border-[#E4E4E7] bg-[#F4F4F5] text-[#52525B] hover:border-[#CBD5E1] hover:text-[#09090B] dark:border-[#1F1F1F] dark:bg-[#0A0A0A] dark:text-[#A1A1AA] dark:hover:border-[#2E2E2E] dark:hover:text-white"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>

        <div className="space-y-8">
          {SAMPLE_ROLES[discipline].map((role, index) => (
            <Reveal key={role.title} delay={index * 80}>
              <div className="minimal-card rounded-2xl bg-white px-7 py-6 dark:bg-[#0A0A0A]">
                <div className="mb-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-[#09090B] dark:text-white">
                      {role.title}
                    </h3>
                    <p className="mt-0.5 text-[15px] text-[#64748B] dark:text-[#71717A]">
                      {role.organization}
                    </p>
                  </div>
                  <span className="inline-flex w-fit items-center rounded-full bg-[#BCE0D8] px-3 py-1 text-xs font-semibold text-[#0E5D52] dark:bg-[#1F8F7E]/20 dark:text-[#7FD8C8]">
                    {role.match}
                  </span>
                </div>
                <p className="border-t border-[#E5E7EB] pt-3 text-[15px] text-[#52525B] dark:border-[#1F1F1F] dark:text-[#A1A1AA]">
                  {role.detail}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10">
          <GooglePillButton />
        </Reveal>
      </div>
    </section>
  );
}
