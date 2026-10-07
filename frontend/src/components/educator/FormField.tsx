import { FieldError } from "./FieldError";
import { OptionalBadge } from "./OptionalBadge";

export function FormField({
  label,
  htmlFor,
  hint,
  error,
  optional,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string[];
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="flex flex-wrap items-center gap-2 text-base font-semibold text-ink"
      >
        {label}
        {optional ? <OptionalBadge /> : null}
      </label>
      <div className="mt-2">{children}</div>
      {hint ? (
        <p className="mt-1 text-small leading-relaxed text-ink-muted">{hint}</p>
      ) : null}
      <FieldError messages={error} />
    </div>
  );
}
