import type { CatalogCategory, CatalogProductListItem } from "@/lib/api/catalog.types";
import { listProductCategories, listProducts } from "@/lib/api/catalog";
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

function adminCategoryToDoor(category: CatalogCategory): ProductCategory {
  const frontendKey = category.domain_frontend_key || category.slug;
  const display = domainDisplay(frontendKey);
  const shortTitle = category.name.split(/\s+/)[0] ?? category.name;
  return {
    id: category.slug,
    title: shortTitle,
    eyebrow: "از مزرعه تا سفره",
    headline: category.name,
    description:
      category.description?.trim() ||
      "تازه و قابل اعتماد — از مسیر سبز مرد کوهستان.",
    heroImage: display.plateImage,
    cardImage: display.plateImage,
    video: "/brand/teaser.mp4",
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

function mergeProducts(
  primary: CatalogProductListItem[],
  secondary: CatalogProductListItem[],
): ShowcaseProduct[] {
  const seen = new Set<string>();
  const out: ShowcaseProduct[] = [];
  for (const item of [...primary, ...secondary]) {
    const key = item.public_uuid || item.slug || String(item.id);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(toCard(item));
  }
  return out;
}

/**
 * Homepage kitchen doors = active admin categories.
 * Products: by category slug, plus same-domain products (so admin domain alone is enough).
 */
export async function loadV2KitchenCatalog(): Promise<V2KitchenCatalogPayload> {
  try {
    const adminCategories = await listProductCategories({ kind: "navigation" });
    const pool =
      adminCategories.length > 0
        ? adminCategories
        : await listProductCategories();

    if (!pool.length) return staticKitchenPayload();

    const loaded = await Promise.all(
      pool.map(async (category) => {
        const [byCategory, byDomain] = await Promise.all([
          listProducts({
            category: category.slug,
            pageSize: FOR_KITCHEN_PAGE_SIZE,
          }),
          category.domain
            ? listProducts({
                domain: category.domain,
                pageSize: FOR_KITCHEN_PAGE_SIZE,
              })
            : Promise.resolve({ results: [] as CatalogProductListItem[] }),
        ]);
        const apiProducts = mergeProducts(
          byCategory.results || [],
          byDomain.results || [],
        );
        return { category, apiProducts };
      }),
    );

    const categories: ProductCategory[] = [];
    const productsByCategory: Record<string, ShowcaseProduct[]> = {};

    for (const { category, apiProducts } of loaded) {
      if (apiProducts.length === 0) continue;
      categories.push(adminCategoryToDoor(category));
      productsByCategory[category.slug] = apiProducts;
    }

    if (!categories.length) return staticKitchenPayload();

    return {
      categories,
      productsByCategory,
      source: "api",
      apiReachable: true,
    };
  } catch {
    return staticKitchenPayload();
  }
}
