"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import type { ProductCategory } from "@/data/productCategories";

import styles from "./ProductStage.module.css";

type ProductStageProps = { category: ProductCategory };

const particles = Array.from({ length: 16 }, (_, index) => ({
  left: `${34 + ((index * 17) % 34)}%`,
  top: `${19 + ((index * 23) % 31)}%`,
  animationDelay: `${(index % 7) * 0.17}s`,
}));

export function ProductStage({ category }: ProductStageProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className={styles.stage}>
      <span className={styles.cable} aria-hidden="true" />
      <div className={styles.lamp} aria-hidden="true">
        <Image src="/brand/v2/pendant-lamp.png" alt="" width={190} height={150} priority />
      </div>
      <div className={styles.beam} aria-hidden="true" />
      <div className={styles.coreLight} aria-hidden="true" />
      <div className={styles.particles} aria-hidden="true">
        {particles.map((particle, index) => <i key={index} style={particle} />)}
      </div>

      <div className={styles.productGroup}>
        <AnimatePresence mode="wait">
          <motion.div
            key={category.id}
            className={styles.plate}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: reduceMotion ? 0.12 : 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image src={category.heroImage} alt={category.headline} fill sizes="(max-width: 700px) 78vw, 520px" priority className={styles.productImage} />
            <span className={styles.plateHighlight} aria-hidden="true" />
          </motion.div>
        </AnimatePresence>
        <div className={styles.pedestal} aria-hidden="true">
          <span className={styles.pedestalTop} />
          <span className={styles.pedestalBody} />
          <span className={styles.goldRim} />
        </div>
        <div className={styles.floorShadow} aria-hidden="true" />
      </div>
    </div>
  );
}
