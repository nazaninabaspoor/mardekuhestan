"use client";

import { PerspectiveCamera, useTexture } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import { DoubleSide, SRGBColorSpace } from "three";

import { BaseCharacter } from "./base-character";
import { BaseStageCard } from "./base-stage-card";
import { GreenPath } from "./green-path";
import { MountainCamera } from "./mountain-camera";

function MountainWorld({ scrollProgress }: { scrollProgress: React.MutableRefObject<number> }) {
  const background = useTexture("/brand/misho-clean.png");
  background.colorSpace = SRGBColorSpace;

  return (
    <>
      <color attach="background" args={["#8aabc3"]} />
      <fog attach="fog" args={["#a7bed0", 8.5, 15]} />
      <PerspectiveCamera makeDefault position={[0, 1.15, 7.7]} fov={43} near={0.1} far={30} />
      <MountainCamera scrollProgress={scrollProgress} />
      <ambientLight intensity={1.25} />
      <directionalLight position={[-3, 6, 5]} intensity={1.3} color="#fff3d2" />

      <mesh position={[0, 0.35, -3.3]} scale={[10.1, 6.73, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={background} side={DoubleSide} toneMapped={false} />
      </mesh>
      <mesh position={[0, -1.42, -0.08]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8.8, 4.7]} />
        <meshStandardMaterial color="#526f45" transparent opacity={0.1} roughness={1} depthWrite={false} />
      </mesh>

      <GreenPath />
      <BaseCharacter />
    </>
  );
}

export function MountainScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollProgress = useRef(0);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const update = () => {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const range = Math.max(1, rect.height - window.innerHeight);
      scrollProgress.current = Math.min(1, Math.max(0, -rect.top / range));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <section ref={sectionRef} className={`base-camp${entered ? " is-entered" : ""}`} aria-labelledby="base-camp-title">
      <div className="base-camp__sticky">
        <div className="base-camp__fallback" aria-hidden="true" />
        <Canvas
          className="base-camp__canvas"
          dpr={[1, 1.75]}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
          onCreated={() => setEntered(true)}
        >
          <Suspense fallback={null}>
            <MountainWorld scrollProgress={scrollProgress} />
          </Suspense>
        </Canvas>
        <div className="base-camp__grade" aria-hidden="true" />
        <BaseStageCard />
        <p className="base-camp__scroll-cue"><span aria-hidden="true" />برای نزدیک‌شدن به کوه، اسکرول کنید</p>
      </div>
    </section>
  );
}
