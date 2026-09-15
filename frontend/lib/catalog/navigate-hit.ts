import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import {
  catalogFocusFromHit,
  emitCatalogFocus,
} from "@/lib/catalog/catalog-focus";
import type { CatalogSearchHit } from "@/lib/catalog/static-search";

export function kitchenProductUrl(hit: CatalogSearchHit): string {
  const params = new URLSearchParams({
    cat: hit.categoryId,
    p: hit.id,
    n: hit.name,
  });
  return `/?${params.toString()}#for-home-kitchen`;
}

export function navigateCatalogHit(
  hit: CatalogSearchHit,
  router: AppRouterInstance,
  pathname: string,
) {
  if (pathname === "/" || pathname === "/v2" || pathname.startsWith("/v2/")) {
    emitCatalogFocus(catalogFocusFromHit(hit));
    router.push(kitchenProductUrl(hit));
    return;
  }

  router.push(kitchenProductUrl(hit));
}

export function catalogResultsPageUrl(query: string, _pathname: string): string {
  const q = encodeURIComponent(query.trim());
  return `/?q=${q}#for-home-kitchen`;
}
