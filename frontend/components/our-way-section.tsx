"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";

import { ourWay } from "@/lib/brand";

/**
 * Peak–valley–peak–valley–peak — mild amplitude for compact full view.
 * Endpoints ARE the first/last stop seats.
 */
const ROAD_PATH =
  "M 0 110 C 90 106, 150 134, 255 134 S 400 102, 500 100 S 610 134, 745 134 S 900 108, 1000 110";

const BEAD_SPACING = 8;
const STOP_CLEARANCE = 14;
/** RTL: 01 = path end (right peak), 05 = path start (left peak) */
const STOP_T = [1, 0.75, 0.5, 0.25, 0] as const;
const SEGMENT_MS = 2600;

type Point = { xPct: number; yPct: number };

function stagePoint(
  path: SVGPathElement,
  stage: HTMLElement,
  distance: number,
): Point | null {
  const svg = path.ownerSVGElement;
  if (!svg) return null;

  const length = path.getTotalLength();
  const p = path.getPointAtLength(Math.max(0, Math.min(length, distance)));
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

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function OurWaySection() {
  const mapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const rafRef = useRef<number | null>(null);
  const [beads, setBeads] = useState<
    { id: string; x: number; y: number; emoji: string }[]
  >([]);
  const [anchors, setAnchors] = useState<
    { x: number; y: number; band: "high" | "low" }[]
  >([]);
  const [journey, setJourney] = useState<{
    from: number;
    to: number;
    walkerIndex: number;
  } | null>(null);
  const [walkerPos, setWalkerPos] = useState<Point | null>(null);
  const [popupIndex, setPopupIndex] = useState<number | null>(null);
  const [popupVisible, setPopupVisible] = useState(false);

  const measurePath = useCallback(() => {
    const path = pathRef.current;
    const stage = stageRef.current;
    if (!path || !stage) return;

    const length = path.getTotalLength();
    if (length <= 0) return;

    const stopDist = STOP_T.map((t) => t * length);
    const nextBeads: { id: string; x: number; y: number; emoji: string }[] =
      [];
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
  }, []);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    measurePath();
    const ro = new ResizeObserver(() => measurePath());
    ro.observe(stage);
    window.addEventListener("resize", measurePath);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measurePath);
    };
  }, [measurePath]);

  useEffect(() => {
    if (!journey) return;

    const path = pathRef.current;
    const stage = stageRef.current;
    if (!path || !stage) return;

    const length = path.getTotalLength();
    const fromT = STOP_T[journey.from];
    const toT = STOP_T[journey.to];
    const start = performance.now();

    setPopupIndex(journey.to);
    setPopupVisible(true);

    const tick = (now: number) => {
      const raw = Math.min(1, (now - start) / SEGMENT_MS);
      const eased = easeInOutCubic(raw);
      const t = fromT + (toT - fromT) * eased;
      const point = stagePoint(path, stage, t * length);
      if (point) setWalkerPos(point);

      if (raw < 1) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const nextFrom = journey.to;
      const nextTo = nextFrom + 1;
      if (nextTo < ourWay.steps.length) {
        setJourney({
          from: nextFrom,
          to: nextTo,
          walkerIndex: nextFrom,
        });
      } else {
        setJourney(null);
        setWalkerPos(null);
        window.setTimeout(() => setPopupVisible(false), 1600);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [journey]);

  const startJourney = (index: number) => {
    if (journey) return;
    if (index >= ourWay.steps.length - 1) {
      setPopupIndex(index);
      setPopupVisible(true);
      window.setTimeout(() => setPopupVisible(false), 2800);
      return;
    }

    const path = pathRef.current;
    const stage = stageRef.current;
    if (path && stage) {
      const point = stagePoint(
        path,
        stage,
        STOP_T[index] * path.getTotalLength(),
      );
      if (point) setWalkerPos(point);
    }

    setJourney({
      from: index,
      to: index + 1,
      walkerIndex: index,
    });
  };

  const closePopup = () => {
    if (journey) return;
    setPopupVisible(false);
  };

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
  const activeStep =
    popupIndex != null ? ourWay.steps[popupIndex] : null;
  const walkerStep =
    journey != null ? ourWay.steps[journey.walkerIndex] : null;

  return (
    <section
      className={`our-way${journey ? " is-journeying" : ""}`}
      aria-labelledby="our-way-title"
    >
      <h2 id="our-way-title" className="sr-only">
        {ourWay.title}
      </h2>

      <div className="shell">
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

              {walkerStep && walkerPos ? (
                <div
                  className="our-way-walker"
                  style={{ left: `${walkerPos.xPct}%`, top: `${walkerPos.yPct}%` }}
                  aria-hidden="true"
                >
                  <Image
                    src={walkerStep.scene}
                    alt=""
                    width={1024}
                    height={1024}
                    sizes="140px"
                    className="our-way-walker-art"
                  />
                </div>
              ) : null}

              <ol className="our-way-map-stops">
                {ourWay.steps.map((step, index) => {
                  const anchor = anchors[index];
                  if (!anchor) return null;
                  const num = String(index + 1).padStart(2, "0");
                  const isAway =
                    journey != null &&
                    index === journey.walkerIndex &&
                    journey.from === index;
                  const isPassed =
                    journey != null && index < journey.from;

                  return (
                    <li
                      key={step.id}
                      className={`our-way-map-stop our-way-map-stop--${anchor.band}${isAway ? " is-away" : ""}${isPassed ? " is-passed" : ""}`}
                      style={{ left: `${anchor.x}%`, top: `${anchor.y}%` }}
                    >
                      <span className="our-way-map-pin" aria-hidden="true">
                        {index % 2 === 0 ? "⛰️" : "🍃"}
                      </span>
                      <span className="our-way-map-stem" aria-hidden="true" />

                      <div className="our-way-map-card">
                        <article className="our-way-thought">
                          <span
                            className="our-way-thought-dots"
                            aria-hidden="true"
                          >
                            <i />
                            <i />
                            <i />
                          </span>
                          <div className="our-way-thought-cloud">
                            <span className="our-way-map-num">{num}</span>
                            <h3 className="our-way-map-title">{step.title}</h3>
                            <p className="our-way-map-text">{step.body}</p>
                          </div>
                        </article>

                        <button
                          type="button"
                          className="our-way-map-figure"
                          onClick={() => startJourney(index)}
                          disabled={Boolean(journey)}
                          aria-label={`شروع راه از ${step.title}`}
                        >
                          <Image
                            src={step.scene}
                            alt={step.sceneAlt}
                            width={1024}
                            height={1024}
                            sizes="150px"
                            className="our-way-map-art"
                          />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`our-way-modal${popupVisible && activeStep ? " is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!popupVisible}
        aria-labelledby="our-way-modal-title"
      >
        <button
          type="button"
          className="our-way-modal-backdrop"
          aria-label="بستن"
          onClick={closePopup}
        />
        {activeStep ? (
          <div className="our-way-modal-card">
            <span className="our-way-modal-num">
              {String((popupIndex ?? 0) + 1).padStart(2, "0")}
            </span>
            <h3 id="our-way-modal-title" className="our-way-modal-title">
              {activeStep.title}
            </h3>
            <p className="our-way-modal-body">{activeStep.story}</p>
            {!journey ? (
              <button
                type="button"
                className="our-way-modal-close"
                onClick={closePopup}
              >
                بستن
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
