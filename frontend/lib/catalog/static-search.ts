import { homeCategoryProducts, type HomeDoorId } from "@/lib/brand";
import { domainLabelForBrandKey } from "@/lib/catalog/brand-keys";
import type { CatalogProductCard } from "@/lib/catalog/map";
import { matchesCatalogPrefix, normalizeFa } from "@/lib/catalog/normalize-fa";

export type CatalogSearchHit = CatalogProductCard & {
  categoryId: string;
  domainLabel: string;
};

type IndexedHit = CatalogSearchHit;

let indexCache: IndexedHit[] | null = null;

function buildIndex(): IndexedHit[] {
  if (indexCache) return indexCache;

  const rows: IndexedHit[] = [];
  for (const brandKey of Object.keys(homeCategoryProducts) as HomeDoorId[]) {
    const domainLabel = domainLabelForBrandKey(brandKey);

    for (const item of homeCategoryProducts[brandKey]) {
      rows.push({
        id: item.id,
        name: item.name,
        note: item.note,
        href: item.href,
        image: item.image,
        alt: item.alt,
        categoryId: brandKey,
        domainLabel,
      });
    }
  }

  indexCache = rows;
  return rows;
}

export function filterCatalogPrefixHits(
  hits: CatalogSearchHit[],
  query: string,
): CatalogSearchHit[] {
  const needle = normalizeFa(query);
  if (!needle) return [];
  return hits.filter((hit) => matchesCatalogPrefix(hit.name, query));
}

export function searchStaticCatalog(query: string, limit = 8): CatalogSearchHit[] {
  const needle = normalizeFa(query);
  if (!needle) return [];

  const ranked = buildIndex()
    .filter((row) => matchesCatalogPrefix(row.name, query))
    .sort((a, b) => a.name.localeCompare(b.name, "fa"));

  const seen = new Set<string>();
  const hits: CatalogSearchHit[] = [];
  for (const row of ranked) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    hits.push(row);
    if (hits.length >= limit) break;
  }
  return hits;
}

export function mergeSearchHits(
  primary: CatalogSearchHit[],
  secondary: CatalogSearchHit[],
  limit = 8,
): CatalogSearchHit[] {
  const map = new Map<string, CatalogSearchHit>();
  for (const hit of [...primary, ...secondary]) {
    if (!map.has(hit.id)) map.set(hit.id, hit);
  }
  return [...map.values()].slice(0, limit);
}
