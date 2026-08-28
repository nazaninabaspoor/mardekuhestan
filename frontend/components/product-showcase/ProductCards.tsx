"use client";

import { useRef } from "react";

import { ProductCard, type ShowcaseProduct } from "./ProductCard";
import styles from "./ProductCards.module.css";

type ProductCardsProps = {
  title: string;
  products: ReadonlyArray<ShowcaseProduct>;
};

export function ProductCards({ title, products = [] }: ProductCardsProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const scroll = (direction: -1 | 1) => {
    trackRef.current?.scrollBy({ left: direction * 360, behavior: "smooth" });
  };

  return (
    <section className={styles.rail} aria-label={title}>
      <header className={styles.header}>
        <span aria-hidden="true" />
        <h3>{title}</h3>
        <span aria-hidden="true" />
      </header>

      <button type="button" className={`${styles.arrow} ${styles.previous}`} aria-label="محصولات قبلی" onClick={() => scroll(-1)}>‹</button>
      <div ref={trackRef} className={styles.products}>
        {products.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
      <button type="button" className={`${styles.arrow} ${styles.next}`} aria-label="محصولات بعدی" onClick={() => scroll(1)}>›</button>
    </section>
  );
}
