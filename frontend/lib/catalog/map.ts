import { getApiBaseUrl } from "@/lib/api/config";
import type {
  CatalogDomain,
  CatalogProductDetail,
  CatalogProductListItem,
} from "@/lib/api/catalog.types";
import { domainDisplay } from "@/lib/catalog/domain-display";

export type CatalogDoor = {
  id: string;
  domainKey: string;
  label: string;
  emoji: string;
  href: string;
};

export type CatalogProductCard = {
  id: string;
  name: string;
  note: string;
  weight?: string;
  href: string;
  image: string;
  alt: string;
  price?: string;
};

export type ForHomeProductItem = CatalogProductCard & {
  story: string;
  teaser?: string;
};

export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const base = getApiBaseUrl();
  return `${base}${url.startsWith("/") ? url : `/${url}`}`;
}

export function mapDomainToDoor(domain: CatalogDomain): CatalogDoor {
  const display = domainDisplay(domain.frontend_query_key);
  return {
    id: domain.frontend_query_key,
    domainKey: domain.key,
    label: domain.label_fa,
    emoji: display.emoji,
    href: `/products?cat=${domain.frontend_query_key}`,
  };
}

export function mapProductToCard(
  product: CatalogProductListItem,
): CatalogProductCard {
  const fallback = domainDisplay(product.domain_frontend_key).plateImage;
  const image =
    resolveMediaUrl(product.hero_image?.url) ?? fallback;

  return {
    id: product.public_uuid || product.slug,
    name: product.name,
    note: product.subtitle || product.short_description || product.domain_label_fa,
    weight: product.net_weight_display || undefined,
    href: `/products/${product.slug}`,
    image,
    alt: product.hero_image?.alt_text || product.name,
    price: product.unit_price_display || undefined,
  };
}

export function mapProductToForHome(
  product: CatalogProductListItem,
): ForHomeProductItem {
  const card = mapProductToCard(product);
  return {
    ...card,
    teaser: product.short_description || product.subtitle,
    story:
      product.short_description ||
      product.subtitle ||
      `${product.name} — از مسیر مرتع تا سفره، با دقت انتخاب شده.`,
  };
}

export function mapDetailToCard(product: CatalogProductDetail): CatalogProductCard {
  return mapProductToCard(product);
}
