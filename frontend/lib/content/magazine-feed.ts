import type { ArticleListItem } from "@/lib/api/content.types";
import { articleCover, formatFaDate } from "@/lib/content/media";
import { magazinePins, type MagazinePin, searchPins } from "@/data/magazine-issue";

export type MagTone = "forest" | "gold" | "earth" | "sage";

export type MagPinData = {
  href: string;
  title: string;
  image: string;
  goods: string[];
  stack?: string;
  aspect: string;
  category?: string;
  excerpt?: string;
  height: "tall" | "mid" | "wide";
  tone: MagTone;
  variant: 1 | 2 | 3 | 4;
};

const PACK_FALLBACKS = [
  "/magazine/png/png-lamb-chops.png",
  "/magazine/png/png-bread.png",
  "/magazine/png/png-honeycomb.png",
  "/magazine/png/png-fish.png",
  "/magazine/png/png-stew.png",
  "/magazine/png/png-cheese.png",
  "/magazine/png/png-sheep.png",
  "/magazine/png/png-yogurt.png",
] as const;

function goodsForArticle(article: ArticleListItem): string[] {
  const cover = article.cover_image || "";
  if (cover && !cover.includes("/magazine/shots/")) {
    return [articleCover(cover, article.id)];
  }
  const first = PACK_FALLBACKS[Math.abs(article.id) % PACK_FALLBACKS.length];
  const second = PACK_FALLBACKS[(Math.abs(article.id) + 3) % PACK_FALLBACKS.length];
  return first === second ? [first] : [first, second];
}

const HEIGHTS = ["tall", "mid", "wide"] as const;
const ASPECTS = ["3 / 4", "1 / 1", "4 / 3"] as const;

export function toneForCategory(slug?: string): MagTone {
  if (slug === "rah-ma") return "forest";
  if (slug === "masir-ghaza") return "earth";
  if (slug === "zendegi-khane") return "gold";
  if (slug === "mazraeh") return "sage";
  return "forest";
}

export function posterVariant(key: string): 1 | 2 | 3 | 4 {
  let n = 0;
  for (const char of key) n += char.charCodeAt(0);
  return ((n % 4) + 1) as 1 | 2 | 3 | 4;
}

export function articleToPin(article: ArticleListItem): MagPinData {
  const height = HEIGHTS[Math.abs(article.id) % 3];
  const goods = goodsForArticle(article);
  return {
    href: `/magazine/${article.slug}`,
    title: article.title,
    image: goods[0],
    goods,
    category: article.categories[0]?.name,
    excerpt: article.excerpt,
    height,
    aspect: ASPECTS[Math.abs(article.id) % 3],
    tone: toneForCategory(article.categories[0]?.slug),
    variant: posterVariant(article.slug),
  };
}

export function issueToPin(pin: MagazinePin): MagPinData {
  const goods = pin.goods?.length ? pin.goods : [pin.image];
  return {
    href: `/magazine/${pin.slug}`,
    title: pin.title,
    image: pin.image,
    goods,
    stack: pin.stack,
    category: pin.categoryName,
    excerpt: pin.excerpt,
    height: pin.height,
    aspect: pin.aspect,
    tone: toneForCategory(pin.categorySlug),
    variant: posterVariant(pin.slug),
  };
}

export function mergeMagazinePins(apiArticles: ArticleListItem[], query = "") {
  const fromApi = apiArticles.map(articleToPin);
  const seen = new Set(fromApi.map((pin) => pin.href));
  const fromIssue = searchPins(query)
    .map(issueToPin)
    .filter((pin) => !seen.has(pin.href));
  return [...fromApi, ...fromIssue];
}

export function mergeCategoryPins(apiArticles: ArticleListItem[], categorySlug: string) {
  const fromApi = apiArticles.map(articleToPin);
  const seen = new Set(fromApi.map((pin) => pin.href));
  const fromIssue = magazinePins
    .filter((pin) => pin.categorySlug === categorySlug)
    .map(issueToPin)
    .filter((pin) => !seen.has(pin.href));
  return [...fromApi, ...fromIssue];
}

export function articleDateLabel(article: ArticleListItem) {
  return formatFaDate(article.published_at);
}

export const MAG_PAGE_SIZE = 10;

export function parseMagazinePage(value?: string) {
  const n = Number.parseInt(value || "1", 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export function paginatePins<T>(items: T[], page: number, size = MAG_PAGE_SIZE) {
  const pageCount = Math.max(1, Math.ceil(items.length / size));
  const current = Math.min(Math.max(1, page), pageCount);
  const start = (current - 1) * size;
  return {
    items: items.slice(start, start + size),
    page: current,
    pageCount,
    total: items.length,
    hasPrev: current > 1,
    hasNext: current < pageCount,
  };
}

export function magazineListHref(opts: {
  page?: number;
  q?: string;
  category?: string;
  path?: string;
  hash?: string;
}) {
  const params = new URLSearchParams();
  if (opts.q) params.set("q", opts.q);
  if (opts.page && opts.page > 1) params.set("page", String(opts.page));
  const base = opts.path || (opts.category ? `/magazine/category/${opts.category}` : "/magazine");
  const qs = params.toString();
  const href = qs ? `${base}?${qs}` : base;
  return opts.hash ? `${href}${opts.hash}` : href;
}
