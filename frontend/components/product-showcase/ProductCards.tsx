"use client";

import Image from "next/image";

import type { ProductCategory, ProductCategoryId } from "@/data/productCategories";
import { CategoryIcon } from "./CategoryIcon";
import styles from "./ProductCards.module.css";

type ProductCardsProps = {
  categories: ReadonlyArray<ProductCategory>;
  activeCategoryId: ProductCategoryId;
  onChange: (id: ProductCategoryId) => void;
};

export function ProductCards({ categories, activeCategoryId, onChange }: ProductCardsProps) {
  const activeIndex = categories.findIndex((category) => category.id === activeCategoryId);
  const cycle = (direction: -1 | 1) => {
    const nextIndex = (activeIndex + direction + categories.length) % categories.length;
    onChange(categories[nextIndex].id);
  };

  return (
    <div className={styles.rail}>
      <button type="button" className={styles.arrow} aria-label="دسته قبلی" onClick={() => cycle(-1)}>‹</button>
      <div className={styles.cards}>
        {categories.map((category) => {
          const active = category.id === activeCategoryId;
          return (
            <button key={category.id} type="button" className={`${styles.card}${active ? ` ${styles.active}` : ""}`} aria-pressed={active} onClick={() => onChange(category.id)}>
              <span className={styles.visual}><Image src={category.cardImage} alt="" fill sizes="220px" /></span>
              <span className={styles.caption}><span className={styles.icon}><CategoryIcon id={category.id} /></span><strong>{category.title}</strong></span>
            </button>
          );
        })}
      </div>
      <button type="button" className={styles.arrow} aria-label="دسته بعدی" onClick={() => cycle(1)}>›</button>
    </div>
  );
}
