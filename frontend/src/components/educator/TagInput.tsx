"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Chip input: Enter / comma / blur commits, Backspace removes the last chip
 * when empty. A capture-phase submit listener folds any uncommitted draft
 * directly into the hidden JSON input, so a typed tag never disappears
 * because the user forgot to press Enter.
 */
export function TagInput({
  name,
  defaultValue,
  value,
  onChange,
  max,
  placeholder,
  suggestions,
}: {
  name: string;
  defaultValue?: string[];
  value?: string[];
  onChange?: (items: string[]) => void;
  max: number;
  placeholder: string;
  suggestions?: string[];
}) {
  const [internal, setInternal] = useState<string[]>(defaultValue ?? []);
  const items = value ?? internal;
  const setItems = onChange ?? setInternal;
  const [draft, setDraft] = useState("");

  const itemsRef = useRef(items);
  const draftRef = useRef(draft);
  const hiddenRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    itemsRef.current = items;
    draftRef.current = draft;
  });

  useEffect(() => {
    const box = boxRef.current;
    const form = box?.closest("form");
    if (!form || !hiddenRef.current) return;
    function onSubmit() {
      const cleaned = draftRef.current.trim().replace(/,$/, "");
      const current = itemsRef.current;
      if (
        cleaned &&
        current.length < max &&
        !current.some((item) => item.toLowerCase() === cleaned.toLowerCase())
      ) {
        hiddenRef.current!.value = JSON.stringify([...current, cleaned]);
      }
    }
    form.addEventListener("submit", onSubmit);
    return () => form.removeEventListener("submit", onSubmit);
  }, [max]);

  function commit(raw: string) {
    const cleaned = raw.trim().replace(/,$/, "");
    if (!cleaned) {
      setDraft("");
      return;
    }
    if (
      items.length < max &&
      !items.some((item) => item.toLowerCase() === cleaned.toLowerCase())
    ) {
      setItems([...items, cleaned]);
    }
    setDraft("");
  }

  return (
    <div ref={boxRef}>
      <div
        className={`flex flex-wrap gap-2 rounded-md border border-rule p-2 transition-colors focus-within:border-accent ${
          items.length === 0 && !draft.trim() ? "bg-paper-deep" : "bg-paper"
        }`}
      >
        {items.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setItems(items.filter((x) => x !== item))}
            aria-label={`Remove ${item}`}
            className="animate-fadein rounded-sm bg-accent-tint px-2 py-1 text-small font-medium text-accent transition-colors hover:bg-accent hover:text-on-accent"
          >
            {item} ×
          </button>
        ))}
        <input
          value={draft}
          disabled={items.length >= max}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              commit(draft);
            }
            if (e.key === "Backspace" && !draft && items.length > 0) {
              setItems(items.slice(0, -1));
            }
          }}
          onBlur={() => {
            if (draft.trim()) commit(draft);
          }}
          placeholder={items.length >= max ? `${max} maximum` : placeholder}
          aria-label="Add item"
          className="min-w-32 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-muted/60 disabled:cursor-not-allowed"
        />
      </div>
      {suggestions && suggestions.length > 0 ? (
        <div className="mt-2">
          <p className="text-small text-ink-muted">Suggestions:</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {suggestions
              .filter(
                (s) => !items.some((item) => item.toLowerCase() === s.toLowerCase()),
              )
              .slice(0, 8)
              .map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => commit(s)}
                  className="rounded-sm border border-rule px-2 py-1 text-small text-ink-muted transition-colors hover:border-accent hover:text-accent"
                >
                  + {s}
                </button>
              ))}
          </div>
        </div>
      ) : null}
      <input ref={hiddenRef} type="hidden" name={name} value={JSON.stringify(items)} />
    </div>
  );
}
