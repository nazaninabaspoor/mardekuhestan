import type { CatalogDomain } from "@/lib/api/catalog.types";
import { listDomains, listProducts } from "@/lib/api/catalog";
import { domainDisplay } from "@/lib/catalog/domain-display";
import { mapProductToCard } from "@/lib/catalog/map";
import type { ShowcaseProduct } from "@/components/product-showcase/ProductCard";
import {
  productCategories,
  type ProductCategory,
} from "@/data/productCategories";
import { homeCategoryProducts, type HomeDoorId } from "@/lib/brand";
import { brandCategoryItems } from "@/lib/catalog/brand-keys";

export type V2KitchenCatalogPayload = {
  categories: ProductCategory[];
  productsByCategory: Record<string, ShowcaseProduct[]>;
  source: "api" | "static";
  apiReachable: boolean;
};

const V2_STATIC_KEY_MAP: Record<string, string> = {
  ready: "ready-meal",
  agriculture: "farm",
};

const FOR_KITCHEN_PAGE_SIZE = 12;

function staticProductsForApiKey(frontendKey: string): ShowcaseProduct[] {
  return brandCategoryItems(frontendKey).map((item) => ({
    id: item.id,
    name: item.name,
    href: `/products/${item.id}`,
    image: item.image,
    alt: item.alt,
  }));
}

function staticKitchenPayload(): V2KitchenCatalogPayload {
  const productsByCategory: Record<string, ShowcaseProduct[]> = {};
  for (const category of productCategories) {
    const items = homeCategoryProducts[category.id as HomeDoorId] ?? [];
    productsByCategory[category.id] = items.map((item) => ({
      id: item.id,
      name: item.name,
      href: item.href,
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

function domainToCategory(domain: CatalogDomain): ProductCategory {
  const frontendKey = domain.frontend_query_key;
  const staticId = V2_STATIC_KEY_MAP[frontendKey] ?? frontendKey;
  const preset = productCategories.find((item) => item.id === staticId);
  const display = domainDisplay(frontendKey);

  if (preset) {
    return {
      ...preset,
      id: frontendKey,
      title: preset.title,
      headline: domain.label_fa,
    };
  }

  const shortTitle = domain.label_fa.split(/\s+/)[0] ?? domain.label_fa;
  return {
    id: frontendKey,
    title: shortTitle,
    eyebrow: "از مزرعه تا سفره",
    headline: domain.label_fa,
    description: "تازه و قابل اعتماد — از مسیر سبز مرد کوهستان.",
    heroImage: display.plateImage,
    cardImage: display.plateImage,
    video: "/brand/teaser.mp4",
  };
}

export async function loadV2KitchenCatalog(): Promise<V2KitchenCatalogPayload> {
  try {
    const domains = await listDomains();
    if (!domains.length) return staticKitchenPayload();

    const categories = domains.map(domainToCategory);
    const productsByCategory: Record<string, ShowcaseProduct[]> = {};

    await Promise.all(
      domains.map(async (domain) => {
        const { results } = await listProducts({
          domain: domain.key,
          pageSize: FOR_KITCHEN_PAGE_SIZE,
        });
        const apiProducts = results.map((item) => {
          const card = mapProductToCard(item);
          return {
            id: card.id,
            name: card.name,
            href: card.href,
            image: card.image,
            alt: card.alt,
          };
        });
        const fallback = staticProductsForApiKey(domain.frontend_query_key);
        productsByCategory[domain.frontend_query_key] =
          apiProducts.length > 0 ? apiProducts : fallback;
      }),
    );

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
