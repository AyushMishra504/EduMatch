"use client";

import { useActionState, useState } from "react";
import { saveStep1 } from "@/app/onboarding/educator/actions";
import { initial } from "@/lib/educator/action-state";
import { INDIAN_STATES } from "@/lib/educator/constants";
import { computeCompleteness } from "@/lib/educator/completeness";
import { stateForCity } from "@/lib/educator/location";
import type { EducatorUser, FullProfile, WizardMode } from "@/lib/educator/wizard";
import { ErrorSummary } from "../ErrorSummary";
import { FormField } from "../FormField";
import { PreviewRail } from "../PreviewRail";
import { SearchableSelect } from "../SearchableSelect";
import { SelectionCard } from "../SelectionCard";
import { StepHeader } from "../StepHeader";
import { StickyStepActions } from "../StickyStepActions";
import { KNOWN_CITIES, POPULAR_CITIES } from "@/lib/educator/location";
import { inputCls } from "../fieldClasses";
import { useDirtyGuard } from "../useDirtyGuard";

function buildStarter(input: {
  headline: string;
  city: string;
  state: string;
  specializations: string[];
}): string {
  const headline = input.headline.trim().replace(/\.*$/, "");
  const place = [input.city.trim(), input.state].filter(Boolean).join(", ");
  const specs = input.specializations.slice(0, 3);
  const parts: string[] = [];
  if (headline) parts.push(`${headline}${place ? ` based in ${place}` : ""}.`);
  else if (place) parts.push(`Educator based in ${place}.`);
  else parts.push("Educator passionate about teaching.");
  if (specs.length > 0) {
    const list =
      specs.length === 1
        ? specs[0]
        : `${specs.slice(0, -1).join(", ")} and ${specs[specs.length - 1]}`;
    parts.push(`Interested in ${list}.`);
  }
  return parts.join(" ").slice(0, 300);
}

export function Step1Basics({
  profile,
  user,
  mode,
}: {
  profile: FullProfile;
  user: EducatorUser;
  mode: WizardMode;
}) {
  const [state, formAction] = useActionState(saveStep1, initial);
  const [dirty, setDirty] = useState(false);
  useDirtyGuard(dirty);
  const editing = mode === "editing";

  const [displayName, setDisplayName] = useState(user.name ?? "");
  const [headline, setHeadline] = useState(profile.headline ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [city, setCity] = useState(profile.city ?? "");
  const [stateValue, setStateValue] = useState(profile.state ?? "");
  const [relocate, setRelocate] = useState<boolean>(profile.willingToRelocate);
  const [autoStateNote, setAutoStateNote] = useState<string | null>(null);

  const { percent, missing } = computeCompleteness(profile);

  function touch<T>(set: (v: T) => void) {
    return (v: T) => {
      setDirty(true);
      set(v);
    };
  }

  function onCityChange(next: string) {
    setDirty(true);
    setCity(next);
    const suggested = stateForCity(next);
    if (suggested && suggested !== stateValue) {
      setStateValue(suggested);
      setAutoStateNote(
        `We set your state to ${suggested} based on the city — change it if that's wrong.`,
      );
    }
  }

  const location =
    city.trim() && stateValue ? `${city.trim()}, ${stateValue}` : city.trim() || null;

  return (
    <div>
      <StepHeader
        eyebrow={editing ? "Edit your profile" : "Step 1 of 6"}
        title="About you"
        description="Name, headline, and location — the rest can wait."
      />
      <form
        action={formAction}
        onChange={() => setDirty(true)}
        className="mt-6"
      >
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-5">
            <ErrorSummary
              errors={state.fieldErrors}
              formError={state.formError}
            />

            <FormField
              label="Full name"
              htmlFor="displayName"
              error={state.fieldErrors?.displayName}
            >
              <input
                id="displayName"
                name="displayName"
                autoComplete="name"
                maxLength={100}
                value={displayName}
                onChange={(e) => touch(setDisplayName)(e.target.value)}
                placeholder="e.g. Ayush Mishra"
                className={inputCls}
              />
            </FormField>

            <FormField
              label="Professional headline"
              htmlFor="headline"
              optional
              error={state.fieldErrors?.headline}
            >
              <input
                id="headline"
                name="headline"
                maxLength={80}
                value={headline}
                onChange={(e) => touch(setHeadline)(e.target.value)}
                placeholder="Assistant Professor of Computer Science"
                aria-describedby="headline-count"
                className={inputCls}
              />
              <p id="headline-count" className="mt-1 text-right text-small text-ink-muted">
                {headline.trim().length} / 80
              </p>
            </FormField>

            <div className="grid gap-6 sm:grid-cols-2">
              <FormField label="City" htmlFor="city" optional error={state.fieldErrors?.city}>
                <SearchableSelect
                  id="city"
                  name="city"
                  value={city}
                  onChange={onCityChange}
                  options={KNOWN_CITIES.map((c) => ({ value: c, label: c }))}
                  placeholder="Search city…"
                  allowCustom
                  quickPicks={POPULAR_CITIES}
                />
              </FormField>
              <FormField
                label="State / UT"
                htmlFor="state"
                optional
                error={state.fieldErrors?.state}
              >
                <select
                  id="state"
                  name="state"
                  value={stateValue}
                  onChange={(e) => {
                    setDirty(true);
                    setStateValue(e.target.value);
                    setAutoStateNote(null);
                  }}
                  className={inputCls}
                >
                  <option value="">Not set</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
            {autoStateNote ? (
              <p className="-mt-3 text-small leading-relaxed text-ink-muted" aria-live="polite">
                {autoStateNote}
              </p>
            ) : null}

            <FormField
              label="Mobile number"
              htmlFor="phone"
              optional
              error={state.fieldErrors?.phone}
            >
              <div className="relative">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-small text-ink-muted"
                >
                  +91
                </span>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  pattern="[6-9][0-9]{9}"
                  maxLength={10}
                  defaultValue={profile.phone ?? ""}
                  placeholder="98765 43210"
                  className={`${inputCls} pl-12`}
                />
              </div>
            </FormField>

            <fieldset>
              <legend className="text-base font-semibold text-ink">
                Would you consider relocating?
                <span className="ml-2 font-normal text-ink-muted">Optional</span>
              </legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <SelectionCard
                  name="willingToRelocate"
                  value="true"
                  checked={relocate === true}
                  onChange={() => {
                    setDirty(true);
                    setRelocate(true);
                  }}
                  label="Yes"
                  description="I'm open to moving for the right role."
                />
                <SelectionCard
                  name="willingToRelocate"
                  value="false"
                  checked={relocate === false}
                  onChange={() => {
                    setDirty(true);
                    setRelocate(false);
                  }}
                  label="No"
                  description="I'd prefer to stay where I am."
                />
              </div>
            </fieldset>

            <FormField
              label="Short bio"
              htmlFor="bio"
              optional
              error={state.fieldErrors?.bio}
            >
              <textarea
                id="bio"
                name="bio"
                rows={3}
                maxLength={300}
                value={bio}
                onChange={(e) => touch(setBio)(e.target.value)}
                placeholder="Write a short introduction…"
                aria-describedby="bio-count"
                className={`${inputCls} resize-y`}
              />
              <div className="mt-1 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setDirty(true);
                    setBio(
                      buildStarter({
                        headline,
                        city,
                        state: stateValue,
                        specializations: profile.specializations,
                      }),
                    );
                  }}
                  className="rounded-sm border border-rule px-2 py-1 text-small font-medium text-ink-muted transition-colors hover:border-accent hover:text-accent"
                >
                  Insert a starter draft
                </button>
                <p id="bio-count" className="text-small text-ink-muted">
                  {bio.length} / 300
                </p>
              </div>
            </FormField>
          </div>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <PreviewRail
              name={displayName || user.name}
              imageUrl={user.image}
              headline={headline}
              location={location}
              tags={profile.specializations}
              footnote={user.image ? "Photo from your Google account." : undefined}
              percent={percent}
              remaining={missing.length}
            />
          </aside>
        </div>

        {state.formError ? (
          <p role="alert" className="mt-4 text-small font-medium text-red-700">
            {state.formError}
          </p>
        ) : null}

        <div className="mt-6">
          <StickyStepActions
            backHref={editing ? "/profile" : "/onboarding"}
            continueLabel={editing ? "Save & continue →" : "Continue to academics →"}
            continueLabelShort={editing ? "Continue →" : "Continue →"}
            dirty={dirty}
            showSaveExit={editing}
            showSaveProfile={editing}
            showSkip={false}
          />
        </div>
      </form>
    </div>
  );
}
