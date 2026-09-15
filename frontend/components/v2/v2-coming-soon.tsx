"use client";

import { useEffect, useRef, useState } from "react";

import { V2SoonScene } from "./v2-soon-scene";

/**
 * «در راه سفره» — same scene + shell pattern as magazine/catalog sections.
 */
export function V2ComingSoonSection() {
  const rootRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.18 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={rootRef}
      id="coming-soon"
      className={`v2-bookcase v2-bookcase--soon${visible ? " is-visible" : ""}`}
      aria-label="محصولات به‌زودی مرد کوهستان"
      data-section="dar-rah-sofreh"
    >
      <V2SoonScene />
      <span className="v2-section-edge v2-section-edge--bottom" aria-hidden="true" />
    </section>
  );
}
