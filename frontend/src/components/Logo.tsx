import { GraduationCap } from "lucide-react";

export function Logo({ size = 32 }: { size?: number }) {
  return (
    <span
      style={{ width: size, height: size }}
      className="inline-grid shrink-0 place-items-center rounded-md bg-accent text-on-accent"
    >
      <GraduationCap
        size={Math.round(size * 0.56)}
        strokeWidth={2.5}
        aria-hidden="true"
      />
    </span>
  );
}

export function Wordmark({ size = 32 }: { size?: number }) {
  return (
    <span className="flex items-center gap-2.5">
      <Logo size={size} />
      <span className="text-[17px] font-bold tracking-tight">
        Edu<span className="text-accent">Match</span>
      </span>
    </span>
  );
}