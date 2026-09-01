"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ProductCards } from "@/components/product-showcase/ProductCards";
import { ProductInfo } from "@/components/product-showcase/ProductInfo";
import { ProductStage } from "@/components/product-showcase/ProductStage";
import { ProductTabs } from "@/components/product-showcase/ProductTabs";
import { ProductDetailModal } from "@/components/product-detail/product-detail-modal";
import { getProductDetail, type ProductDetailData } from "@/lib/catalog/product-details";
import type { ShowcaseProduct } from "@/components/product-showcase/ProductCard";
import {
  productCategories,
  type ProductCategory,
} from "@/data/productCategories";
import { homeCategoryProducts, type HomeDoorId } from "@/lib/brand";
import {
  API_KEY_TO_BRAND_KEY,
  BRAND_KEY_TO_API_KEY,
} from "@/lib/catalog/brand-keys";
import {
  CATALOG_FOCUS_EVENT,
  type CatalogFocusDetail,
} from "@/lib/catalog/catalog-focus";
import { normalizeFa } from "@/lib/catalog/normalize-fa";
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
  dairy: "dairy",
  "fresh-meat": "fresh-meat",
  seafood: "seafood",
  bakery: "bakery",
  sausage: "sausage",
};

type FocusTarget = {
  categoryId: string;
  productId: string;
};

function categoryExists(
  id: string | null | undefined,
  categories: ReadonlyArray<ProductCategory>,
): id is string {
  return Boolean(id && categories.some((category) => category.id === id));
}

function namesMatch(left: string, right: string): boolean {
  const a = normalizeFa(left);
  const b = normalizeFa(right);
  return Boolean(a) && a === b;
}

function findProductInCategory(
  products: ReadonlyArray<ShowcaseProduct>,
  productId: string | null,
  productName: string | null,
): ShowcaseProduct | undefined {
  if (productId) {
    const byId = products.find((item) => item.id === productId);
    if (byId) return byId;
  }
  if (!productName) return undefined;
  return products.find((item) => namesMatch(item.name, productName));
}

function mapToKitchenCategory(
  rawCat: string | null,
  categories: ReadonlyArray<ProductCategory>,
): string | null {
  if (!rawCat) return null;
  const mappedApi = BRAND_KEY_TO_API_KEY[rawCat as HomeDoorId];
  const mappedBrand = API_KEY_TO_BRAND_KEY[rawCat];
  const candidates = [rawCat, CATEGORY_ALIASES[rawCat], mappedApi, mappedBrand].filter(
    (id): id is string => Boolean(id),
  );
  for (const id of candidates) {
    if (categoryExists(id, categories)) return id;
  }
  return null;
}

/** اول دسته، بعد محصول داخل همان دسته — نه جستجو در دسته‌های دیگر */
function resolveKitchenFocus(
  rawCat: string | null,
  productId: string | null,
  productName: string | null,
  categories: ReadonlyArray<ProductCategory>,
  productsByCategory: Record<string, ShowcaseProduct[]>,
): FocusTarget | null {
  if (!productId && !productName && !rawCat) return null;

  const categoryId = mapToKitchenCategory(rawCat, categories);
  if (categoryId) {
    const hit = findProductInCategory(
      productsByCategory[categoryId] ?? [],
      productId,
      productName,
    );
    return { categoryId, productId: hit?.id ?? productId ?? "" };
  }

  if (productId) {
    for (const category of categories) {
      const hit = (productsByCategory[category.id] ?? []).find((item) => item.id === productId);
      if (hit) return { categoryId: category.id, productId: hit.id };
    }
  }

  if (productName) {
    for (const category of categories) {
      const hit = (productsByCategory[category.id] ?? []).find((item) =>
        namesMatch(item.name, productName),
      );
      if (hit) return { categoryId: category.id, productId: hit.id };
    }
  }

  return null;
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
  const [focusTick, setFocusTick] = useState(0);
  const [pinnedProduct, setPinnedProduct] = useState<ShowcaseProduct | null>(null);
  const [detailProduct, setDetailProduct] = useState<ProductDetailData | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const focusTimerRef = useRef<number | null>(null);

  const categories = catalog?.categories ?? productCategories;
  const productsByCategory = useMemo(() => {
    if (catalog?.productsByCategory) return catalog.productsByCategory;
    return Object.fromEntries(
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
    ) as Record<string, ShowcaseProduct[]>;
  }, [catalog]);

  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    categories[0]?.id ?? DEFAULT_CATEGORY,
  );

  const activeCategory =
    categories.find((category) => category.id === activeCategoryId) ??
    categories[0];
  const catalogProducts = productsByCategory[activeCategoryId] ?? [];
  const activeProducts = useMemo(() => {
    if (!pinnedProduct) return catalogProducts;
    const alreadyThere = catalogProducts.some(
      (item) =>
        item.id === pinnedProduct.id || namesMatch(item.name, pinnedProduct.name),
    );
    if (alreadyThere) return catalogProducts;
    return [pinnedProduct, ...catalogProducts];
  }, [catalogProducts, pinnedProduct]);
  const firstProduct = activeProducts[0];
  const heroProduct =
    activeProducts.find((item) => item.id === focusProductId) ?? firstProduct;

  const applyFocus = useCallback(
    (
      cat: string | null,
      productId: string | null,
      productName: string | null,
      extra?: { image?: string; href?: string; alt?: string } | null,
    ) => {
      const focus = resolveKitchenFocus(
        cat,
        productId,
        productName,
        categories,
        productsByCategory,
      );
      const categoryId = focus?.categoryId ?? mapToKitchenCategory(cat, categories);
      if (!categoryId) return;

      const inCategory = findProductInCategory(
        productsByCategory[categoryId] ?? [],
        focus?.productId || productId,
        productName,
      );
      const resolvedProductId = inCategory?.id ?? (extra?.image ? productId : focus?.productId) ?? null;

      if (inCategory) {
        setPinnedProduct(null);
      } else if (extra?.image && productId && productName) {
        setPinnedProduct({
          id: productId,
          name: productName,
          href: extra.href ?? "/#for-home-kitchen",
          image: extra.image,
          alt: extra.alt ?? productName,
        });
      }

      const switchCategory = categoryId !== activeCategoryId;
      if (focusTimerRef.current) window.clearTimeout(focusTimerRef.current);
      if (switchCategory) {
        setActiveCategoryId(categoryId);
        setFocusProductId(null);
        void playCategoryBell();
        focusTimerRef.current = window.setTimeout(() => {
          if (resolvedProductId) setFocusProductId(resolvedProductId);
          setFocusTick((tick) => tick + 1);
        }, 90);
        return;
      }

      if (resolvedProductId) setFocusProductId(resolvedProductId);
      setFocusTick((tick) => tick + 1);
    },
    [activeCategoryId, categories, productsByCategory],
  );

  useEffect(() => {
    const cat = searchParams.get("cat");
    const productId = searchParams.get("p");
    const productName = searchParams.get("n");
    if (!cat && !productId && !productName) return;
    applyFocus(cat, productId, productName);
  }, [searchParams, applyFocus]);

  useEffect(() => {
    const onFocus = (event: Event) => {
      const detail = (event as CustomEvent<CatalogFocusDetail>).detail;
      if (!detail) return;
      applyFocus(detail.categoryId, detail.productId, detail.productName, {
        image: detail.image,
        href: detail.href,
        alt: detail.alt,
      });
    };
    window.addEventListener(CATALOG_FOCUS_EVENT, onFocus);
    return () => window.removeEventListener(CATALOG_FOCUS_EVENT, onFocus);
  }, [applyFocus]);

  useEffect(() => {
    const productId = focusProductId;
    if (!productId) return;

    let cancelled = false;
    let attempts = 0;

    const run = () => {
      if (cancelled) return;
      const section = document.getElementById("for-home-kitchen");
      const card = document.getElementById(`catalog-product-${productId}`);

      if (!card) {
        attempts += 1;
        if (attempts < 20) {
          window.setTimeout(run, 80);
        }
        return;
      }

      section?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => {
        if (cancelled) return;
        card.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 180);
    };

    const frame = window.requestAnimationFrame(run);
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [focusProductId, focusTick, activeCategoryId, activeProducts]);

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
    setFocusProductId(null);
    setPinnedProduct(null);
    void playCategoryBell();
  };

  const openProductDetail = (prod?: ShowcaseProduct | null) => {
    const target = prod || heroProduct;
    const detail = getProductDetail(
      target?.id || activeCategoryId,
      activeCategoryId,
      target?.name || activeCategory?.headline,
      target?.image || activeCategory?.heroImage,
    );
    setDetailProduct(detail);
    setIsDetailOpen(true);
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
              productName={focusProductId ? heroProduct?.name : null}
              onViewProduct={() => openProductDetail()}
              onPlayVideo={() => openProductDetail()}
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
            onProductClick={(p) => openProductDetail(p)}
          />
        ) : (
          <p className={styles.emptyCatalog}>
            {catalog?.apiReachable
              ? "هنوز محصول فعالی در این دسته نیست — از Admin یک محصول active بساز."
              : "به‌زودی محصولات این دسته از مسیر سبز می‌رسند."}
          </p>
        )}
      </div>

      <ProductDetailModal
        isOpen={isDetailOpen}
        product={detailProduct}
        onClose={() => setIsDetailOpen(false)}
      />
    </section>
  );
}
