import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MagArticle, type MagStory } from "@/components/magazine/mag-article";
import { pinArticleFaqs, pinArticleHeadline, pinArticleHtml, pinArticlePack } from "@/data/magazine-reading";
import { magazinePins, pinBySlug, relatedPins } from "@/data/magazine-issue";
import { ApiError } from "@/lib/api/client";
import { getArticleBySlug } from "@/lib/api/content";
import type { ArticleDetail } from "@/lib/api/content.types";
import { articleCover, faqPairs, formatFaDate, resolveMediaUrl } from "@/lib/content/media";
import { articleToPin, issueToPin, toneForCategory } from "@/lib/content/magazine-feed";
import { magazineArticleGraph } from "@/lib/content/magazine-schema";

type Params = { slug: string };

function countWords(html: string) {
  return html.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
}

async function loadArticle(slug: string) {
  try {
    return await getArticleBySlug(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    return null;
  }
}

function storyFromApi(article: ArticleDetail): MagStory {
  const category = article.categories[0];
  const body = article.body || "";
  return {
    slug: article.slug,
    title: article.title,
    headline: article.title,
    excerpt: article.excerpt || article.geo_summary,
    updatedLabel: formatFaDate(article.updated_at) || undefined,
    body,
    image: articleCover(article.cover_image, article.id),
    author: article.author_name,
    date: formatFaDate(article.published_at),
    publishedAt: article.published_at || undefined,
    updatedAt: article.updated_at,
    minutes: article.reading_time_minutes,
    wordCount: article.word_count || countWords(body),
    categorySlug: category?.slug,
    categoryName: category?.name,
    geo: article.geo_summary,
    faqs: faqPairs(article.geo_faq),
    tags: article.tags.map((tag) => ({ slug: tag.slug, name: tag.name })),
    related:
      (article.related || []).length
        ? (article.related || []).map(articleToPin)
        : relatedPins(article.slug, category?.slug || "").map(issueToPin),
    tone: toneForCategory(category?.slug),
  };
}

function readingMinutes(words: number) {
  return Math.max(2, Math.round(words / 160) || 2);
}

export function generateStaticParams() {
  return magazinePins.map((pin) => ({ slug: pin.slug }));
}

function storyFromPin(slug: string): MagStory | null {
  const pin = pinBySlug(slug);
  if (!pin) return null;
  const pack = pinArticlePack(pin);
  const body = pinArticleHtml(pin);
  const wordCount = countWords(body);
  return {
    slug: pin.slug,
    title: pin.title,
    headline: pinArticleHeadline(pin),
    excerpt: pack?.excerpt || pin.excerpt,
    body,
    image: pack?.hero || pin.image,
    imageAlt: pack?.heroAlt,
    imageCaption: pack?.heroCaption,
    imagePhoto: Boolean(pack?.hero),
    author: pin.author,
    date: pin.date,
    publishedAt: pack?.publishedAt,
    updatedAt: pack?.updatedAt,
    updatedLabel: pack?.updatedAt ? formatFaDate(pack.updatedAt) : undefined,
    minutes: readingMinutes(wordCount),
    wordCount,
    categorySlug: pin.categorySlug,
    categoryName: pin.categoryName,
    geo: pack?.geo,
    faqs: pinArticleFaqs(pin),
    faqTitle: pack ? "سوالات متداول درباره راه سبز" : undefined,
    tags: pack?.tags || [{ slug: pin.categorySlug, name: pin.categoryName }],
    keywords: pack?.keywords,
    images: pack?.images,
    related: relatedPins(pin.slug, pin.categorySlug).map(issueToPin),
    tone: toneForCategory(pin.categorySlug),
  };
}

async function resolveStory(slug: string) {
  const pin = pinBySlug(slug);
  if (pin && pinArticlePack(pin)) return storyFromPin(slug);
  const article = await loadArticle(slug);
  if (article) return storyFromApi(article);
  return storyFromPin(slug);
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const pin = pinBySlug(slug);
  const pack = pin ? pinArticlePack(pin) : null;
  if (pin && pack) {
    const headline = pinArticleHeadline(pin);
    const title = pack.seoTitle;
    const description = pack.seoDescription;
    return {
      title,
      description,
      keywords: pack.keywords,
      alternates: { canonical: `/magazine/${pin.slug}` },
      openGraph: {
        title: headline,
        description,
        type: "article",
        locale: "fa_IR",
        siteName: "مرد کوهستان",
        publishedTime: pack.publishedAt,
        modifiedTime: pack.updatedAt,
        images: [{ url: pack.hero, alt: pack.heroAlt }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [pack.hero],
      },
    };
  }
  const article = await loadArticle(slug);
  if (article) {
    const title = article.seo_title || `${article.title} | مجله مرد کوهستان`;
    const description = article.seo_description || article.excerpt || article.geo_summary;
    const image = article.og_image || article.cover_image;
    const imageUrl = image ? resolveMediaUrl(image) : articleCover(article.cover_image, article.id);
    return {
      title,
      description,
      keywords: [article.focus_keyword, ...article.secondary_keywords, ...article.tags.map((tag) => tag.name)].filter(
        Boolean,
      ),
      robots: {
        index: article.robots_index,
        follow: article.robots_follow,
      },
      alternates: {
        canonical: article.canonical_url || `/magazine/${article.slug}`,
      },
      openGraph: {
        title: article.og_title || title,
        description: article.og_description || description,
        type: "article",
        locale: "fa_IR",
        siteName: "مرد کوهستان",
        publishedTime: article.published_at || undefined,
        modifiedTime: article.updated_at,
        authors: article.author_name ? [article.author_name] : undefined,
        images: [{ url: imageUrl, alt: article.title }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
    };
  }
  if (!pin) return { title: "نوشته پیدا نشد | مرد کوهستان" };
  const headline = pinArticleHeadline(pin);
  const title = `${headline} | مجله مرد کوهستان`;
  const description = pin.excerpt;
  return {
    title,
    description,
    keywords: [pin.title, pin.categoryName, "مجله مرد کوهستان", "این راه سبز است", "غذای کوهستان"],
    alternates: { canonical: `/magazine/${pin.slug}` },
    openGraph: {
      title: headline,
      description,
      type: "article",
      locale: "fa_IR",
      siteName: "مرد کوهستان",
      images: [{ url: pin.image, alt: headline }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [pin.image],
    },
  };
}

export default async function MagazineArticlePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const story = await resolveStory(slug);
  if (!story) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(magazineArticleGraph(story)) }}
      />
      <MagArticle story={story} />
    </>
  );
}
