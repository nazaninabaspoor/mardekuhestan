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

const ROAD_PATH =
  "M 36 120 C 150 52, 240 172, 340 96 S 530 46, 630 124 S 790 182, 964 112";

const BEAD_COUNT = 56;
/** RTL: step 01 on path end (right), step 05 on path start (left) */
const STOP_T = [1, 0.72, 0.5, 0.28, 0] as const;

type Point = { xPct: number; yPct: number };

function pointOnPath(path: SVGPathElement, t: number): Point {
  const length = path.getTotalLength();
  const p = path.getPointAtLength(Math.max(0, Math.min(1, t)) * length);
  return {
    xPct: (p.x / 1000) * 100,
    yPct: (p.y / 220) * 100,
  };
}

function nearStop(t: number) {
  return STOP_T.some((stop) => Math.abs(stop - t) < 0.04);
}

export function OurWaySection() {
  const mapRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [beads, setBeads] = useState<
    { id: string; x: number; y: number; emoji: string }[]
  >([]);
  const [anchors, setAnchors] = useState<
    { x: number; y: number; band: "high" | "low" }[]
  >([]);

  useLayoutEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    const nextBeads = [];
    for (let i = 0; i < BEAD_COUNT; i += 1) {
      const t = i / (BEAD_COUNT - 1);
      if (nearStop(t)) continue;
      const point = pointOnPath(path, t);
      nextBeads.push({
        id: `bead-${i}`,
        x: point.xPct,
        y: point.yPct,
        emoji: i % 2 === 0 ? "⛰️" : "🍃",
      });
    }
    setBeads(nextBeads);

    setAnchors(
      STOP_T.map((t, index) => {
        const point = pointOnPath(path, t);
        return {
          x: point.xPct,
          y: point.yPct,
          band: (index % 2 === 0 ? "high" : "low") as "high" | "low",
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
  };

  const onPointerLeave = () => {
    mapRef.current?.style.setProperty("--mx", "50");
  };

  const mapStyle = { "--mx": 50 } as CSSProperties;

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
            <div className="our-way-map-stage">
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
                  strokeWidth="34"
                  strokeLinecap="round"
                />
                <path
                  ref={pathRef}
                  className="our-way-map-wave-line"
                  d={ROAD_PATH}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6.5"
                  strokeLinecap="round"
                />
              </svg>

              <div className="our-way-map-trail" aria-hidden="true">
                {beads.map((bead) => (
                  <span
                    key={bead.id}
                    className="our-way-map-bead"
                    style={{ left: `${bead.x}%`, top: `${bead.y}%` }}
                  >
                    {bead.emoji}
                  </span>
                ))}
              </div>

              <ol className="our-way-map-stops">
                {ourWay.steps.map((step, index) => {
                  const anchor = anchors[index];
                  if (!anchor) return null;
                  const num = String(index + 1).padStart(2, "0");

                  return (
                    <li
                      key={step.id}
                      className={`our-way-map-stop our-way-map-stop--${anchor.band}`}
                      style={{ left: `${anchor.x}%`, top: `${anchor.y}%` }}
                    >
                      <span className="our-way-map-pin" aria-hidden="true">
                        {index % 2 === 0 ? "⛰️" : "🍃"}
                      </span>
                      <span className="our-way-map-stem" aria-hidden="true" />

                      <div className="our-way-map-card">
                        <figure className="our-way-map-figure">
                          <Image
                            src={step.scene}
                            alt={step.sceneAlt}
                            width={1024}
                            height={640}
                            sizes="200px"
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
        </div>

        <p className="our-way-note">{ourWay.note}</p>
      </div>
    </section>
  );
}
