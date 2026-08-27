"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { ProductCards } from "@/components/product-showcase/ProductCards";
import { ProductStage } from "@/components/product-showcase/ProductStage";
import { ProductTabs } from "@/components/product-showcase/ProductTabs";
import { productCategories, type ProductCategoryId } from "@/data/productCategories";
import { homeCategoryProducts } from "@/lib/brand";
import { playCategoryBell } from "@/lib/v2-bell-audio";
import styles from "./for-home-kitchen.module.css";

const DEFAULT_CATEGORY: ProductCategoryId = "seafood";

export function ForHomeKitchen() {
  const rootRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();
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
    <section ref={rootRef} id="for-home-kitchen" className={`${styles.section}${visible ? ` ${styles.visible}` : ""}`} data-category={activeCategoryId} aria-labelledby="product-showcase-title">
      <div className={styles.landscape} aria-hidden="true" />
      <div className={styles.roadGlow} aria-hidden="true" />
      <div className={styles.vignette} aria-hidden="true" />

      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.headingRow}>
            <span className={styles.leafMark} aria-hidden="true">⌁</span>
            <h2 id="product-showcase-title">منتخب محصولات مرد کوهستان</h2>
          </div>
          <ProductTabs categories={productCategories} activeCategoryId={activeCategoryId} onChange={selectCategory} menuClassName={styles.tabs} itemClassName={styles.tab} activeItemClassName={styles.activeTab} />
        </header>

        <div className={styles.composition}>
          <AnimatePresence mode="wait">
            <motion.div key={activeCategory.id} className={styles.copy} initial={reduceMotion ? false : { opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: reduceMotion ? 0 : 0.38, ease: [0.22, 1, 0.36, 1] }}>
              <p className={styles.eyebrow}><i aria-hidden="true" />{activeCategory.eyebrow}<i aria-hidden="true" /></p>
              <h3>{activeCategory.headline}</h3>
              <p className={styles.description}>{activeCategory.description}</p>
              <div className={styles.actions}>
                <Link className={styles.primaryAction} href={firstProduct?.href ?? "/products"}><span aria-hidden="true">←</span> مشاهده محصول</Link>
                <button className={styles.videoAction} type="button"><span aria-hidden="true">▷</span> پخش ویدیو</button>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className={styles.stageWrap}>
            <ProductStage category={activeCategory} />
            <div className={styles.qualitySeal} aria-label="تازه از دل کوهستان، به سفره شما"><strong>تازه از دل کوهستان</strong><span>به سفره شما</span></div>
          </div>
          <div className={styles.balanceSpace} aria-hidden="true" />
        </div>

        <ProductCards categories={productCategories} activeCategoryId={activeCategoryId} onChange={selectCategory} />
      </div>
    </section>
  );
}
