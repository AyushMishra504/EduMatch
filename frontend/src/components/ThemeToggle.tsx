"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import {
  applyTheme,
  getThemeSnapshot,
  setThemePreference,
  subscribeTheme,
  type Theme,
} from "@/lib/theme";

const OPTIONS: { value: Theme; label: string; icon: typeof Monitor }[] = [
  { value: "system", label: "System", icon: Monitor },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
];

export function ThemeToggle() {
  const preference = useSyncExternalStore<Theme>(
    subscribeTheme,
    getThemeSnapshot,
    () => "system",
  );
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    applyTheme(preference);
  }, [preference]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const current =
    OPTIONS.find((option) => option.value === preference) ?? OPTIONS[0];

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Change theme. Current: ${current.label}`}
        title={`Theme: ${current.label}`}
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-rule text-ink transition-colors hover:bg-paper-deep hover:text-accent"
      >
        <current.icon size={18} strokeWidth={2} aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Theme options"
          className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-md border border-rule bg-paper py-1 shadow-card-lg"
        >
          {OPTIONS.map((option) => {
            const active = option.value === preference;
            return (
              <button
                key={option.value}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  setThemePreference(option.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-small transition-colors ${
                  active
                    ? "font-semibold text-accent"
                    : "text-ink hover:bg-paper-deep"
                }`}
              >
                <option.icon size={15} strokeWidth={2} aria-hidden="true" />
                <span className="flex-1">{option.label}</span>
                {active && (
                  <Check size={14} strokeWidth={2.5} aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}