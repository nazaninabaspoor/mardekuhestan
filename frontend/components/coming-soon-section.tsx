"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";

import { upcomingDrops } from "@/lib/brand";

function SparkIcon() {
  return (
    <svg
      className="coming-soon-title-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M12 3.5 13.2 9.2 18.5 10.5 13.2 11.8 12 17.5 10.8 11.8 5.5 10.5 10.8 9.2 12 3.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type DecorKind =
  | "fork"
  | "spoon"
  | "knife"
  | "leaf"
  | "peak"
  | "steam"
  | "drop"
  | "herb"
  | "ring"
  | "dot";

type DecorSpec = {
  kind: DecorKind;
  top: string;
  left: string;
  size: number;
  rot: number;
  delay: number;
  duration: number;
  opacity: number;
  drift: "a" | "b" | "c" | "d";
};

/** Dense soft constellation of tableware / path motifs — fills the case, stays quiet. */
const DECOR_FIELD: DecorSpec[] = [
  { kind: "fork", top: "6%", left: "5%", size: 17, rot: 16, delay: 0, duration: 7.2, opacity: 0.38, drift: "a" },
  { kind: "spoon", top: "7%", left: "88%", size: 16, rot: -20, delay: 0.3, duration: 8, opacity: 0.36, drift: "b" },
  { kind: "knife", top: "22%", left: "3%", size: 15, rot: -14, delay: 0.6, duration: 6.8, opacity: 0.34, drift: "c" },
  { kind: "fork", top: "24%", left: "92%", size: 15, rot: 22, delay: 0.2, duration: 7.6, opacity: 0.32, drift: "d" },
  { kind: "leaf", top: "12%", left: "14%", size: 26, rot: -32, delay: 0.4, duration: 9, opacity: 0.34, drift: "a" },
  { kind: "leaf", top: "10%", left: "78%", size: 24, rot: 28, delay: 0.7, duration: 8.4, opacity: 0.32, drift: "b" },
  { kind: "peak", top: "5%", left: "46%", size: 38, rot: 0, delay: 0.5, duration: 5.6, opacity: 0.3, drift: "c" },
  { kind: "steam", top: "4%", left: "28%", size: 22, rot: 0, delay: 0.1, duration: 4.6, opacity: 0.26, drift: "d" },
  { kind: "steam", top: "5%", left: "66%", size: 20, rot: 0, delay: 0.9, duration: 5, opacity: 0.24, drift: "a" },
  { kind: "herb", top: "34%", left: "6%", size: 28, rot: -18, delay: 0.35, duration: 8.8, opacity: 0.33, drift: "b" },
  { kind: "herb", top: "36%", left: "90%", size: 26, rot: 24, delay: 0.55, duration: 7.9, opacity: 0.31, drift: "c" },
  { kind: "spoon", top: "40%", left: "2%", size: 14, rot: 28, delay: 0.15, duration: 7.1, opacity: 0.3, drift: "d" },
  { kind: "knife", top: "44%", left: "94%", size: 14, rot: -26, delay: 0.85, duration: 6.5, opacity: 0.3, drift: "a" },
  { kind: "fork", top: "52%", left: "8%", size: 13, rot: -8, delay: 0.45, duration: 8.2, opacity: 0.28, drift: "b" },
  { kind: "spoon", top: "54%", left: "86%", size: 13, rot: 12, delay: 0.65, duration: 7.4, opacity: 0.28, drift: "c" },
  { kind: "leaf", top: "48%", left: "16%", size: 20, rot: 40, delay: 0.25, duration: 9.2, opacity: 0.26, drift: "d" },
  { kind: "leaf", top: "50%", left: "76%", size: 22, rot: -36, delay: 0.75, duration: 8.6, opacity: 0.26, drift: "a" },
  { kind: "ring", top: "18%", left: "48%", size: 18, rot: 0, delay: 0.4, duration: 10, opacity: 0.22, drift: "b" },
  { kind: "ring", top: "58%", left: "48%", size: 14, rot: 0, delay: 1.1, duration: 9.4, opacity: 0.2, drift: "c" },
  { kind: "drop", top: "16%", left: "22%", size: 10, rot: 0, delay: 0.2, duration: 5.2, opacity: 0.28, drift: "d" },
  { kind: "drop", top: "20%", left: "72%", size: 9, rot: 0, delay: 0.8, duration: 5.8, opacity: 0.26, drift: "a" },
  { kind: "drop", top: "42%", left: "20%", size: 8, rot: 0, delay: 1.2, duration: 4.9, opacity: 0.24, drift: "b" },
  { kind: "drop", top: "46%", left: "74%", size: 8, rot: 0, delay: 0.5, duration: 5.4, opacity: 0.24, drift: "c" },
  { kind: "peak", top: "62%", left: "12%", size: 28, rot: 0, delay: 0.9, duration: 6.2, opacity: 0.22, drift: "d" },
  { kind: "peak", top: "64%", left: "80%", size: 26, rot: 0, delay: 0.3, duration: 6.8, opacity: 0.22, drift: "a" },
  { kind: "dot", top: "9%", left: "38%", size: 4, rot: 0, delay: 0.1, duration: 4.2, opacity: 0.35, drift: "b" },
  { kind: "dot", top: "11%", left: "58%", size: 3, rot: 0, delay: 0.6, duration: 4.8, opacity: 0.32, drift: "c" },
  { kind: "dot", top: "28%", left: "10%", size: 3, rot: 0, delay: 0.4, duration: 5, opacity: 0.3, drift: "d" },
  { kind: "dot", top: "30%", left: "84%", size: 4, rot: 0, delay: 1, duration: 4.5, opacity: 0.3, drift: "a" },
  { kind: "dot", top: "56%", left: "28%", size: 3, rot: 0, delay: 0.7, duration: 5.1, opacity: 0.28, drift: "b" },
  { kind: "dot", top: "58%", left: "68%", size: 3, rot: 0, delay: 0.2, duration: 4.7, opacity: 0.28, drift: "c" },
  { kind: "knife", top: "68%", left: "4%", size: 12, rot: 32, delay: 0.55, duration: 7, opacity: 0.24, drift: "d" },
  { kind: "fork", top: "70%", left: "91%", size: 12, rot: -18, delay: 0.35, duration: 7.8, opacity: 0.24, drift: "a" },
  { kind: "spoon", top: "66%", left: "42%", size: 11, rot: 8, delay: 0.95, duration: 8.1, opacity: 0.2, drift: "b" },
  { kind: "herb", top: "72%", left: "58%", size: 22, rot: -22, delay: 0.45, duration: 8.5, opacity: 0.22, drift: "c" },
  { kind: "leaf", top: "74%", left: "22%", size: 18, rot: 18, delay: 0.15, duration: 9, opacity: 0.22, drift: "d" },
];

function DecorGlyph({ kind }: { kind: DecorKind }) {
  switch (kind) {
    case "fork":
      return (
        <svg viewBox="0 0 24 72" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round">
          <path d="M7 3v18M12 3v18M17 3v18M7 21h10M12 21v48" />
        </svg>
      );
    case "spoon":
      return (
        <svg viewBox="0 0 24 72" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round">
          <ellipse cx="12" cy="12" rx="7" ry="10" />
          <path d="M12 22v47" />
        </svg>
      );
    case "knife":
      return (
        <svg viewBox="0 0 24 72" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 69V30L18 6c.6-1-.2-2.2-1.4-2.1L7 6.2c-1 .1-1.6 1.2-1.2 2.1L14 30v39" />
        </svg>
      );
    case "leaf":
      return (
        <svg viewBox="0 0 40 52" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinejoin="round">
          <path d="M20 48S6 34 6 20C6 10 12 4 20 4s14 6 14 16c0 14-14 28-14 28Z" />
          <path d="M20 8v34M20 22c-5-3-8-8-9-13M20 28c5-2 8-7 9-12" strokeWidth="1.25" />
        </svg>
      );
    case "peak":
      return (
        <svg viewBox="0 0 56 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 20 L28 4 L52 20" />
        </svg>
      );
    case "steam":
      return (
        <svg viewBox="0 0 36 40" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
          <path d="M8 36c0-7 5-8 5-15S8 13 8 6M18 36c0-7 5-8 5-15S18 13 18 6M28 36c0-7 5-8 5-15S28 13 28 6" />
        </svg>
      );
    case "drop":
      return (
        <svg viewBox="0 0 16 22" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
          <path d="M8 2C8 2 2 10 2 14a6 6 0 0 0 12 0C14 10 8 2 8 2Z" />
        </svg>
      );
    case "herb":
      return (
        <svg viewBox="0 0 36 44" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 42V8" />
          <path d="M18 16c-6-4-10-2-12 2M18 22c6-4 10-2 12 2M18 28c-5-3-9-1-11 2" />
        </svg>
      );
    case "ring":
      return (
        <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.35">
          <ellipse cx="14" cy="14" rx="10" ry="6" />
        </svg>
      );
    case "dot":
      return (
        <svg viewBox="0 0 8 8" fill="currentColor">
          <circle cx="4" cy="4" r="2.2" />
        </svg>
      );
  }
}

function ComingSoonDecor() {
  return (
    <div className="coming-soon-decor" aria-hidden="true">
      {DECOR_FIELD.map((item, index) => (
        <span
          key={`${item.kind}-${index}`}
          className={`coming-soon-decor-item coming-soon-decor--${item.drift}`}
          style={
            {
              top: item.top,
              left: item.left,
              width: item.size,
              height: item.size * (item.kind === "peak" || item.kind === "ring" ? 0.55 : item.kind === "dot" ? 1 : 2.4),
              ["--decor-rot" as string]: `${item.rot}deg`,
              ["--decor-delay" as string]: `${item.delay}s`,
              ["--decor-dur" as string]: `${item.duration}s`,
              ["--decor-opacity" as string]: item.opacity,
            } as CSSProperties
          }
        >
          <DecorGlyph kind={item.kind} />
        </span>
      ))}
    </div>
  );
}

export function ComingSoonSection() {
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
      className={`coming-soon${visible ? " is-visible" : ""}`}
      aria-labelledby="coming-soon-title"
    >
      <div className="shell">
        <div className="coming-soon-block">
          <div className="coming-soon-block-title">
            <h2 className="coming-soon-block-title-text" id="coming-soon-title">
              <SparkIcon />
              {upcomingDrops.title}
            </h2>
            <span className="coming-soon-block-title-rule" aria-hidden="true" />
            <span className="coming-soon-flag">{upcomingDrops.kicker}</span>
          </div>

          <div className="coming-soon-case">
            <ComingSoonDecor />

            <div className="coming-soon-showcase">
              <ul className="coming-soon-drops">
                {upcomingDrops.items.map((item, index) => (
                  <li
                    key={item.id}
                    className="coming-soon-drop"
                    style={{ ["--drop-i" as string]: index }}
                  >
                    <article className="coming-soon-spot">
                      <div className="coming-soon-spot-stage">
                        <div className="coming-soon-product">
                          <Image
                            src={item.image}
                            alt={item.alt}
                            width={720}
                            height={720}
                            sizes="(max-width: 760px) 72vw, 300px"
                            className="coming-soon-art"
                            priority={false}
                          />
                        </div>

                        <div className="coming-soon-base" aria-hidden="true">
                          <span className="coming-soon-base-top" />
                          <span className="coming-soon-base-body" />
                          <span className="coming-soon-base-rim" />
                          <span className="coming-soon-base-shadow" />
                        </div>
                      </div>

                      <div className="coming-soon-meta">
                        <span className="coming-soon-eta">{item.eta}</span>
                        <h3 className="coming-soon-name">{item.name}</h3>
                        <p className="coming-soon-note">{item.note}</p>
                      </div>
                    </article>
                  </li>
                ))}
              </ul>

              <span className="coming-soon-divider" aria-hidden="true" />
            </div>

            <div className="coming-soon-foot">
              <div className="coming-soon-mascot">
                <div className="coming-soon-mascot-cloud">
                  <strong>از کوهستان</strong>
                  <span>آغاز راه، هوای پاک.</span>
                </div>
                <Image
                  src="/brand/our-way-01-climb.png"
                  alt=""
                  width={256}
                  height={256}
                  sizes="84px"
                  className="coming-soon-mascot-art"
                  aria-hidden="true"
                />
              </div>

              <Link href={upcomingDrops.ctaHref} className="coming-soon-cta">
                <span className="coming-soon-cta-label">{upcomingDrops.ctaLabel}</span>
                <span className="coming-soon-cta-arrow" aria-hidden="true">
                  ←
                </span>
              </Link>

              <div className="coming-soon-mark">
                <Image
                  src="/brand/orginal-clear.png"
                  alt="مرد کوهستان"
                  width={160}
                  height={160}
                  sizes="68px"
                  className="coming-soon-mark-art"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
