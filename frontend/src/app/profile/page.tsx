import Link from "next/link";
import type { Metadata } from "next";
import { requireEducatorWithUser } from "@/lib/educator/profile";
import { computeCompleteness } from "@/lib/educator/completeness";
import {
  DEGREE_LABELS,
  DISCIPLINE_LABELS,
  ELIGIBILITY_LABELS,
  EMPLOYMENT_LABELS,
  LEVEL_LABELS,
  PAY_LEVEL_LABELS,
  PHD_STATUS_LABELS,
} from "@/lib/educator/constants";
import { MatchRing } from "@/components/3d/MatchRing";
import { ResumeImportCard } from "@/components/educator/ResumeImportCard";
import { VisibilityCard } from "@/components/educator/VisibilityCard";
import { PriorityImprovementsCard } from "@/components/educator/PriorityImprovementsCard";
import { EducatorProfilePreview } from "@/components/educator/EducatorProfilePreview";
import { MatchEstimate } from "@/components/educator/MatchEstimate";

export const metadata: Metadata = {
  title: "My profile",
};

export const dynamic = "force-dynamic";

function Section({
  id,
  title,
  step,
  children,
}: {
  id?: string;
  title: string;
  step: number;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-md border border-rule bg-paper p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-serif text-lg font-medium text-ink">{title}</h2>
        <Link
          href={`/onboarding/educator/${step}`}
          className="text-small font-semibold text-accent hover:text-accent-deep"
        >
          Edit
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

export default async function ProfilePage() {
  // The gate covers auth + role check in one cached pass — do not re-run
  // auth()/role lookups here, each one is a DB roundtrip (~265ms remote).
  const { profile, user } = await requireEducatorWithUser();
  const { percent, missing } = computeCompleteness(profile);
  const published = profile.visibility === "PUBLISHED";

  const location =
    profile.city && profile.state
      ? `${profile.city}, ${profile.state}`
      : (profile.city ?? null);

  return (
    <main className="mx-auto max-w-2xl px-5 py-10 sm:px-8 lg:py-16">
      <p className="text-tiny font-semibold uppercase tracking-[0.18em] text-accent">
        My profile
      </p>
      <div className="mt-3 flex items-center gap-4">
        <MatchRing value={percent} label="ready" size={72} />
        <div>
          <h1 className="font-serif text-3xl font-medium text-ink">
            {profile.headline ?? "Your educator profile"}
          </h1>
          <p className="mt-1 text-small text-ink-muted">
            {published
              ? "Visible to institutions."
              : "Your profile is taking shape."}{" "}
            {missing.length > 0
              ? `${missing.length} useful detail${missing.length === 1 ? "" : "s"} remain${missing.length === 1 ? "s" : ""}.`
              : "Nothing important left to add."}
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <PriorityImprovementsCard missing={missing} />

        <section
          id="resume"
          className="scroll-mt-24 rounded-md border border-rule bg-paper p-5"
        >
          <ResumeImportCard
            title="Import from your resume"
            description="Upload a PDF or DOCX — only empty fields are filled, nothing is overwritten."
          />
        </section>

        <Section title="About you" step={1}>
          <Row label="Headline" value={profile.headline} />
          <Row
            label="Location"
            value={
              profile.city && profile.state
                ? `${profile.city}, ${profile.state}`
                : null
            }
          />
          <Row label="Phone" value={profile.phone} />
          <Row
            label="Open to relocate"
            value={profile.willingToRelocate ? "Yes" : "No"}
          />
          <Row label="Bio" value={profile.bio} />
        </Section>

        <Section title="Academic background" step={2}>
          <Row
            label="Highest degree"
            value={
              profile.highestDegree ? DEGREE_LABELS[profile.highestDegree] : null
            }
          />
          <Row
            label="PhD status"
            value={
              profile.phdStatus ? PHD_STATUS_LABELS[profile.phdStatus] : null
            }
          />
          <Row
            label="Discipline"
            value={
              profile.discipline ? DISCIPLINE_LABELS[profile.discipline] : null
            }
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
                ? profile.eligibility
                    .map((e) => ELIGIBILITY_LABELS[e] ?? e)
                    .join(", ")
                : null
            }
          />
          <Row
            label="Education"
            value={
              profile.education.length > 0
                ? profile.education
                    .map((e) => `${e.field} · ${e.institution} (${e.startYear})`)
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
                label="Teaching years"
                value={profile.teachingYears ?? null}
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
                        .map((e) => `${e.designation} · ${e.institution}`)
                        .join("; ")
                    : null
                }
              />
              <Row
                label="Notice period"
                value={
                  profile.noticePeriodDays !== null
                    ? `${profile.noticePeriodDays} days`
                    : null
                }
              />
            </>
          )}
        </Section>

        <Section id="research" title="Research" step={4}>
          <Row
            label="Publications"
            value={profile.publicationsCount ?? null}
          />
          <Row label="ORCID" value={profile.orcidId} />
          <Row label="Scopus ID" value={profile.scopusId} />
          <Row label="h-index" value={profile.hIndex ?? null} />
        </Section>

        <Section title="What you're looking for" step={5}>
          <Row
            label="Levels"
            value={
              profile.desiredLevels.length > 0
                ? profile.desiredLevels
                    .map((l) => LEVEL_LABELS[l] ?? l)
                    .join(", ")
                : profile.completedSteps >= 5
                  ? "Any level"
                  : null
            }
          />
          <Row
            label="Employment types"
            value={
              profile.employmentTypes.length > 0
                ? profile.employmentTypes
                    .map((t) => EMPLOYMENT_LABELS[t] ?? t)
                    .join(", ")
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
                ? (PAY_LEVEL_LABELS[profile.expectedPayLevel] ??
                  profile.expectedPayLevel)
                : null
            }
          />
          <div className="pt-3">
            <MatchEstimate
              discipline={profile.discipline}
              desiredLevels={[...profile.desiredLevels]}
              employmentTypes={[...profile.employmentTypes]}
              preferredLocations={[...profile.preferredLocations]}
              highestDegree={profile.highestDegree}
            />
          </div>
        </Section>

        <section className="rounded-md border border-rule bg-paper p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-serif text-lg font-medium text-ink">
              What institutions see
            </h2>
            <Link
              href="/onboarding/educator/6"
              className="text-small font-semibold text-accent hover:text-accent-deep"
            >
              Review →
            </Link>
          </div>
          <div className="mt-3">
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
        </section>

        <VisibilityCard published={published} />
      </div>
    </main>
  );
}
