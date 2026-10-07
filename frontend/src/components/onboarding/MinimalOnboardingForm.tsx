"use client";

import { useEffect, useState, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { completeMinimalOnboarding } from "@/app/onboarding/educator/actions";
import { initial } from "@/lib/educator/action-state";
import { DISCIPLINE_LABELS, EMPLOYMENT_LABELS } from "@/lib/educator/constants";
import { ErrorSummary } from "@/components/educator/ErrorSummary";
import { SearchableSelect } from "@/components/educator/SearchableSelect";
import { CardGroup, SelectionCard } from "@/components/educator/SelectionCard";
import type { Discipline, EmploymentType } from "@prisma/client";

/**
 * Back-preservation: unsaved edits are mirrored into sessionStorage so a
 * browser Back (or refresh) never empties the form. The draft is only
 * re-applied when it was written at/after the last server save — saved
 * profile data always wins over a stale draft.
 */
const DRAFT_KEY = "edumatch.minimalOnboarding.v1";

type Draft = { t: number; discipline?: string; employmentTypes?: string[] };

function readDraft(): Draft | null {
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Draft;
    return typeof parsed?.t === "number" ? parsed : null;
  } catch {
    return null;
  }
}

function writeDraft(discipline: string, employmentTypes: EmploymentType[]) {
  try {
    const draft: Draft = { t: Date.now(), discipline, employmentTypes };
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Storage unavailable (private mode/quota) — form still works, it just
    // can't survive a Back navigation.
  }
}

function ActionButtons({ canSubmit }: { canSubmit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <div className="mt-8 flex flex-wrap items-center gap-3">
      <button
        type="submit"
        name="intent"
        value="complete"
        disabled={!canSubmit || pending}
        className="h-11 rounded-md bg-accent px-6 text-small font-semibold text-on-accent transition-colors hover:bg-accent-deep disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Saving…" : "Enter EduMatch →"}
      </button>
      <button
        type="submit"
        name="intent"
        value="skip"
        disabled={pending}
        className="h-11 rounded-md border border-rule px-5 text-small font-semibold text-ink transition-colors hover:bg-paper-deep disabled:cursor-not-allowed disabled:opacity-50"
      >
        Skip for now
      </button>
    </div>
  );
}

export function MinimalOnboardingForm({
  initialDiscipline,
  initialEmploymentTypes,
  savedAtMs,
}: {
  initialDiscipline: Discipline | null;
  initialEmploymentTypes: EmploymentType[];
  savedAtMs: number;
}) {
  const [state, formAction] = useActionState(completeMinimalOnboarding, initial);
  const [discipline, setDiscipline] = useState<string>(initialDiscipline ?? "");
  const [employmentTypes, setEmploymentTypes] = useState<EmploymentType[]>(
    initialEmploymentTypes,
  );
  // Bumped when a draft is restored so SearchableSelect remounts and
  // re-derives its displayed text from the restored value (its internal
  // text state only initializes once, on mount).
  const [restoreKey, setRestoreKey] = useState(0);

  // Restore unsaved edits after Back/refresh. A draft older than the last
  // server save is stale (the profile has since been written) — ignore it.
  useEffect(() => {
    const draft = readDraft();
    if (!draft || draft.t < savedAtMs) return;
    if (draft.discipline !== undefined && draft.discipline !== (initialDiscipline ?? "")) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- storage-restore: first client render must match server HTML, draft applies post-mount
      setDiscipline(draft.discipline);
      setRestoreKey((k) => k + 1);
    }
    if (Array.isArray(draft.employmentTypes)) {
      setEmploymentTypes(draft.employmentTypes as EmploymentType[]);
    }
  }, [savedAtMs, initialDiscipline]);

  function chooseDiscipline(value: string) {
    setDiscipline(value);
    writeDraft(value, employmentTypes);
  }

  function toggleEmployment(value: EmploymentType) {
    const next = employmentTypes.includes(value)
      ? employmentTypes.filter((x) => x !== value)
      : [...employmentTypes, value];
    setEmploymentTypes(next);
    writeDraft(discipline, next);
  }

  return (
    <form action={formAction}>
      <div className="mt-7 space-y-7">
        <ErrorSummary
          errors={state.fieldErrors}
          formError={state.formError}
        />

        <div>
          <span
            className="block text-small font-semibold text-ink"
            id="minimal-discipline-label"
          >
            Your discipline
          </span>
          <div className="mt-2">
            <SearchableSelect
              key={restoreKey}
              id="minimal-discipline"
              name="discipline"
              value={discipline}
              onChange={chooseDiscipline}
              options={Object.entries(DISCIPLINE_LABELS).map(
                ([value, label]) => ({ value, label }),
              )}
              placeholder="Search discipline…"
            />
          </div>
          {state.fieldErrors?.discipline ? (
            <p role="alert" className="mt-1 text-tiny font-medium text-red-700">
              {state.fieldErrors.discipline[0]}
            </p>
          ) : null}
        </div>

        <CardGroup
          label="What are you looking for?"
          optional
          hint="Pick every type of role you'd consider. This personalises what you see first."
          error={state.fieldErrors?.employmentTypes}
        >
          {(Object.keys(EMPLOYMENT_LABELS) as EmploymentType[]).map((value) => (
            <SelectionCard
              key={value}
              name="employmentTypes"
              type="checkbox"
              value={value}
              checked={employmentTypes.includes(value)}
              onChange={() => toggleEmployment(value)}
              label={EMPLOYMENT_LABELS[value]}
            />
          ))}
        </CardGroup>
      </div>

      <ActionButtons canSubmit={discipline.length > 0} />
    </form>
  );
}
