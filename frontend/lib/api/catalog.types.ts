export type CatalogDomain = {
  key: string;
  slug: string;
  label_fa: string;
  frontend_query_key: string;
  sort_order: number;
  default_storage: string;
  requires_cold_chain: boolean;
};

export type CatalogHeroImage = {
  id: number;
  public_uuid: string;
  role: string;
  url: string | null;
  alt_text: string;
  sort_order: number;
};

export type CatalogProductListItem = {
  id: number;
  public_uuid: string;
  name: string;
  slug: string;
  subtitle: string;
  short_description: string;
  domain: string;
  unit_price_rial: number | null;
  unit_price_display: string;
  net_weight_display: string;
  domain_label_fa: string;
  domain_slug: string;
  domain_frontend_key: string;
  hero_image: CatalogHeroImage | null;
  category_slugs: string[];
  is_available: boolean;
  sort_order: number;
};

export type CatalogProductDetail = CatalogProductListItem & {
  images: CatalogHeroImage[];
  variants: Array<{
    id: number;
    public_uuid: string;
    label: string;
    sku: string;
    unit_price_display: string;
    is_active: boolean;
  }>;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  allergens_detail: Array<{ key: string; label_fa: string }>;
  storage_class: string;
  packaging_type: string;
  halal_status: string;
};

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};
