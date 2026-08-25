"use client";

import { useEffect } from "react";

/** Marks the document for /v2 scoped styles (no mountain page background). */
export function V2PageEffects() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("is-home-v2");
    return () => {
      root.classList.remove("is-home-v2");
    };
  }, []);

  return null;
}
