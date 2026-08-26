"use client";

import { useEffect } from "react";

/** Marks the document for /v2 scoped styles + first-scroll fling into kitchen section. */
export function V2PageEffects() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("is-home-v2");
    return () => {
      root.classList.remove("is-home-v2");
    };
  }, []);

  useEffect(() => {
    let flung = false;
    let locked = false;

    const fling = () => {
      if (flung || locked) return;
      const section = document.getElementById("for-home-kitchen");
      if (!section) return;
      flung = true;
      locked = true;
      document.documentElement.classList.add("is-v2-flinging");
      section.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => {
        document.documentElement.classList.remove("is-v2-flinging");
        locked = false;
      }, 1100);
    };

    const onWheel = (event: WheelEvent) => {
      if (flung) return;
      if (event.deltaY <= 4) return;
      if (window.scrollY > window.innerHeight * 0.42) return;
      event.preventDefault();
      fling();
    };

    let touchY = 0;
    const onTouchStart = (event: TouchEvent) => {
      touchY = event.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (event: TouchEvent) => {
      if (flung) return;
      const y = event.touches[0]?.clientY ?? 0;
      if (touchY - y < 28) return;
      if (window.scrollY > window.innerHeight * 0.42) return;
      event.preventDefault();
      fling();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  return null;
}
