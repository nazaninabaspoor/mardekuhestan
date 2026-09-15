import { listDomains, listProducts } from "@/lib/api/catalog";
import type { CatalogDoor, ForHomeProductItem } from "@/lib/catalog/map";
import { mapDomainToDoor, mapProductToForHome } from "@/lib/catalog/map";
import { brandCategoryItems } from "@/lib/catalog/brand-keys";
import {
  homeCategoryProducts,
  homeDoors,
  type HomeDoorId,
} from "@/lib/brand";

export type ForHomeCatalogPayload = {
  doors: CatalogDoor[];
  productsByDoor: Record<string, ForHomeProductItem[]>;
  source: "api" | "static";
  apiReachable: boolean;
};

const FOR_HOME_PAGE_SIZE = 6;

function staticPayload(): ForHomeCatalogPayload {
  const doors: CatalogDoor[] = homeDoors.map((door) => ({
    id: door.id,
    domainKey: door.id,
    label: door.label,
    emoji: door.emoji,
    href: door.href,
  }));

  const productsByDoor: Record<string, ForHomeProductItem[]> = {};
  for (const key of Object.keys(homeCategoryProducts) as HomeDoorId[]) {
    productsByDoor[key] = homeCategoryProducts[key].map((item) => ({
      id: item.id,
      name: item.name,
      note: item.note,
      teaser: item.teaser,
      story: item.story,
      href: item.href,
      image: item.image,
      alt: item.alt,
    }));
  }

  return {
    doors,
    productsByDoor,
    source: "static",
    apiReachable: false,
  };
}

/** Server-side loader for homepage section 2 — prefers live catalog API. */
export async function loadForHomeCatalog(): Promise<ForHomeCatalogPayload> {
  try {
    const domains = await listDomains();
    if (!domains.length) {
      return staticPayload();
    }

    const doors = domains.map(mapDomainToDoor);
    const productsByDoor: Record<string, ForHomeProductItem[]> = {};

    await Promise.all(
      domains.map(async (domain) => {
        const { results } = await listProducts({
          domain: domain.key,
          pageSize: FOR_HOME_PAGE_SIZE,
        });
        const apiProducts = results.map(mapProductToForHome);
        const staticItems = brandCategoryItems(domain.frontend_query_key).map(
          (item) => ({
            id: item.id,
            name: item.name,
            note: item.note,
            teaser: item.teaser,
            story: item.story,
            href: `/products/${item.id}`,
            image: item.image,
            alt: item.alt,
          }),
        );
        productsByDoor[domain.frontend_query_key] =
          apiProducts.length > 0 ? apiProducts : staticItems;
      }),
    );

    return {
      doors,
      productsByDoor,
      source: "api",
      apiReachable: true,
    };
  } catch {
    return staticPayload();
  }
}
