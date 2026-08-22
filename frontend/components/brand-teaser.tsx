"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";

import { playIntroBell } from "@/lib/intro-bell";

const INTRO_MS = 1000;

/**
 * Home intro — single CSS timeline (no phase re-renders), ≤1s.
 */
export function BrandTeaser() {
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "/playground";
  const rootRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(!isHome);

  useLayoutEffect(() => {
    if (!isHome) {
      document.documentElement.classList.add("is-logo-intro-done");
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.documentElement.classList.remove("is-logo-intro-pending");
      document.documentElement.classList.add("is-logo-intro-done");
      setDone(true);
      return;
    }

    const root = rootRef.current;
    const target = document.querySelector<HTMLElement>(".logo-badge");
    if (!root || !target) {
      document.documentElement.classList.remove("is-logo-intro-pending");
      document.documentElement.classList.add("is-logo-intro-done");
      setDone(true);
      return;
    }

    const rect = target.getBoundingClientRect();
    root.style.setProperty("--intro-cx", `${window.innerWidth / 2}px`);
    root.style.setProperty("--intro-cy", `${window.innerHeight / 2}px`);
    root.style.setProperty("--intro-ex", `${rect.left + rect.width / 2}px`);
    root.style.setProperty("--intro-ey", `${rect.top + rect.height / 2}px`);
    root.style.setProperty("--intro-es", String(rect.width / 92));

    document.documentElement.classList.remove("is-logo-intro-pending");
    document.documentElement.classList.add("is-logo-intro-play", "is-logo-intro-lock");

    const finish = () => {
      document.documentElement.classList.remove("is-logo-intro-play", "is-logo-intro-lock");
      document.documentElement.classList.add("is-logo-intro-done");
      setDone(true);
    };

    const track = root.querySelector<HTMLElement>(".logo-intro-track");
    const onEnd = (event: AnimationEvent) => {
      if (event.target !== track || event.animationName !== "intro-track") return;
      track?.removeEventListener("animationend", onEnd);
      finish();
    };

    track?.addEventListener("animationend", onEnd);
    const fallback = window.setTimeout(finish, INTRO_MS + 48);

    requestAnimationFrame(() => {
      root.classList.add("logo-intro--run");
      window.setTimeout(() => playIntroBell(), 64);
    });

    return () => {
      track?.removeEventListener("animationend", onEnd);
      window.clearTimeout(fallback);
    };
  }, [isHome]);

  if (!isHome || done) return null;

  return (
    <div ref={rootRef} className="logo-intro" aria-hidden="true">
      <div className="logo-intro-backdrop" />
      <div className="logo-intro-track">
        <div className="logo-intro-core">
          <div className="logo-intro-word-wrap">
            <p className="logo-intro-word">مرد کوهستان</p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="logo-intro-mark"
            src="/brand/orginal-clear.png"
            alt=""
            width={92}
            height={92}
            decoding="sync"
            fetchPriority="high"
          />
        </div>
      </div>
    </div>
  );
}
