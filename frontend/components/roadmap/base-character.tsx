"use client";

import { Billboard, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { DoubleSide, Mesh, SRGBColorSpace } from "three";

export function BaseCharacter() {
  const character = useRef<Mesh>(null);
  const texture = useTexture("/brand/mountain-man.png");
  texture.colorSpace = SRGBColorSpace;

  useFrame(({ clock }) => {
    if (!character.current) return;
    character.current.position.y = -0.35 + Math.sin(clock.elapsedTime * 1.55) * 0.018;
  });

  return (
    <group position={[0.08, -0.58, 0.72]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.88, 0]} scale={[0.7, 0.23, 1]}>
        <circleGeometry args={[0.62, 40]} />
        <meshBasicMaterial color="#10271e" transparent opacity={0.27} depthWrite={false} />
      </mesh>
      <Billboard follow lockX lockZ>
        <mesh ref={character} scale={[1.05, 1.73, 1]}>
          <planeGeometry args={[1, 1.6]} />
          <meshBasicMaterial map={texture} transparent alphaTest={0.08} side={DoubleSide} toneMapped={false} />
        </mesh>
      </Billboard>
    </group>
  );
}
