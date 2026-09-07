import type { ArticleListItem } from "@/lib/api/content.types";
import { articleCover, formatFaDate } from "@/lib/content/media";
import {
  magazineBoards,
  magazinePins,
  type MagazinePin,
  searchPins,
} from "@/data/magazine-issue";

export type MagPinData = {
  href: string;
  title: string;
  image: string;
  category?: string;
  excerpt?: string;
  height: "tall" | "mid" | "wide";
};

const HEIGHTS = ["tall", "mid", "wide"] as const;

export function articleToPin(article: ArticleListItem): MagPinData {
  return {
    href: `/magazine/${article.slug}`,
    title: article.title,
    image: articleCover(article.cover_image, article.id),
    category: article.categories[0]?.name,
    excerpt: article.excerpt,
    height: HEIGHTS[Math.abs(article.id) % 3],
  };
}

export function issueToPin(pin: MagazinePin): MagPinData {
  return {
    href: `/magazine/${pin.slug}`,
    title: pin.title,
    image: pin.image,
    category: pin.categoryName,
    excerpt: pin.excerpt,
    height: pin.height,
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

export function magazineBoardsForNav() {
  return magazineBoards;
}

export function articleDateLabel(article: ArticleListItem) {
  return formatFaDate(article.published_at);
}
