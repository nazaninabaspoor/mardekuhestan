import type { ArticleListItem } from "@/lib/api/content.types";
import { articleCover, formatFaDate } from "@/lib/content/media";
import { magazinePins, type MagazinePin, searchPins } from "@/data/magazine-issue";

export type MagTone = "forest" | "gold" | "earth" | "sage";

export type MagPinData = {
  href: string;
  title: string;
  image: string;
  stack?: string;
  aspect: string;
  category?: string;
  excerpt?: string;
  height: "tall" | "mid" | "wide";
  tone: MagTone;
  variant: 1 | 2 | 3 | 4;
};

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
  return {
    href: `/magazine/${article.slug}`,
    title: article.title,
    image: articleCover(article.cover_image, article.id),
    category: article.categories[0]?.name,
    excerpt: article.excerpt,
    height,
    aspect: ASPECTS[Math.abs(article.id) % 3],
    tone: toneForCategory(article.categories[0]?.slug),
    variant: posterVariant(article.slug),
  };
}

export function issueToPin(pin: MagazinePin): MagPinData {
  return {
    href: `/magazine/${pin.slug}`,
    title: pin.title,
    image: pin.image,
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
