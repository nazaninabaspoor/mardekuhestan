"use client";

import { useEffect, useRef } from "react";

import { ProductCard, type ShowcaseProduct } from "./ProductCard";
import styles from "./ProductCards.module.css";

type ProductCardsProps = {
  title: string;
  products: ReadonlyArray<ShowcaseProduct>;
  highlightId?: string | null;
  onProductClick?: (product: ShowcaseProduct) => void;
};

export function ProductCards({
  title,
  products = [],
  highlightId = null,
  onProductClick,
}: ProductCardsProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);

  const focusIndex = Math.max(
    0,
    products.findIndex((product) => product.id === highlightId),
  );

  const goTo = (index: number) => {
    if (!products.length) return;
    const nextIndex = (index + products.length) % products.length;
    const next = products[nextIndex];
    if (!next) return;
    onProductClick?.(next);
    window.requestAnimationFrame(() => {
      const card = document.getElementById(`catalog-product-${next.id}`);
      card?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    });
  };

  useEffect(() => {
    if (!highlightId) return;
    const card = document.getElementById(`catalog-product-${highlightId}`);
    if (!card) return;
    card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [highlightId, products]);

  const showArrows = products.length > 1;

  return (
    <section className={styles.rail} aria-label={title}>
      <header className={styles.header}>
        <span aria-hidden="true" />
        <h3>{title}</h3>
        <span aria-hidden="true" />
      </header>

      <div ref={trackRef} className={styles.products}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            highlighted={product.id === highlightId}
            onClick={onProductClick}
          />
        ))}
      </div>

      {showArrows ? (
        <div className={styles.nav} aria-label="ورق زدن محصولات">
          <button
            type="button"
            className={styles.arrow}
            aria-label="محصول قبلی"
            onClick={() => goTo(focusIndex - 1)}
          >
            ‹
          </button>
          <button
            type="button"
            className={styles.arrow}
            aria-label="محصول بعدی"
            onClick={() => goTo(focusIndex + 1)}
          >
            ›
          </button>
        </div>
      ) : null}
    </section>
  );
}
