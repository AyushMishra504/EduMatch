"use client";

import { useCallback, useRef } from "react";
import { useHoverCapable } from "./useHoverCapable";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";
import type { PointerEvent as ReactPointerEvent } from "react";

const MAX_TILT = 9;

export function useTilt<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const hoverCapable = useHoverCapable();
  const reducedMotion = usePrefersReducedMotion();
  const enabled = hoverCapable && !reducedMotion;

  const onPointerMove = useCallback((event: ReactPointerEvent<T>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    el.style.setProperty("--ry", `${((px - 0.5) * 2 * MAX_TILT).toFixed(2)}deg`);
    el.style.setProperty("--rx", `${((py - 0.5) * -2 * MAX_TILT).toFixed(2)}deg`);
    el.style.setProperty("--glare-x", `${(px * 100).toFixed(1)}%`);
    el.style.setProperty("--glare-y", `${(py * 100).toFixed(1)}%`);
  }, []);

  const onPointerLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }, []);

  if (!enabled) {
    return { ref };
  }

  return { ref, onPointerMove, onPointerLeave };
}