import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

interface LegalSection {
  heading: string;
  body: string;
}

interface LegalPageProps {
  title: string;
  updated: string;
  sections: LegalSection[];
}

export function LegalPage({ title, updated, sections }: LegalPageProps) {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-5 py-16 sm:px-8 lg:py-24">
        <p className="text-tiny font-semibold uppercase tracking-[0.18em] text-accent">
          Legal
        </p>
        <h1 className="mt-4 font-serif font-medium text-h2 text-ink">{title}</h1>
        <p className="mt-2 text-tiny text-ink-muted">Last updated {updated}</p>

        <div className="mt-10 space-y-8 border-t border-rule pt-8">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-serif text-h3 font-medium text-ink">
                {section.heading}
              </h2>
              <p className="mt-2 text-body text-ink-muted">{section.body}</p>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}