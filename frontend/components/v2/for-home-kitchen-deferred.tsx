"use client";

import dynamic from "next/dynamic";
import { Suspense, useMemo } from "react";

import type { ShowcaseProduct } from "@/components/product-showcase/ProductCard";
import { productCategories } from "@/data/productCategories";
import { homeCategoryProducts, type HomeDoorId } from "@/lib/brand";
import type { V2KitchenCatalogPayload } from "@/lib/catalog/v2-kitchen";

const ForHomeKitchen = dynamic(
  () => import("@/components/v2/for-home-kitchen").then((mod) => mod.ForHomeKitchen),
  {
    ssr: false,
    loading: () => (
      <section
        aria-hidden
        style={{
          minHeight: "85vh",
          background:
            "linear-gradient(180deg, #0a5540 0%, #084735 24%, #063a2c 52%, #042f24 100%)",
        }}
      />
    ),
  },
);

function staticKitchenPayload(): V2KitchenCatalogPayload {
  const productsByCategory: Record<string, ShowcaseProduct[]> = {};
  for (const category of productCategories) {
    const items = homeCategoryProducts[category.id as HomeDoorId] ?? [];
    productsByCategory[category.id] = items.map((item) => ({
      id: item.id,
      name: item.name,
      href: `/products/${item.id}`,
      image: item.image,
      alt: item.alt,
    }));
  }
  return {
    categories: [...productCategories],
    productsByCategory,
    source: "static",
    apiReachable: false,
  };
}

/** Client-only kitchen — keeps catalog fetch off the first paint. */
export function ForHomeKitchenDeferred() {
  const catalog = useMemo(() => staticKitchenPayload(), []);
  return (
    <Suspense
      fallback={
        <section
          aria-hidden
          style={{
            minHeight: "85vh",
            background:
              "linear-gradient(180deg, #0a5540 0%, #084735 24%, #063a2c 52%, #042f24 100%)",
          }}
        />
      }
    >
      <ForHomeKitchen catalog={catalog} />
    </Suspense>
  );
}
