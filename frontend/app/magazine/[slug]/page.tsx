import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MagArticle, type MagStory } from "@/components/magazine/mag-article";
import { MagReadProgress } from "@/components/magazine/mag-chrome";
import { pinArticleHtml } from "@/data/magazine-reading";
import { pinBySlug, relatedPins } from "@/data/magazine-issue";
import { ApiError } from "@/lib/api/client";
import { getArticleBySlug } from "@/lib/api/content";
import type { ArticleDetail } from "@/lib/api/content.types";
import { articleCover, faqPairs, formatFaDate, resolveMediaUrl } from "@/lib/content/media";
import { articleToPin, issueToPin, plainMagazineCopy, toneForCategory } from "@/lib/content/magazine-feed";
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
    excerpt: plainMagazineCopy(article.excerpt),
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
    related: (article.related || []).map(articleToPin),
    tone: toneForCategory(category?.slug),
  };
}

function storyFromPin(slug: string): MagStory | null {
  const pin = pinBySlug(slug);
  if (!pin) return null;
  const body = pinArticleHtml(pin);
  return {
    slug: pin.slug,
    title: pin.title,
    excerpt: plainMagazineCopy(pin.excerpt),
    body,
    image: pin.image,
    author: pin.author,
    date: pin.date,
    minutes: pin.minutes,
    wordCount: countWords(body),
    categorySlug: pin.categorySlug,
    categoryName: pin.categoryName,
    faqs: [],
    tags: [],
    related: relatedPins(pin.slug, pin.categorySlug).map(issueToPin),
    tone: toneForCategory(pin.categorySlug),
  };
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
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
  const pin = pinBySlug(slug);
  if (!pin) return { title: "نوشته پیدا نشد | مرد کوهستان" };
  const title = `${pin.title} | مجله مرد کوهستان`;
  const description = plainMagazineCopy(pin.excerpt);
  return {
    title,
    description,
    alternates: { canonical: `/magazine/${pin.slug}` },
    openGraph: {
      title: pin.title,
      description,
      type: "article",
      locale: "fa_IR",
      images: [{ url: pin.image, alt: pin.title }],
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
  const article = await loadArticle(slug);
  const story = article ? storyFromApi(article) : storyFromPin(slug);
  if (!story) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(magazineArticleGraph(story)) }}
      />
      <MagReadProgress />
      <MagArticle story={story} />
    </>
  );
}
