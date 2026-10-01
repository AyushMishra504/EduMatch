"use client";

import Link from "next/link";
import { useInView } from "@/hooks/useInView";

export function Join() {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <section
      id="join"
      className="relative scroll-mt-16 overflow-hidden border-t border-rule bg-accent py-20 text-on-accent lg:py-28"
    >
      {/* Animated background orbs */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute -top-24 left-1/2 h-64 w-[42rem] -translate-x-1/2 rounded-full bg-on-accent/10 blur-3xl"
          style={{ animation: "orb-drift 14s ease-in-out infinite" }}
        />
        <div
          className="absolute -bottom-16 -right-16 h-48 w-72 rounded-full bg-accent-tint/25 blur-3xl"
          style={{ animation: "orb-drift-slow 18s ease-in-out infinite alternate" }}
        />
        <div
          className="absolute top-1/2 -left-20 h-56 w-56 rounded-full bg-on-accent/5 blur-2xl"
          style={{ animation: "orb-drift 20s ease-in-out infinite reverse" }}
        />
        {/* Moving shimmer mesh */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            background:
              "linear-gradient(135deg, transparent 30%, color-mix(in srgb, var(--color-on-accent) 80%, transparent) 50%, transparent 70%)",
            backgroundSize: "200% 200%",
            animation: "gradient-shift 6s ease infinite",
          }}
        />
      </div>

      <div ref={ref} className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <p
          data-inview="slide-up"
          className={`text-tiny font-semibold uppercase tracking-[0.18em] text-accent-tint ${inView ? "in-view" : ""}`}
        >
          Join
        </p>
        <h2
          data-inview="slide-up"
          className={`mt-5 max-w-3xl font-serif font-medium text-4xl leading-[1.1] sm:text-5xl ${inView ? "in-view" : ""}`}
          style={{ "--delay": "80ms" } as React.CSSProperties}
        >
          Build the future of education with the right people.
        </h2>
        <p
          data-inview="slide-up"
          className={`mt-5 max-w-md text-body text-on-accent/75 ${inView ? "in-view" : ""}`}
          style={{ "--delay": "160ms" } as React.CSSProperties}
        >
          Sign-up is open. Whichever side you&apos;re on, this is where it
          starts.
        </p>

        <div
          data-inview="slide-up"
          className={`mt-9 flex flex-col gap-3 sm:flex-row sm:items-center ${inView ? "in-view" : ""}`}
          style={{ "--delay": "240ms" } as React.CSSProperties}
        >
          <Link
            href="/signup"
            className="group inline-flex items-center justify-center rounded-full bg-paper px-6 py-3 text-small font-semibold text-accent shadow-card-lg transition-all hover:bg-accent-tint hover:scale-105 hover:shadow-glow"
          >
            Join as an Educator
          </Link>
          <Link
            href="/signup"
            className="group inline-flex items-center justify-center rounded-full border border-on-accent/40 px-6 py-3 text-small font-semibold text-on-accent transition-all hover:border-on-accent hover:bg-accent-deep hover:scale-105"
          >
            Join as an Institution
          </Link>
        </div>
      </div>
    </section>
  );
}