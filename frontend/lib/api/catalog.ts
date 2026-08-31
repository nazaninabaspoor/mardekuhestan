import { apiFetch } from "@/lib/api/client";
import { DEFAULT_SALES_CHANNEL } from "@/lib/api/config";
import type {
  CatalogDomain,
  CatalogProductDetail,
  CatalogProductListItem,
  Paginated,
} from "@/lib/api/catalog.types";

type ListProductsParams = {
  domain?: string;
  category?: string;
  q?: string;
  channel?: string;
  page?: number;
  pageSize?: number;
};

export async function listDomains(): Promise<CatalogDomain[]> {
  return apiFetch<CatalogDomain[]>("/api/products/domains/");
}

export async function listProducts(
  params: ListProductsParams = {},
): Promise<Paginated<CatalogProductListItem>> {
  const channel = params.channel ?? DEFAULT_SALES_CHANNEL;

  if (params.q?.trim()) {
    return apiFetch<Paginated<CatalogProductListItem>>("/api/products/search/", {
      searchParams: {
        q: params.q.trim(),
        domain: params.domain,
        category: params.category,
        channel,
        page: params.page ?? 1,
        page_size: params.pageSize ?? 24,
      },
    });
  }

  return apiFetch<Paginated<CatalogProductListItem>>("/api/products/", {
    searchParams: {
      domain: params.domain,
      category: params.category,
      channel,
      page: params.page ?? 1,
      page_size: params.pageSize ?? 24,
    },
  });
}

export async function getProductBySlug(
  slug: string,
  channel = DEFAULT_SALES_CHANNEL,
): Promise<CatalogProductDetail> {
  return apiFetch<CatalogProductDetail>(`/api/products/${slug}/`, {
    searchParams: { channel },
  });
}

export async function getProductByUuid(
  uuid: string,
  channel = DEFAULT_SALES_CHANNEL,
): Promise<CatalogProductDetail> {
  return apiFetch<CatalogProductDetail>(`/api/products/by-uuid/${uuid}/`, {
    searchParams: { channel },
  });
}

export function resolveDomainFromCat(
  domains: CatalogDomain[],
  cat?: string,
): CatalogDomain | undefined {
  if (!cat) return undefined;
  return domains.find(
    (item) =>
      item.frontend_query_key === cat ||
      item.slug === cat ||
      item.key === cat,
  );
}
