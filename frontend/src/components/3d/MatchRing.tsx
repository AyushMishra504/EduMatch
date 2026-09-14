"use client";

import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

export function MatchRing({
  value,
  label = "match",
  size = 96,
  className,
}: {
  value: number;
  label?: string;
  size?: number;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const start = performance.now();
    const duration = 1100;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimated(Math.round(eased * value));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, reduced]);

  const display = reduced ? value : animated;

  const stroke = Math.max(5, Math.round(size * 0.073));
  const r = (size - stroke) / 2 - 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - display / 100);

  return (
    <div
      className={`relative grid place-items-center rounded-full bg-paper shadow-glow ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="h-full w-full -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-accent)"
          strokeOpacity="0.16"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p
            className="font-serif font-medium leading-none text-ink"
            style={{ fontSize: Math.round(size * 0.26) }}
          >
            {display}
          </p>
          <p
            className="mt-0.5 font-semibold uppercase tracking-[0.16em] text-accent"
            style={{ fontSize: Math.max(8, Math.round(size * 0.09)) }}
          >
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}