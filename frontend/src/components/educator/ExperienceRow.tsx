"use client";

import { useState } from "react";

export type ExperienceDraft = {
  designation: string;
  institution: string;
  startYear: number | "";
  startMonth: number | "";
  endYear: number | "" | null;
  endMonth: number | "" | null;
  isCurrent: boolean;
  subjects: string[];
};

export const EMPTY_EXPERIENCE: ExperienceDraft = {
  designation: "",
  institution: "",
  startYear: new Date().getFullYear(),
  startMonth: 1,
  endYear: "",
  endMonth: "",
  isCurrent: false,
  subjects: [],
};

const inputCls =
  "w-full rounded-md border border-rule bg-paper px-3 py-2.5 text-small text-ink outline-none transition-colors focus:border-accent";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function ExperienceRow({
  row,
  update,
  subjectSuggestions,
}: {
  row: ExperienceDraft;
  update: (patch: Partial<ExperienceDraft>) => void;
  subjectSuggestions?: string[];
}) {
  const [subjectDraft, setSubjectDraft] = useState("");

  function addSubject(raw: string) {
    const value = raw.trim();
    if (
      value &&
      row.subjects.length < 6 &&
      !row.subjects.some((s) => s.toLowerCase() === value.toLowerCase())
    ) {
      update({ subjects: [...row.subjects, value] });
    }
    setSubjectDraft("");
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="block text-base font-medium text-ink">
        Designation
        <input
          value={row.designation}
          onChange={(e) => update({ designation: e.target.value })}
          placeholder="e.g. Assistant Professor"
          maxLength={60}
          className={`${inputCls} mt-1.5`}
        />
      </label>
      <label className="block text-base font-medium text-ink">
        Institution
        <input
          value={row.institution}
          onChange={(e) => update({ institution: e.target.value })}
          placeholder="e.g. Fergusson College"
          maxLength={100}
          className={`${inputCls} mt-1.5`}
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-base font-medium text-ink">
          Start month
          <select
            value={row.startMonth}
            onChange={(e) => update({ startMonth: Number(e.target.value) })}
            className={`${inputCls} mt-1.5`}
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-base font-medium text-ink">
          Start year
          <input
            type="number"
            value={row.startYear}
            onChange={(e) =>
              update({
                startYear: e.target.value === "" ? "" : Number(e.target.value),
              })
            }
            placeholder="e.g. 2018"
            min={1960}
            max={new Date().getFullYear()}
            className={`${inputCls} mt-1.5`}
          />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-base font-medium text-ink">
          End month
          <select
            value={row.endMonth ?? ""}
            disabled={row.isCurrent}
            onChange={(e) =>
              update({
                endMonth: e.target.value === "" ? "" : Number(e.target.value),
              })
            }
            className={`${inputCls} mt-1.5 disabled:opacity-50`}
          >
            <option value="">—</option>
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-base font-medium text-ink">
          End year
          <input
            type="number"
            value={row.endYear ?? ""}
            disabled={row.isCurrent}
            onChange={(e) =>
              update({
                endYear: e.target.value === "" ? "" : Number(e.target.value),
              })
            }
            placeholder={row.isCurrent ? "Present" : "e.g. 2024"}
            className={`${inputCls} mt-1.5 disabled:opacity-50`}
          />
        </label>
      </div>
      <label className="flex items-center gap-2 text-small font-medium text-ink sm:col-span-2">
        <input
          type="checkbox"
          checked={row.isCurrent}
          onChange={(e) => update({ isCurrent: e.target.checked })}
          className="h-4 w-4 accent-[#0e5a4f]"
        />
        I currently work here
      </label>
      <div className="sm:col-span-2">
        <span className="block text-base font-medium text-ink">
          Subjects taught{" "}
          <span className="font-normal text-ink-muted">(up to 6)</span>
        </span>
        <div className="mt-1.5 flex flex-wrap gap-1.5 rounded-md border border-rule p-2">
          {row.subjects.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() =>
                update({ subjects: row.subjects.filter((x) => x !== s) })
              }
              aria-label={`Remove ${s}`}
              className="rounded-sm bg-accent-tint px-2 py-1 text-small font-medium text-accent hover:bg-accent hover:text-on-accent"
            >
              {s} ×
            </button>
          ))}
          <input
            value={subjectDraft}
            onChange={(e) => setSubjectDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addSubject(subjectDraft);
              }
            }}
            onBlur={() => addSubject(subjectDraft)}
            placeholder="Type a subject, press Enter"
            className="min-w-32 flex-1 bg-transparent text-small outline-none"
          />
        </div>
        {subjectSuggestions && subjectSuggestions.length > 0 ? (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {subjectSuggestions
              .filter(
                (s) =>
                  !row.subjects.some((x) => x.toLowerCase() === s.toLowerCase()),
              )
              .slice(0, 6)
              .map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addSubject(s)}
                  className="rounded-sm border border-rule px-2 py-1 text-small text-ink-muted transition-colors hover:border-accent hover:text-accent"
                >
                  + {s}
                </button>
              ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
