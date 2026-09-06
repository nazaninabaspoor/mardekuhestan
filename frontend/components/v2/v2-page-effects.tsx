"use client";

import { useEffect } from "react";

import { armWelcomeBellOnGesture, playWelcomeBell } from "@/lib/v2-bell-audio";
import { consumeKitchenTravel, travelToKitchenSection } from "@/lib/travel-to-kitchen";

function measureV2HeaderHeight(): number {
  const header = document.querySelector<HTMLElement>(".site-header--v2");
  return header ? Math.round(header.getBoundingClientRect().height) : 122;
}

function syncHeaderHeight() {
  const root = document.documentElement;
  const headerH = measureV2HeaderHeight();
  root.style.setProperty("--v2-header-h", `${headerH}px`);
  document.getElementById("for-home-kitchen")?.style.setProperty("--v2-header-h", `${headerH}px`);
}

/** Page-only effects. Scrolling is intentionally left entirely to the browser. */
export function V2PageEffects() {
  useEffect(() => {
    const root = document.documentElement;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    root.classList.add("is-home-v2");
    root.classList.remove("is-v2-hero-locked", "is-v2-flinging");
    root.style.removeProperty("scroll-snap-type");
    root.style.removeProperty("scroll-padding-top");
    root.style.removeProperty("scroll-behavior");
    document.querySelectorAll<HTMLElement>(".home-v2 > section").forEach((section) => {
      section.style.removeProperty("scroll-snap-align");
      section.style.removeProperty("scroll-snap-stop");
    });
    if (fine && !reduced) root.classList.add("is-v2-bell-cursor");

    syncHeaderHeight();
    const onResize = () => syncHeaderHeight();
    window.addEventListener("resize", onResize);

    const disarmBell = armWelcomeBellOnGesture();
    void playWelcomeBell();

    let travelTimer = 0;
    if (consumeKitchenTravel()) {
      const tryTravel = (attempt = 0) => {
        if (travelToKitchenSection()) return;
        if (attempt < 16) {
          travelTimer = window.setTimeout(() => tryTravel(attempt + 1), 50);
        }
      };
      tryTravel();
    }

    return () => {
      window.clearTimeout(travelTimer);
      window.removeEventListener("resize", onResize);
      root.style.removeProperty("--v2-header-h");
      disarmBell();
      root.classList.remove(
        "is-home-v2",
        "is-v2-hero-locked",
        "is-v2-flinging",
        "is-v2-bell-cursor",
      );
    };
  }, []);

  return null;
}
