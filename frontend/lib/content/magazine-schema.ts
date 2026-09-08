type StorySchema = {
  slug: string;
  title: string;
  headline?: string;
  excerpt: string;
  image: string;
  author: string;
  date?: string;
  publishedAt?: string;
  updatedAt?: string;
  minutes?: number;
  wordCount?: number;
  categoryName?: string;
  categorySlug?: string;
  faqs: Array<{ q: string; a: string }>;
};

const PUBLISHER = {
  "@type": "Organization",
  "@id": "/#organization",
  name: "مرد کوهستان",
  url: "/",
  logo: {
    "@type": "ImageObject",
    url: "/brand/logo.svg",
  },
};

export function magazineArticleGraph(story: StorySchema) {
  const url = `/magazine/${story.slug}`;
  const published = story.publishedAt;
  const modified = story.updatedAt || story.publishedAt;

  const article: Record<string, unknown> = {
    "@type": "Article",
    "@id": `${url}#article`,
    headline: story.headline || story.title,
    description: story.excerpt,
    inLanguage: "fa-IR",
    url,
    image: {
      "@type": "ImageObject",
      url: story.image,
      caption: story.title,
    },
    author: {
      "@type": "Organization",
      name: story.author || "تحریریه مرد کوهستان",
    },
    publisher: PUBLISHER,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    isPartOf: {
      "@type": "Periodical",
      name: "مجله مرد کوهستان",
    },
  };

  if (story.categoryName) article.articleSection = story.categoryName;
  if (published) article.datePublished = published;
  if (modified) article.dateModified = modified;
  if (story.wordCount) article.wordCount = story.wordCount;
  if (story.minutes) article.timeRequired = `PT${story.minutes}M`;

  const crumbs = {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "خانه", item: "/" },
      { "@type": "ListItem", position: 2, name: "مجله", item: "/magazine" },
      story.categoryName
        ? {
            "@type": "ListItem",
            position: 3,
            name: story.categoryName,
            item: story.categorySlug ? `/magazine/category/${story.categorySlug}` : url,
          }
        : null,
      { "@type": "ListItem", position: story.categoryName ? 4 : 3, name: story.headline || story.title, item: url },
    ].filter(Boolean),
  };

  const graph: unknown[] = [article, crumbs];

  if (story.faqs.length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: story.faqs.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}
