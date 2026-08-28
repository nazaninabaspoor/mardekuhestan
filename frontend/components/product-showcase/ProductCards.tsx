"use client";

import type { ProductCategory, ProductCategoryId } from "@/data/productCategories";
import { ProductCard } from "./ProductCard";
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
          return <ProductCard key={category.id} category={category} active={active} onClick={() => onChange(category.id)} />;
        })}
      </div>
      <button type="button" className={styles.arrow} aria-label="دسته بعدی" onClick={() => cycle(1)}>›</button>
    </div>
  );
}
