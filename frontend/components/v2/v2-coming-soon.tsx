"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { V2SoonScene } from "./v2-soon-scene";

const LOGO = "/brand/logo.svg";

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
      aria-labelledby="v2-soon-title"
      data-section="dar-rah-sofreh"
    >
      <V2SoonScene />

      <header className="v2-bookcase-head v2-soon-head">
        <p className="v2-bookcase-kicker">در راه سفره</p>
        <Image
          src={LOGO}
          alt="مرد کوهستان"
          width={220}
          height={44}
          className="v2-soon-logo"
          priority={false}
        />
        <p className="v2-bookcase-lead v2-soon-tagline">این راه سبز است</p>
      </header>

      <div className="v2-soon-copy">
        <h2 className="v2-soon-headline" id="v2-soon-title">
          به‌زودی…
        </h2>
        <span className="v2-soon-mark" aria-hidden />
        <p className="v2-soon-lead">
          محصولات تازه هنوز پشت پارچه سبزند.
          <span className="v2-soon-lead-line">راهشان به سفره شما باز می‌شود.</span>
        </p>
      </div>
    </section>
  );
}
