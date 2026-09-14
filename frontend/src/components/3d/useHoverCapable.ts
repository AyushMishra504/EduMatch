"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  const media = window.matchMedia("(hover: hover)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia("(hover: hover)").matches;
}

export function useHoverCapable() {
  return useSyncExternalStore(subscribe, getSnapshot, () => true);
}