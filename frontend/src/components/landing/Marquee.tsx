const ITEMS = [
  "Built for UGC-style faculty hiring",
  "ORCID & Scopus-ready dossiers",
  "NIRF-aware role criteria",
  "Confidential candidate search",
  "Transparent pay-bands",
];

export function Marquee() {
  const items = [...ITEMS, ...ITEMS];

  return (
    <div
      className="overflow-hidden border-y border-rule bg-paper-deep py-3"
      aria-hidden="true"
    >
      <div className="flex w-max animate-marquee items-center motion-reduce:animate-none">
        {items.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="flex items-center gap-8 pr-8 text-tiny font-semibold uppercase tracking-[0.18em] text-accent"
          >
            {item}
            <span>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}