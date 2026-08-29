"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { ProductCards } from "@/components/product-showcase/ProductCards";
import { ProductInfo } from "@/components/product-showcase/ProductInfo";
import { ProductStage } from "@/components/product-showcase/ProductStage";
import { ProductTabs } from "@/components/product-showcase/ProductTabs";
import { productCategories, type ProductCategoryId } from "@/data/productCategories";
import { homeCategoryProducts } from "@/lib/brand";
import { playCategoryBell } from "@/lib/v2-bell-audio";

import styles from "./for-home-kitchen.module.css";

const DEFAULT_CATEGORY: ProductCategoryId = "seafood";

export function ForHomeKitchen() {
  const rootRef = useRef<HTMLElement | null>(null);
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<ProductCategoryId>(DEFAULT_CATEGORY);
  const activeCategory = productCategories.find((category) => category.id === activeCategoryId) ?? productCategories[1];
  const firstProduct = homeCategoryProducts[activeCategoryId]?.[0];

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.16 });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const selectCategory = (id: ProductCategoryId) => {
    if (id === activeCategoryId) return;
    setActiveCategoryId(id);
    void playCategoryBell();
  };

  return (
    <section
      ref={rootRef}
      id="for-home-kitchen"
      className={`${styles.section}${visible ? ` ${styles.visible}` : ""}`}
      data-category={activeCategoryId}
      aria-labelledby="product-showcase-title"
    >
      <div className={styles.landscape} aria-hidden="true" />
      <div className={styles.vignette} aria-hidden="true" />
      <div className={styles.mountainFog} aria-hidden="true" />
      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.headingRow}>
            <h2 id="product-showcase-title">محصولات مرد کوهستان</h2>
          </div>
          <ProductTabs
            categories={productCategories}
            activeCategoryId={activeCategoryId}
            onChange={selectCategory}
            menuClassName={styles.tabs}
            itemClassName={styles.tab}
            activeItemClassName={styles.activeTab}
          />
        </header>

        <div className={styles.composition}>
          <div className={styles.copy}>
            <ProductInfo
              category={activeCategory}
              onViewProduct={() => router.push(firstProduct?.href ?? "/products")}
              onPlayVideo={(category) => {
                if (category.video) window.open(category.video, "_blank", "noopener,noreferrer");
              }}
            />
          </div>

          <div className={styles.stageWrap}>
            <ProductStage category={activeCategory} />
            <div className={styles.qualitySeal} aria-label="تازه از دل کوهستان، به سفره شما">
              <strong>تازه از دل کوهستان</strong>
              <span>به سفره شما</span>
            </div>
          </div>
          <div className={styles.balanceSpace} aria-hidden="true" />
        </div>

        <ProductCards title={`انواع ${activeCategory.title}`} products={homeCategoryProducts[activeCategoryId]} />
      </div>
    </section>
  );
}
