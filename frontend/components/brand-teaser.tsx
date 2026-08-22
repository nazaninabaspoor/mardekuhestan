"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const TEASER_MS = 900;
const FLY_MS = 580;

type Phase = "teaser" | "fly" | "done";

function buildFlightTransform(
  x: number,
  y: number,
  scale: number,
): string {
  return `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale})`;
}

/**
 * Home intro — green teaser with «مرد کوهستان», morphs into header logotype.
 */
export function BrandTeaser() {
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "/playground";
  const [phase, setPhase] = useState<Phase>(isHome ? "teaser" : "done");
  const [transform, setTransform] = useState("");
  const [ready, setReady] = useState(false);
  const flightRef = useRef({ start: "", end: "" });

  useLayoutEffect(() => {
    if (!isHome) return;

    const target = document.querySelector<HTMLElement>(".logo-badge");
    if (!target) {
      setPhase("done");
      return;
    }

    const rect = target.getBoundingClientRect();
    const endScale = rect.width / 92;
    const startScale = 1;

    const startX = window.innerWidth / 2;
    const startY = window.innerHeight / 2;
    const endX = rect.left + rect.width / 2;
    const endY = rect.top + rect.height / 2;

    flightRef.current = {
      start: buildFlightTransform(startX, startY, startScale),
      end: buildFlightTransform(endX, endY, endScale),
    };
    setTransform(flightRef.current.start);
    setReady(true);
  }, [isHome]);

  useEffect(() => {
    if (!isHome) {
      document.documentElement.classList.remove(
        "is-logo-intro-pending",
        "is-logo-intro-active",
        "is-logo-intro-teaser",
        "is-logo-intro-flying",
        "is-logo-intro-lock",
      );
      document.documentElement.classList.add("is-logo-intro-done");
      setPhase("done");
      return;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      document.documentElement.classList.remove(
        "is-logo-intro-pending",
        "is-logo-intro-active",
        "is-logo-intro-teaser",
        "is-logo-intro-flying",
        "is-logo-intro-lock",
      );
      document.documentElement.classList.add("is-logo-intro-done");
      setPhase("done");
      return;
    }

    document.documentElement.classList.remove("is-logo-intro-pending");
    document.documentElement.classList.add(
      "is-logo-intro-active",
      "is-logo-intro-teaser",
      "is-logo-intro-lock",
    );

    const flyTimer = window.setTimeout(() => {
      document.documentElement.classList.remove("is-logo-intro-teaser");
      document.documentElement.classList.add("is-logo-intro-flying");
      setPhase("fly");
    }, TEASER_MS);

    const doneTimer = window.setTimeout(() => {
      document.documentElement.classList.remove(
        "is-logo-intro-active",
        "is-logo-intro-flying",
        "is-logo-intro-lock",
      );
      document.documentElement.classList.add("is-logo-intro-done");
      setPhase("done");
    }, TEASER_MS + FLY_MS + 28);

    return () => {
      window.clearTimeout(flyTimer);
      window.clearTimeout(doneTimer);
    };
  }, [isHome]);

  useEffect(() => {
    if (phase !== "fly") return;

    let outer = 0;
    let inner = 0;

    outer = window.requestAnimationFrame(() => {
      inner = window.requestAnimationFrame(() => {
        setTransform(flightRef.current.end);
      });
    });

    return () => {
      window.cancelAnimationFrame(outer);
      window.cancelAnimationFrame(inner);
    };
  }, [phase]);

  if (!isHome || phase === "done") return null;

  return (
    <div
      className={`logo-intro${phase === "fly" ? " is-flying" : " is-teaser"}`}
      role="dialog"
      aria-modal="true"
      aria-label="تیزر مرد کوهستان"
    >
      <div className="logo-intro-backdrop" aria-hidden="true" />

      <div
        className={`logo-intro-fly${phase === "fly" ? " is-flying" : " is-teaser"}${ready ? " is-ready" : ""}`}
        style={{ transform }}
      >
        <div className="logo-intro-morph">
          <p className="logo-intro-word">مرد کوهستان</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="logo-intro-mark"
            src="/brand/orginal-clear.png"
            alt=""
            width={92}
            height={92}
            decoding="async"
            fetchPriority="high"
          />
        </div>
      </div>
    </div>
  );
}
