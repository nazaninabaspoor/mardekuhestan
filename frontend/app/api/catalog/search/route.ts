import { NextResponse } from "next/server";

import { listProducts } from "@/lib/api/catalog";
import { mapProductToCard } from "@/lib/catalog/map";
import {
  filterCatalogPrefixHits,
  searchStaticCatalog,
  type CatalogSearchHit,
} from "@/lib/catalog/static-search";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (!q) {
    return NextResponse.json({ count: 0, results: [] });
  }

  try {
    const page = await listProducts({ q, pageSize: 8 });
    const apiHits: CatalogSearchHit[] = page.results.map((item) => {
      const card = mapProductToCard(item);
      return {
        ...card,
        categoryId: card.categoryId ?? item.domain_frontend_key,
        domainLabel: card.domainLabel ?? item.domain_label_fa,
      };
    });
    const filtered = filterCatalogPrefixHits(apiHits, q);
    const results =
      filtered.length > 0
        ? filtered
        : searchStaticCatalog(q, 8);
    return NextResponse.json({
      count: results.length,
      results,
      source: apiHits.length > 0 ? "api" : "static-fallback",
    });
  } catch {
    const results = searchStaticCatalog(q, 8);
    return NextResponse.json({
      count: results.length,
      results,
      source: "static-fallback",
    });
  }
}
