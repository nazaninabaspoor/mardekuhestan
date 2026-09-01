import type { CatalogSearchHit } from "@/lib/catalog/static-search";

export const CATALOG_FOCUS_EVENT = "mk:catalog-focus";

export type CatalogFocusDetail = {
  categoryId: string;
  productId: string;
  productName: string;
  image: string;
  href: string;
  alt: string;
};

export function catalogFocusFromHit(hit: CatalogSearchHit): CatalogFocusDetail {
  return {
    categoryId: hit.categoryId,
    productId: hit.id,
    productName: hit.name,
    image: hit.image,
    href: hit.href,
    alt: hit.alt,
  };
}

export function emitCatalogFocus(detail: CatalogFocusDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CATALOG_FOCUS_EVENT, { detail }));
}
