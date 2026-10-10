const ITEMS = [
  "Built for UGC-style faculty hiring",
  "ORCID & Scopus-ready dossiers",
  "NIRF-aware role criteria",
  "Confidential candidate search",
  "Transparent pay-bands",
  "Indian higher-ed norms",
  "Profile-based matching",
];

const ITEMS_2 = [
  "Research alignment scoring",
  "Location preference matching",
  "Committee review tools",
  "Pay-band disclosed upfront",
  "NET / PhD credential tracking",
  "Teaching experience weighting",
];

export function MarqueeTop() {
  const row1 = [...ITEMS, ...ITEMS];

  return (
    <div
      className="overflow-hidden border-y border-rule bg-paper py-4"
      aria-hidden="true"
      style={{
        maskImage:
          "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
      }}
    >
      <div className="flex w-max animate-marquee items-center motion-reduce:animate-none">
        {row1.map((item, index) => (
          <span
            key={`r1-${item}-${index}`}
            className="flex items-center gap-8 pr-8 text-tiny font-semibold uppercase tracking-[0.18em] text-accent"
          >
            {item}
            <span className="opacity-40">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function MarqueeBottom() {
  const row2 = [...ITEMS_2, ...ITEMS_2];

  return (
    <div
      className="overflow-hidden border-y border-rule bg-paper py-4"
      aria-hidden="true"
      style={{
        maskImage:
          "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
      }}
    >
      <div
        className="flex w-max items-center motion-reduce:animate-none"
        style={{ animation: "marquee-reverse 34s linear infinite" }}
      >
        {row2.map((item, index) => (
          <span
            key={`r2-${item}-${index}`}
            className="flex items-center gap-8 pr-8 text-tiny font-semibold uppercase tracking-[0.18em] text-ink-muted"
          >
            {item}
            <span className="opacity-30">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}