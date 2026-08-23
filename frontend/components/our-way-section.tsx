"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";

import { ourWay } from "@/lib/brand";

const BACKGROUND = "/brand/roadmap-diorama-v1.png";
const VIEW_W = 1680;
const VIEW_H = 945;
const ROAD_PATH =
  "M 960 805 C 820 795, 650 770, 605 685 C 750 525, 1225 645, 1390 535 C 1530 442, 815 455, 565 450 C 470 410, 690 326, 825 342 C 745 300, 625 292, 585 286";

const STATIONS = [
  { x: 960, y: 805, cardSide: "left", artY: -18 },
  { x: 1390, y: 535, cardSide: "left", artY: 8 },
  { x: 565, y: 450, cardSide: "left", artY: 42 },
  { x: 825, y: 342, cardSide: "left", artY: -8 },
  { x: 585, y: 286, cardSide: "left", artY: -46 },
] as const;

export function OurWaySection() {
  const pathRef = useRef<SVGPathElement>(null);
  const progressRef = useRef<SVGPathElement>(null);
  const walkerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const lengthsRef = useRef<number[]>([]);
  const [current, setCurrent] = useState(0);
  const [walking, setWalking] = useState(false);
  const [finished, setFinished] = useState(false);

  const placeWalker = (distance: number) => {
    const path = pathRef.current;
    const walker = walkerRef.current;
    if (!path || !walker) return;
    const point = path.getPointAtLength(distance);
    walker.style.left = `${(point.x / VIEW_W) * 100}%`;
    walker.style.top = `${(point.y / VIEW_H) * 100}%`;
  };

  const paintProgress = (distance: number) => {
    const path = pathRef.current;
    const progress = progressRef.current;
    if (!path || !progress) return;
    const total = path.getTotalLength();
    progress.style.strokeDasharray = `${total}`;
    progress.style.strokeDashoffset = `${total - distance}`;
  };

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const total = path.getTotalLength();
    const nearest = ({ x, y }: { x: number; y: number }) => {
      let result = 0;
      let min = Number.POSITIVE_INFINITY;
      for (let index = 0; index <= 2200; index += 1) {
        const distance = (index / 2200) * total;
        const point = path.getPointAtLength(distance);
        const delta = (point.x - x) ** 2 + (point.y - y) ** 2;
        if (delta < min) {
          min = delta;
          result = distance;
        }
      }
      return result;
    };
    lengthsRef.current = STATIONS.map(nearest);
    placeWalker(lengthsRef.current[0]);
    paintProgress(lengthsRef.current[0]);
    return () => {
      if (animationRef.current != null) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const walkTo = (target: number) => {
    if (walking) return;
    const startDistance = lengthsRef.current[current];
    const endDistance = lengthsRef.current[target];
    if (startDistance == null || endDistance == null) return;
    setWalking(true);
    const startedAt = performance.now();
    const duration = 1900;
    const frame = (now: number) => {
      const raw = Math.min(1, (now - startedAt) / duration);
      const eased = 0.5 - 0.5 * Math.cos(Math.PI * raw);
      const distance = startDistance + (endDistance - startDistance) * eased;
      placeWalker(distance);
      paintProgress(distance);
      if (raw < 1) {
        animationRef.current = requestAnimationFrame(frame);
      } else {
        setCurrent(target);
        setWalking(false);
      }
    };
    animationRef.current = requestAnimationFrame(frame);
  };

  const next = () => {
    if (walking) return;
    if (current === STATIONS.length - 1) {
      setFinished(true);
      return;
    }
    walkTo(current + 1);
  };

  const restart = () => {
    setFinished(false);
    setCurrent(0);
    placeWalker(lengthsRef.current[0] ?? 0);
    paintProgress(lengthsRef.current[0] ?? 0);
  };

  return (
    <section className="diorama-journey" aria-labelledby="diorama-journey-title">
      <header className="diorama-journey__heading">
        <h2 id="diorama-journey-title">راه ما</h2>
        <div aria-label={`مرحله ${current + 1} از ۵`}>
          {STATIONS.map((_, index) => <i key={index} className={index <= current ? "is-active" : ""} />)}
        </div>
      </header>

      <div className="diorama-journey__scene">
        <Image src={BACKGROUND} alt={ourWay.lead} width={1680} height={945} sizes="100vw" className="diorama-journey__background" />

        <svg className="diorama-journey__route" viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} preserveAspectRatio="none" aria-hidden="true">
          <path d={ROAD_PATH} className="diorama-journey__road-shadow" />
          <path ref={pathRef} d={ROAD_PATH} className="diorama-journey__road" />
          <path ref={progressRef} d={ROAD_PATH} className="diorama-journey__road-progress" />
        </svg>

        <ol className="diorama-journey__stations">
          {STATIONS.map((station, index) => {
            const step = ourWay.steps[index];
            return (
              <li
                key={step.id}
                className={`diorama-journey__station diorama-journey__station--card-${station.cardSide}${index === current ? " is-current" : ""}`}
                style={{
                  left: `${(station.x / VIEW_W) * 100}%`,
                  top: `${(station.y / VIEW_H) * 100}%`,
                  ["--station-art-y" as string]: `${station.artY}px`,
                } as CSSProperties}
              >
                <span className="diorama-journey__pin">{index + 1}</span>
                <article>
                  <small>{String(index + 1).padStart(2, "0")}</small>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </article>
                <div className="diorama-journey__scene-art" aria-hidden="true">
                  <Image
                    src={step.scene.split("?")[0]}
                    alt=""
                    width={320}
                    height={320}
                    sizes="(max-width: 760px) 90px, 150px"
                  />
                </div>
              </li>
            );
          })}
        </ol>

        <div ref={walkerRef} className={`diorama-journey__walker${walking ? " is-walking" : ""}`} aria-hidden="true">
          <Image src="/brand/our-way-05-ahead.png" alt="" width={220} height={220} sizes="100px" />
          <span />
        </div>

        <div className="diorama-journey__controls">
          <button type="button" onClick={next} disabled={walking}>
            {walking ? "در راه…" : current === 4 ? "پایان مسیر" : "قدم بعدی"}
            <b aria-hidden="true">←</b>
          </button>
        </div>
      </div>

      {finished ? (
        <div className="diorama-journey__finale" role="dialog" aria-modal="true">
          <span>✨</span><h3>سفر کامل شد</h3>
          <p>از دل کوهستان تا سفره خانه؛ پنج قدم، یک داستان از کیفیت.</p>
          <button type="button" onClick={restart}>شروع دوباره</button>
        </div>
      ) : null}
    </section>
  );
}
