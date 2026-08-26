"use client";

import { useEffect } from "react";

import {
  armWelcomeBellOnGesture,
  playWelcomeBell,
} from "@/lib/v2-bell-audio";

function measureV2HeaderHeight(): number {
  const header = document.querySelector<HTMLElement>(".site-header--v2");
  if (!header) return 122;
  return Math.round(header.getBoundingClientRect().height);
}

function syncKitchenFrameVars() {
  const h = measureV2HeaderHeight();
  document.documentElement.style.setProperty("--v2-header-h", `${h}px`);
  const kitchen = document.getElementById("for-home-kitchen");
  if (kitchen) {
    kitchen.style.setProperty("--v2-header-h", `${h}px`);
  }
  return h;
}

/** Exact scroll Y so kitchen fills the viewport under the sticky header — no more, no less. */
function kitchenFrameScrollY(section: HTMLElement, headerH: number): number {
  const sectionTop = section.getBoundingClientRect().top + window.scrollY;
  return Math.max(0, Math.round(sectionTop - headerH));
}

function easeOutExpo(t: number) {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function animateScrollTo(targetY: number, duration = 720) {
  const startY = window.scrollY;
  const delta = targetY - startY;
  if (Math.abs(delta) < 2) return Promise.resolve();

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    window.scrollTo(0, targetY);
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      window.scrollTo(0, startY + delta * easeOutExpo(p));
      if (p < 1) {
        requestAnimationFrame(step);
      } else {
        resolve();
      }
    };
    requestAnimationFrame(step);
  });
}

/** Marks /v2 styles, pins top on load, cinematic fling, welcome bell. */
export function V2PageEffects() {
  useEffect(() => {
    const root = document.documentElement;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    if (location.hash) {
      history.replaceState(null, "", location.pathname + location.search);
    }

    root.classList.add("is-home-v2", "is-v2-hero-locked");
    if (fine && !reduced) {
      root.classList.add("is-v2-bell-cursor");
    }

    const pin = () => {
      root.scrollTop = 0;
      document.body.scrollTop = 0;
      window.scrollTo(0, 0);
    };
    pin();
    const raf1 = requestAnimationFrame(() => {
      pin();
      requestAnimationFrame(pin);
    });
    const timers = [0, 16, 50, 100, 250, 500].map((ms) =>
      window.setTimeout(pin, ms),
    );
    const onShow = (event: PageTransitionEvent) => {
      if (event.persisted) pin();
      else pin();
    };
    const onFocusIn = (event: FocusEvent) => {
      if (!root.classList.contains("is-v2-hero-locked")) return;
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.closest(".landing--v2, .site-header--v2, .skip-link")) return;
      target.blur?.();
      pin();
    };

    window.addEventListener("pageshow", onShow);
    document.addEventListener("focusin", onFocusIn, true);

    const disarmBell = armWelcomeBellOnGesture();
    void playWelcomeBell();
    syncKitchenFrameVars();
    const onResize = () => syncKitchenFrameVars();
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf1);
      timers.forEach((id) => window.clearTimeout(id));
      window.removeEventListener("pageshow", onShow);
      document.removeEventListener("focusin", onFocusIn, true);
      window.removeEventListener("resize", onResize);
      disarmBell();
      root.classList.remove(
        "is-home-v2",
        "is-v2-hero-locked",
        "is-v2-flinging",
        "is-v2-bell-cursor",
      );
    };
  }, []);

  useEffect(() => {
    let flung = false;
    let busy = false;

    const pinTop = () => {
      if (flung || busy) return;
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      if (window.scrollY !== 0) window.scrollTo(0, 0);
    };

    const fling = async () => {
      if (flung || busy) return;
      const section = document.getElementById("for-home-kitchen");
      if (!section) return;

      flung = true;
      busy = true;
      void playWelcomeBell();

      const root = document.documentElement;
      root.scrollTop = 0;
      document.body.scrollTop = 0;
      window.scrollTo(0, 0);
      root.classList.add("is-v2-flinging");
      /* Reveal kitchen + rest, then measure the exact frame */
      root.classList.remove("is-v2-hero-locked");

      await new Promise<void>((r) =>
        requestAnimationFrame(() => requestAnimationFrame(() => r())),
      );

      const headerH = syncKitchenFrameVars();
      /* Wait one frame so height: calc(100svh - header) is applied */
      await new Promise<void>((r) => requestAnimationFrame(() => r()));

      const target = kitchenFrameScrollY(section, headerH);
      await animateScrollTo(target, 760);
      /* Hard-pin the final pixel so smooth easing cannot overshoot */
      window.scrollTo(0, target);
      root.scrollTop = target;

      window.dispatchEvent(new CustomEvent("v2:kitchen-arrive"));
      root.classList.remove("is-v2-flinging");
      busy = false;
    };

    const onWheel = (event: WheelEvent) => {
      if (flung) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (event.deltaY > 0) void fling();
      else pinTop();
    };

    let touchY = 0;
    const onTouchStart = (event: TouchEvent) => {
      touchY = event.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (event: TouchEvent) => {
      if (flung) return;
      const y = event.touches[0]?.clientY ?? 0;
      const dy = touchY - y;
      if (dy <= 8) {
        if (dy < -2) {
          event.preventDefault();
          pinTop();
        }
        return;
      }
      event.preventDefault();
      event.stopImmediatePropagation();
      void fling();
    };

    const onKey = (event: KeyboardEvent) => {
      if (flung) return;
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        tag === "A" ||
        tag === "BUTTON" ||
        target?.isContentEditable
      ) {
        return;
      }
      if (
        event.key === "ArrowDown" ||
        event.key === "PageDown" ||
        event.key === " "
      ) {
        event.preventDefault();
        void fling();
      } else if (
        event.key === "ArrowUp" ||
        event.key === "PageUp" ||
        event.key === "Home" ||
        event.key === "End"
      ) {
        event.preventDefault();
        pinTop();
      }
    };

    const onScroll = () => {
      if (!flung) pinTop();
    };

    const opts = { passive: false, capture: true } as const;
    window.addEventListener("wheel", onWheel, opts);
    window.addEventListener("touchstart", onTouchStart, {
      passive: true,
      capture: true,
    });
    window.addEventListener("touchmove", onTouchMove, opts);
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });

    return () => {
      window.removeEventListener("wheel", onWheel, true);
      window.removeEventListener("touchstart", onTouchStart, true);
      window.removeEventListener("touchmove", onTouchMove, true);
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, []);

  return null;
}
