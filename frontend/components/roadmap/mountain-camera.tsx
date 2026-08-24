"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import type { PerspectiveCamera as PerspectiveCameraType } from "three";

type MountainCameraProps = {
  scrollProgress: React.MutableRefObject<number>;
};

export function MountainCamera({ scrollProgress }: MountainCameraProps) {
  const camera = useThree((state) => state.camera) as PerspectiveCameraType;
  const pointer = useThree((state) => state.pointer);
  const current = useRef({ x: 0, y: 1.15, z: 7.7 });

  useFrame((_, delta) => {
    const progress = scrollProgress.current;
    const target = {
      x: pointer.x * 0.09,
      y: 1.15 + progress * 0.2 + pointer.y * 0.045,
      z: 7.7 - progress * 0.72,
    };
    const ease = 1 - Math.exp(-delta * 2.4);

    current.current.x += (target.x - current.current.x) * ease;
    current.current.y += (target.y - current.current.y) * ease;
    current.current.z += (target.z - current.current.z) * ease;
    camera.position.set(current.current.x, current.current.y, current.current.z);
    camera.lookAt(0, 0.38 + progress * 0.12, -1.8);
  });

  return null;
}
