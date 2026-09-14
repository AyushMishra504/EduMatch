import Link from "next/link";

export function Join() {
  return (
    <section
      id="join"
      className="scroll-mt-16 border-t border-rule bg-accent py-20 text-on-accent lg:py-28"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <p className="text-tiny font-semibold uppercase tracking-[0.18em] text-accent-tint">
          Join
        </p>
        <h2 className="mt-5 max-w-3xl font-serif font-medium text-4xl leading-[1.1] sm:text-5xl">
          Ready to make the right academic connection?
        </h2>
        <p className="mt-5 max-w-md text-body text-on-accent/75">
          Both paths open with the launch. Whichever side you&apos;re on, this
          is where it starts.
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-md bg-paper px-5 py-3 text-small font-semibold text-accent transition-colors hover:bg-accent-tint"
          >
            Join as an Educator
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-md border border-on-accent/40 px-5 py-3 text-small font-semibold text-on-accent transition-colors hover:border-on-accent hover:bg-accent-deep"
          >
            Join as an Institution
          </Link>
        </div>
      </div>
    </section>
  );
}