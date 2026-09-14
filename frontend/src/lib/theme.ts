export type Theme = "system" | "light" | "dark";

const STORAGE_KEY = "theme";
export const THEME_ORDER: Theme[] = ["system", "light", "dark"];

function readPreference(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    return stored && THEME_ORDER.includes(stored) ? stored : "system";
  } catch {
    return "system";
  }
}

export function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function applyTheme(preference: Theme): void {
  const dark =
    preference === "dark" ||
    (preference === "system" && getSystemTheme() === "dark");
  document.documentElement.classList.toggle("dark", dark);
}

const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

export function subscribeTheme(listener: () => void): () => void {
  listeners.add(listener);
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onMediaChange = () => {
    if (readPreference() === "system") applyTheme("system");
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === STORAGE_KEY) emit();
  };
  media.addEventListener("change", onMediaChange);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    media.removeEventListener("change", onMediaChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function getThemeSnapshot(): Theme {
  return readPreference();
}

export function setThemePreference(preference: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, preference);
    applyTheme(preference);
    emit();
  } catch {
    // Storage unavailable (e.g. private mode) — apply for this session only.
    applyTheme(preference);
  }
}