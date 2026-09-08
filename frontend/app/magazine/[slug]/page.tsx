import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MagMasonry } from "@/components/magazine/mag-card";
import { MagReadProgress } from "@/components/magazine/mag-chrome";
import { pinBySlug, relatedPins } from "@/data/magazine-issue";
import { ApiError } from "@/lib/api/client";
import { getArticleBySlug } from "@/lib/api/content";
import type { ArticleDetail } from "@/lib/api/content.types";
import { articleCover, faqPairs, formatFaDate, resolveMediaUrl } from "@/lib/content/media";
import { articleToPin, issueToPin, plainMagazineCopy, type MagPinData } from "@/lib/content/magazine-feed";

type Params = { slug: string };

type MagStory = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  image: string;
  author: string;
  date: string;
  minutes?: number;
  wordCount?: number;
  categorySlug?: string;
  categoryName?: string;
  geo?: string;
  faqs: Array<{ q: string; a: string }>;
  tags: Array<{ slug: string; name: string }>;
  related: MagPinData[];
  schema?: Record<string, unknown> | null;
};

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
  return {
    slug: article.slug,
    title: article.title,
    excerpt: plainMagazineCopy(article.excerpt),
    body: article.body || "",
    image: articleCover(article.cover_image, article.id),
    author: article.author_name,
    date: formatFaDate(article.published_at),
    minutes: article.reading_time_minutes,
    wordCount: article.word_count,
    categorySlug: category?.slug,
    categoryName: category?.name,
    geo: article.geo_summary,
    faqs: faqPairs(article.geo_faq),
    tags: article.tags.map((tag) => ({ slug: tag.slug, name: tag.name })),
    related: (article.related || []).map(articleToPin),
    schema: article.schema_json,
  };
}

function storyFromPin(slug: string): MagStory | null {
  const pin = pinBySlug(slug);
  if (!pin) return null;
  return {
    slug: pin.slug,
    title: pin.title,
    excerpt: plainMagazineCopy(pin.excerpt),
    body: pin.body,
    image: pin.image,
    author: pin.author,
    date: pin.date,
    minutes: pin.minutes,
    categorySlug: pin.categorySlug,
    categoryName: pin.categoryName,
    faqs: [],
    tags: [],
    related: relatedPins(pin.slug, pin.categorySlug).map(issueToPin),
  };
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await loadArticle(slug);
  if (article) {
    const title = article.seo_title || `${article.title} | مجله مرد کوهستان`;
    const description = article.seo_description || article.excerpt || article.geo_summary;
    const image = article.og_image || article.cover_image;
    return {
      title,
      description,
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
        publishedTime: article.published_at || undefined,
        modifiedTime: article.updated_at,
        images: image ? [{ url: resolveMediaUrl(image) }] : [{ url: articleCover(article.cover_image, article.id) }],
      },
    };
  }
  const pin = pinBySlug(slug);
  if (!pin) return { title: "نوشته پیدا نشد | مرد کوهستان" };
  return {
    title: `${pin.title} | مجله مرد کوهستان`,
    description: pin.excerpt,
    alternates: { canonical: `/magazine/${pin.slug}` },
    openGraph: {
      title: pin.title,
      description: pin.excerpt,
      type: "article",
      images: [{ url: pin.image }],
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
      {story.schema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(story.schema) }}
        />
      ) : null}
      <MagReadProgress />
      <article>
        <div className="mk-mag-shell">
          <nav className="mk-mag-crumbs" aria-label="مسیر صفحه">
            <Link href="/magazine">مجله</Link>
            <span>/</span>
            {story.categorySlug ? (
              <>
                <Link href={`/magazine/category/${story.categorySlug}`}>{story.categoryName}</Link>
                <span>/</span>
              </>
            ) : null}
            <span>{story.title}</span>
          </nav>

          <div className="mk-mag-article-hero">
            <Image src={story.image} alt="" fill priority sizes="100vw" />
          </div>

          <header className="mk-mag-article-head">
            {story.categoryName ? <p className="mk-mag-label">{story.categoryName}</p> : <p className="mk-mag-kicker">مجله مرد کوهستان</p>}
            <h1>{story.title}</h1>
            <div className="mk-mag-article-byline">
              {story.author ? <span>{story.author}</span> : null}
              {story.date ? <span>{story.date}</span> : null}
              {story.minutes ? <span>{story.minutes} دقیقه خواندن</span> : null}
              {story.wordCount ? <span>{story.wordCount.toLocaleString("fa-IR")} کلمه</span> : null}
            </div>
          </header>
        </div>

        <div className="mk-mag-prose-wrap">
          {story.geo ? (
            <aside className="mk-mag-geo">
              <p>{story.geo}</p>
            </aside>
          ) : story.excerpt ? (
            <aside className="mk-mag-geo">
              <p>{story.excerpt}</p>
            </aside>
          ) : null}
          <div className="mk-mag-body" dangerouslySetInnerHTML={{ __html: story.body || "" }} />
          {story.faqs.length ? (
            <section className="mk-mag-faq">
              <h2>پرسش‌های این راه</h2>
              {story.faqs.map((item) => (
                <details key={item.q}>
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </section>
          ) : null}
          {story.tags.length ? (
            <div className="mk-mag-tags">
              {story.tags.map((tag) => (
                <Link key={tag.slug} className="mk-mag-chip" href={`/magazine?q=${encodeURIComponent(tag.name)}`}>
                  {tag.name}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </article>

      {story.related.length ? (
        <section className="mk-mag-related mk-mag-shell">
          <h2>ایده‌های نزدیک</h2>
          <MagMasonry pins={story.related} />
        </section>
      ) : null}
    </>
  );
}
