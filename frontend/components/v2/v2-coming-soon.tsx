"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";

const LOGO = "/brand/logo.svg";

const DROPS = [
  {
    id: "drop-meat",
    image: "/brand/home-meat.png",
    alt: "محصول گوشت مرد کوهستان — به‌زودی",
    progress: 46,
  },
  {
    id: "drop-dairy",
    image: "/brand/home-dairy.png",
    alt: "محصول لبنی مرد کوهستان — به‌زودی",
    progress: 76,
  },
] as const;

/**
 * Poster-style «در راه سفره» for /v2 only.
 * Minimal cream field · two product thumbs · independent loading bars.
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
      { threshold: 0.22 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={rootRef}
      id="coming-soon"
      className={`v2-soon${visible ? " is-visible" : ""}`}
      aria-labelledby="v2-soon-title"
      data-section="dar-rah-sofreh"
    >
      <div className="v2-soon-stage">
        <header className="v2-soon-brand">
          <Image
            src={LOGO}
            alt="مرد کوهستان"
            width={220}
            height={44}
            className="v2-soon-logo"
            priority={false}
          />
          <p className="v2-soon-tagline">این راه سبز است</p>
        </header>

        <ul className="v2-soon-meters">
          {DROPS.map((drop, index) => (
            <li
              key={drop.id}
              className="v2-soon-meter"
              style={
                {
                  ["--soon-progress"]: `${drop.progress}%`,
                  ["--soon-i"]: index,
                } as CSSProperties
              }
            >
              <div className="v2-soon-track" aria-hidden="true">
                <span className="v2-soon-fill" />
              </div>
              <div className="v2-soon-thumb">
                <Image
                  src={drop.image}
                  alt={drop.alt}
                  width={640}
                  height={640}
                  sizes="(max-width: 760px) 22vw, 112px"
                  className="v2-soon-product"
                />
              </div>
            </li>
          ))}
        </ul>

        <h2 className="v2-soon-headline" id="v2-soon-title">
          به‌زودی…
        </h2>
      </div>
    </section>
  );
}
