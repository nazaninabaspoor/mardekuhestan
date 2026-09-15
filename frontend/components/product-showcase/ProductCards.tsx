"use client";

import { useEffect, useRef, useState } from "react";

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
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateArrows = () => {
    const el = trackRef.current;
    if (!el) {
      setCanPrev(false);
      setCanNext(false);
      return;
    }
    const max = el.scrollWidth - el.clientWidth;
    // RTL: scrollLeft can be negative in some browsers
    const left = Math.abs(el.scrollLeft);
    setCanPrev(left > 8);
    setCanNext(left < max - 8);
  };

  const scroll = (direction: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    // In RTL track, "next" should reveal items toward the visual left (older products).
    el.scrollBy({ left: direction * -320, behavior: "smooth" });
    window.setTimeout(updateArrows, 320);
  };

  useEffect(() => {
    updateArrows();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [products]);

  useEffect(() => {
    if (!highlightId) return;
    const card = document.getElementById(`catalog-product-${highlightId}`);
    if (!card) return;
    card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    window.setTimeout(updateArrows, 320);
  }, [highlightId, products]);

  const showArrows = products.length > 6;

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
            aria-label="محصولات قبلی"
            disabled={!canPrev}
            onClick={() => scroll(-1)}
          >
            ‹
          </button>
          <button
            type="button"
            className={styles.arrow}
            aria-label="محصولات بعدی"
            disabled={!canNext}
            onClick={() => scroll(1)}
          >
            ›
          </button>
        </div>
      ) : null}
    </section>
  );
}
