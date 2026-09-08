import { apiFetch } from "@/lib/api/client";
import type {
  ArticleDetail,
  ArticleListItem,
  ContentCategory,
  ContentTag,
  PaginatedContent,
} from "@/lib/api/content.types";

const PAGE_SIZE = 12;

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
    revalidate: 60,
  });
}

export async function getArticleBySlug(slug: string): Promise<ArticleDetail> {
  return apiFetch<ArticleDetail>(`/api/content/articles/${encodeURIComponent(slug)}/`, {
    revalidate: 60,
  });
}

export async function listCategories(): Promise<PaginatedContent<ContentCategory> | ContentCategory[]> {
  return apiFetch<PaginatedContent<ContentCategory> | ContentCategory[]>("/api/content/categories/", {
    revalidate: 120,
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
