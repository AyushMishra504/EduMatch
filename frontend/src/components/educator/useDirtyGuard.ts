"use client";

import { useEffect } from "react";

/**
 * Warns before leaving the page with unsaved edits (browser-level
 * beforeunload). Only arms while `dirty` is true — saved states never nag.
 */
export function useDirtyGuard(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);
}
