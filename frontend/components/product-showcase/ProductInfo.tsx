"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import type { ProductCategory } from "@/data/productCategories";
import { useCart } from "@/lib/cart-context";

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
  const { addToCart } = useCart();
  const [isQuickAdding, setIsQuickAdding] = useState(false);

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsQuickAdding(true);
    await addToCart({
      product_id: category.id,
      product_name: headline,
      product_image: category.heroImage || category.cardImage,
      portion: "۱ کیلوگرم",
      cut_type: "سهمیه تازه مرتع",
      unit_price_toman: 480000,
      quantity: 1,
    });
    setIsQuickAdding(false);
  };

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
              <span>مشاهده و انتخاب برش</span>
            </motion.button>

            <motion.button
              type="button"
              disabled={isQuickAdding}
              className={styles.quickCartAction}
              onClick={handleQuickAdd}
              whileHover={reduceMotion ? undefined : { y: -2 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              transition={{ duration: 0.2 }}
              title="افزودن سریع به سبد خرید"
            >
              <svg viewBox="0 0 24 24" width="17" height="17" stroke="currentColor" strokeWidth="2.2" fill="none">
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              <span>{isQuickAdding ? "در حال ثبت…" : "افزودن به سبد"}</span>
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
                <span>مستند مرتع</span>
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
