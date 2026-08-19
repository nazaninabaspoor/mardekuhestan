"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";

import { PeakMark } from "@/components/brand-marks";
import { ourWay } from "@/lib/brand";

/** Shared roadmap curve (viewBox 1000×220) */
const ROAD_PATH =
  "M 40 118 C 140 48, 230 178, 330 92 S 520 42, 620 128 S 800 188, 960 108";

const BEAD_COUNT = 48;
const STOP_T = [0.94, 0.72, 0.5, 0.28, 0.06] as const;

type Point = { x: number; y: number; angle: number };

function samplePath(path: SVGPathElement, t: number): Point {
  const length = path.getTotalLength();
  const dist = Math.max(0, Math.min(1, t)) * length;
  const p = path.getPointAtLength(dist);
  const p2 = path.getPointAtLength(Math.min(length, dist + 1.5));
  const angle = (Math.atan2(p2.y - p.y, p2.x - p.x) * 180) / Math.PI;
  return { x: p.x, y: p.y, angle };
}

function nearStop(t: number) {
  return STOP_T.some((stop) => Math.abs(stop - t) < 0.035);
}

export function OurWaySection() {
  const mapRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [beads, setBeads] = useState<
    { id: string; x: number; y: number; emoji: string; delay: string }[]
  >([]);
  const [stops, setStops] = useState<
    { x: number; y: number; angle: number; band: "high" | "low" }[]
  >([]);

  useLayoutEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    const nextBeads = [];
    for (let i = 0; i < BEAD_COUNT; i += 1) {
      const t = i / (BEAD_COUNT - 1);
      if (nearStop(t)) continue;
      const point = samplePath(path, t);
      nextBeads.push({
        id: `bead-${i}`,
        x: (point.x / 1000) * 100,
        y: (point.y / 220) * 100,
        emoji: i % 2 === 0 ? "⛰️" : "🍃",
        delay: `${(i % 10) * 55}ms`,
      });
    }
    setBeads(nextBeads);

    setStops(
      STOP_T.map((t, index) => {
        const point = samplePath(path, t);
        return {
          x: (point.x / 1000) * 100,
          y: (point.y / 220) * 100,
          angle: point.angle,
          band: index % 2 === 0 ? "high" : "low",
        };
      }),
    );
  }, []);

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const el = mapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty(
      "--mx",
      String(((event.clientX - rect.left) / rect.width) * 100),
    );
    el.style.setProperty(
      "--my",
      String(((event.clientY - rect.top) / rect.height) * 100),
    );
  };

  const onPointerLeave = () => {
    const el = mapRef.current;
    if (!el) return;
    el.style.setProperty("--mx", "50");
    el.style.setProperty("--my", "50");
  };

  const mapStyle = { "--mx": 50, "--my": 50 } as CSSProperties;

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

        <header className="our-way-intro">
          <p className="our-way-kicker">{ourWay.kicker}</p>
          <p className="our-way-lead">{ourWay.lead}</p>
        </header>

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
                d={ROAD_PATH}
                fill="none"
                stroke="currentColor"
                strokeWidth="22"
                strokeLinecap="round"
              />
              <path
                ref={pathRef}
                className="our-way-map-wave-line"
                d={ROAD_PATH}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeDasharray="1.5 8"
              />
            </svg>

            <div className="our-way-map-trail" aria-hidden="true">
              {beads.map((bead) => (
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
                const layout = stops[index];
                if (!layout) return null;
                const num = String(index + 1).padStart(2, "0");

                return (
                  <li
                    key={step.id}
                    className={`our-way-map-stop our-way-map-stop--${layout.band}`}
                    style={{ left: `${layout.x}%`, top: `${layout.y}%` }}
                  >
                    <span className="our-way-map-pin" aria-hidden="true">
                      {index % 2 === 0 ? "⛰️" : "🍃"}
                    </span>

                    <div className="our-way-map-card">
                      <figure className="our-way-map-figure">
                        <Image
                          src={step.scene}
                          alt={step.sceneAlt}
                          width={1024}
                          height={640}
                          sizes="(max-width: 900px) 180px, 148px"
                          className="our-way-map-art"
                        />
                      </figure>
                      <article className="our-way-map-copy">
                        <span className="our-way-map-num">{num}</span>
                        <h3 className="our-way-map-title">{step.title}</h3>
                        <p className="our-way-map-text">{step.body}</p>
                      </article>
                    </div>
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
