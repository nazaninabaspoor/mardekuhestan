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

type DecorKind = "fork" | "spoon" | "knife";

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

const CUTLERY: DecorKind[] = ["fork", "spoon", "knife"];
const DRIFTS = ["a", "b", "c", "d"] as const;

/** Pack the green case wall-to-wall with soft cutlery (avoid deep plate centers). */
function buildDecorField(): DecorSpec[] {
  const items: DecorSpec[] = [];
  const cols = 14;
  const rows = 11;

  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const stagger = (r % 2) * (100 / cols / 2);
      const left = (c / (cols - 1)) * 94 + 2 + stagger * 0.15 + ((r * 3 + c) % 5) * 0.35;
      const top = (r / (rows - 1)) * 88 + 3 + ((c * 2 + r) % 4) * 0.55;

      // Keep plates readable — thin out only the deepest plate cores
      const inLeftCore = left > 22 && left < 36 && top > 10 && top < 42;
      const inRightCore = left > 60 && left < 74 && top > 10 && top < 42;
      if ((inLeftCore || inRightCore) && (r + c) % 2 === 0) continue;

      // Soften over the foot CTA band a little
      const inFoot = top > 78 && left > 32 && left < 64;
      if (inFoot && (r + c) % 3 === 0) continue;

      const i = r * cols + c;
      const kind = CUTLERY[i % 3];
      const size = 11 + ((i * 7) % 9);
      const rot = ((i * 37) % 70) - 35;
      const opacity = inLeftCore || inRightCore ? 0.28 : 0.42 + ((i % 5) * 0.03);

      items.push({
        kind,
        top: `${top.toFixed(1)}%`,
        left: `${left.toFixed(1)}%`,
        size,
        rot,
        delay: (i % 12) * 0.12,
        duration: 5.8 + (i % 8) * 0.35,
        opacity: Math.min(opacity, 0.58),
        drift: DRIFTS[i % 4],
      });
    }
  }

  return items;
}

const DECOR_FIELD = buildDecorField();

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
              height: item.size * 2.55,
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
          <div className="coming-soon-head">
            <div className="coming-soon-block-title">
              <h2 className="coming-soon-block-title-text" id="coming-soon-title">
                <SparkIcon />
                {upcomingDrops.title}
              </h2>
              <span className="coming-soon-flag">{upcomingDrops.kicker}</span>
            </div>
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
