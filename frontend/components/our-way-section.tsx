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
    const arrivedAt = journey.to;

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

    // مسیر آزاد می‌ماند؛ داستان فقط بعد از رسیدن باز می‌شود
    setPopupVisible(false);
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
      setJourney(null);
      setPopupIndex(arrivedAt);
      setPopupVisible(true);
      // مبدأ بلافاصله برمی‌گردد؛ لازم نیست روی مقصد کلیک شود
      setWalkerActive(false);
      setWalkerIndex(null);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [journey, placeWalker]);

  const startJourney = (index: number) => {
    if (journey) return;

    setPopupVisible(false);

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
  /** مبدأ حرکت — تا وقتی walker فعال است مخفی است؛ با بستن داستان برمی‌گردد */
  const vacatedStop =
    journey != null
      ? journey.from
      : walkerActive
        ? walkerIndex
        : null;
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
      <div className="our-way-atmosphere" aria-hidden="true">
        <div className="our-way-atmosphere-wash" />
        <div className="our-way-atmosphere-ceiling" />
        <svg
          className="our-way-atmosphere-caps"
          viewBox="0 0 1440 220"
          preserveAspectRatio="none"
          focusable="false"
        >
          <path
            className="our-way-atmosphere-cap our-way-atmosphere-cap--far"
            d="M0 0 L0 92 L95 122 L210 78 L340 148 L480 92 L620 162 L770 98 L920 152 L1070 88 L1220 136 L1360 102 L1440 124 L1440 0 Z"
          />
          <path
            className="our-way-atmosphere-cap our-way-atmosphere-cap--near"
            d="M0 0 L0 62 L80 82 L190 52 L320 108 L460 62 L600 116 L750 66 L890 110 L1040 58 L1180 96 L1320 64 L1440 82 L1440 0 Z"
          />
        </svg>
        <svg
          className="our-way-atmosphere-ridges"
          viewBox="0 0 1440 220"
          preserveAspectRatio="none"
          focusable="false"
        >
          <path
            className="our-way-atmosphere-ridge our-way-atmosphere-ridge--far"
            d="M0 220 L0 128 L95 98 L210 142 L340 72 L480 128 L620 58 L770 122 L920 68 L1070 132 L1220 84 L1360 118 L1440 96 L1440 220 Z"
          />
          <path
            className="our-way-atmosphere-ridge our-way-atmosphere-ridge--near"
            d="M0 220 L0 158 L80 138 L190 168 L320 112 L460 158 L600 104 L750 154 L890 110 L1040 162 L1180 124 L1320 156 L1440 138 L1440 220 Z"
          />
        </svg>
        <div className="our-way-atmosphere-floor" />
      </div>

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
                  const isAway = vacatedStop === index;
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

        <aside
          className={`our-way-story${popupVisible && activeStep ? " is-open" : ""}${journey ? " is-traveling" : ""}`}
          aria-live="polite"
          aria-hidden={!popupVisible && !journey}
        >
          {journey ? (
            <p className="our-way-story-cue">
              <span className="our-way-story-cue-dot" aria-hidden="true" />
              در راه… به‌سوی{" "}
              <strong>{ourWay.steps[journey.to]?.title}</strong>
            </p>
          ) : null}

          {popupVisible && activeStep ? (
            <div
              className="our-way-story-card"
              role="dialog"
              aria-modal="false"
              aria-labelledby="our-way-story-title"
            >
              <button
                type="button"
                className="our-way-story-x"
                aria-label="بستن"
                onClick={closePopup}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="12"
                  height="12"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    d="M6.2 6.2a1 1 0 0 1 1.4 0L12 10.6l4.4-4.4a1 1 0 1 1 1.4 1.4L13.4 12l4.4 4.4a1 1 0 0 1-1.4 1.4L12 13.4l-4.4 4.4a1 1 0 0 1-1.4-1.4L10.6 12 6.2 7.6a1 1 0 0 1 0-1.4Z"
                    fill="currentColor"
                  />
                </svg>
              </button>

              <div className="our-way-story-thumb" aria-hidden="true">
                <Image
                  src={activeStep.scene}
                  alt=""
                  width={256}
                  height={256}
                  sizes="72px"
                  className="our-way-story-art"
                />
              </div>

              <div className="our-way-story-copy">
                <div className="our-way-story-meta">
                  <span className="our-way-story-kicker">راه ما</span>
                  <span className="our-way-story-num">{stepNum}</span>
                </div>
                <h3 id="our-way-story-title" className="our-way-story-title">
                  {activeStep.title}
                </h3>
                <p className="our-way-story-lead">{activeStep.body}</p>
                <p className="our-way-story-body">{activeStep.story}</p>
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
