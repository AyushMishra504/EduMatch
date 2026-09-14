"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import {
  applyTheme,
  getThemeSnapshot,
  setThemePreference,
  subscribeTheme,
  type Theme,
} from "@/lib/theme";

const OPTIONS: { value: Theme; label: string; icon: typeof Monitor }[] = [
  { value: "system", label: "Use system theme", icon: Monitor },
  { value: "light", label: "Light theme", icon: Sun },
  { value: "dark", label: "Dark theme", icon: Moon },
];

export function ThemeToggle() {
  const preference = useSyncExternalStore<Theme>(
    subscribeTheme,
    getThemeSnapshot,
    () => "system",
  );

  useEffect(() => {
    applyTheme(preference);
  }, [preference]);

  const activeIndex = Math.max(
    0,
    OPTIONS.findIndex((option) => option.value === preference),
  );

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="relative inline-flex items-stretch rounded-md border border-rule bg-paper-deep p-0.5"
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-0.5 left-0.5 rounded-sm bg-paper shadow-sm transition-transform duration-300 ease-out"
        style={{
          width: "calc((100% - 4px) / 3)",
          transform: `translateX(${activeIndex * 100}%)`,
        }}
      />
      {OPTIONS.map((option, index) => {
        const active = index === activeIndex;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={option.label}
            title={option.label}
            onClick={() => setThemePreference(option.value)}
            className={`relative grid h-8 w-9 place-items-center rounded-sm transition-colors ${
              active ? "text-accent" : "text-ink-muted hover:text-ink"
            }`}
          >
            <option.icon size={16} strokeWidth={2} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}