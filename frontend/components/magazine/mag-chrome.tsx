"use client";

import { useEffect } from "react";

export function MagRouteClass() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("is-magazine-route");
    root.classList.remove("is-home-v2");
    return () => {
      root.classList.remove("is-magazine-route");
    };
  }, []);
  return null;
}
