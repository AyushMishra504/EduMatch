"use client";

import { useId, useRef, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { inputCls } from "./fieldClasses";

export type SearchOption = { value: string; label: string };

/**
 * Lightweight searchable combobox (no new dependency). Full keyboard
 * support: arrows move, Enter picks, Escape closes. In `allowCustom` mode
 * (city) free text is a valid value; otherwise the value must be an option.
 */
export function SearchableSelect({
  id,
  name,
  value,
  onChange,
  options,
  placeholder,
  allowCustom = false,
  quickPicks,
  required,
}: {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: SearchOption[];
  placeholder: string;
  allowCustom?: boolean;
  quickPicks?: string[];
  required?: boolean;
}) {
  const listId = useId();
  const [text, setText] = useState(
    () => options.find((o) => o.value === value)?.label ?? value,
  );
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const needle = text.trim().toLowerCase();
  const filtered =
    needle.length === 0
      ? options
      : options.filter(
          (o) =>
            o.label.toLowerCase().includes(needle) ||
            o.value.toLowerCase().includes(needle),
        );

  function commit(value: string, label: string) {
    onChange(value);
    setText(label);
    setOpen(false);
    setActive(0);
  }

  function pickCustom(raw: string) {
    const cleaned = raw.trim();
    if (!cleaned) return;
    onChange(cleaned);
    setText(cleaned);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, Math.max(filtered.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      if (open && filtered.length > 0) {
        e.preventDefault();
        const opt = filtered[Math.min(active, filtered.length - 1)];
        commit(opt.value, opt.label);
      } else if (allowCustom && text.trim()) {
        e.preventDefault();
        pickCustom(text);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setText(options.find((o) => o.value === value)?.label ?? value);
      inputRef.current?.blur();
    }
  }

  const showQuickPicks =
    open && needle.length === 0 && quickPicks && quickPicks.length > 0;
  const submittedValue = allowCustom ? text.trim() : value;

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={open && filtered[active] ? `${listId}-${active}` : undefined}
          autoComplete="off"
          required={required}
          value={text}
          placeholder={placeholder}
          onChange={(e) => {
            setText(e.target.value);
            setOpen(true);
            setActive(0);
            if (!allowCustom) onChange("");
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            // Delayed so option pointer-downs register first.
            window.setTimeout(() => {
              setOpen(false);
              if (allowCustom) {
                if (text.trim()) pickCustom(text);
              } else {
                setText(options.find((o) => o.value === value)?.label ?? "");
              }
            }, 120);
          }}
          onKeyDown={onKeyDown}
          className={`${inputCls} pr-16`}
        />
        <div className="absolute inset-y-0 right-2 flex items-center gap-1">
          {text ? (
            <button
              type="button"
              aria-label="Clear selection"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange("");
                setText("");
                inputRef.current?.focus();
              }}
              className="rounded p-1 text-ink-muted transition-colors hover:text-ink"
            >
              <X size={15} aria-hidden="true" />
            </button>
          ) : null}
          <ChevronDown
            size={15}
            aria-hidden="true"
            className={`pointer-events-none text-ink-muted transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {open ? (
        <div className="absolute inset-x-0 z-20 mt-1 max-h-60 overflow-auto rounded-md border border-rule bg-paper shadow-card">
          {showQuickPicks ? (
            <>
              <p className="px-3 pb-1 pt-2 text-small font-semibold uppercase tracking-[0.12em] text-ink-muted">
                Popular
              </p>
              <ul role="listbox" id={listId} aria-label="Suggestions">
                {quickPicks!
                  .filter((c) => !options.every((o) => o.label !== c))
                  .map((city, i) => {
                    const opt = options.find((o) => o.label === city);
                    if (!opt) return null;
                    return (
                      <li
                        key={city}
                        id={`${listId}-${i}`}
                        role="option"
                        aria-selected={value === opt.value}
                      >
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => commit(opt.value, opt.label)}
                          className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-base text-ink transition-colors hover:bg-paper-deep"
                        >
                          {opt.label}
                          {value === opt.value ? (
                            <Check size={15} className="shrink-0 text-accent" aria-hidden="true" />
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
              </ul>
            </>
          ) : filtered.length > 0 ? (
            <ul role="listbox" id={listId} aria-label="Options">
              {filtered.map((opt, i) => (
                <li
                  key={opt.value}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={value === opt.value}
                >
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => commit(opt.value, opt.label)}
                    onMouseEnter={() => setActive(i)}
                    className={`flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-base transition-colors ${
                      i === active ? "bg-paper-deep text-ink" : "text-ink"
                    }`}
                  >
                    {opt.label}
                    {value === opt.value ? (
                      <Check size={15} className="shrink-0 text-accent" aria-hidden="true" />
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          ) : allowCustom && text.trim() ? (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pickCustom(text)}
              className="block w-full px-3 py-2.5 text-left text-base text-ink transition-colors hover:bg-paper-deep"
            >
              Use “{text.trim()}”
            </button>
          ) : (
            <p className="px-3 py-2.5 text-base text-ink-muted">
              No matches. Try a different search.
            </p>
          )}
        </div>
      ) : null}

      <input type="hidden" name={name} value={submittedValue} />
    </div>
  );
}
