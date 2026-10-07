"use client";

import { Check } from "lucide-react";
import { FieldError } from "./FieldError";
import { cardIdleCls, cardSelectedCls } from "./fieldClasses";

type CardType = "radio" | "checkbox";

/**
 * Choice rendered as a real labelled input (native keyboard + arrow-key
 * support), styled as a card. Selected state uses border + tint + check
 * icon — never color alone.
 */
export function SelectionCard({
  name,
  value,
  type = "radio",
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  name: string;
  value: string;
  type?: CardType;
  checked: boolean;
  onChange: () => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-md border p-3.5 transition-colors has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-accent has-[input:focus-visible]:outline-offset-2 ${
        checked ? cardSelectedCls : cardIdleCls
      } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
    >
      <input
        type={type}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-colors ${
          checked ? "border-accent bg-accent text-on-accent" : "border-rule text-transparent"
        }`}
      >
        <Check size={12} strokeWidth={3} />
      </span>
      <span>
        <span className="block text-base font-semibold text-ink">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-small leading-relaxed text-ink-muted">
            {description}
          </span>
        ) : null}
      </span>
    </label>
  );
}

/** Fieldset wrapper for a group of SelectionCards with one error slot. */
export function CardGroup({
  label,
  hint,
  optional,
  error,
  children,
}: {
  label: string;
  hint?: string;
  optional?: boolean;
  error?: string[];
  children: React.ReactNode;
}) {
  return (
    <fieldset>
      <legend className="text-base font-semibold text-ink">
        {label}
        {optional ? (
          <span className="ml-2 font-normal text-ink-muted">Optional</span>
        ) : null}
      </legend>
      {hint ? (
        <p className="mt-1 text-small leading-relaxed text-ink-muted">{hint}</p>
      ) : null}
      <div className="mt-2 grid gap-2 sm:grid-cols-2">{children}</div>
      <FieldError messages={error} />
    </fieldset>
  );
}
