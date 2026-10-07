import { Check, GraduationCap, MapPin } from "lucide-react";

const PROFILE_ROWS = [
  { label: "Eligibility", value: "UGC-NET & JRF Qualified" },
  { label: "Teaching", value: "9 yrs exp." },
  { label: "Research", value: "32 publications" },
];

export function CampusVisual() {
  return (
    <div
      className="relative mx-auto h-[430px] w-full max-w-[440px] overflow-hidden rounded-[28px] bg-gradient-to-b from-[#E8F3F0] via-[#F2F8F6] to-white select-none sm:h-[470px] dark:from-[#0D3A33] dark:via-[#08211D] dark:to-[#04100E]"
      aria-hidden="true"
    >
      <svg
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[38%] w-full"
        viewBox="0 0 480 180"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M0 180 V110 H40 V95 H65 V110 H110 V80 H140 V65 H155 V80 H190 V115 H280 V85 H320 V115 H370 V90 H410 V70 H430 V90 H480 V180 Z"
          className="fill-[#DCE5EE] dark:fill-[#0B1512]"
        />
        <rect x="15" y="105" width="90" height="75" className="fill-[#EDF2F7] dark:fill-[#101A17]" />
        <polygon points="10,105 60,82 110,105" className="fill-[#C3CFDC] dark:fill-[#152420]" />
        <line x1="30" y1="108" x2="30" y2="160" strokeWidth={2.5} className="stroke-[#C3CFDC] dark:stroke-[#0A1210]" />
        <line x1="45" y1="108" x2="45" y2="160" strokeWidth={2.5} className="stroke-[#C3CFDC] dark:stroke-[#0A1210]" />
        <line x1="60" y1="108" x2="60" y2="160" strokeWidth={2.5} className="stroke-[#C3CFDC] dark:stroke-[#0A1210]" />
        <line x1="75" y1="108" x2="75" y2="160" strokeWidth={2.5} className="stroke-[#C3CFDC] dark:stroke-[#0A1210]" />
        <line x1="90" y1="108" x2="90" y2="160" strokeWidth={2.5} className="stroke-[#C3CFDC] dark:stroke-[#0A1210]" />
        <rect x="165" y="90" width="150" height="90" className="fill-[#EDF2F7] dark:fill-[#0E1A16]" />
        <path d="M210 90 C210 58 270 58 270 90 Z" className="fill-[#C3CFDC] dark:fill-[#12201C]" />
        <rect x="234" y="38" width="12" height="20" className="fill-[#94A3B8] dark:fill-[#172722]" />
        <polygon points="230,38 240,24 250,38" className="fill-[#94A3B8] dark:fill-[#172722]" />
        <path d="M180 120 C180 114 192 114 192 120 V145 H180 Z" className="fill-[#F8FAFC] dark:fill-[#0A1512]" />
        <path d="M205 120 C205 114 217 114 217 120 V145 H205 Z" className="fill-[#F8FAFC] dark:fill-[#0A1512]" />
        <path d="M263 120 C263 114 275 114 275 120 V145 H263 Z" className="fill-[#F8FAFC] dark:fill-[#0A1512]" />
        <path d="M288 120 C288 114 300 114 300 120 V145 H288 Z" className="fill-[#F8FAFC] dark:fill-[#0A1512]" />
        <rect x="350" y="98" width="115" height="82" className="fill-[#EDF2F7] dark:fill-[#0E1A16]" />
        <polygon points="345,98 408,76 470,98" className="fill-[#C3CFDC] dark:fill-[#12201C]" />
        <circle cx="135" cy="140" r="18" className="fill-[#DCE5EE] dark:fill-[#0E1A16]" />
        <circle cx="150" cy="145" r="14" className="fill-[#C3CFDC] dark:fill-[#0A1512]" />
        <rect x="138" y="150" width="4" height="30" className="fill-[#94A3B8] dark:fill-[#081210]" />
        <circle cx="335" cy="142" r="16" className="fill-[#DCE5EE] dark:fill-[#0E1A16]" />
        <rect x="333" y="150" width="4" height="30" className="fill-[#94A3B8] dark:fill-[#081210]" />
        <rect x="184" y="128" width="4" height="4" fill="#1F8F7E" opacity="0.95" />
        <rect x="238" y="46" width="4" height="4" fill="#1F8F7E" opacity="0.9" />
        <rect x="292" y="128" width="4" height="4" fill="#1F8F7E" opacity="0.95" />
        <rect x="45" y="132" width="4" height="5" fill="#1F8F7E" opacity="0.85" />
        <rect x="395" y="124" width="5" height="5" fill="#1F8F7E" opacity="0.9" />
      </svg>

      <svg
        className="pointer-events-none absolute inset-0 z-10 h-full w-full"
        viewBox="0 0 440 460"
        fill="none"
      >
        <path
          className="motion-reduce:animate-none animate-[draw-arc_1.4s_cubic-bezier(0.16,1,0.3,1)_0.5s_both] [stroke-dashoffset:0]"
          d="M 226 268 C 330 240 326 142 330 58"
          stroke="#1F8F7E"
          strokeWidth={1.5}
          strokeDasharray="3 4"
          opacity="0.85"
        />
      </svg>

      <div className="motion-reduce:animate-none animate-rise absolute left-[5%] top-[11%] z-20 w-[67%] rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-[0_18px_40px_-24px_rgb(15_23_42/0.35)] sm:p-5 dark:border-[#1F3A34] dark:bg-[#0A1512] dark:shadow-none">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#1F8F7E]/25 bg-[#E6F3EF] text-[#12796B] dark:border-[#1F8F7E]/40 dark:bg-transparent dark:text-[#4FC3AE]">
            <GraduationCap size={17} strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <p className="text-[15px] font-semibold leading-tight text-[#09090B] sm:text-[16px] dark:text-white">
              Dr. Ananya
              <br />
              Sharma
            </p>
            <p className="mt-1 text-[12px] leading-snug text-[#64748B] dark:text-[#9DB6B0]">
              Ph.D., Computer
              <br />
              Science
            </p>
          </div>
          <span className="ml-auto shrink-0 rounded-md border border-[#1F8F7E]/25 bg-[#E6F3EF] px-2 py-0.5 text-[11px] font-medium text-[#12796B] dark:border-[#1F8F7E]/40 dark:bg-[#1F8F7E]/10 dark:text-[#4FC3AE]">
            Profile
          </span>
        </div>

        <div className="mt-4 space-y-1.5 border-t border-[#E5E7EB] pt-3 dark:border-[#1F3A34]">
          {PROFILE_ROWS.map((row) => (
            <div key={row.label} className="flex items-baseline justify-between gap-3">
              <span className="text-[12px] text-[#64748B] dark:text-[#7E968F]">
                {row.label}
              </span>
              <span className="truncate text-[12px] font-medium text-[#09090B] dark:text-white">
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="motion-reduce:animate-none animate-pop absolute left-[42%] top-[39%] z-30 flex items-center gap-1.5 rounded-full border border-[#1F8F7E]/45 bg-white px-3 py-1.5 shadow-[0_10px_24px_-12px_rgb(15_23_42/0.35)] [animation-delay:900ms] dark:bg-[#0A1512] dark:shadow-none">
        <Check size={13} strokeWidth={3} className="text-[#1F8F7E]" />
        <span className="whitespace-nowrap text-[13px] font-semibold text-[#12796B] dark:text-[#4FC3AE]">
          92% match
        </span>
      </div>

      <div className="motion-reduce:animate-none animate-rise absolute right-[4%] top-[4%] z-30 flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3.5 py-2 shadow-[0_12px_28px_-16px_rgb(15_23_42/0.4)] [animation-delay:150ms] dark:border-[#1F3A34] dark:bg-[#0A1512] dark:shadow-none">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#1F8F7E] opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#1F8F7E]" />
        </span>
        <span className="whitespace-nowrap text-[13px] font-medium text-[#09090B] dark:text-white">
          Open roles near you
        </span>
      </div>

      <div className="motion-reduce:animate-none animate-rise absolute bottom-[13%] right-[4%] z-30 w-[73%] rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-[0_24px_50px_-28px_rgb(15_23_42/0.4)] [animation-delay:450ms] sm:p-5 dark:border-[#1F3A34] dark:bg-[#0A1512] dark:shadow-none">
        <div className="flex items-start justify-between gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#12796B] dark:text-[#4FC3AE]">
            Faculty role
          </span>
          <span className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[#1F8F7E]" />
        </div>
        <p className="mt-2 text-[18px] font-semibold leading-tight text-[#09090B] dark:text-white">
          Assistant Professor
        </p>
        <p className="mt-1 text-[13px] text-[#64748B] dark:text-[#9DB6B0]">
          Computer Science
        </p>
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#E5E7EB] pt-3 dark:border-[#1F3A34]">
          <span className="flex items-center gap-1.5 text-[13px] text-[#09090B] dark:text-[#D4D4D8]">
            <MapPin size={14} className="text-[#1F8F7E]" />
            Bengaluru
          </span>
          <span className="rounded-md border border-[#1F8F7E]/25 bg-[#E6F3EF] px-2 py-0.5 text-[12px] font-medium text-[#12796B] dark:border-[#1F8F7E]/40 dark:bg-[#1F8F7E]/10 dark:text-[#4FC3AE]">
            Full-time
          </span>
        </div>
      </div>
    </div>
  );
}
