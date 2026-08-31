import { homeCategoryProducts, type HomeDoorId } from "@/lib/brand";
import {
  apiKeyForBrandKey,
  domainLabelForBrandKey,
} from "@/lib/catalog/brand-keys";
import type { CatalogProductCard } from "@/lib/catalog/map";
import { normalizeFa, searchTokens } from "@/lib/catalog/normalize-fa";

export type CatalogSearchHit = CatalogProductCard & {
  categoryId: string;
  domainLabel: string;
};

type IndexedHit = CatalogSearchHit & { blob: string };

let indexCache: IndexedHit[] | null = null;

function buildIndex(): IndexedHit[] {
  if (indexCache) return indexCache;

  const rows: IndexedHit[] = [];
  for (const brandKey of Object.keys(homeCategoryProducts) as HomeDoorId[]) {
    const categoryId = apiKeyForBrandKey(brandKey);
    const domainLabel = domainLabelForBrandKey(brandKey);

    for (const item of homeCategoryProducts[brandKey]) {
      const hit: CatalogSearchHit = {
        id: item.id,
        name: item.name,
        note: item.note,
        href: `/products/${item.id}`,
        image: item.image,
        alt: item.alt,
        categoryId,
        domainLabel,
      };
      const blob = normalizeFa(
        [item.name, item.note, item.teaser, item.story, domainLabel, categoryId].join(" "),
      );
      rows.push({ ...hit, blob });
    }
  }

  indexCache = rows;
  return rows;
}

function scoreHit(needle: string, tokens: string[], row: IndexedHit): number {
  const name = normalizeFa(row.name);
  let score = 0;

  if (name === needle) score += 200;
  else if (name.startsWith(needle)) score += 120;
  else if (name.includes(needle)) score += 80;

  if (normalizeFa(row.note).includes(needle)) score += 40;
  if (row.blob.includes(needle)) score += 25;

  for (const token of tokens) {
    if (name.startsWith(token)) score += 35;
    else if (name.includes(token)) score += 20;
    else if (row.blob.includes(token)) score += 10;
  }

  return score;
}

export function searchStaticCatalog(query: string, limit = 8): CatalogSearchHit[] {
  const needle = normalizeFa(query);
  if (!needle) return [];

  const tokens = searchTokens(query);
  const ranked = buildIndex()
    .map((row) => ({ row, score: scoreHit(needle, tokens, row) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.row.name.localeCompare(b.row.name, "fa"));

  const seen = new Set<string>();
  const hits: CatalogSearchHit[] = [];
  for (const { row } of ranked) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    const { blob: _blob, ...hit } = row;
    hits.push(hit);
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
