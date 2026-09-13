import { apiFetch } from "@/lib/api/client";
import type {
  ArticleDetail,
  ArticleListItem,
  ContentCategory,
  ContentTag,
  MagazinePageSettings,
  PaginatedContent,
} from "@/lib/api/content.types";

const PAGE_SIZE = 12;

/** Fresh enough that studio publish/delete shows up quickly on /magazine. */
const MAG_REVALIDATE = 10;

export async function listArticles(params: {
  category?: string;
  tag?: string;
  pillar?: string;
  cluster?: string;
  q?: string;
  page?: number;
  pageSize?: number;
} = {}): Promise<PaginatedContent<ArticleListItem>> {
  return apiFetch<PaginatedContent<ArticleListItem>>("/api/content/articles/", {
    searchParams: {
      category: params.category,
      tag: params.tag,
      pillar: params.pillar,
      cluster: params.cluster,
      q: params.q,
      page: params.page ?? 1,
      page_size: params.pageSize ?? PAGE_SIZE,
    },
    revalidate: MAG_REVALIDATE,
  });
}

export async function getArticleBySlug(slug: string): Promise<ArticleDetail> {
  return apiFetch<ArticleDetail>(`/api/content/articles/${encodeURIComponent(slug)}/`, {
    revalidate: MAG_REVALIDATE,
  });
}

export async function listCategories(opts?: {
  magazineOnly?: boolean;
}): Promise<PaginatedContent<ContentCategory> | ContentCategory[]> {
  return apiFetch<PaginatedContent<ContentCategory> | ContentCategory[]>(
    "/api/content/categories/",
    {
      searchParams: opts?.magazineOnly ? { magazine: "1" } : undefined,
      revalidate: MAG_REVALIDATE,
    },
  );
}

export async function getMagazinePageSettings(): Promise<MagazinePageSettings> {
  return apiFetch<MagazinePageSettings>("/api/content/magazine-page/", {
    revalidate: MAG_REVALIDATE,
  });
}

export async function listTags(): Promise<PaginatedContent<ContentTag> | ContentTag[]> {
  return apiFetch<PaginatedContent<ContentTag> | ContentTag[]>("/api/content/tags/", {
    revalidate: 120,
  });
}

export function unwrapResults<T>(payload: PaginatedContent<T> | T[]): T[] {
  return Array.isArray(payload) ? payload : payload.results || [];
}
