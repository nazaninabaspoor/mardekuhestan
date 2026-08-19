"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, type CSSProperties, type PointerEvent } from "react";

import { PeakMark } from "@/components/brand-marks";
import { ourWay } from "@/lib/brand";

const BEAD_COUNT = 42;

function buildBeads() {
  return Array.from({ length: BEAD_COUNT }, (_, index) => {
    const t = index / (BEAD_COUNT - 1);
    const x = 2 + t * 96;
    const y =
      50 +
      Math.sin(t * Math.PI * 3.2) * 22 +
      Math.sin(t * Math.PI * 7.1) * 6 +
      Math.cos(t * Math.PI * 1.4) * 4;
    return {
      id: `bead-${index}`,
      x,
      y,
      emoji: index % 2 === 0 ? "⛰️" : "🍃",
      delay: `${(index % 8) * 40}ms`,
    };
  });
}

const BEADS = buildBeads();

const STOP_LAYOUT = [
  { x: 92, band: "high" },
  { x: 72, band: "low" },
  { x: 50, band: "high" },
  { x: 28, band: "low" },
  { x: 8, band: "high" },
] as const;

export function OurWaySection() {
  const mapRef = useRef<HTMLDivElement>(null);

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const el = mapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const mx = ((event.clientX - rect.left) / rect.width) * 100;
    const my = ((event.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--mx", String(mx));
    el.style.setProperty("--my", String(my));
  };

  const onPointerLeave = () => {
    const el = mapRef.current;
    if (!el) return;
    el.style.setProperty("--mx", "50");
    el.style.setProperty("--my", "50");
  };

  const mapStyle = {
    "--mx": 50,
    "--my": 50,
  } as CSSProperties;

  return (
    <section className="our-way" aria-labelledby="our-way-title">
      <div className="shell">
        <div className="our-way-head">
          <h2 className="our-way-title" id="our-way-title">
            <PeakMark className="our-way-title-peak" />
            {ourWay.title}
          </h2>
          <span className="our-way-title-rule" aria-hidden="true" />
          <Link href={ourWay.moreHref} className="our-way-more" title={ourWay.moreLabel}>
            {ourWay.moreLabel}
            <span className="our-way-more-mark" aria-hidden="true">
              <PeakMark />
            </span>
          </Link>
        </div>

        <p className="our-way-lead-line">
          <span className="our-way-kicker">{ourWay.kicker}</span>
          {ourWay.lead}
        </p>

        <div
          className="our-way-map"
          ref={mapRef}
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
          style={mapStyle}
        >
          <div className="our-way-map-inner">
            <svg
              className="our-way-map-wave"
              viewBox="0 0 1000 220"
              preserveAspectRatio="none"
              aria-hidden="true"
              focusable="false"
            >
              <path
                className="our-way-map-wave-glow"
                d="M20 110 C 120 40, 220 180, 320 95 S 520 40, 620 125 S 820 190, 980 100"
                fill="none"
                stroke="currentColor"
                strokeWidth="18"
                strokeLinecap="round"
              />
              <path
                className="our-way-map-wave-line"
                d="M20 110 C 120 40, 220 180, 320 95 S 520 40, 620 125 S 820 190, 980 100"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray="2 7"
              />
            </svg>

            <div className="our-way-map-trail" aria-hidden="true">
              {BEADS.map((bead) => (
                <span
                  key={bead.id}
                  className="our-way-map-bead"
                  style={{
                    left: `${bead.x}%`,
                    top: `${bead.y}%`,
                    animationDelay: bead.delay,
                  }}
                >
                  {bead.emoji}
                </span>
              ))}
            </div>

            <ol className="our-way-map-stops">
              {ourWay.steps.map((step, index) => {
                const layout = STOP_LAYOUT[index] ?? STOP_LAYOUT[0];
                const num = String(index + 1).padStart(2, "0");

                return (
                  <li
                    key={step.id}
                    className={`our-way-map-stop our-way-map-stop--${layout.band}`}
                    style={{ left: `${layout.x}%` }}
                  >
                    <span className="our-way-map-pin" aria-hidden="true">
                      {index % 2 === 0 ? "⛰️" : "🍃"}
                    </span>

                    <figure className="our-way-map-figure">
                      <Image
                        src={step.scene}
                        alt={step.sceneAlt}
                        width={1024}
                        height={640}
                        sizes="(max-width: 900px) 180px, 150px"
                        className="our-way-map-art"
                      />
                    </figure>

                    <article className="our-way-map-copy">
                      <span className="our-way-map-num">{num}</span>
                      <h3 className="our-way-map-title">{step.title}</h3>
                      <p className="our-way-map-text">{step.body}</p>
                    </article>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        <p className="our-way-note">{ourWay.note}</p>
      </div>
    </section>
  );
}
