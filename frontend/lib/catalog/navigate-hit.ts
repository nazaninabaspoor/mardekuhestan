import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import type { CatalogSearchHit } from "@/lib/catalog/static-search";

/** مسیر نمایش محصول در سکشن کاتالوگ /v2 */
export function kitchenProductUrl(hit: CatalogSearchHit): string {
  const cat = encodeURIComponent(hit.categoryId);
  const product = encodeURIComponent(hit.id);
  return `/v2?cat=${cat}&p=${product}#for-home-kitchen`;
}

export function navigateCatalogHit(
  hit: CatalogSearchHit,
  router: AppRouterInstance,
  pathname: string,
) {
  if (pathname === "/v2" || pathname.startsWith("/v2/") || pathname === "/") {
    router.push(kitchenProductUrl(hit));
    return;
  }

  router.push(hit.href);
}

export function catalogResultsPageUrl(query: string, pathname: string): string {
  const q = encodeURIComponent(query.trim());
  if (pathname === "/v2" || pathname.startsWith("/v2/")) {
    return `/products?q=${q}`;
  }
  return `/products?q=${q}`;
}
