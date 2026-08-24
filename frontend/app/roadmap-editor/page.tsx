"use client";

import dynamic from "next/dynamic";

const RoadmapEditor = dynamic(() => import("@/components/editor/roadmap-editor").then((module) => module.RoadmapEditor), { ssr: false, loading: () => <div className="roadmap-editor-loading">در حال آماده‌سازی بوم طراحی…</div> });

export default function RoadmapEditorPage() {
  return <RoadmapEditor />;
}
