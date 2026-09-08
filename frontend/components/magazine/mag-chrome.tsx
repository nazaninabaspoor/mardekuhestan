"use client";

import { useEffect } from "react";

export function MagRouteClass() {
  useEffect(() => {
    document.documentElement.classList.add("is-magazine-route");
    return () => document.documentElement.classList.remove("is-magazine-route");
  }, []);
  return null;
}
