import { apiFetch } from "@/lib/api/client";
import { DEFAULT_SALES_CHANNEL } from "@/lib/api/config";
import type {
  CatalogCategory,
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
  return apiFetch<CatalogDomain[]>("/api/products/domains/", {
    revalidate: false,
    cache: "no-store",
  });
}

function unwrapList<T>(payload: T[] | Paginated<T>): T[] {
  if (Array.isArray(payload)) return payload;
  return payload.results || [];
}

/** Active storefront categories from Django admin (دسته‌ها). */
export async function listProductCategories(params?: {
  kind?: string;
  domain?: string;
}): Promise<CatalogCategory[]> {
  const payload = await apiFetch<CatalogCategory[] | Paginated<CatalogCategory>>(
    "/api/products/categories/",
    {
      searchParams: {
        kind: params?.kind,
        domain: params?.domain,
        page_size: 100,
      },
      revalidate: false,
      cache: "no-store",
    },
  );
  return unwrapList(payload).filter((item) => item.is_active);
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
    revalidate: false,
    cache: "no-store",
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
