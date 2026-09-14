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
  if (typeof document === "undefined") return;
  const dark =
    preference === "dark" ||
    (preference === "system" && getSystemTheme() === "dark");
  const root = document.documentElement;
  const isDark = root.classList.contains("dark");
  if (isDark === dark) return;
  root.classList.toggle("dark", dark);
}

let viewTransitionActive = false;

export function setThemeWithTransition(
  next: "light" | "dark",
  buttonEl: HTMLElement,
): void {
  if (typeof document === "undefined") return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    setThemePreference(next);
    return;
  }

  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => {
      ready: Promise<void>;
      finished: Promise<void>;
    };
  };

  const root = document.documentElement;
  const dark = next === "dark";

  if (!doc.startViewTransition || viewTransitionActive) {
    root.classList.add("theme-transition");
    setThemePreference(next);
    window.setTimeout(() => {
      root.classList.remove("theme-transition");
    }, 500);
    return;
  }

  viewTransitionActive = true;
  let callbackRan = false;

  const applyChange = () => {
    root.classList.toggle("dark", dark);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // private mode
    }
  };

  // Chrome invokes the update callback asynchronously (and can occasionally
  // skip it entirely). Toggle the class inside the callback so the reveal's
  // "before"/"after" snapshots are correct, but guarantee the change + React
  // notification after the callback has had a chance to run.
  const transition = doc.startViewTransition(() => {
    callbackRan = true;
    applyChange();
  });

  const ensureApplied = () => {
    if (!callbackRan) applyChange();
    emit();
  };
  requestAnimationFrame(() => requestAnimationFrame(ensureApplied));

  transition.ready
    .then(() => {
      const { top, left, width, height } = buttonEl.getBoundingClientRect();
      const x = left + width / 2;
      const y = top + height / 2;
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      );
      root.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 500,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
          fill: "both",
        },
      );
    })
    .catch(() => {});
  transition.ready.catch(() => {});
  transition.finished.catch(() => {}).finally(() => {
    viewTransitionActive = false;
  });
}

const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

export function subscribeTheme(listener: () => void): () => void {
  listeners.add(listener);
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onMediaChange = () => {
    if (readPreference() === "system") {
      applyTheme("system");
      emit();
    }
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
  } catch {
    // private mode
  }
  applyTheme(preference);
  emit();
}
