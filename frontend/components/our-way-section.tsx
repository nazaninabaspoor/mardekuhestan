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

/**
 * Peak–valley–peak–valley–peak.
 * Endpoints ARE the first/last stop seats (no dangling tips).
 * viewBox 1000×220
 */
const ROAD_PATH =
  "M 0 72 C 80 68, 140 168, 250 168 S 390 52, 500 50 S 620 168, 750 168 S 900 70, 1000 72";

/** Spacing along path in viewBox units — denser trail */
const BEAD_SPACING = 7;
/** Keep clear of pin centers (viewBox length units) */
const STOP_CLEARANCE = 16;

/** RTL: 01 = path end (right peak), 05 = path start (left peak) */
const STOP_T = [1, 0.75, 0.5, 0.25, 0] as const;

type Point = { xPct: number; yPct: number };

function stagePoint(
  path: SVGPathElement,
  stage: HTMLElement,
  distance: number,
): Point | null {
  const svg = path.ownerSVGElement;
  if (!svg) return null;

  const length = path.getTotalLength();
  const p = path.getPointAtLength(
    Math.max(0, Math.min(length, distance)),
  );
  const ctm = path.getScreenCTM();
  if (!ctm) return null;

  const pt = svg.createSVGPoint();
  pt.x = p.x;
  pt.y = p.y;
  const screen = pt.matrixTransform(ctm);
  const rect = stage.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;

  return {
    xPct: ((screen.x - rect.left) / rect.width) * 100,
    yPct: ((screen.y - rect.top) / rect.height) * 100,
  };
}

export function OurWaySection() {
  const mapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [beads, setBeads] = useState<
    { id: string; x: number; y: number; emoji: string }[]
  >([]);
  const [anchors, setAnchors] = useState<
    { x: number; y: number; band: "high" | "low" }[]
  >([]);

  useLayoutEffect(() => {
    const path = pathRef.current;
    const stage = stageRef.current;
    if (!path || !stage) return;

    const measure = () => {
      const length = path.getTotalLength();
      if (length <= 0) return;

      const stopDist = STOP_T.map((t) => t * length);

      const nextBeads: {
        id: string;
        x: number;
        y: number;
        emoji: string;
      }[] = [];
      const count = Math.max(1, Math.floor(length / BEAD_SPACING));
      for (let i = 0; i <= count; i += 1) {
        const dist = (i / count) * length;
        if (stopDist.some((sd) => Math.abs(sd - dist) < STOP_CLEARANCE)) {
          continue;
        }
        const point = stagePoint(path, stage, dist);
        if (!point) continue;
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
          const point = stagePoint(path, stage, t * length);
          return {
            x: point?.xPct ?? 0,
            y: point?.yPct ?? 0,
            band: (index % 2 === 0 ? "high" : "low") as "high" | "low",
          };
        }),
      );
    };

    measure();
    const ro = new ResizeObserver(() => measure());
    ro.observe(stage);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
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

        <div className="our-way-story">
          <header className="our-way-intro">
            <p className="our-way-kicker">{ourWay.kicker}</p>
            <p className="our-way-lead">{ourWay.lead}</p>
          </header>
          <aside className="our-way-note" aria-label="یادداشت راه">
            <PeakMark className="our-way-note-peak" />
            <p>{ourWay.note}</p>
          </aside>
        </div>

        <div
          className="our-way-map"
          ref={mapRef}
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
          style={mapStyle}
        >
          <div className="our-way-map-inner">
            <div className="our-way-map-stage" ref={stageRef}>
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
                  strokeWidth="11"
                  strokeLinecap="butt"
                />
                <path
                  ref={pathRef}
                  className="our-way-map-wave-line"
                  d={ROAD_PATH}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.35"
                  strokeLinecap="butt"
                />
              </svg>

              <div className="our-way-map-trail" aria-hidden="true">
                {beads.map((bead, index) => (
                  <span
                    key={bead.id}
                    className="our-way-map-bead"
                    style={
                      {
                        left: `${bead.x}%`,
                        top: `${bead.y}%`,
                        "--bead-i": index,
                      } as CSSProperties
                    }
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
                            height={1024}
                            sizes="180px"
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
      </div>
    </section>
  );
}
