"use client";

import Image from "next/image";

import { DraggableStageItem } from "@/components/draggable-stage-item";
import type { JourneyStage } from "@/lib/journey-stage-data";

export type StageLayout = {
  id: number;
  pinX: number;
  pinY: number;
  cardX: number;
  cardY: number;
  objectX: number;
  objectY: number;
};

type PositionKind = "pin" | "card" | "object";

type JourneyStageClusterProps = {
  stage: JourneyStage;
  layout: StageLayout;
  isActive: boolean;
  isDone: boolean;
  editMode: boolean;
  onClick: () => void;
  onPositionChange: (kind: PositionKind, x: number, y: number) => void;
  onSelect: () => void;
};

export function JourneyStageCluster({ stage, layout, isActive, isDone, editMode, onClick, onPositionChange, onSelect }: JourneyStageClusterProps) {
  const stateClass = `${isActive ? " is-active" : ""}${isDone ? " is-done" : ""}`;

  return (
    <div className="journey-stage-cluster">
      <DraggableStageItem edit={editMode} kind="pin" x={layout.pinX} y={layout.pinY} onChange={(x, y) => onPositionChange("pin", x, y)} onSelect={onSelect}>
        <button
          type="button"
          className={`journey-stage-pin${stateClass}`}
          onClick={() => { if (!editMode) onClick(); }}
          disabled={!editMode && !isActive}
          aria-label={`مرحله ${stage.id}: ${stage.title}${isActive ? "؛ حرکت به مرحله بعد" : ""}`}
        >
          <span>{stage.id}</span>
        </button>
      </DraggableStageItem>

      <DraggableStageItem edit={editMode} kind="card" x={layout.cardX} y={layout.cardY} onChange={(x, y) => onPositionChange("card", x, y)} onSelect={onSelect}>
        <article className={`journey-stage-card${stateClass}`}>
          <small>{String(stage.id).padStart(2, "0")}</small>
          <h3>{stage.title}</h3>
          <p>{stage.subtitle}</p>
        </article>
      </DraggableStageItem>

      <DraggableStageItem edit={editMode} kind="object" x={layout.objectX} y={layout.objectY} onChange={(x, y) => onPositionChange("object", x, y)} onSelect={onSelect}>
        <div className={`journey-stage-object${stateClass}`} aria-hidden="true">
          <Image src={stage.objectSrc} alt="" width={150} height={170} sizes="150px" />
        </div>
      </DraggableStageItem>
    </div>
  );
}
