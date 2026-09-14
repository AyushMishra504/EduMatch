import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  FileText,
  School,
  Scale,
  Eye,
} from "lucide-react";

const DOSSIER_ROWS = [
  "Teaching experience",
  "Research & publications",
  "CV & documents",
  "Preferences & location",
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-14 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-12 lg:min-h-[82vh] lg:items-center lg:gap-10 lg:pb-24 lg:pt-20">
        <div className="lg:col-span-7">
          <p className="text-tiny font-semibold uppercase tracking-[0.18em] text-accent">
            For educators &amp; institutions in Indian higher education
          </p>

          <h1 className="mt-5 font-serif font-medium text-display text-ink">
            Where great educators meet the right institution.
          </h1>

          <p className="mt-6 max-w-xl text-lead text-ink-muted">
            EduMatch connects teachers, researchers, and universities around the
            roles that actually fit — matched to your teaching, your research,
            and what you want next.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="#for-educators"
              className="group inline-flex items-center justify-center gap-2 rounded-md bg-accent px-5 py-3 text-small font-semibold text-on-accent transition-colors hover:bg-accent-deep"
            >
              Find Teaching Opportunities
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
            <Link
              href="#for-institutions"
              className="inline-flex items-center justify-center rounded-md border border-rule bg-transparent px-5 py-3 text-small font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
            >
              Hire Qualified Educators
            </Link>
          </div>

          <p className="mt-6 text-tiny text-ink-muted">
            Free to join. Educator and institution sign-up opens with the launch.
          </p>
        </div>

        <div className="relative lg:col-span-5">
          <div
            className="absolute -left-3 top-3 h-full w-full border border-rule bg-paper-deep"
            aria-hidden="true"
          />
          <div className="relative border border-rule bg-paper p-6 shadow-sm sm:p-7">
            <div className="flex items-start justify-between gap-4 border-b border-rule pb-5">
              <div>
                <p className="font-serif text-[26px] leading-tight text-ink">
                  Teacher dossier
                </p>
                <p className="mt-1 text-tiny text-ink-muted">
                  One profile, used for every application.
                </p>
              </div>
              <span className="rounded-sm border border-accent/40 px-2 py-1 text-tiny font-semibold uppercase tracking-wider text-accent">
                Preview
              </span>
            </div>

            <div className="border-b border-rule py-5">
              <div className="flex items-center justify-between text-small">
                <span className="font-medium text-ink">Profile completeness</span>
                <span className="text-ink-muted">
                  Teaching, research, CV
                </span>
              </div>
              <div className="mt-2.5 h-1 w-full bg-rule">
                <div className="h-1 w-3/5 bg-accent" />
              </div>
            </div>

            <ul className="divide-y divide-rule">
              {DOSSIER_ROWS.map((row) => (
                <li key={row}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 py-3.5 text-left"
                  >
                    <ChevronRight size={16} className="text-ink-muted" />
                    <span className="text-small font-medium text-ink">
                      {row}
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-5 border-t border-rule pt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-tiny text-ink-muted">
                  <FileText size={15} className="text-accent" />
                  Attach CV
                </div>
                <div className="flex items-center gap-2 text-tiny text-ink-muted">
                  <BookOpen size={15} className="text-accent" />
                  Add publications
                </div>
                <div className="flex items-center gap-2 text-tiny text-ink-muted">
                  <School size={15} className="text-accent" />
                  Teaching focus
                </div>
                <div className="flex items-center gap-2 text-tiny text-ink-muted">
                  <Eye size={15} className="text-accent" />
                  Visibility settings
                </div>
                <div className="flex items-center gap-2 text-tiny text-ink-muted">
                  <Scale size={15} className="text-accent" />
                  Pay expectations
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}