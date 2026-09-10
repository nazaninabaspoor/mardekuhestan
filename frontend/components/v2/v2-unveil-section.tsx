"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import { UNVEIL_FUTURE_PRODUCTS, manSlotX, type UnveilManState } from "./v2-unveil-shared";
import { UnveilProductSlot } from "./v2-unveil-products";
import styles from "./v2-unveil-section.module.css";

const V2UnveilCanvas = dynamic(
  () => import("./v2-unveil-canvas").then((mod) => mod.V2UnveilCanvas),
  { ssr: false },
);

const INITIAL_MAN: UnveilManState = {
  x: manSlotX(0) - 0.28,
  originX: manSlotX(0) - 0.28,
  facing: 1,
  walking: true,
  stride: 0,
  slot: 0,
  hold: 0,
  dir: 1,
  profile: 1,
  accel: 1,
  windup: 0,
  gait: 0,
  foot: 0,
};

export function V2UnveilSection() {
  const rootRef = useRef<HTMLElement | null>(null);
  const cloth = useRef([0, 0, 0, 0, 0]);
  const man = useRef<UnveilManState>({ ...INITIAL_MAN });
  const [ready, setReady] = useState(false);
  const [unveiled, setUnveiled] = useState(false);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      cloth.current = [1, 1, 1, 1, 1];
      man.current = {
        x: 0,
        originX: 0,
        facing: 1,
        walking: false,
        stride: 0,
        slot: 2,
        hold: 99,
        dir: 1,
        profile: 0,
        accel: 0,
        windup: 0,
        gait: 0,
        foot: 0,
      };
      setUnveiled(true);
    }

    const measure = () => {
      const rect = node.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const visible = rect.bottom > 40 && rect.top < vh - 20;
      setActive(reduced ? false : visible);
      if (cloth.current.every((value) => value >= 0.98)) setUnveiled(true);
    };

    measure();
    setReady(true);
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    const poll = window.setInterval(measure, 400);
    return () => {
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      window.clearInterval(poll);
    };
  }, []);

  return (
    <section
      ref={rootRef}
      id="product-unveil"
      className={`${styles.section}${unveiled ? ` ${styles.unveiled}` : ""}`}
      aria-label="نمای تازه روی سفره"
    >
      <span className="v2-section-edge v2-section-edge--top" aria-hidden="true" />
      <div className={styles.atmosphere} aria-hidden="true" />
      <div className={styles.depth} aria-hidden="true" />
      <div className={styles.fog} aria-hidden="true" />
      <div className={styles.stage}>
        {ready ? <V2UnveilCanvas cloth={cloth} man={man} active={active} /> : null}
      </div>

      <div className={styles.copy}>
        <h2>روی میز خانه</h2>
        <span>نمایش تازهٔ محصولاتی که به‌زودی روی سفره می‌آیند</span>
      </div>

      <ul className={styles.slots} aria-hidden={unveiled ? undefined : true}>
        {UNVEIL_FUTURE_PRODUCTS.map((product, index) => (
          <li key={product.id} className={styles.slot}>
            <UnveilProductSlot index={index} />
          </li>
        ))}
      </ul>
      <span className="v2-section-edge v2-section-edge--bottom" aria-hidden="true" />
    </section>
  );
}
