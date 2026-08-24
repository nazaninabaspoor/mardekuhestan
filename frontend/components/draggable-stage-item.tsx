"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";

type DraggableStageItemProps = {
  children: ReactNode;
  x: number;
  y: number;
  edit: boolean;
  kind: "pin" | "card" | "object";
  onChange: (x: number, y: number) => void;
  onSelect?: () => void;
};

export function DraggableStageItem({ children, x, y, edit, kind, onChange, onSelect }: DraggableStageItemProps) {
  const draggingRef = useRef(false);

  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (!edit || !draggingRef.current) return;
    const canvas = event.currentTarget.closest<HTMLElement>(".roadmap-art__camera");
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const nextX = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
    const nextY = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100));
    onChange(Number(nextX.toFixed(2)), Number(nextY.toFixed(2)));
  };

  return (
    <div
      className={`draggable-stage-item draggable-stage-item--${kind}${edit ? " is-editing" : ""}`}
      style={{ left: `${x}%`, top: `${y}%` }}
      onPointerDown={(event) => {
        if (!edit) return;
        draggingRef.current = true;
        event.currentTarget.setPointerCapture(event.pointerId);
        onSelect?.();
        event.preventDefault();
      }}
      onPointerMove={move}
      onPointerUp={(event) => {
        draggingRef.current = false;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      onPointerCancel={() => { draggingRef.current = false; }}
    >
      {children}
    </div>
  );
}
