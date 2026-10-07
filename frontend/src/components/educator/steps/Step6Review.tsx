"use client";

import Link from "next/link";
import { useActionState } from "react";
import { publishProfile } from "@/app/onboarding/educator/actions";
import { initial } from "@/lib/educator/action-state";
import {
  DEGREE_LABELS,
  DISCIPLINE_LABELS,
  ELIGIBILITY_LABELS,
  EMPLOYMENT_LABELS,
  LEVEL_LABELS,
  PAY_LEVEL_LABELS,
  PHD_STATUS_LABELS,
} from "@/lib/educator/constants";
import type {
  EducatorUser,
  FullProfile,
  WizardMode,
} from "@/lib/educator/wizard";
import { EducatorProfilePreview } from "../EducatorProfilePreview";
import { ResumeImportCard } from "../ResumeImportCard";
import { StepHeader } from "../StepHeader";
import { SubmitButton } from "../SubmitButton";

const MONTH_SHORT = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function Section({
  title,
  step,
  children,
}: {
  title: string;
  step: number;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md border border-rule bg-paper p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-serif text-lg font-medium text-ink">{title}</h2>
        <Link
          href={`/onboarding/educator/${step}`}
          className="shrink-0 text-base font-semibold text-accent hover:text-accent-deep"
        >
          Edit →
        </Link>
      </div>
      <div className="mt-3 space-y-1.5 text-small text-ink-muted">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <p>
      <span className="font-medium text-ink">{label}: </span>
      {value || <span className="italic">Not added</span>}
    </p>
  );
}

export function Step6Review({
  profile,
  user,
  mode,
}: {
  profile: FullProfile;
  user: EducatorUser;
  mode: WizardMode;
}) {
  const [state, formAction] = useActionState(publishProfile, initial);
  const editing = mode === "editing";

  const location =
    profile.city && profile.state
      ? `${profile.city}, ${profile.state}`
      : (profile.city ?? null);

  const gaps = state.missingSteps ?? [];

  return (
    <div>
      <StepHeader
        eyebrow={editing ? "Edit your profile" : "Step 6 of 6"}
        title={editing ? "Review profile" : "Your profile is ready"}
        description={
          editing
            ? "What institutions see. Everything stays live."
            : "What institutions will see before you publish."
        }
      />

      <div className="mx-auto mt-6 max-w-xl">
        <p className="mb-2 text-base font-semibold uppercase tracking-[0.18em] text-ink-muted">
          Profile preview
        </p>
        <EducatorProfilePreview
          name={user.name}
          imageUrl={user.image}
          headline={profile.headline}
          location={location}
          tags={profile.specializations}
          footnote={
            profile.desiredLevels.length > 0
              ? `Looking for ${profile.desiredLevels
                  .slice(0, 3)
                  .map((l) => LEVEL_LABELS[l] ?? l)
                  .join(" · ")}`
              : profile.completedSteps >= 5
                ? "Open to any level"
                : null
          }
        />
      </div>

      <div className="mt-6 space-y-4">
        <Section title="About you" step={1}>
          <Row label="Headline" value={profile.headline} />
          <Row label="Location" value={location} />
          <Row label="Phone" value={profile.phone} />
          <Row
            label="Open to relocating"
            value={profile.willingToRelocate ? "Yes" : "No"}
          />
          <Row label="Bio" value={profile.bio} />
        </Section>

        <Section title="Academic background" step={2}>
          <Row
            label="Highest degree"
            value={profile.highestDegree ? DEGREE_LABELS[profile.highestDegree] : null}
          />
          <Row
            label="PhD status"
            value={profile.phdStatus ? PHD_STATUS_LABELS[profile.phdStatus] : null}
          />
          <Row
            label="Discipline"
            value={profile.discipline ? DISCIPLINE_LABELS[profile.discipline] : null}
          />
          <Row
            label="Specializations"
            value={
              profile.specializations.length > 0
                ? profile.specializations.join(", ")
                : null
            }
          />
          <Row
            label="Eligibility"
            value={
              profile.eligibility.length > 0
                ? profile.eligibility.map((e) => ELIGIBILITY_LABELS[e] ?? e).join(", ")
                : null
            }
          />
          <Row
            label="Education"
            value={
              profile.education.length > 0
                ? profile.education
                    .map(
                      (e) =>
                        `${e.field} · ${e.institution} (${e.startYear}${e.isOngoing ? "–present" : e.endYear ? `–${e.endYear}` : ""})`,
                    )
                    .join("; ")
                : null
            }
          />
        </Section>

        <Section title="Teaching & experience" step={3}>
          {profile.isFresher ? (
            <p>New to teaching — no prior experience.</p>
          ) : (
            <>
              <Row
                label="Teaching experience"
                value={
                  profile.teachingYears === null || profile.teachingYears === undefined
                    ? null
                    : `${profile.teachingYears} years`
                }
              />
              <Row
                label="Current role"
                value={
                  profile.currentDesignation && profile.currentInstitution
                    ? `${profile.currentDesignation} · ${profile.currentInstitution}`
                    : (profile.currentDesignation ?? profile.currentInstitution)
                }
              />
              <Row
                label="Roles"
                value={
                  profile.experience.length > 0
                    ? profile.experience
                        .map(
                          (e) =>
                            `${e.designation} · ${e.institution} (${MONTH_SHORT[e.startMonth] || ""} ${e.startYear}${e.isCurrent ? "–present" : e.endYear ? `–${MONTH_SHORT[e.endMonth || 0] || ""} ${e.endYear}` : ""})`,
                        )
                        .join("; ")
                    : null
                }
              />
              <Row
                label="Notice period"
                value={
                  profile.noticePeriodDays !== null &&
                  profile.noticePeriodDays !== undefined
                    ? `${profile.noticePeriodDays} days`
                    : null
                }
              />
            </>
          )}
        </Section>

        <Section title="Research" step={4}>
          <Row label="Publications" value={profile.publicationsCount ?? null} />
          <Row label="ORCID" value={profile.orcidId} />
          <Row label="Scopus ID" value={profile.scopusId} />
          <Row label="h-index" value={profile.hIndex ?? null} />
        </Section>

        <Section title="What you're looking for" step={5}>
          <Row
            label="Teaching levels"
            value={
              profile.desiredLevels.length > 0
                ? profile.desiredLevels.map((l) => LEVEL_LABELS[l] ?? l).join(", ")
                : profile.completedSteps >= 5
                  ? "Any level"
                  : null
            }
          />
          <Row
            label="Work types"
            value={
              profile.employmentTypes.length > 0
                ? profile.employmentTypes.map((t) => EMPLOYMENT_LABELS[t] ?? t).join(", ")
                : null
            }
          />
          <Row
            label="Locations"
            value={
              profile.preferredLocations.length > 0
                ? profile.preferredLocations.join(", ")
                : null
            }
          />
          <Row
            label="Pay level"
            value={
              profile.expectedPayLevel
                ? (PAY_LEVEL_LABELS[profile.expectedPayLevel] ?? profile.expectedPayLevel)
                : null
            }
          />
        </Section>

        <ResumeImportCard
          title="Upload your resume"
          description="We'll prefill any blanks — your answers above are never overwritten."
        />

        <div className="rounded-md border border-dashed border-rule bg-paper-deep p-5">
          <h2 className="font-serif text-lg font-medium text-ink">
            Not ready to publish?
          </h2>
          <p className="mt-1 text-small leading-relaxed text-ink-muted">
            Saved as a draft — publish from your profile whenever you like.
          </p>
          <Link
            href="/dashboard"
            className="mt-4 inline-block rounded-md border border-rule bg-paper px-5 py-3 text-base font-semibold text-ink transition-colors hover:bg-paper-deep"
          >
            Take me to my dashboard →
          </Link>
        </div>

        {editing ? (
          <div className="rounded-md border border-rule bg-paper p-5">
            <h2 className="font-serif text-lg font-medium text-ink">
              Your profile is live
            </h2>
            <p className="mt-1 text-small leading-relaxed text-ink-muted">
              Changes save per section and stay visible. Nothing here will
              unpublish you.
            </p>
            <nav className="mt-4 flex items-center justify-between gap-3">
              <Link
                href="/onboarding/educator/5"
                className="rounded-md border border-rule px-5 py-3 text-base font-semibold text-ink transition-colors hover:bg-paper-deep"
              >
                ← Back
              </Link>
              <Link
                href="/profile"
                className="rounded-md bg-accent px-5 py-3 text-base font-semibold text-on-accent transition-colors hover:bg-accent-deep"
              >
                Back to profile
              </Link>
            </nav>
          </div>
        ) : (
          <div className="rounded-md border border-rule bg-paper p-5">
            <h2 className="font-serif text-lg font-medium text-ink">
              Ready to publish?
            </h2>
            <p className="mt-1 text-small leading-relaxed text-ink-muted">
              Publishing makes your educator profile available for relevant
              EduMatch opportunities. You can change your profile later.
            </p>
            <form action={formAction} className="mt-4">
              {gaps.length > 0 ? (
                <div role="alert" className="mb-4 rounded-md border border-amber-600/30 bg-amber-50 p-4 dark:bg-amber-950/20">
                  <p className="text-base font-semibold text-ink">
                    Your profile needs {gaps.length} more detail
                    {gaps.length === 1 ? "" : "s"}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {gaps.map((gap) => (
                      <li key={gap.label}>
                        <Link
                          href={`/onboarding/educator/${gap.step}`}
                          className="text-small font-medium text-accent hover:text-accent-deep"
                        >
                          Fix: {gap.label} →
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : state.formError ? (
                <p role="alert" className="mb-4 text-small font-medium text-red-700">
                  {state.formError}
                </p>
              ) : null}
              <nav className="flex items-center justify-between gap-3">
                <Link
                  href="/onboarding/educator/5"
                  className="rounded-md border border-rule px-5 py-3 text-base font-semibold text-ink transition-colors hover:bg-paper-deep"
                >
                  ← Back
                </Link>
                <SubmitButton pendingLabel="Publishing…">
                  Publish my profile
                </SubmitButton>
              </nav>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
