"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { MOUNTAIN_STAGES } from "@/components/roadmap/stage-data";

const MAP_W = 1536;
const MAP_H = 1024;
const ROUTE = "M 748 1016 C 752 936 790 842 884 720 C 960 620 914 548 820 494 C 724 438 762 356 900 302 C 1040 247 986 176 910 116";
const WAYPOINTS = [0, .25, .5, .75, 1] as const;

type CameraState = { x: number; y: number; scale: number };

export function MountainJourney() {
  const sectionRef = useRef<HTMLElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const routeRef = useRef<SVGPathElement>(null);
  const walkerRef = useRef<HTMLButtonElement>(null);
  const frameRef = useRef<number | null>(null);
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [sceneReady, setSceneReady] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [isWalking, setIsWalking] = useState(false);
  const [walkerVisible, setWalkerVisible] = useState(true);
  const [stageCharacterVisible, setStageCharacterVisible] = useState(false);
  const [journeyState, setJourneyState] = useState<"idle" | "walking" | "arrived">("idle");
  const [camera, setCamera] = useState<CameraState>({ x: 0, y: 0, scale: 1.018 });
  const stage = MOUNTAIN_STAGES[currentStage];

  const placeWalker = (progress: number) => {
    const path = routeRef.current;
    const walker = walkerRef.current;
    if (!path || !walker) return null;
    const length = path.getTotalLength();
    const distance = length * progress;
    const point = path.getPointAtLength(distance);
    const next = path.getPointAtLength(Math.min(length, distance + 10));
    const direction = next.x < point.x ? -1 : 1;
    const rawAngle = Math.atan2(next.y - point.y, next.x - point.x) * 180 / Math.PI;
    const bodyAngle = Math.max(-6, Math.min(6, rawAngle / 12));
    walker.style.left = `${(point.x / MAP_W) * 100}%`;
    walker.style.top = `${(point.y / MAP_H) * 100}%`;
    walker.style.setProperty("--walk-direction", String(direction));
    walker.style.setProperty("--walker-angle", `${bodyAngle}deg`);
    walker.style.setProperty("--character-scale", String(.96 - progress * .42));
    return point;
  };

  const followCamera = (point: DOMPoint, progress: number) => {
    const path = routeRef.current;
    const world = worldRef.current;
    if (!path || !world) return;
    const start = path.getPointAtLength(0);
    const x = -((point.x - start.x) / MAP_W) * world.clientWidth * .42;
    const y = -((point.y - start.y) / MAP_H) * world.clientHeight * .42;
    const scale = 1.018 + progress * .53;
    world.style.transform = `translate(${x}px,${y}px) scale(${scale})`;
    return { x, y, scale };
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setSceneReady(true);
      requestAnimationFrame(() => placeWalker(WAYPOINTS[0]));
      observer.disconnect();
    }, { threshold: .28 });
    observer.observe(section);
    return () => {
      observer.disconnect();
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      if (revealTimerRef.current !== null) clearTimeout(revealTimerRef.current);
    };
  }, []);

  const moveToStageTwo = () => {
    if (isWalking || currentStage !== 0) return;
    const startProgress = WAYPOINTS[0];
    const endProgress = WAYPOINTS[1];
    setIsWalking(true);
    setJourneyState("walking");
    const startedAt = performance.now();
    const duration = 3900;
    let finalCamera = camera;

    const animate = (now: number) => {
      const time = Math.min(1, (now - startedAt) / duration);
      const eased = time < .5 ? 2 * time * time : 1 - Math.pow(-2 * time + 2, 2) / 2;
      const progress = startProgress + (endProgress - startProgress) * eased;
      const point = placeWalker(progress);
      if (point) finalCamera = followCamera(point, progress) ?? finalCamera;
      if (time < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setCamera(finalCamera);
        setWalkerVisible(false);
        setCurrentStage(1);
        setIsWalking(false);
        setJourneyState("arrived");
        revealTimerRef.current = setTimeout(() => setStageCharacterVisible(true), 700);
      }
    };
    frameRef.current = requestAnimationFrame(animate);
  };

  return (
    <section ref={sectionRef} className={`misho-journey${sceneReady ? " is-ready" : ""}${isWalking ? " is-walking" : ""}${currentStage === 1 ? " is-stage-two" : ""}${stageCharacterVisible ? " is-stage-character-visible" : ""}`} aria-labelledby="misho-stage-title">
      <div className="misho-journey__viewport">
        <div ref={worldRef} className={`misho-journey__world is-${journeyState}`} style={{ transform: `translate(${camera.x}px,${camera.y}px) scale(${camera.scale})` }}>
          <Image src="/brand/misho-clean.png" alt="دامنه سرسبز و مسیر صعود کوه میشو" fill priority unoptimized sizes="100vw" className="misho-journey__mountain" />

          <svg className="misho-journey__trail" viewBox={`0 0 ${MAP_W} ${MAP_H}`} preserveAspectRatio="none" aria-hidden="true">
            <path ref={routeRef} d={ROUTE} />
          </svg>

          <div className="misho-journey__light" aria-hidden="true" />

          <button ref={walkerRef} type="button" className={`misho-journey__character${walkerVisible ? "" : " is-hidden"}`} onClick={moveToStageTwo} disabled={isWalking || currentStage === 1} aria-label="حرکت مرد کوهستان روی مسیر صعود">
            <Image src="/brand/mountain-man.png" alt="مرد کوهستان در حال صعود" width={190} height={285} priority />
            <span aria-hidden="true" />
          </button>

          <div className="misho-journey__stage-floating" style={{ left: `${MOUNTAIN_STAGES[1].floating.x}%`, top: `${MOUNTAIN_STAGES[1].floating.y}%` }} aria-hidden="true">
            <Image src={MOUNTAIN_STAGES[1].floating.src} alt="" width={240} height={350} />
          </div>

          <article className="misho-journey__stage-card" key={stage.id} style={{ left: `${stage.card.x}%`, top: `${stage.card.y}%` }}>
            <small>{String(stage.id).padStart(2, "0")}</small>
            <h2 id="misho-stage-title">{stage.title}</h2>
            <p>{stage.subtitle}</p>
          </article>
        </div>
      </div>

      <p className="misho-journey__hint" aria-live="polite">
        {isWalking ? "دوربین همراه صعود مرد کوهستان است…" : currentStage === 1 ? "به مرتع میشو رسیدی" : "روی مرد کوهستان بزن تا سفر آغاز شود"}
      </p>
    </section>
  );
}
