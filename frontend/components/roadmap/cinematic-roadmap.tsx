"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { DEFAULT_ROADMAP_LAYOUT, normalizeRoadmapLayout, type RoadmapEditorLayout } from "@/lib/roadmap-editor-layout";

const IMAGE_SIZES: Record<number, { width: number; height: number }> = {
  1: { width: 1024, height: 1536 },
  2: { width: 1207, height: 1303 },
  3: { width: 1254, height: 1254 },
  4: { width: 1254, height: 1254 },
  5: { width: 1024, height: 1536 },
};

function smoothPath(points: number[], tension = .34) {
  const pairs = Array.from({ length: points.length / 2 }, (_, index) => ({ x: points[index * 2], y: points[index * 2 + 1] }));
  if (pairs.length < 2) return "";
  let path = `M ${pairs[0].x} ${pairs[0].y}`;
  for (let index = 0; index < pairs.length - 1; index += 1) {
    const previous = pairs[Math.max(0, index - 1)];
    const current = pairs[index];
    const next = pairs[index + 1];
    const after = pairs[Math.min(pairs.length - 1, index + 2)];
    const cp1 = { x: current.x + ((next.x - previous.x) / 6) * tension, y: current.y + ((next.y - previous.y) / 6) * tension };
    const cp2 = { x: next.x - ((after.x - current.x) / 6) * tension, y: next.y - ((after.y - current.y) / 6) * tension };
    path += ` C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${next.x} ${next.y}`;
  }
  return path;
}

export function CinematicRoadmap({ layoutOverride }: { layoutOverride?: RoadmapEditorLayout } = {}) {
  const [activeStage, setActiveStage] = useState(1);
  const [isWalking, setIsWalking] = useState(false);
  const [walkDirection, setWalkDirection] = useState<1 | -1>(1);
  const [walker, setWalker] = useState({ x: DEFAULT_ROADMAP_LAYOUT.character.x, y: DEFAULT_ROADMAP_LAYOUT.character.y, angle: DEFAULT_ROADMAP_LAYOUT.character.rotation });
  const routeRef = useRef<SVGPathElement>(null);
  const frameRef = useRef<number | null>(null);
  const layout = normalizeRoadmapLayout(layoutOverride ?? DEFAULT_ROADMAP_LAYOUT);
  const stageProgress = layout.stages.map((stage) => stage.progress);
  const progressRef = useRef<number>(stageProgress[0] ?? .08);
  const route = smoothPath(layout.movementPath.flatMap((point) => [point.x, point.y]));
  const backgroundOffsetX = ((layout.background.x + (layout.background.extend.right - layout.background.extend.left) / 2 - layout.canvas.width / 2) / layout.canvas.width) * 100;
  const backgroundOffsetY = ((layout.background.y + (layout.background.extend.bottom - layout.background.extend.top) / 2 - layout.canvas.height / 2) / layout.canvas.height) * 100;
  const backgroundScaleX = layout.background.scale * layout.background.scaleX * ((layout.canvas.width + layout.background.extend.left + layout.background.extend.right) / layout.canvas.width);
  const backgroundScaleY = layout.background.scale * layout.background.scaleY * ((layout.canvas.height + layout.background.extend.top + layout.background.extend.bottom) / layout.canvas.height);

  useEffect(() => () => { if (frameRef.current !== null) cancelAnimationFrame(frameRef.current); }, []);

  const pointAt = (progress: number) => {
    const path = routeRef.current;
    if (!path) return null;
    const length = path.getTotalLength();
    const distance = Math.max(0, Math.min(length, length * progress));
    const point = path.getPointAtLength(distance);
    const next = path.getPointAtLength(Math.min(length, distance + 12));
    const angle = Math.max(-5, Math.min(5, Math.atan2(next.y - point.y, next.x - point.x) * 180 / Math.PI / 8));
    return { x: point.x, y: point.y, angle, length };
  };

  const walkToStage = (targetIndex: number) => {
    const target = stageProgress[targetIndex] ?? 0;
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    const start = progressRef.current;
    const routePoint = pointAt(start);
    if (!routePoint) return;
    const duration = Math.max(3500, Math.abs(target - start) * routePoint.length * 5);
    const startedAt = performance.now();
    setIsWalking(true);
    if (target !== start) setWalkDirection(target > start ? 1 : -1);

    const animate = (now: number) => {
      const raw = Math.min(1, (now - startedAt) / duration);
      const eased = raw < .5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2;
      const progress = start + (target - start) * eased;
      const point = pointAt(progress);
      if (point) setWalker({ x: point.x, y: point.y, angle: point.angle });
      progressRef.current = progress;
      if (raw < 1) frameRef.current = requestAnimationFrame(animate);
      else {
        setIsWalking(false);
        setActiveStage(targetIndex + 1);
        frameRef.current = null;
      }
    };
    frameRef.current = requestAnimationFrame(animate);
  };

  return (
    <section className="final-roadmap" aria-label="سفر مرد کوهستان">
      <div className="final-roadmap__ambient" aria-hidden="true" />
      <div className="final-roadmap__scene">
        <Image
          src={layout.background.src}
          alt="مسیر کوهستانی میشو"
          fill
          priority
          unoptimized
          sizes="(max-width: 1024px) 100vw, 1024px"
          className="final-roadmap__background"
          style={{ opacity: layout.background.opacity, filter: `brightness(${layout.background.brightness}) blur(${layout.background.blur}px)`, transform: `translate(${backgroundOffsetX}%,${backgroundOffsetY}%) rotate(${layout.background.rotation}deg) scale(${backgroundScaleX},${backgroundScaleY})` }}
        />
        <div className="final-roadmap__grade" aria-hidden="true" />

        <svg className="final-roadmap__route" viewBox={`0 0 ${layout.canvas.width} ${layout.canvas.height}`} preserveAspectRatio="none" aria-hidden="true">
          <path className="final-roadmap__route-shadow" d={route} style={{ strokeWidth: layout.trail.width + 4, strokeDasharray: `${layout.trail.dash} ${layout.trail.gap}` }} />
          <path ref={routeRef} className="final-roadmap__route-line" d={route} style={{ stroke: layout.trail.color, strokeWidth: layout.trail.width, strokeDasharray: `${layout.trail.dash} ${layout.trail.gap}` }} />
        </svg>

        {layout.steps.map((step) => {
          const stage = layout.stages.find((item) => item.id === step.id);
          const imageSize = IMAGE_SIZES[step.id];
          const objectWidth = (imageSize.width * step.imageObject.scale / layout.canvas.width) * 100;
          return (
            <div key={step.id} className={`final-roadmap__cluster${activeStage === step.id ? " is-active" : ""}`}>
              {step.card.visible && <button
                type="button"
                className="final-roadmap__card"
                style={{
                  left: `${step.card.x / layout.canvas.width * 100}%`,
                  top: `${step.card.y / layout.canvas.height * 100}%`,
                  width: `${step.card.width / layout.canvas.width * 100}%`,
                  minHeight: `${step.card.height / layout.canvas.height * 100}%`,
                  opacity: step.card.opacity,
                  borderRadius: step.card.radius,
                  transform: `translate(-50%,-50%) rotate(${step.card.rotation}deg) scale(${step.card.scale})`,
                }}
                onClick={() => walkToStage(step.id - 1)}
                aria-pressed={activeStage === step.id}
              >
                <strong>{stage?.title ?? step.title}</strong>
                <small>{stage?.description ?? step.subtitle}</small>
              </button>}
              {step.imageObject.visible && <div className="final-roadmap__object" style={{ left: `${step.imageObject.x / layout.canvas.width * 100}%`, top: `${step.imageObject.y / layout.canvas.height * 100}%`, width: `${objectWidth}%`, opacity: step.imageObject.opacity, transform: `translate(-50%,-50%) rotate(${step.imageObject.rotation}deg)` }} aria-hidden="true">
                <Image src={stage?.image ?? step.image} alt="" width={imageSize.width} height={imageSize.height} sizes="26vw" />
                <span />
              </div>}
            </div>
          );
        })}

        {layout.character.visible && <div className={`final-roadmap__character${isWalking ? " is-walking" : ""}`} style={{ "--walk-direction": walkDirection, left: `${walker.x / layout.canvas.width * 100}%`, top: `${walker.y / layout.canvas.height * 100}%`, width: `${1024 * layout.character.scale / layout.canvas.width * 100}%`, opacity: layout.character.opacity, transform: `translate(-50%,-75%) rotate(${walker.angle}deg) scaleX(var(--walk-direction))` } as React.CSSProperties} aria-hidden="true">
          <Image src={layout.character.src} alt="" width={1024} height={1536} priority className="final-roadmap__idle-character" />
          <span />
        </div>}
      </div>
    </section>
  );
}
