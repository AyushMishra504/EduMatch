"use client";

import { useActionState, useState } from "react";
import { saveStep2 } from "@/app/onboarding/educator/actions";
import { initial } from "@/lib/educator/action-state";
import {
  DEGREE_LABELS,
  DISCIPLINE_LABELS,
  ELIGIBILITY_LABELS,
} from "@/lib/educator/constants";
import { computeCompleteness } from "@/lib/educator/completeness";
import { SPECIALIZATION_SUGGESTIONS } from "@/lib/educator/suggestions";
import { ErrorSummary } from "../ErrorSummary";
import type {
  Discipline,
  Eligibility,
  HighestDegree,
  PhdStatus,
} from "@prisma/client";
import type {
  EducatorUser,
  FullProfile,
  WizardMode,
} from "@/lib/educator/wizard";
import { MatchEstimate } from "../MatchEstimate";
import { PreviewRail } from "../PreviewRail";
import { RepeatableList } from "../RepeatableList";
import { EducationRow, EMPTY_EDUCATION, type EducationDraft } from "../EducationRow";
import type { EducationEntry } from "@prisma/client";
import { SearchableSelect } from "../SearchableSelect";
import { CardGroup, SelectionCard } from "../SelectionCard";
import { StepHeader } from "../StepHeader";
import { StickyStepActions } from "../StickyStepActions";
import { TagInput } from "../TagInput";
import { useDirtyGuard } from "../useDirtyGuard";

function toDrafts(rows: EducationEntry[]): EducationDraft[] {
  return rows.map((r) => ({
    degree: r.degree,
    field: r.field,
    institution: r.institution,
    startYear: r.startYear,
    endYear: r.endYear,
    isOngoing: r.isOngoing,
    grade: r.grade ?? "",
  }));
}

const PHD_OPTIONS: PhdStatus[] = ["PURSUING", "SUBMITTED", "AWARDED"];
const PHD_OPTION_LABELS: Record<PhdStatus, string> = {
  NONE: "Not pursuing",
  PURSUING: "Pursuing",
  SUBMITTED: "Thesis submitted",
  AWARDED: "Awarded",
};

export function Step2Academics({
  profile,
  user,
  mode,
}: {
  profile: FullProfile;
  user: EducatorUser;
  mode: WizardMode;
}) {
  const [state, formAction] = useActionState(saveStep2, initial);
  const [dirty, setDirty] = useState(false);
  useDirtyGuard(dirty);
  const editing = mode === "editing";

  const [highestDegree, setHighestDegree] = useState<HighestDegree | null>(
    profile.highestDegree,
  );
  const [phdTrack, setPhdTrack] = useState(
    profile.highestDegree === "PHD" ||
      profile.highestDegree === "POSTDOC" ||
      (profile.phdStatus !== null && profile.phdStatus !== "NONE"),
  );
  const [phdStatus, setPhdStatus] = useState<PhdStatus | null>(profile.phdStatus);
  const [discipline, setDiscipline] = useState<Discipline | null>(profile.discipline);
  const [specializations, setSpecializations] = useState<string[]>([
    ...profile.specializations,
  ]);
  const [eligibility, setEligibility] = useState<Eligibility[]>([
    ...profile.eligibility,
  ]);
  const [education, setEducation] = useState<EducationDraft[]>(
    profile.education.length > 0 ? toDrafts(profile.education) : [{ ...EMPTY_EDUCATION }],
  );

  const { percent, missing } = computeCompleteness(profile);

  function touch<T>(set: (v: T) => void) {
    return (v: T) => {
      setDirty(true);
      set(v);
    };
  }

  function toggleEligibility(v: Eligibility) {
    setDirty(true);
    setEligibility((prev) => {
      if (v === "NONE") return prev.includes("NONE") ? [] : ["NONE"];
      const next = prev.includes(v)
        ? prev.filter((x) => x !== v)
        : [...prev.filter((x) => x !== "NONE"), v];
      return next;
    });
  }

  const location =
    profile.city && profile.state
      ? `${profile.city}, ${profile.state}`
      : (profile.city ?? null);

  return (
    <div>
      <StepHeader
        eyebrow={editing ? "Edit your profile" : "Step 2 of 6"}
        title="Academic background"
        description="Your degrees, discipline, and eligibility."
      />

      <form action={formAction} onChange={() => setDirty(true)} className="mt-6">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-6">
            <ErrorSummary
              errors={state.fieldErrors}
              formError={state.formError}
            />

            <CardGroup
              label="What is your highest qualification?"
              optional
              error={state.fieldErrors?.highestDegree}
            >
              {(Object.keys(DEGREE_LABELS) as HighestDegree[]).map((value) => (
                <SelectionCard
                  key={value}
                  name="highestDegree"
                  value={value}
                  checked={highestDegree === value}
                  onChange={() => {
                    setDirty(true);
                    setHighestDegree(value);
                    if (value === "PHD" || value === "POSTDOC") setPhdTrack(true);
                  }}
                  label={DEGREE_LABELS[value]}
                />
              ))}
            </CardGroup>

            <div>
              <p className="text-base font-semibold text-ink">
                Are you pursuing, or have you completed, a PhD?
              </p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <SelectionCard
                  name="phdTrack"
                  value="yes"
                  checked={phdTrack}
                  onChange={() => {
                    setDirty(true);
                    setPhdTrack(true);
                  }}
                  label="Yes"
                />
                <SelectionCard
                  name="phdTrack"
                  value="no"
                  checked={!phdTrack}
                  onChange={() => {
                    setDirty(true);
                    setPhdTrack(false);
                  }}
                  label="No"
                />
              </div>
              {phdTrack ? (
                <div className="mt-3 animate-fadein rounded-md border border-rule bg-paper-deep p-4">
                  <p className="text-base font-semibold text-ink">
                    What&apos;s your PhD status?
                  </p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    {PHD_OPTIONS.map((value) => (
                      <SelectionCard
                        key={value}
                        name="phdStatus"
                        value={value}
                        checked={phdStatus === value}
                        onChange={() => {
                          setDirty(true);
                          setPhdStatus(value);
                        }}
                        label={PHD_OPTION_LABELS[value]}
                      />
                    ))}
                  </div>
                  {state.fieldErrors?.phdStatus ? (
                    <p role="alert" className="mt-1 text-small font-medium text-red-700">
                      {state.fieldErrors.phdStatus[0]}
                    </p>
                  ) : null}
                </div>
              ) : (
                <input type="hidden" name="phdStatus" value="NONE" />
              )}
            </div>

            <div>
              <span className="block text-base font-semibold text-ink" id="discipline-label">
                What do you teach?
              </span>
              <div className="mt-2">
                <SearchableSelect
                  id="discipline"
                  name="discipline"
                  value={discipline ?? ""}
                  onChange={(v) => {
                    setDirty(true);
                    setDiscipline((v || null) as Discipline | null);
                  }}
                  options={Object.entries(DISCIPLINE_LABELS).map(([value, label]) => ({
                    value,
                    label,
                  }))}
                  placeholder="Search discipline…"
                />
              </div>
              {state.fieldErrors?.discipline ? (
                <p role="alert" className="mt-1 text-small font-medium text-red-700">
                  {state.fieldErrors.discipline[0]}
                </p>
              ) : null}
            </div>

            <div>
              <span className="block text-base font-semibold text-ink">
                What are your areas of specialization?
              </span>
              <p className="mt-1 text-small leading-relaxed text-ink-muted">
                Up to 8.
              </p>
              <div className="mt-2">
                <TagInput
                  name="specializations"
                  value={specializations}
                  onChange={touch(setSpecializations)}
                  max={8}
                  placeholder="Type an area and press Enter"
                  suggestions={
                    discipline
                      ? SPECIALIZATION_SUGGESTIONS[discipline]
                      : ["Machine Learning", "Data Structures", "Econometrics"]
                  }
                />
              </div>
              {state.fieldErrors?.specializations ? (
                <p role="alert" className="mt-1 text-small font-medium text-red-700">
                  {state.fieldErrors.specializations[0]}
                </p>
              ) : null}
            </div>

            <CardGroup
              label="Which eligibility qualifications do you hold?"
              error={state.fieldErrors?.eligibility}
            >
              {(Object.keys(ELIGIBILITY_LABELS) as Eligibility[]).map((value) => (
                <SelectionCard
                  key={value}
                  name="eligibility"
                  type="checkbox"
                  value={value}
                  checked={eligibility.includes(value)}
                  onChange={() => toggleEligibility(value)}
                  label={ELIGIBILITY_LABELS[value]}
                />
              ))}
            </CardGroup>

            <div>
              <span className="block text-base font-semibold text-ink">Education</span>
              <p className="mt-1 text-small leading-relaxed text-ink-muted">
                Up to 6.
              </p>
              <div className="mt-3">
                <RepeatableList
                  name="education"
                  rows={education}
                  onChange={touch(setEducation)}
                  emptyRow={{ ...EMPTY_EDUCATION }}
                  emptyTitle="No education history added yet."
                  emptyBody="Add your highest qualification first."
                  addLabel="Add qualification"
                  max={6}
                  min={0}
                  isRowEmpty={(row) =>
                    !row.field.trim() &&
                    !row.institution.trim() &&
                    row.endYear === "" &&
                    !row.isOngoing
                  }
                  renderRow={(row, _i, update) => (
                    <EducationRow row={row} update={update} />
                  )}
                  renderSummary={(row) => (
                    <div>
                      <p className="text-base font-semibold text-ink">
                        {(DEGREE_LABELS[row.degree] ?? row.degree) +
                          (row.field ? ` · ${row.field}` : "")}
                      </p>
                      <p className="mt-0.5 text-small text-ink-muted">
                        {(row.institution || "Institution not set") +
                          ` · ${row.startYear || "…"}–${row.isOngoing ? "Present" : row.endYear || "…"}`}
                      </p>
                    </div>
                  )}
                />
              </div>
              {state.fieldErrors?.education ? (
                <p role="alert" className="mt-1 text-small font-medium text-red-700">
                  {state.fieldErrors.education[0]}
                </p>
              ) : null}
            </div>
          </div>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <PreviewRail
              name={user.name}
              imageUrl={user.image}
              headline={profile.headline}
              location={location}
              tags={specializations}
              percent={percent}
              remaining={missing.length}
              extra={
                <MatchEstimate
                  discipline={discipline}
                  desiredLevels={[...profile.desiredLevels]}
                  employmentTypes={[...profile.employmentTypes]}
                  preferredLocations={[...profile.preferredLocations]}
                  highestDegree={highestDegree}
                />
              }
            />
          </aside>
        </div>

        <div className="mt-6">
          <StickyStepActions
            backHref="/onboarding/educator/1"
            continueLabel={editing ? "Save & continue →" : "Continue to experience →"}
            continueLabelShort={editing ? "Continue →" : "Continue →"}
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
