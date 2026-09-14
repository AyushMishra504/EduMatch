"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import {
  applyTheme,
  getSystemTheme,
  getThemeSnapshot,
  setThemeWithTransition,
  subscribeTheme,
  type Theme,
} from "@/lib/theme";

function resolveDark(): boolean {
  const preference = getThemeSnapshot();
  return (
    preference === "dark" ||
    (preference === "system" && getSystemTheme() === "dark")
  );
}

export function ThemeToggle() {
  const preference = useSyncExternalStore<Theme>(
    subscribeTheme,
    getThemeSnapshot,
    () => "system",
  );
  const isDark = useSyncExternalStore<boolean>(
    subscribeTheme,
    resolveDark,
    () => false,
  );
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    applyTheme(preference);
  }, [preference]);

  const handleClick = () => {
    if (!btnRef.current) return;
    setThemeWithTransition(isDark ? "light" : "dark", btnRef.current);
  };

  return (
    <button
      ref={btnRef}
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={handleClick}
      className="relative grid h-8 w-9 place-items-center overflow-hidden rounded-md border border-rule bg-paper-deep text-ink-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
    >
      <Sun
        size={16}
        strokeWidth={2}
        aria-hidden="true"
        className={`absolute transition-all duration-300 ease-out ${
          isDark
            ? "rotate-90 scale-75 opacity-0 translate-y-1"
            : "rotate-0 scale-100 opacity-100 translate-y-0"
        }`}
      />
      <Moon
        size={16}
        strokeWidth={2}
        aria-hidden="true"
        className={`absolute transition-all duration-300 ease-out ${
          isDark
            ? "rotate-0 scale-100 opacity-100 translate-y-0"
            : "-rotate-90 scale-75 opacity-0 -translate-y-1"
        }`}
      />
    </button>
  );
}
