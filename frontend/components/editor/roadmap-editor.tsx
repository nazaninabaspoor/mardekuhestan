"use client";

import Konva from "konva";
import { Circle, Group, Image as KonvaImage, Layer, Line, Rect, Stage, Text, Transformer } from "react-konva";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KonvaEventObject } from "konva/lib/Node";

import { CinematicRoadmap } from "@/components/roadmap/cinematic-roadmap";
import { DEFAULT_ROADMAP_LAYOUT, normalizeRoadmapLayout, type EditorObject, type RoadmapEditorLayout } from "@/lib/roadmap-editor-layout";

type Selected = { type: "background" | "character" | "card" | "image" | "stage"; stepId?: number } | null;
type EditorTool = "select" | "path" | "stage" | "background";

function useCanvasImage(src: string) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    const next = new window.Image();
    next.crossOrigin = "anonymous";
    next.src = src;
    next.onload = () => setImage(next);
  }, [src]);
  return image;
}

function NumberField({ label, value, step = 1, onChange }: { label: string; value: number; step?: number; onChange: (value: number) => void }) {
  return <label className="editor-field"><span>{label}</span><input type="number" step={step} value={Number(value.toFixed(2))} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}

function RangeField({ label, value, min = 0, max = 600, step = 1, onChange }: { label: string; value: number; min?: number; max?: number; step?: number; onChange: (value: number) => void }) {
  return <label className="editor-range"><span>{label}<b>{Number(value.toFixed(2))}</b></span><input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}

function ObjectImage({ src, value, selected, draggable, onSelect, onChange }: { src: string; value: EditorObject; selected: boolean; draggable: boolean; onSelect: () => void; onChange: (value: EditorObject) => void }) {
  const image = useCanvasImage(src);
  return (
    <KonvaImage
      image={image ?? undefined}
      x={value.x}
      y={value.y}
      offsetX={(image?.width ?? 0) / 2}
      offsetY={(image?.height ?? 0) / 2}
      scaleX={value.scale}
      scaleY={value.scale}
      rotation={value.rotation}
      opacity={value.opacity}
      visible={value.visible}
      draggable={draggable}
      stroke={selected ? "#d1ad68" : undefined}
      strokeWidth={selected ? 5 / value.scale : 0}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(event) => onChange({ ...value, x: event.target.x(), y: event.target.y() })}
      onTransformEnd={(event) => {
        const node = event.target;
        onChange({ ...value, x: node.x(), y: node.y(), rotation: node.rotation(), scale: Math.max(.03, node.scaleX()) });
      }}
    />
  );
}

export function RoadmapEditor() {
  const [layout, setLayout] = useState<RoadmapEditorLayout>(DEFAULT_ROADMAP_LAYOUT);
  const [selected, setSelected] = useState<Selected>({ type: "character" });
  const [tool, setTool] = useState<EditorTool>("select");
  const [selectedStageId, setSelectedStageId] = useState(1);
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const [preview, setPreview] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [status, setStatus] = useState("آماده ویرایش");
  const [viewport, setViewport] = useState({ width: 720, height: 760 });
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const selectedNodeRef = useRef<Konva.Node | null>(null);
  const backgroundImage = useCanvasImage(layout.background.src);
  const pathMode = tool === "path";
  const stageMode = tool === "stage";

  useEffect(() => {
    const host = canvasHostRef.current;
    if (!host) return;
    const observer = new ResizeObserver(([entry]) => setViewport({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const transformer = transformerRef.current;
    if (!transformer) return;
    transformer.nodes(selectedNodeRef.current ? [selectedNodeRef.current] : []);
    transformer.getLayer()?.batchDraw();
  }, [selected, layout]);

  const scale = Math.min(viewport.width / layout.canvas.width, viewport.height / layout.canvas.height);
  const stageWidth = layout.canvas.width * scale;
  const stageHeight = layout.canvas.height * scale;

  const updateStep = useCallback((id: number, patch: Partial<RoadmapEditorLayout["steps"][number]>) => {
    setLayout((current) => ({ ...current, steps: current.steps.map((step) => step.id === id ? { ...step, ...patch } : step) }));
  }, []);

  const selectedObject = useMemo(() => {
    if (!selected) return null;
    if (selected.type === "background") return layout.background;
    if (selected.type === "character") return layout.character;
    if (selected.type === "stage") return null;
    const step = layout.steps.find((item) => item.id === selected.stepId);
    return selected.type === "card" ? step?.card ?? null : step?.imageObject ?? null;
  }, [layout, selected]);

  const updateSelectedObject = (patch: Partial<EditorObject>) => {
    if (!selected) return;
    if (selected.type === "background") setLayout((current) => ({ ...current, background: { ...current.background, ...patch } }));
    else if (selected.type === "character") setLayout((current) => ({ ...current, character: { ...current.character, ...patch } }));
    else {
      const step = layout.steps.find((item) => item.id === selected.stepId);
      if (!step) return;
      updateStep(step.id, selected.type === "card" ? { card: { ...step.card, ...patch } } : { imageObject: { ...step.imageObject, ...patch } });
    }
  };

  const selectNode = (selection: Selected, event: KonvaEventObject<MouseEvent | TouchEvent>) => {
    setSelected(selection);
    selectedNodeRef.current = event.currentTarget;
  };

  const updatePoint = (index: number, x: number, y: number) => setLayout((current) => {
    const points = [...current.trail.points];
    points[index * 2] = x;
    points[index * 2 + 1] = y;
    const movementPath = current.movementPath.map((point, pointIndex) => pointIndex === index ? { x, y } : point);
    const stages = current.stages.map((stage) => stage.waypointIndex === index ? { ...stage, position: { x, y } } : stage);
    return { ...current, trail: { ...current.trail, points }, movementPath, stages };
  });

  const nearestWaypoint = (x: number, y: number) => layout.movementPath.reduce((best, point, index) => {
    const distance = Math.hypot(point.x - x, point.y - y);
    return distance < best.distance ? { index, point, distance } : best;
  }, { index: 0, point: layout.movementPath[0], distance: Number.POSITIVE_INFINITY });

  const placeStage = (id: number, x: number, y: number) => {
    const nearest = nearestWaypoint(x, y);
    if (!nearest.point) return;
    setLayout((current) => ({ ...current, stages: current.stages.map((stage) => stage.id === id ? { ...stage, position: { ...nearest.point }, waypointIndex: nearest.index, progress: nearest.index / Math.max(1, current.movementPath.length - 1) } : stage) }));
    setSelected({ type: "stage", stepId: id });
  };

  const exportJson = async () => {
    const output = JSON.stringify(layout, null, 2);
    setJsonText(output);
    await navigator.clipboard?.writeText(output);
    setStatus("JSON کپی شد");
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(layout, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "marde-kuhestan-roadmap.json";
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus("فایل JSON دانلود شد");
  };

  const importJson = () => {
    try {
      const parsed = JSON.parse(jsonText) as Partial<RoadmapEditorLayout>;
      if (!parsed.canvas || !parsed.steps || !parsed.trail) throw new Error("invalid");
      setLayout(normalizeRoadmapLayout(parsed));
      setStatus("چیدمان وارد شد");
    } catch { setStatus("JSON معتبر نیست"); }
  };

  return (
    <main className="roadmap-editor-shell" dir="rtl">
      <header className="roadmap-editor-toolbar">
        <div><strong>Roadmap Studio</strong><span>{status}</span></div>
        <nav>
          <button onClick={() => { localStorage.setItem("roadmap-layout", JSON.stringify(layout)); setStatus("در مرورگر ذخیره شد"); }}>ذخیره</button>
          <button onClick={() => { const saved = localStorage.getItem("roadmap-layout"); if (saved) setLayout(normalizeRoadmapLayout(JSON.parse(saved))); }}>بازیابی</button>
          <button onClick={() => setPreview((value) => !value)} className={preview ? "is-active" : ""}>▶ Preview Roadmap</button>
          <button onClick={exportJson}>کپی JSON</button>
          <button className="is-primary" onClick={downloadJson}>Export JSON</button>
        </nav>
      </header>

      {preview ? <div className="roadmap-editor-preview"><CinematicRoadmap layoutOverride={layout} /></div> : <div className="roadmap-editor-workspace">
        <aside className="roadmap-editor-panel roadmap-editor-layers">
          <h2>لایه‌ها</h2>
          <button className={selected?.type === "background" ? "is-selected" : ""} onClick={() => setSelected({ type: "background" })}>پس‌زمینه</button>
          <button className={selected?.type === "character" ? "is-selected" : ""} onClick={() => setSelected({ type: "character" })}>مرد کوهستان</button>
          <button className={pathMode ? "is-selected" : ""} onClick={() => setTool("path")}>مسیر سبز</button>
          {layout.steps.map((step) => <div className="roadmap-editor-layer-group" key={step.id}><b>مرحله {step.id}</b><button onClick={() => setSelected({ type: "card", stepId: step.id })}>کارت {step.title}</button><button onClick={() => setSelected({ type: "image", stepId: step.id })}>تصویر مرحله</button></div>)}
        </aside>

        <section className={`roadmap-editor-canvas-wrap${layout.canvas.locked ? " is-canvas-locked" : ""}`} ref={canvasHostRef}>
          <Stage width={stageWidth} height={stageHeight} draggable={!layout.canvas.locked && tool === "select"} onClick={(event) => {
            const point = event.target.getStage()?.getPointerPosition();
            if (!point) return;
            const x = point.x / scale;
            const y = point.y / scale;
            if (pathMode) setLayout((current) => {
              const movementPath = [...current.movementPath, { x, y }];
              return { ...current, movementPath, trail: { ...current.trail, points: movementPath.flatMap((item) => [item.x, item.y]) } };
            });
            if (stageMode) placeStage(selectedStageId, x, y);
          }}>
            <Layer scaleX={scale} scaleY={scale}>
              <KonvaImage
                image={backgroundImage ?? undefined}
                x={layout.background.x + (layout.background.extend.right - layout.background.extend.left) / 2}
                y={layout.background.y + (layout.background.extend.bottom - layout.background.extend.top) / 2}
                width={layout.canvas.width + layout.background.extend.left + layout.background.extend.right}
                height={layout.canvas.height + layout.background.extend.top + layout.background.extend.bottom}
                offsetX={(layout.canvas.width + layout.background.extend.left + layout.background.extend.right) / 2}
                offsetY={(layout.canvas.height + layout.background.extend.top + layout.background.extend.bottom) / 2}
                scaleX={layout.background.scale * layout.background.scaleX}
                scaleY={layout.background.scale * layout.background.scaleY}
                rotation={layout.background.rotation}
                opacity={layout.background.opacity}
                draggable={!layout.canvas.locked && tool === "select"}
                onClick={(event) => selectNode({ type: "background" }, event)}
                onDragEnd={(event) => setLayout((current) => ({ ...current, background: { ...current.background, x: event.target.x(), y: event.target.y() } }))}
              />
              <Line points={layout.trail.points} stroke={layout.trail.color} strokeWidth={layout.trail.width} dash={[layout.trail.dash, layout.trail.gap]} lineCap="round" lineJoin="round" tension={.34} />
              {pathMode && layout.movementPath.map((point, index) => <Circle key={index} x={point.x} y={point.y} radius={selectedPoint === index ? 12 : 9} fill={selectedPoint === index ? "#d1ad68" : "#fff"} stroke="#005b48" strokeWidth={4} draggable onClick={(event) => { event.cancelBubble = true; setSelectedPoint(index); }} onDragMove={(event) => updatePoint(index, event.target.x(), event.target.y())} />)}

              {stageMode && layout.stages.map((stage) => <Group key={`stage-${stage.id}`} x={stage.position.x} y={stage.position.y} draggable onClick={(event) => { event.cancelBubble = true; setSelectedStageId(stage.id); setSelected({ type: "stage", stepId: stage.id }); }} onDragEnd={(event) => placeStage(stage.id, event.target.x(), event.target.y())}>
                <Circle radius={selectedStageId === stage.id ? 17 : 14} fill="#d1ad68" stroke="#005b48" strokeWidth={4} />
                <Text text={String(stage.id)} x={-10} y={-8} width={20} align="center" fontSize={16} fontStyle="bold" fill="#fff" />
              </Group>)}

              {layout.steps.map((step) => (
                <Group key={step.id}>
                  <ObjectImage src={step.image} value={step.imageObject} selected={selected?.type === "image" && selected.stepId === step.id} draggable={!layout.canvas.locked || selected?.type === "image" && selected.stepId === step.id} onSelect={() => setSelected({ type: "image", stepId: step.id })} onChange={(imageObject) => updateStep(step.id, { imageObject })} />
                  <Group
                    x={step.card.x} y={step.card.y} offsetX={step.card.width / 2} offsetY={step.card.height / 2} rotation={step.card.rotation} scaleX={step.card.scale} scaleY={step.card.scale} opacity={step.card.opacity} visible={step.card.visible} draggable={!layout.canvas.locked || selected?.type === "card" && selected.stepId === step.id}
                    onClick={(event) => selectNode({ type: "card", stepId: step.id }, event)}
                    onDragEnd={(event) => updateStep(step.id, { card: { ...step.card, x: event.target.x(), y: event.target.y() } })}
                    onTransformEnd={(event) => updateStep(step.id, { card: { ...step.card, x: event.target.x(), y: event.target.y(), rotation: event.target.rotation(), scale: event.target.scaleX() } })}
                  >
                    <Rect width={step.card.width} height={step.card.height} cornerRadius={step.card.radius} fill="rgba(244,240,232,.78)" stroke="rgba(255,255,255,.65)" shadowColor="rgba(0,35,25,.25)" shadowBlur={18} shadowOffsetY={10} />
                    <Text text={step.title} width={step.card.width - 32} x={16} y={24} align="center" fontSize={25} fontStyle="bold" fill="#005b48" fontFamily="Tahoma" />
                    <Text text={step.subtitle} width={step.card.width - 32} x={16} y={64} align="center" fontSize={13} fill="#4d635b" fontFamily="Tahoma" />
                  </Group>
                </Group>
              ))}
              <ObjectImage src={layout.character.src} value={layout.character} selected={selected?.type === "character"} draggable={!layout.canvas.locked || selected?.type === "character"} onSelect={() => setSelected({ type: "character" })} onChange={(character) => setLayout((current) => ({ ...current, character: { ...current.character, ...character } }))} />
              <Transformer ref={transformerRef} rotateEnabled enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]} borderStroke="#d1ad68" anchorFill="#fff" anchorStroke="#005b48" />
            </Layer>
          </Stage>
          {pathMode && <div className="roadmap-editor-path-tip">برای افزودن waypoint کلیک کن؛ نقاط را با موس بکش.</div>}
          {stageMode && <div className="roadmap-editor-path-tip">مرحله را انتخاب کن و روی مسیر کلیک کن؛ Marker به نزدیک‌ترین waypoint متصل می‌شود.</div>}
        </section>

        <aside className="roadmap-editor-panel roadmap-editor-properties">
          <h2>TOOLS</h2>
          <div className="roadmap-editor-tools">
            <button className={pathMode ? "is-selected" : ""} onClick={() => setTool("path")}>🟢 Path Tool</button>
            <button className={stageMode ? "is-selected" : ""} onClick={() => setTool("stage")}>🟡 Stage Tool</button>
            <button className={tool === "background" ? "is-selected" : ""} onClick={() => { setTool("background"); setSelected({ type: "background" }); }}>🖼 Background Size</button>
            <button className={tool === "select" ? "is-selected" : ""} onClick={() => setTool("select")}>↖ Select Tool</button>
          </div>
          <label className="editor-check"><input type="checkbox" checked={layout.canvas.locked} onChange={(event) => setLayout((current) => ({ ...current, canvas: { ...current.canvas, locked: event.target.checked } }))} />🔒 Lock Canvas</label>
          {stageMode && <label className="editor-field"><span>Stage</span><select value={selectedStageId} onChange={(event) => { const id = Number(event.target.value); setSelectedStageId(id); setSelected({ type: "stage", stepId: id }); }}>{layout.stages.map((stage) => <option key={stage.id} value={stage.id}>Stage {String(stage.id).padStart(2, "0")}</option>)}</select></label>}
          {tool === "background" && <div className="roadmap-editor-path-controls">
            <h3>Background Expansion</h3>
            <RangeField label="Left Extend" value={layout.background.extend.left} onChange={(left) => setLayout((current) => ({ ...current, background: { ...current.background, extend: { ...current.background.extend, left } } }))} />
            <RangeField label="Right Extend" value={layout.background.extend.right} onChange={(right) => setLayout((current) => ({ ...current, background: { ...current.background, extend: { ...current.background.extend, right } } }))} />
            <RangeField label="Top Extend" value={layout.background.extend.top} onChange={(top) => setLayout((current) => ({ ...current, background: { ...current.background, extend: { ...current.background.extend, top } } }))} />
            <RangeField label="Bottom Extend" value={layout.background.extend.bottom} onChange={(bottom) => setLayout((current) => ({ ...current, background: { ...current.background, extend: { ...current.background.extend, bottom } } }))} />
            <RangeField label="Background Scale X" value={layout.background.scaleX} min={.5} max={2} step={.05} onChange={(scaleX) => setLayout((current) => ({ ...current, background: { ...current.background, scaleX } }))} />
            <RangeField label="Background Scale Y" value={layout.background.scaleY} min={.5} max={2} step={.05} onChange={(scaleY) => setLayout((current) => ({ ...current, background: { ...current.background, scaleY } }))} />
          </div>}
          <h2>ویژگی‌ها</h2>
          {selectedObject && <>
            <NumberField label="X" value={selectedObject.x} onChange={(x) => updateSelectedObject({ x })} />
            <NumberField label="Y" value={selectedObject.y} onChange={(y) => updateSelectedObject({ y })} />
            <NumberField label="Scale" value={selectedObject.scale} step={.05} onChange={(scale) => updateSelectedObject({ scale })} />
            <NumberField label="Rotation" value={selectedObject.rotation} onChange={(rotation) => updateSelectedObject({ rotation })} />
            <NumberField label="Opacity" value={selectedObject.opacity} step={.05} onChange={(opacity) => updateSelectedObject({ opacity })} />
            <label className="editor-check"><input type="checkbox" checked={selectedObject.visible} onChange={(event) => updateSelectedObject({ visible: event.target.checked })} />نمایش داده شود</label>
          </>}
          {selected?.type === "background" && <><NumberField label="Brightness" value={layout.background.brightness} step={.05} onChange={(brightness) => setLayout((current) => ({ ...current, background: { ...current.background, brightness } }))} /><NumberField label="Blur" value={layout.background.blur} onChange={(blur) => setLayout((current) => ({ ...current, background: { ...current.background, blur } }))} /></>}
          {selected?.type === "card" && (() => { const step = layout.steps.find((item) => item.id === selected.stepId); return step ? <><NumberField label="Width" value={step.card.width} onChange={(width) => updateStep(step.id, { card: { ...step.card, width } })} /><NumberField label="Height" value={step.card.height} onChange={(height) => updateStep(step.id, { card: { ...step.card, height } })} /><NumberField label="Radius" value={step.card.radius} onChange={(radius) => updateStep(step.id, { card: { ...step.card, radius } })} /><label className="editor-field"><span>عنوان</span><input value={step.title} onChange={(event) => updateStep(step.id, { title: event.target.value })} /></label><label className="editor-field"><span>زیرعنوان</span><input value={step.subtitle} onChange={(event) => updateStep(step.id, { subtitle: event.target.value })} /></label></> : null; })()}
          {selected?.type === "stage" && (() => { const stage = layout.stages.find((item) => item.id === selected.stepId); return stage ? <div className="roadmap-editor-path-controls"><h3>Stage {String(stage.id).padStart(2, "0")}</h3><NumberField label="X" value={stage.position.x} onChange={(x) => placeStage(stage.id, x, stage.position.y)} /><NumberField label="Y" value={stage.position.y} onChange={(y) => placeStage(stage.id, stage.position.x, y)} /><label className="editor-field"><span>Title</span><input value={stage.title} onChange={(event) => setLayout((current) => ({ ...current, stages: current.stages.map((item) => item.id === stage.id ? { ...item, title: event.target.value } : item) }))} /></label><label className="editor-field"><span>Description</span><input value={stage.description} onChange={(event) => setLayout((current) => ({ ...current, stages: current.stages.map((item) => item.id === stage.id ? { ...item, description: event.target.value } : item) }))} /></label><label className="editor-field"><span>Image</span><input value={stage.image} onChange={(event) => setLayout((current) => ({ ...current, stages: current.stages.map((item) => item.id === stage.id ? { ...item, image: event.target.value } : item) }))} /></label><label className="editor-field"><span>Character Position</span><input value={stage.characterPosition} onChange={(event) => setLayout((current) => ({ ...current, stages: current.stages.map((item) => item.id === stage.id ? { ...item, characterPosition: event.target.value } : item) }))} /></label></div> : null; })()}
          {pathMode && <div className="roadmap-editor-path-controls"><h3>مسیر</h3><NumberField label="ضخامت" value={layout.trail.width} onChange={(width) => setLayout((current) => ({ ...current, trail: { ...current.trail, width } }))} /><NumberField label="طول نقطه" value={layout.trail.dash} onChange={(dash) => setLayout((current) => ({ ...current, trail: { ...current.trail, dash } }))} /><NumberField label="فاصله" value={layout.trail.gap} onChange={(gap) => setLayout((current) => ({ ...current, trail: { ...current.trail, gap } }))} />{selectedPoint !== null && <button className="is-danger" onClick={() => { setLayout((current) => { const movementPath = current.movementPath.filter((_, index) => index !== selectedPoint); return { ...current, movementPath, trail: { ...current.trail, points: movementPath.flatMap((point) => [point.x, point.y]) } }; }); setSelectedPoint(null); }}>حذف نقطه</button>}</div>}
          <hr />
          <textarea value={jsonText} onChange={(event) => setJsonText(event.target.value)} placeholder="JSON را اینجا Paste کن" />
          <button onClick={importJson}>Import JSON</button>
          <button onClick={() => { setLayout(DEFAULT_ROADMAP_LAYOUT); setStatus("چیدمان اولیه بازیابی شد"); }}>بازنشانی</button>
        </aside>
      </div>}
    </main>
  );
}
