"use client";

import { DEGREE_LABELS } from "@/lib/educator/constants";

export type EducationDraft = {
  degree: string;
  field: string;
  institution: string;
  startYear: number | "";
  endYear: number | "" | null;
  isOngoing: boolean;
  grade: string;
};

export const EMPTY_EDUCATION: EducationDraft = {
  degree: "MASTERS",
  field: "",
  institution: "",
  startYear: new Date().getFullYear(),
  endYear: "",
  isOngoing: false,
  grade: "",
};

const inputCls =
  "w-full rounded-md border border-rule bg-paper px-3 py-2.5 text-small text-ink outline-none transition-colors focus:border-accent";

export function EducationRow({
  row,
  update,
}: {
  row: EducationDraft;
  update: (patch: Partial<EducationDraft>) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="block text-base font-medium text-ink">
        Degree
        <select
          value={row.degree}
          onChange={(e) => update({ degree: e.target.value })}
          className={`${inputCls} mt-1.5`}
        >
          {Object.entries(DEGREE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-base font-medium text-ink">
        Field of study
        <input
          value={row.field}
          onChange={(e) => update({ field: e.target.value })}
          placeholder="e.g. Computer Science"
          maxLength={60}
          className={`${inputCls} mt-1.5`}
        />
      </label>
      <label className="block text-base font-medium text-ink sm:col-span-2">
        Institution
        <input
          value={row.institution}
          onChange={(e) => update({ institution: e.target.value })}
          placeholder="e.g. University of Pune"
          maxLength={100}
          className={`${inputCls} mt-1.5`}
        />
      </label>
      <label className="block text-base font-medium text-ink">
        Start year
        <input
          type="number"
          value={row.startYear}
          onChange={(e) =>
            update({ startYear: e.target.value === "" ? "" : Number(e.target.value) })
          }
          placeholder="e.g. 2018"
          min={1960}
          max={new Date().getFullYear()}
          className={`${inputCls} mt-1.5`}
        />
      </label>
      <label className="block text-base font-medium text-ink">
        End year
        <input
          type="number"
          value={row.endYear ?? ""}
          disabled={row.isOngoing}
          onChange={(e) =>
            update({ endYear: e.target.value === "" ? "" : Number(e.target.value) })
          }
          placeholder={row.isOngoing ? "Ongoing" : "e.g. 2021"}
          className={`${inputCls} mt-1.5 disabled:opacity-50`}
        />
      </label>
      <label className="flex items-center gap-2 text-small font-medium text-ink">
        <input
          type="checkbox"
          checked={row.isOngoing}
          onChange={(e) => update({ isOngoing: e.target.checked })}
          className="h-4 w-4 accent-[#0e5a4f]"
        />
        Still studying here
      </label>
      <label className="block text-base font-medium text-ink">
        Grade <span className="font-normal text-ink-muted">(optional)</span>
        <input
          value={row.grade}
          onChange={(e) => update({ grade: e.target.value })}
          placeholder="e.g. 8.2 CGPA"
          maxLength={20}
          className={`${inputCls} mt-1.5`}
        />
      </label>
    </div>
  );
}
