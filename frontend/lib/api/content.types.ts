export type ContentCategory = {
  id: number;
  name: string;
  slug: string;
  description: string;
  parent: number | null;
  is_active: boolean;
  article_count?: number;
};

export type ContentTag = {
  id: number;
  name: string;
  slug: string;
};

export type ContentCluster = {
  id: number;
  pillar: number;
  title: string;
  slug: string;
  description?: string;
  target_keyword: string;
  is_active: boolean;
};

export type ContentPillar = {
  id: number;
  title: string;
  slug: string;
  description: string;
  primary_keyword: string;
  is_active: boolean;
  clusters: ContentCluster[];
};

export type ArticleListItem = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  focus_keyword: string;
  seo_title: string;
  seo_description: string;
  content_role: string;
  search_intent: string;
  pillar: number | null;
  cluster: number | null;
  categories: ContentCategory[];
  tags: ContentTag[];
  cover_image: string | null;
  word_count: number;
  reading_time_minutes: number;
  published_at: string | null;
  updated_at: string;
  author_name: string;
};

export type ArticleDetail = ArticleListItem & {
  body: string;
  secondary_keywords: string[];
  breadcrumb_title: string;
  canonical_url: string;
  robots_index: boolean;
  robots_follow: boolean;
  og_title: string;
  og_description: string;
  og_image: string | null;
  geo_summary: string;
  geo_key_facts: string[];
  geo_entities: string[];
  geo_faq: Array<Record<string, string>>;
  schema_json: Record<string, unknown> | null;
  internal_links: Array<Record<string, string>>;
  pillar_detail: ContentPillar | null;
  cluster_detail: ContentCluster | null;
  related: ArticleListItem[];
  status: string;
  created_at: string;
  readiness: Record<string, boolean>;
};

export type PaginatedContent<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};
