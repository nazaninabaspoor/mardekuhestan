"use client";

import { useLayoutEffect } from "react";

/** Home uses the header logo fly-in instead of this overlay. */
export function BrandTeaser() {
  useLayoutEffect(() => {
    document.documentElement.classList.remove("is-logo-intro-pending", "is-logo-intro-play");
    document.documentElement.classList.add("is-logo-intro-done");
  }, []);

  return null;
}
