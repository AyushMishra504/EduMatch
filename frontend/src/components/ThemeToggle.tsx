"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import {
  THEME_ORDER,
  applyTheme,
  getThemeSnapshot,
  setThemePreference,
  subscribeTheme,
  type Theme,
} from "@/lib/theme";

const ICONS = {
  system: Monitor,
  light: Sun,
  dark: Moon,
} as const;

const LABELS = {
  system: "System",
  light: "Light",
  dark: "Dark",
} as const;

export function ThemeToggle() {
  const preference = useSyncExternalStore<Theme>(
    subscribeTheme,
    getThemeSnapshot,
    () => "system",
  );

  useEffect(() => {
    applyTheme(preference);
  }, [preference]);

  const Icon = ICONS[preference];
  const label = LABELS[preference];

  return (
    <button
      type="button"
      onClick={() => {
        const next =
          THEME_ORDER[(THEME_ORDER.indexOf(preference) + 1) % THEME_ORDER.length];
        setThemePreference(next);
      }}
      aria-label={`Theme: ${label}. Click to change.`}
      title={`Theme: ${label}`}
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-rule text-ink transition-colors hover:bg-paper-deep hover:text-accent"
    >
      <Icon size={18} strokeWidth={2} aria-hidden="true" />
    </button>
  );
}