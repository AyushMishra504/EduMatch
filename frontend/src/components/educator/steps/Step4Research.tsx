"use client";

import { useActionState, useState } from "react";
import { saveStep4 } from "@/app/onboarding/educator/actions";
import { initial } from "@/lib/educator/action-state";
import { computeCompleteness } from "@/lib/educator/completeness";
import type {
  EducatorUser,
  FullProfile,
  WizardMode,
} from "@/lib/educator/wizard";
import { ErrorSummary } from "../ErrorSummary";
import { FormField } from "../FormField";
import { PreviewRail } from "../PreviewRail";
import { StepHeader } from "../StepHeader";
import { StickyStepActions } from "../StickyStepActions";
import { inputCls } from "../fieldClasses";
import { useDirtyGuard } from "../useDirtyGuard";

export function Step4Research({
  profile,
  user,
  mode,
}: {
  profile: FullProfile;
  user: EducatorUser;
  mode: WizardMode;
}) {
  const [state, formAction] = useActionState(saveStep4, initial);
  const [dirty, setDirty] = useState(false);
  useDirtyGuard(dirty);
  const editing = mode === "editing";

  const [publications, setPublications] = useState(
    profile.publicationsCount === null || profile.publicationsCount === undefined
      ? ""
      : String(profile.publicationsCount),
  );
  const [hIndex, setHIndex] = useState(
    profile.hIndex === null || profile.hIndex === undefined
      ? ""
      : String(profile.hIndex),
  );

  const { percent, missing } = computeCompleteness(profile);

  const hasResearch =
    publications.trim() !== "" ||
    hIndex.trim() !== "" ||
    (profile.orcidId ?? "") !== "" ||
    (profile.scopusId ?? "") !== "";

  const researchSummary = [
    publications.trim() !== ""
      ? `${publications.trim()} publication${publications.trim() === "1" ? "" : "s"}`
      : null,
    hIndex.trim() !== "" ? `h-index ${hIndex.trim()}` : null,
    (profile.orcidId ?? "") !== "" ? "ORCID added" : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const location =
    profile.city && profile.state
      ? `${profile.city}, ${profile.state}`
      : (profile.city ?? null);

  return (
    <div>
      <StepHeader
        eyebrow={editing ? "Edit your profile" : "Step 4 of 6"}
        title="Research"
        description="Publications and IDs — only if you have them."
        optional
      />

      <form action={formAction} onChange={() => setDirty(true)} className="mt-6">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-5">
            <ErrorSummary
              errors={state.fieldErrors}
              formError={state.formError}
            />

            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                label="Publications"
                htmlFor="publicationsCount"
                optional
                error={state.fieldErrors?.publicationsCount}
              >
                <input
                  id="publicationsCount"
                  name="publicationsCount"
                  type="number"
                  min={0}
                  max={1000}
                  value={publications}
                  onChange={(e) => {
                    setDirty(true);
                    setPublications(e.target.value);
                  }}
                  placeholder="e.g. 12"
                  className={inputCls}
                />
              </FormField>
              <FormField
                label="h-index"
                htmlFor="hIndex"
                optional
                error={state.fieldErrors?.hIndex}
              >
                <input
                  id="hIndex"
                  name="hIndex"
                  type="number"
                  min={0}
                  max={200}
                  value={hIndex}
                  onChange={(e) => {
                    setDirty(true);
                    setHIndex(e.target.value);
                  }}
                  placeholder="e.g. 5"
                  className={inputCls}
                />
              </FormField>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                label="ORCID"
                htmlFor="orcidId"
                optional
                error={state.fieldErrors?.orcidId}
              >
                <input
                  id="orcidId"
                  name="orcidId"
                  defaultValue={profile.orcidId ?? ""}
                  placeholder="0000-0002-1825-0097"
                  className={inputCls}
                />
              </FormField>
              <FormField
                label="Scopus Author ID"
                htmlFor="scopusId"
                optional
                error={state.fieldErrors?.scopusId}
              >
                <input
                  id="scopusId"
                  name="scopusId"
                  inputMode="numeric"
                  defaultValue={profile.scopusId ?? ""}
                  placeholder="e.g. 57201234567"
                  className={inputCls}
                />
              </FormField>
            </div>

            <div className="rounded-md border border-rule bg-paper-deep p-4">
              <p className="text-base font-semibold text-ink">
                {hasResearch ? "Research profile" : "No research details yet"}
              </p>
              <p className="mt-1 text-small leading-relaxed text-ink-muted">
                {hasResearch
                  ? researchSummary || "Research details added."
                  : "You can add these later from your profile."}
              </p>
            </div>
          </div>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <PreviewRail
              name={user.name}
              imageUrl={user.image}
              headline={profile.headline}
              location={location}
              tags={profile.specializations}
              percent={percent}
              remaining={missing.length}
            />
          </aside>
        </div>

        <div className="mt-6">
          <StickyStepActions
            backHref="/onboarding/educator/3"
            continueLabel={editing ? "Save & continue →" : "Continue to preferences →"}
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
