import Image from "next/image";
import Link from "next/link";

import { MagMasonry } from "@/components/magazine/mag-card";
import type { MagPinData, MagTone } from "@/lib/content/magazine-feed";

export type MagStory = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  image: string;
  author: string;
  date: string;
  publishedAt?: string;
  updatedAt?: string;
  minutes?: number;
  wordCount?: number;
  categorySlug?: string;
  categoryName?: string;
  geo?: string;
  faqs: Array<{ q: string; a: string }>;
  tags: Array<{ slug: string; name: string }>;
  related: MagPinData[];
  tone: MagTone;
};

function Peak({ className = "mk-read-peak" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
        d="M3.4 19.2 12 4.8 20.6 19.2Z"
      />
    </svg>
  );
}

function withHeadingIds(html: string) {
  let index = 0;
  return html.replace(/<h2(\s[^>]*)?>/gi, (full, attrs = "") => {
    if (/\sid=/i.test(attrs)) return full;
    index += 1;
    return `<h2${attrs} id="s-${index}">`;
  });
}

function headingsFrom(html: string) {
  return [...html.matchAll(/<h2\b([^>]*)>([\s\S]*?)<\/h2>/gi)].map((match, index) => {
    const attrs = match[1] || "";
    const idMatch = attrs.match(/\sid=["']([^"']+)["']/i);
    return {
      id: idMatch?.[1] || `s-${index + 1}`,
      text: match[2].replace(/<[^>]+>/g, "").trim(),
    };
  }).filter((item) => item.text);
}

export function MagArticle({ story }: { story: MagStory }) {
  const body = withHeadingIds(story.body || "");
  const headings = headingsFrom(body);
  const minutes = story.minutes
    ? `${story.minutes.toLocaleString("fa-IR")} دقیقه خواندن`
    : null;
  const words = story.wordCount
    ? `${story.wordCount.toLocaleString("fa-IR")} کلمه`
    : null;

  return (
    <article className="mk-read" itemScope itemType="https://schema.org/Article">
      <meta itemProp="inLanguage" content="fa-IR" />
      {story.updatedAt ? <meta itemProp="dateModified" content={story.updatedAt} /> : null}

      <div className="mk-read-shell">
        <nav className="mk-read-crumbs" aria-label="مسیر صفحه">
          <ol>
            <li>
              <Link href="/magazine">مجله</Link>
            </li>
            {story.categorySlug ? (
              <li>
                <Link href={`/magazine/category/${story.categorySlug}`}>{story.categoryName}</Link>
              </li>
            ) : null}
            <li aria-current="page">{story.title}</li>
          </ol>
        </nav>

        <header className="mk-read-spread">
          <div className="mk-read-copy">
            <p className="mk-read-kicker">
              <Peak className="mk-read-kicker-peak" />
              {story.categoryName || "مجله مرد کوهستان"}
            </p>
            <h1 id="hero-title" itemProp="headline">
              {story.title}
            </h1>
            {story.excerpt ? (
              <p className="mk-read-dek" itemProp="description">
                {story.excerpt}
              </p>
            ) : null}
            <ul className="mk-read-byline">
              {story.author ? (
                <li itemProp="author" itemScope itemType="https://schema.org/Organization">
                  <span itemProp="name">{story.author}</span>
                </li>
              ) : null}
              {story.date ? (
                <li>
                  {story.publishedAt ? (
                    <time itemProp="datePublished" dateTime={story.publishedAt}>
                      {story.date}
                    </time>
                  ) : (
                    <span>{story.date}</span>
                  )}
                </li>
              ) : null}
              {minutes ? <li>{minutes}</li> : null}
              {words ? <li>{words}</li> : null}
            </ul>
          </div>

          <figure className={`mk-read-plate mk-read-plate--${story.tone}`}>
            <span className="mk-read-plate-pages" aria-hidden="true" />
            <span className="mk-read-plate-spine" aria-hidden="true" />
            <span className="mk-read-plate-face">
              <Peak className="mk-read-peak mk-read-peak--a" />
              <Peak className="mk-read-peak mk-read-peak--b" />
              <Image
                src={story.image}
                alt={story.title}
                width={900}
                height={900}
                priority
                sizes="(max-width: 800px) 58vw, 28vw"
                itemProp="image"
              />
            </span>
            <figcaption className="sr-only">{story.title}</figcaption>
          </figure>
        </header>
      </div>

      <div className="mk-read-ridge" aria-hidden="true" />

      <div className="mk-read-prose">
        {headings.length > 1 ? (
          <nav className="mk-read-toc" aria-label="بخش‌های نوشته">
            <p>در این نوشته</p>
            <ol>
              {headings.map((heading) => (
                <li key={heading.id}>
                  <a href={`#${heading.id}`}>{heading.text}</a>
                </li>
              ))}
            </ol>
          </nav>
        ) : null}

        {story.geo ? <p className="mk-read-geo">{story.geo}</p> : null}

        <div
          className="mk-mag-body mk-read-body"
          itemProp="articleBody"
          dangerouslySetInnerHTML={{ __html: body }}
        />

        {story.faqs.length ? (
          <section className="mk-read-faq">
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
          <ul className="mk-read-tags">
            {story.tags.map((tag) => (
              <li key={tag.slug}>
                <Link href={`/magazine?q=${encodeURIComponent(tag.name)}`}>{tag.name}</Link>
              </li>
            ))}
          </ul>
        ) : null}

        <p className="mk-read-back">
          <Link href="/magazine">بازگشت به مجله</Link>
        </p>
      </div>

      {story.related.length ? (
        <section className="mk-read-more" aria-labelledby="mk-read-more-title">
          <div className="mk-read-more-inner">
            <p>این راه ادامه دارد</p>
            <h2 id="mk-read-more-title">نوشته‌های نزدیک</h2>
            <MagMasonry pins={story.related.slice(0, 5)} />
          </div>
        </section>
      ) : null}
    </article>
  );
}
