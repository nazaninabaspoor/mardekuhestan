"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const HOLD_MS = 1650;
const FADE_MS = 480;

/**
 * Brand intro before home — logotype-led, not a boxed AI collage.
 */
export function BrandTeaser() {
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "/playground";
  const [phase, setPhase] = useState<"show" | "out" | "done">(
    isHome ? "show" : "done",
  );

  useEffect(() => {
    if (!isHome) {
      document.documentElement.classList.remove(
        "is-teaser-lock",
        "is-teaser-pending",
      );
      setPhase("done");
      return;
    }

    setPhase("show");
    document.documentElement.classList.add("is-teaser-lock");
    document.documentElement.classList.remove("is-teaser-pending");

    const outTimer = window.setTimeout(() => setPhase("out"), HOLD_MS);
    const doneTimer = window.setTimeout(() => {
      document.documentElement.classList.remove(
        "is-teaser-lock",
        "is-teaser-pending",
      );
      setPhase("done");
    }, HOLD_MS + FADE_MS);

    return () => {
      window.clearTimeout(outTimer);
      window.clearTimeout(doneTimer);
    };
  }, [isHome]);

  if (!isHome || phase === "done") return null;

  return (
    <div
      className={`brand-teaser${phase === "out" ? " is-out" : " is-ready"}`}
      role="dialog"
      aria-modal="true"
      aria-label="تیزر مرد کوهستان"
    >
      <div className="brand-teaser-wash" aria-hidden="true" />
      <div className="brand-teaser-glow" aria-hidden="true" />
      <svg
        className="brand-teaser-peak"
        viewBox="0 0 120 40"
        aria-hidden="true"
      >
        <path d="M8 36 L60 6 L112 36" />
      </svg>

      <div className="brand-teaser-core">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="brand-teaser-mark"
          src="/brand/logo-white.svg"
          alt=""
          width={302}
          height={60}
          decoding="async"
          fetchPriority="high"
        />
        <p className="brand-teaser-line">این راه سبز است</p>
      </div>
    </div>
  );
}
