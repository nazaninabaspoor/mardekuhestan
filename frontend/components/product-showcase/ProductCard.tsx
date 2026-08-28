"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

import type { ProductCategory } from "@/data/productCategories";

import { CategoryIcon } from "./CategoryIcon";
import styles from "./ProductCards.module.css";

type ProductCardProps = {
  category: ProductCategory;
  active: boolean;
  onClick: () => void;
};

export function ProductCard({ category, active, onClick }: ProductCardProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      className={`${styles.card}${active ? ` ${styles.active}` : ""}`}
      aria-label={`نمایش دسته ${category.title}`}
      aria-pressed={active}
      onClick={onClick}
      whileHover={reduceMotion ? undefined : { y: -3 }}
      whileTap={reduceMotion ? undefined : { scale: 0.985 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className={styles.visual}>
        <motion.span
          className={styles.visualMotion}
          animate={active && !reduceMotion ? { scale: 1.025 } : { scale: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image src={category.cardImage} alt={category.title} fill sizes="220px" />
        </motion.span>
      </span>
      <span className={styles.caption}>
        <span className={styles.icon}><CategoryIcon id={category.id} /></span>
        <strong>{category.title}</strong>
      </span>
    </motion.button>
  );
}
