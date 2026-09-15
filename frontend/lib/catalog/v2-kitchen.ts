import type { CatalogCategory, CatalogDomain, CatalogProductListItem } from "@/lib/api/catalog.types";
import { listDomains, listProductCategories, listProducts } from "@/lib/api/catalog";
import { domainDisplay } from "@/lib/catalog/domain-display";
import { mapProductToCard } from "@/lib/catalog/map";
import type { ShowcaseProduct } from "@/components/product-showcase/ProductCard";
import {
  productCategories,
  type ProductCategory,
} from "@/data/productCategories";
import { homeCategoryProducts, type HomeDoorId } from "@/lib/brand";

export type V2KitchenCatalogPayload = {
  categories: ProductCategory[];
  productsByCategory: Record<string, ShowcaseProduct[]>;
  source: "api" | "static";
  apiReachable: boolean;
};

const FOR_KITCHEN_PAGE_SIZE = 80;

const V2_STATIC_KEY_MAP: Record<string, string> = {
  ready: "ready-meal",
  agriculture: "farm",
  bakery: "farm",
  sausage: "ready-meal",
  "ready-to-cook": "ready-meal",
  "ready-meals": "ready-meal",
};

export function staticKitchenPayload(): V2KitchenCatalogPayload {
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

function toCard(item: CatalogProductListItem): ShowcaseProduct {
  const card = mapProductToCard(item);
  return {
    id: card.id,
    name: card.name,
    href: card.href,
    image: card.image,
    alt: card.alt,
  };
}

function domainToDoor(
  domain: CatalogDomain,
  adminCategory?: CatalogCategory,
): ProductCategory {
  const frontendKey = domain.frontend_query_key;
  const staticId = V2_STATIC_KEY_MAP[frontendKey] ?? frontendKey;
  const preset = productCategories.find((item) => item.id === staticId);
  const display = domainDisplay(frontendKey);
  const label = adminCategory?.name || domain.label_fa;
  const shortTitle = label.split(/\s+/)[0] ?? label;

  if (preset) {
    return {
      ...preset,
      id: frontendKey,
      title: shortTitle,
      headline: label,
      description:
        adminCategory?.description?.trim() ||
        preset.description ||
        "تازه و قابل اعتماد — از مسیر سبز مرد کوهستان.",
    };
  }

  return {
    id: frontendKey,
    title: shortTitle,
    eyebrow: "از مزرعه تا سفره",
    headline: label,
    description:
      adminCategory?.description?.trim() ||
      "تازه و قابل اعتماد — از مسیر سبز مرد کوهستان.",
    heroImage: display.plateImage,
    cardImage: display.plateImage,
    video: "/brand/teaser.mp4",
  };
}

/**
 * Kitchen doors = product domains that have published products in Django.
 * IDs stay as frontend_query_key (fresh-meat, …) so UI state keeps working.
 */
export async function loadV2KitchenCatalog(): Promise<V2KitchenCatalogPayload> {
  try {
    const [domains, adminCategories] = await Promise.all([
      listDomains(),
      listProductCategories({ kind: "navigation" }).catch(() => [] as CatalogCategory[]),
    ]);

    if (!domains.length) return staticKitchenPayload();

    const byDomainAdmin = new Map(
      adminCategories.map((category) => [category.domain, category] as const),
    );

    const loaded = await Promise.all(
      domains.map(async (domain) => {
        try {
          const { results } = await listProducts({
            domain: domain.key,
            pageSize: FOR_KITCHEN_PAGE_SIZE,
          });
          return {
            domain,
            products: (results || []).map(toCard),
          };
        } catch {
          return { domain, products: [] as ShowcaseProduct[] };
        }
      }),
    );

    const categories: ProductCategory[] = [];
    const productsByCategory: Record<string, ShowcaseProduct[]> = {};

    for (const { domain, products } of loaded) {
      if (!products.length) continue;
      const door = domainToDoor(domain, byDomainAdmin.get(domain.key));
      categories.push(door);
      productsByCategory[door.id] = products;
    }

    if (!categories.length) return staticKitchenPayload();

    return {
      categories,
      productsByCategory,
      source: "api",
      apiReachable: true,
    };
  } catch (error) {
    console.error("[kitchen-catalog] API load failed, using static fallback", error);
    return staticKitchenPayload();
  }
}
