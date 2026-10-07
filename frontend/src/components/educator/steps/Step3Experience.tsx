"use client";

import { useActionState, useState } from "react";
import { Check } from "lucide-react";
import { saveStep3 } from "@/app/onboarding/educator/actions";
import { initial } from "@/lib/educator/action-state";
import { computeCompleteness } from "@/lib/educator/completeness";
import { subjectSuggestions } from "@/lib/educator/suggestions";
import type { ExperienceEntry } from "@prisma/client";
import type {
  EducatorUser,
  FullProfile,
  WizardMode,
} from "@/lib/educator/wizard";
import { ErrorSummary } from "../ErrorSummary";
import { FormField } from "../FormField";
import { PreviewRail } from "../PreviewRail";
import { RepeatableList } from "../RepeatableList";
import {
  ExperienceRow,
  EMPTY_EXPERIENCE,
  type ExperienceDraft,
} from "../ExperienceRow";
import { SelectionCard } from "../SelectionCard";
import { StepHeader } from "../StepHeader";
import { StickyStepActions } from "../StickyStepActions";
import { inputCls } from "../fieldClasses";
import { useDirtyGuard } from "../useDirtyGuard";

function toDrafts(rows: ExperienceEntry[]): ExperienceDraft[] {
  return rows.map((r) => ({
    designation: r.designation,
    institution: r.institution,
    startYear: r.startYear,
    startMonth: r.startMonth,
    endYear: r.endYear,
    endMonth: r.endMonth,
    isCurrent: r.isCurrent,
    subjects: [...r.subjects],
  }));
}

const MONTH_SHORT = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function dateLabel(row: ExperienceDraft): string {
  const start = `${MONTH_SHORT[row.startMonth || 0] || ""} ${row.startYear || ""}`.trim();
  const end = row.isCurrent
    ? "Present"
    : `${MONTH_SHORT[row.endMonth || 0] || ""} ${row.endYear || ""}`.trim() || "…";
  return `${start} — ${end}`;
}

export function Step3Experience({
  profile,
  user,
  mode,
}: {
  profile: FullProfile;
  user: EducatorUser;
  mode: WizardMode;
}) {
  const [state, formAction] = useActionState(saveStep3, initial);
  const [dirty, setDirty] = useState(false);
  useDirtyGuard(dirty);
  const editing = mode === "editing";

  const [hasExperience, setHasExperience] = useState<boolean | null>(
    profile.isFresher
      ? false
      : profile.teachingYears !== null || profile.experience.length > 0
        ? true
        : profile.completedSteps >= 3
          ? true
          : null,
  );
  const [teachingYears, setTeachingYears] = useState(
    profile.teachingYears === null || profile.teachingYears === undefined
      ? ""
      : String(profile.teachingYears),
  );
  const [experience, setExperience] = useState<ExperienceDraft[]>(
    profile.experience.length > 0 ? toDrafts(profile.experience) : [],
  );

  const { percent, missing } = computeCompleteness(profile);

  function touch<T>(set: (v: T) => void) {
    return (v: T) => {
      setDirty(true);
      set(v);
    };
  }

  const location =
    profile.city && profile.state
      ? `${profile.city}, ${profile.state}`
      : (profile.city ?? null);

  const roleFootnote =
    hasExperience && teachingYears !== ""
      ? `${teachingYears} year${teachingYears === "1" ? "" : "s"} teaching experience`
      : hasExperience === false
        ? "Starting a teaching career"
        : null;

  return (
    <div>
      <StepHeader
        eyebrow={editing ? "Edit your profile" : "Step 3 of 6"}
        title="Teaching & experience"
        description="Your teaching history — or mark yourself new to teaching."
      />

      <form action={formAction} onChange={() => setDirty(true)} className="mt-6">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-6">
            <ErrorSummary
              errors={state.fieldErrors}
              formError={state.formError}
            />

            <fieldset>
              <legend className="text-base font-semibold text-ink">
                Do you have teaching experience?
              </legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <SelectionCard
                  name="path"
                  value="yes"
                  checked={hasExperience === true}
                  onChange={() => {
                    setDirty(true);
                    setHasExperience(true);
                  }}
                  label="Yes"
                  description="I have taught at an institution or organization."
                />
                <SelectionCard
                  name="path"
                  value="no"
                  checked={hasExperience === false}
                  onChange={() => {
                    setDirty(true);
                    setHasExperience(false);
                  }}
                  label="Not yet"
                  description="I'm starting my teaching career."
                />
              </div>
            </fieldset>

            {hasExperience === false ? (
              <div className="animate-fadein rounded-md border border-rule bg-paper-deep p-5">
                <p className="flex items-center gap-2 text-base font-semibold text-ink">
                  <Check size={16} className="text-accent" aria-hidden="true" />
                  Fresher profile
                </p>
                <p className="mt-1 text-small leading-relaxed text-ink-muted">
                  No problem — we&apos;ll mark you as a fresher.
                </p>
                <input type="hidden" name="experience" value="[]" />
              </div>
            ) : null}

            {hasExperience ? (
              <div className="animate-fadein space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField
                    label="Teaching experience (years)"
                    htmlFor="teachingYears"
                    error={state.fieldErrors?.teachingYears}
                  >
                    <input
                      id="teachingYears"
                      name="teachingYears"
                      type="number"
                      min={0}
                      max={50}
                      value={teachingYears}
                      onChange={(e) => touch(setTeachingYears)(e.target.value)}
                      placeholder="e.g. 6"
                      className={inputCls}
                    />
                  </FormField>
                  <FormField
                    label="Industry experience (years)"
                    htmlFor="industryYears"
                    optional
                    error={state.fieldErrors?.industryYears}
                  >
                    <input
                      id="industryYears"
                      name="industryYears"
                      type="number"
                      min={0}
                      max={50}
                      defaultValue={profile.industryYears ?? ""}
                      placeholder="e.g. 2"
                      className={inputCls}
                    />
                  </FormField>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField
                    label="Current designation"
                    htmlFor="currentDesignation"
                    error={state.fieldErrors?.currentDesignation}
                  >
                    <input
                      id="currentDesignation"
                      name="currentDesignation"
                      maxLength={60}
                      defaultValue={profile.currentDesignation ?? ""}
                      placeholder="e.g. Assistant Professor"
                      className={inputCls}
                    />
                  </FormField>
                  <FormField
                    label="Current institution"
                    htmlFor="currentInstitution"
                    error={state.fieldErrors?.currentInstitution}
                  >
                    <input
                      id="currentInstitution"
                      name="currentInstitution"
                      maxLength={100}
                      defaultValue={profile.currentInstitution ?? ""}
                      placeholder="e.g. Fergusson College"
                      className={inputCls}
                    />
                  </FormField>
                </div>

                <FormField
                  label="Notice period (days)"
                  htmlFor="noticePeriodDays"
                  error={state.fieldErrors?.noticePeriodDays}
                >
                  <input
                    id="noticePeriodDays"
                    name="noticePeriodDays"
                    type="number"
                    min={0}
                    max={180}
                    defaultValue={profile.noticePeriodDays ?? ""}
                    placeholder="0 = available now"
                    className={inputCls}
                  />
                </FormField>

                <div>
                  <span className="block text-base font-semibold text-ink">
                    Teaching roles
                  </span>
                  <p className="mt-1 text-small leading-relaxed text-ink-muted">
                    Most recent first.
                  </p>
                  <div className="mt-3">
                    <RepeatableList
                      name="experience"
                      rows={experience}
                      onChange={touch(setExperience)}
                      emptyRow={{ ...EMPTY_EXPERIENCE, subjects: [] }}
                      emptyTitle="No teaching roles added yet."
                      emptyBody="Add your current or most recent role first."
                      addLabel="Add teaching experience"
                      max={10}
                      min={0}
                      isRowEmpty={(row) =>
                        !row.designation.trim() &&
                        !row.institution.trim() &&
                        !row.subjects.length
                      }
                      renderRow={(row, _i, update) => (
                        <ExperienceRow
                          row={row}
                          update={update}
                          subjectSuggestions={subjectSuggestions(profile.discipline)}
                        />
                      )}
                      renderSummary={(row) => (
                        <div>
                          <p className="text-base font-semibold text-ink">
                            {row.designation || "Designation not set"}
                            {row.isCurrent ? (
                              <span className="ml-2 rounded-sm bg-accent-tint px-1.5 py-0.5 text-small font-medium text-accent">
                                Current
                              </span>
                            ) : null}
                          </p>
                          <p className="mt-0.5 text-small text-ink-muted">
                            {(row.institution || "Institution not set") +
                              ` · ${dateLabel(row)}`}
                            {row.subjects.length > 0
                              ? ` · ${row.subjects.slice(0, 3).join(", ")}`
                              : ""}
                          </p>
                        </div>
                      )}
                    />
                  </div>
                  {state.fieldErrors?.experience ? (
                    <p role="alert" className="mt-1 text-small font-medium text-red-700">
                      {state.fieldErrors.experience[0]}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <PreviewRail
              name={user.name}
              imageUrl={user.image}
              headline={profile.headline}
              location={location}
              tags={profile.specializations}
              footnote={roleFootnote}
              percent={percent}
              remaining={missing.length}
            />
          </aside>
        </div>

        <div className="mt-6">
          <StickyStepActions
            backHref="/onboarding/educator/2"
            continueLabel={editing ? "Save & continue →" : "Continue to research →"}
            continueLabelShort={editing ? "Continue →" : "Continue →"}
            dirty={dirty}
            showSaveExit={editing}
            showSaveProfile={editing}
            showSkip={!editing}
            skipLabel={
              hasExperience === null ? "Skip — I'll do this later" : "Skip for now"
            }
          />
        </div>
      </form>
    </div>
  );
}
