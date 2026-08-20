"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import { ourWay } from "@/lib/brand";

/**
 * Peak–valley–peak–valley–peak — mild amplitude for compact full view.
 * Endpoints ARE the first/last stop seats.
 */
const ROAD_PATH =
  "M 0 110 C 90 106, 150 134, 255 134 S 400 102, 500 100 S 610 134, 745 134 S 900 108, 1000 110";

/** فاصله بیشتر = مهره‌های کمتر = بدون لگ */
const BEAD_SPACING = 16;
const STOP_CLEARANCE = 16;
/** RTL: 01 = path end (right peak), 05 = path start (left peak) */
const STOP_T = [1, 0.75, 0.5, 0.25, 0] as const;
const SEGMENT_MS = 2000;

type Point = { xPct: number; yPct: number };

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function OurWaySection() {
  const stageRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const walkerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const measureTimer = useRef<number | null>(null);

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
  const [walkerActive, setWalkerActive] = useState(false);
  const [walkerIndex, setWalkerIndex] = useState<number | null>(null);
  const [popupIndex, setPopupIndex] = useState<number | null>(null);
  const [popupVisible, setPopupVisible] = useState(false);

  const placeWalker = useCallback((point: Point | null) => {
    const el = walkerRef.current;
    if (!el || !point) return;
    el.style.left = `${point.xPct}%`;
    el.style.top = `${point.yPct}%`;
    el.style.opacity = "1";
  }, []);

  const measurePath = useCallback(() => {
    const path = pathRef.current;
    const stage = stageRef.current;
    const svg = path?.ownerSVGElement;
    if (!path || !stage || !svg) return;

    const length = path.getTotalLength();
    if (length <= 0) return;

    const ctm = path.getScreenCTM();
    if (!ctm) return;

    const stageRect = stage.getBoundingClientRect();
    if (stageRect.width <= 0 || stageRect.height <= 0) return;

    const pt = svg.createSVGPoint();
    const toPct = (distance: number): Point | null => {
      const p = path.getPointAtLength(
        Math.max(0, Math.min(length, distance)),
      );
      pt.x = p.x;
      pt.y = p.y;
      const screen = pt.matrixTransform(ctm);
      return {
        xPct: ((screen.x - stageRect.left) / stageRect.width) * 100,
        yPct: ((screen.y - stageRect.top) / stageRect.height) * 100,
      };
    };

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
      const point = toPct(dist);
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
        const point = toPct(t * length);
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

    const schedule = () => {
      if (measureTimer.current != null) {
        window.clearTimeout(measureTimer.current);
      }
      measureTimer.current = window.setTimeout(() => {
        measurePath();
        measureTimer.current = null;
      }, 80);
    };

    const ro = new ResizeObserver(schedule);
    ro.observe(stage);
    window.addEventListener("resize", schedule);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", schedule);
      if (measureTimer.current != null) {
        window.clearTimeout(measureTimer.current);
      }
    };
  }, [measurePath]);

  useEffect(() => {
    if (!journey) return;

    const path = pathRef.current;
    const stage = stageRef.current;
    const svg = path?.ownerSVGElement;
    if (!path || !stage || !svg) return;

    const length = path.getTotalLength();
    const ctm = path.getScreenCTM();
    if (!ctm) return;

    const stageRect = stage.getBoundingClientRect();
    const pt = svg.createSVGPoint();
    const fromT = STOP_T[journey.from];
    const toT = STOP_T[journey.to];
    const start = performance.now();
    const movingCharacter = journey.walkerIndex;

    const toPct = (t: number): Point => {
      const p = path.getPointAtLength(
        Math.max(0, Math.min(length, t * length)),
      );
      pt.x = p.x;
      pt.y = p.y;
      const screen = pt.matrixTransform(ctm);
      return {
        xPct: ((screen.x - stageRect.left) / stageRect.width) * 100,
        yPct: ((screen.y - stageRect.top) / stageRect.height) * 100,
      };
    };

    setPopupIndex(journey.to);
    setPopupVisible(true);
    setWalkerActive(true);
    placeWalker(toPct(fromT));

    const tick = (now: number) => {
      const raw = Math.min(1, (now - start) / SEGMENT_MS);
      placeWalker(toPct(fromT + (toT - fromT) * easeInOutCubic(raw)));

      if (raw < 1) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      placeWalker(toPct(toT));
      setWalkerIndex(movingCharacter);
      setJourney(null);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [journey, placeWalker]);

  const startJourney = (index: number) => {
    if (journey) return;

    if (index >= ourWay.steps.length - 1) {
      setPopupIndex(index);
      setPopupVisible(true);
      setWalkerActive(false);
      setWalkerIndex(null);
      return;
    }

    const path = pathRef.current;
    const stage = stageRef.current;
    const svg = path?.ownerSVGElement;
    if (path && stage && svg) {
      const ctm = path.getScreenCTM();
      if (ctm) {
        const length = path.getTotalLength();
        const stageRect = stage.getBoundingClientRect();
        const pt = svg.createSVGPoint();
        const p = path.getPointAtLength(STOP_T[index] * length);
        pt.x = p.x;
        pt.y = p.y;
        const screen = pt.matrixTransform(ctm);
        setWalkerActive(true);
        // بعد از mount، placeWalker در effect اجرا می‌شود؛ اینجا هم همان فریم
        requestAnimationFrame(() => {
          placeWalker({
            xPct: ((screen.x - stageRect.left) / stageRect.width) * 100,
            yPct: ((screen.y - stageRect.top) / stageRect.height) * 100,
          });
        });
      }
    }

    setWalkerIndex(index);
    setJourney({
      from: index,
      to: index + 1,
      walkerIndex: index,
    });
  };

  const closePopup = () => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setJourney(null);
    setWalkerActive(false);
    setWalkerIndex(null);
    setPopupVisible(false);
  };

  useEffect(() => {
    if (!popupVisible) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      setJourney(null);
      setWalkerActive(false);
      setWalkerIndex(null);
      setPopupVisible(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [popupVisible]);

  const activeStep =
    popupIndex != null ? ourWay.steps[popupIndex] : null;
  const activeWalkerIndex =
    journey != null ? journey.walkerIndex : walkerIndex;
  const walkerStep =
    activeWalkerIndex != null ? ourWay.steps[activeWalkerIndex] : null;
  const stepNum = String((popupIndex ?? 0) + 1).padStart(2, "0");

  return (
    <section
      className={`our-way${journey ? " is-journeying" : ""}`}
      aria-labelledby="our-way-title"
    >
      <h2 id="our-way-title" className="sr-only">
        {ourWay.title}
      </h2>

      <div className="shell">
        <div className="our-way-map">
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
                {beads.map((bead) => (
                  <span
                    key={bead.id}
                    className="our-way-map-bead"
                    style={
                      {
                        left: `${bead.x}%`,
                        top: `${bead.y}%`,
                      } as CSSProperties
                    }
                  >
                    {bead.emoji}
                  </span>
                ))}
              </div>

              {walkerStep && walkerActive ? (
                <div
                  ref={walkerRef}
                  className="our-way-walker"
                  aria-hidden="true"
                >
                  <Image
                    src={walkerStep.scene}
                    alt=""
                    width={1024}
                    height={1024}
                    sizes="140px"
                    className="our-way-walker-art"
                    priority={false}
                  />
                </div>
              ) : null}

              <ol className="our-way-map-stops">
                {ourWay.steps.map((step, index) => {
                  const anchor = anchors[index];
                  if (!anchor) return null;
                  const num = String(index + 1).padStart(2, "0");
                  const isAway =
                    activeWalkerIndex != null &&
                    index === activeWalkerIndex &&
                    walkerActive;
                  const isPassed =
                    journey != null && index < journey.from;
                  const isTerminus =
                    index === 0 || index === ourWay.steps.length - 1;

                  return (
                    <li
                      key={step.id}
                      className={`our-way-map-stop our-way-map-stop--${anchor.band}${isTerminus ? " our-way-map-stop--terminus" : ""}${isAway ? " is-away" : ""}${isPassed ? " is-passed" : ""}`}
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
                          aria-label={`یک قدم از ${step.title}`}
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
            <button
              type="button"
              className="our-way-modal-x"
              aria-label="بستن"
              onClick={closePopup}
            >
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="M6.2 6.2a1 1 0 0 1 1.4 0L12 10.6l4.4-4.4a1 1 0 1 1 1.4 1.4L13.4 12l4.4 4.4a1 1 0 0 1-1.4 1.4L12 13.4l-4.4 4.4a1 1 0 0 1-1.4-1.4L10.6 12 6.2 7.6a1 1 0 0 1 0-1.4Z"
                  fill="currentColor"
                />
              </svg>
            </button>

            <div className="our-way-modal-badge" aria-hidden="true">
              <span className="our-way-modal-badge-kicker">راه ما</span>
              <span className="our-way-modal-badge-num">{stepNum}</span>
            </div>

            <div className="our-way-modal-visual" aria-hidden="true">
              <Image
                src={activeStep.scene}
                alt=""
                width={512}
                height={512}
                sizes="140px"
                className="our-way-modal-art"
              />
            </div>

            <h3 id="our-way-modal-title" className="our-way-modal-title">
              {activeStep.title}
            </h3>
            <p className="our-way-modal-lead">{activeStep.body}</p>
            <p className="our-way-modal-body">{activeStep.story}</p>

            <button
              type="button"
              className="our-way-modal-done"
              onClick={closePopup}
            >
              بستن
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
