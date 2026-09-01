"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import type { ProductCategory } from "@/data/productCategories";

import styles from "./ProductInfo.module.css";

type ProductInfoProps = {
  category: ProductCategory;
  productName?: string | null;
  onViewProduct?: (category: ProductCategory) => void;
  onPlayVideo?: (category: ProductCategory) => void;
};

export function ProductInfo({
  category,
  productName = null,
  onViewProduct,
  onPlayVideo,
}: ProductInfoProps) {
  const reduceMotion = useReducedMotion();
  const headline = productName?.trim() || category.headline;

  return (
    <div className={styles.root}>
      <AnimatePresence mode="wait">
        <motion.div
          key={`${category.id}:${headline}`}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -14, y: 4 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 10, y: -2 }}
          transition={{ duration: reduceMotion ? 0.12 : 0.42, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowLine} aria-hidden="true" />
            <span>{category.eyebrow}</span>
            <span className={styles.eyebrowLine} aria-hidden="true" />
          </p>

          <h3>{headline}</h3>
          <p className={styles.description}>{category.description}</p>

          <div className={styles.actions}>
            <motion.button
              type="button"
              className={styles.primaryAction}
              onClick={() => onViewProduct?.(category)}
              whileHover={reduceMotion ? undefined : { y: -2 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <span>مشاهده محصول</span>
            </motion.button>

            {category.video && (
              <motion.button
                type="button"
                className={styles.videoAction}
                onClick={() => onPlayVideo?.(category)}
                whileHover={reduceMotion ? undefined : { y: -2 }}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <span>پخش ویدئو</span>
                <span className={styles.playIcon} aria-hidden="true">
                  <svg viewBox="0 0 24 24"><path d="m9 7 8 5-8 5V7Z" /></svg>
                </span>
              </motion.button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
