/** Shared field styling for the educator wizard.
 *
 * Empty state = faint bg tint so unanswered fields are scannable at a
 * glance: text inputs/textareas via `:placeholder-shown` (needs a
 * placeholder attribute — use " " when there's nothing to show), selects
 * via a checked empty option. Filled fields render plain `bg-paper`.
 */

export const inputCls =
  "w-full rounded-md border border-rule bg-paper px-3 py-2.5 text-base text-ink outline-none transition-colors placeholder-shown:bg-paper-deep placeholder-shown:placeholder:text-ink-muted/70 has-[option:checked[value='']]:bg-paper-deep placeholder:text-ink-muted/60 focus:border-accent focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export const cardSelectedCls = "border-accent bg-accent-tint";
export const cardIdleCls = "border-rule bg-paper hover:border-accent/50";
