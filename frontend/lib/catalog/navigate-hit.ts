import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import type { CatalogSearchHit } from "@/lib/catalog/static-search";

export function navigateCatalogHit(
  hit: CatalogSearchHit,
  router: AppRouterInstance,
  pathname: string,
) {
  const cat = encodeURIComponent(hit.categoryId);
  const product = encodeURIComponent(hit.id);

  if (pathname === "/v2" || pathname.startsWith("/v2/")) {
    router.push(`/v2?cat=${cat}&p=${product}#for-home-kitchen`);
    return;
  }

  if (pathname === "/") {
    router.push(`/?cat=${cat}&p=${product}#for-home-kitchen`);
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
