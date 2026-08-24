"use client";

import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Line2 } from "three-stdlib";

const PATH_POINTS: [number, number, number][] = [
  [-0.04, -1.34, 0.42],
  [-0.42, -1.17, 0.22],
  [-0.78, -0.96, 0.02],
  [-0.54, -0.73, -0.2],
  [0.05, -0.54, -0.42],
  [0.52, -0.34, -0.65],
  [0.36, -0.12, -0.88],
];

export function GreenPath() {
  const line = useRef<Line2>(null);

  useFrame(({ clock }) => {
    const material = line.current?.material;
    if (material && "dashOffset" in material) material.dashOffset = -clock.elapsedTime * 0.055;
  });

  return (
    <Line
      ref={line}
      points={PATH_POINTS}
      color="#2f9f62"
      lineWidth={3.2}
      dashed
      dashSize={0.055}
      gapSize={0.045}
      transparent
      opacity={0.92}
    />
  );
}
