"use client";

import { useActionState, useState } from "react";
import { saveStep5 } from "@/app/onboarding/educator/actions";
import { initial } from "@/lib/educator/action-state";
import {
  EMPLOYMENT_LABELS,
  LEVEL_LABELS,
  PAY_LEVEL_LABELS,
} from "@/lib/educator/constants";
import { computeCompleteness } from "@/lib/educator/completeness";
import { ErrorSummary } from "../ErrorSummary";
import type {
  EmploymentType,
  FacultyLevel,
} from "@prisma/client";
import type {
  EducatorUser,
  FullProfile,
  WizardMode,
} from "@/lib/educator/wizard";
import { MatchEstimate } from "../MatchEstimate";
import { PreviewRail } from "../PreviewRail";
import { CardGroup, SelectionCard } from "../SelectionCard";
import { StepHeader } from "../StepHeader";
import { StickyStepActions } from "../StickyStepActions";
import { TagInput } from "../TagInput";
import { inputCls } from "../fieldClasses";
import { useDirtyGuard } from "../useDirtyGuard";

const ANYWHERE = "Anywhere in India";

const LOCATION_SUGGESTIONS = [
  ANYWHERE,
  "Bengaluru",
  "Mumbai",
  "Delhi",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Kolkata",
  "Ahmedabad",
  "Jaipur",
];

export function Step5Preferences({
  profile,
  user,
  mode,
}: {
  profile: FullProfile;
  user: EducatorUser;
  mode: WizardMode;
}) {
  const [state, formAction] = useActionState(saveStep5, initial);
  const [dirty, setDirty] = useState(false);
  useDirtyGuard(dirty);
  const editing = mode === "editing";

  const [desiredLevels, setDesiredLevels] = useState<FacultyLevel[]>([
    ...profile.desiredLevels,
  ]);
  const [employmentTypes, setEmploymentTypes] = useState<EmploymentType[]>([
    ...profile.employmentTypes,
  ]);
  const [preferredLocations, setPreferredLocations] = useState<string[]>([
    ...profile.preferredLocations,
  ]);

  const { percent, missing } = computeCompleteness(profile);

  function toggle<T>(list: T[], value: T, set: (v: T[]) => void) {
    setDirty(true);
    set(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  }

  /** "Anywhere in India" is exclusive: picking it clears the rest. */
  function onLocationsChange(next: string[]) {
    setDirty(true);
    const hadAnywhere = preferredLocations.includes(ANYWHERE);
    const hasAnywhere = next.includes(ANYWHERE);
    if (hasAnywhere && !hadAnywhere) setPreferredLocations([ANYWHERE]);
    else if (hasAnywhere && next.length > 1)
      setPreferredLocations(next.filter((x) => x !== ANYWHERE));
    else setPreferredLocations(next);
  }

  function setAnywhere() {
    setDirty(true);
    setPreferredLocations([ANYWHERE]);
  }

  const anywhere = preferredLocations.includes(ANYWHERE);
  const location =
    profile.city && profile.state
      ? `${profile.city}, ${profile.state}`
      : (profile.city ?? null);

  return (
    <div>
      <StepHeader
        eyebrow={editing ? "Edit your profile" : "Step 5 of 6"}
        title="What are you looking for?"
        description="Levels, work types, and locations."
      />

      <form action={formAction} onChange={() => setDirty(true)} className="mt-6">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-6">
            <ErrorSummary
              errors={state.fieldErrors}
              formError={state.formError}
            />

            <CardGroup
              label="What level are you interested in?"
              error={state.fieldErrors?.desiredLevels}
            >
              <SelectionCard
                name="levelsAny"
                type="checkbox"
                value="1"
                checked={desiredLevels.length === 0}
                onChange={() => {
                  setDirty(true);
                  setDesiredLevels([]);
                }}
                label="Any"
                description="Any level works for me."
              />
              {(Object.keys(LEVEL_LABELS) as FacultyLevel[]).map((value) => (
                <SelectionCard
                  key={value}
                  name="desiredLevels"
                  type="checkbox"
                  value={value}
                  checked={desiredLevels.includes(value)}
                  onChange={() => toggle(desiredLevels, value, setDesiredLevels)}
                  label={LEVEL_LABELS[value]}
                />
              ))}
            </CardGroup>

            <CardGroup
              label="How would you like to work?"
              error={state.fieldErrors?.employmentTypes}
            >
              {(Object.keys(EMPLOYMENT_LABELS) as EmploymentType[]).map((value) => (
                <SelectionCard
                  key={value}
                  name="employmentTypes"
                  type="checkbox"
                  value={value}
                  checked={employmentTypes.includes(value)}
                  onChange={() => toggle(employmentTypes, value, setEmploymentTypes)}
                  label={EMPLOYMENT_LABELS[value]}
                />
              ))}
            </CardGroup>

            <div>
              <span className="block text-base font-semibold text-ink">
                Where would you like to work?
              </span>
              <button
                type="button"
                onClick={setAnywhere}
                aria-pressed={anywhere}
                className={`mt-2 flex w-full items-center justify-between gap-3 rounded-md border p-3.5 text-left transition-colors ${
                  anywhere
                    ? "border-accent bg-accent-tint"
                    : "border-rule bg-paper hover:border-accent/50"
                }`}
              >
                <span>
                  <span className="block text-base font-semibold text-ink">
                    {ANYWHERE}
                  </span>
                  <span className="mt-0.5 block text-small text-ink-muted">
                    See the widest set of opportunities.
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 text-[11px] font-bold ${
                    anywhere ? "border-accent bg-accent text-on-accent" : "border-rule text-transparent"
                  }`}
                >
                  ✓
                </span>
              </button>
              <p className="mt-3 text-small leading-relaxed text-ink-muted">
                Or add up to 5 cities:
              </p>
              <div className="mt-2">
                <TagInput
                  name="preferredLocations"
                  value={preferredLocations}
                  onChange={onLocationsChange}
                  max={5}
                  placeholder="Search city…"
                  suggestions={LOCATION_SUGGESTIONS}
                />
              </div>
              {state.fieldErrors?.preferredLocations ? (
                <p role="alert" className="mt-1 text-small font-medium text-red-700">
                  {state.fieldErrors.preferredLocations[0]}
                </p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="expectedPayLevel"
                className="block text-base font-semibold text-ink"
              >
                Preferred pay level{" "}
                <span className="rounded-full border border-rule bg-paper-deep px-2 py-0.5 text-small font-medium text-ink-muted">
                  Optional
                </span>
              </label>
              <select
                id="expectedPayLevel"
                name="expectedPayLevel"
                defaultValue={profile.expectedPayLevel ?? ""}
                className={`${inputCls} mt-2`}
              >
                <option value="">Prefer not to say</option>
                {Object.entries(PAY_LEVEL_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <PreviewRail
              name={user.name}
              imageUrl={user.image}
              headline={profile.headline}
              location={location}
              tags={profile.specializations}
              footnote={
                desiredLevels.length > 0
                  ? `Looking for ${desiredLevels
                      .slice(0, 2)
                      .map((l) => LEVEL_LABELS[l])
                      .join(" · ")}${desiredLevels.length > 2 ? " · +" + (desiredLevels.length - 2) : ""}`
                  : "Open to any level"
              }
              percent={percent}
              remaining={missing.length}
              extra={
                <MatchEstimate
                  discipline={profile.discipline}
                  desiredLevels={desiredLevels}
                  employmentTypes={employmentTypes}
                  preferredLocations={preferredLocations}
                  highestDegree={profile.highestDegree}
                />
              }
            />
          </aside>
        </div>

        <div className="mt-6">
          <StickyStepActions
            backHref="/onboarding/educator/4"
            continueLabel={editing ? "Save & continue →" : "Review my profile →"}
            continueLabelShort={editing ? "Continue →" : "Review →"}
            dirty={dirty}
            showSaveExit={editing}
            showSaveProfile={editing}
            showSkip={!editing}
          />
        </div>
      </form>
    </div>
  );
}
