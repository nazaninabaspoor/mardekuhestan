"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { ProductCards } from "@/components/product-showcase/ProductCards";
import { ProductInfo } from "@/components/product-showcase/ProductInfo";
import { ProductStage } from "@/components/product-showcase/ProductStage";
import { ProductTabs } from "@/components/product-showcase/ProductTabs";
import type { ShowcaseProduct } from "@/components/product-showcase/ProductCard";
import {
  productCategories,
  type ProductCategory,
} from "@/data/productCategories";
import { homeCategoryProducts, type HomeDoorId } from "@/lib/brand";
import type { V2KitchenCatalogPayload } from "@/lib/catalog/v2-kitchen";
import { playCategoryBell } from "@/lib/v2-bell-audio";

import styles from "./for-home-kitchen.module.css";

const DEFAULT_CATEGORY = productCategories[1]?.id ?? "seafood";

const CATEGORY_ALIASES: Record<string, string> = {
  agriculture: "farm",
  farm: "agriculture",
  ready: "ready-meal",
  "ready-meal": "ready",
  "ready-to-cook": "cook-ready",
  "cook-ready": "ready-to-cook",
};

function resolveKitchenCategoryId(
  rawCat: string | null,
  productId: string | null,
  categories: ProductCategory[],
  productsByCategory: Record<string, ShowcaseProduct[]>,
): string | null {
  const pick = (id: string | null | undefined) =>
    id && categories.some((category) => category.id === id) ? id : null;

  const fromParam = pick(rawCat);
  if (fromParam) return fromParam;

  if (rawCat && CATEGORY_ALIASES[rawCat]) {
    const aliased = pick(CATEGORY_ALIASES[rawCat]);
    if (aliased) return aliased;
  }

  if (productId) {
    for (const category of categories) {
      const products = productsByCategory[category.id] ?? [];
      if (products.some((item) => item.id === productId)) {
        return category.id;
      }
    }
  }

  return rawCat;
}

type ForHomeKitchenProps = {
  catalog?: V2KitchenCatalogPayload;
};

export function ForHomeKitchen({ catalog }: ForHomeKitchenProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [focusProductId, setFocusProductId] = useState<string | null>(null);

  const categories = catalog?.categories ?? productCategories;
  const productsByCategory =
    catalog?.productsByCategory ??
    Object.fromEntries(
      productCategories.map((category) => [
        category.id,
        (homeCategoryProducts[category.id as HomeDoorId] ?? []).map((item) => ({
          id: item.id,
          name: item.name,
          href: item.href,
          image: item.image,
          alt: item.alt,
        })),
      ]),
    );

  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    categories[0]?.id ?? DEFAULT_CATEGORY,
  );

  const activeCategory =
    categories.find((category) => category.id === activeCategoryId) ??
    categories[0];
  const activeProducts = productsByCategory[activeCategoryId] ?? [];
  const firstProduct = activeProducts[0];
  const heroProduct =
    activeProducts.find((item) => item.id === focusProductId) ?? firstProduct;

  useEffect(() => {
    const cat = searchParams.get("cat");
    const productId = searchParams.get("p");
    const resolvedCat = resolveKitchenCategoryId(
      cat,
      productId,
      categories,
      productsByCategory,
    );

    if (resolvedCat) {
      setActiveCategoryId(resolvedCat);
    }
    if (productId) {
      setFocusProductId(productId);
    }
  }, [searchParams, categories, productsByCategory]);

  useEffect(() => {
    const productId = searchParams.get("p");
    if (!productId) return;

    const scrollToProduct = () => {
      document.getElementById("for-home-kitchen")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      window.setTimeout(() => {
        document
          .getElementById(`catalog-product-${productId}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 320);
    };

    const frame = window.requestAnimationFrame(scrollToProduct);
    return () => window.cancelAnimationFrame(frame);
  }, [searchParams, activeCategoryId, activeProducts]);

  useEffect(() => {
    if (!categories.some((category) => category.id === activeCategoryId)) {
      setActiveCategoryId(categories[0]?.id ?? DEFAULT_CATEGORY);
    }
  }, [categories, activeCategoryId]);

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

  const selectCategory = (id: string) => {
    if (id === activeCategoryId) return;
    setActiveCategoryId(id);
    void playCategoryBell();
  };

  if (!activeCategory) return null;

  return (
    <section
      ref={rootRef}
      id="for-home-kitchen"
      className={`${styles.section}${visible ? ` ${styles.visible}` : ""}`}
      data-category={activeCategoryId}
      data-catalog-source={catalog?.source ?? "static"}
      aria-labelledby="product-showcase-title"
    >
      <div className={styles.landscape} aria-hidden="true" />
      <div className={styles.vignette} aria-hidden="true" />
      <div className={styles.mountainFog} aria-hidden="true" />
      <div className={styles.bottomBridge} aria-hidden="true" />
      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.headingRow}>
            <h2 id="product-showcase-title">محصولات مرد کوهستان</h2>
          </div>
          <ProductTabs
            categories={categories}
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
              onViewProduct={() =>
                router.push(heroProduct?.href ?? `/products?cat=${activeCategoryId}`)
              }
              onPlayVideo={(category) => {
                if (category.video) {
                  window.open(category.video, "_blank", "noopener,noreferrer");
                }
              }}
            />
          </div>

          <div className={styles.stageWrap}>
            <ProductStage
              category={{
                ...activeCategory,
                heroImage: heroProduct?.image ?? activeCategory.heroImage,
              }}
            />
            <div className={styles.qualitySeal} aria-label="تازه از دل کوهستان، به سفره شما">
              <strong>تازه از دل کوهستان</strong>
              <span>به سفره شما</span>
            </div>
          </div>
          <div className={styles.balanceSpace} aria-hidden="true" />
        </div>

        {activeProducts.length ? (
          <ProductCards
            title={`انواع ${activeCategory.title}`}
            products={activeProducts as ReadonlyArray<ShowcaseProduct>}
            highlightId={focusProductId}
          />
        ) : (
          <p className={styles.emptyCatalog}>
            {catalog?.apiReachable
              ? "هنوز محصول فعالی در این دسته نیست — از Admin یک محصول active بساز."
              : "به‌زودی محصولات این دسته از مسیر سبز می‌رسند."}
          </p>
        )}
      </div>
    </section>
  );
}
