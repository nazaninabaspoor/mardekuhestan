import Image from "next/image";
import Link from "next/link";

import { MagReadMood } from "@/components/magazine/mag-read-mood";
import { MagShare } from "@/components/magazine/mag-share";
import { MagToc, type MagTocItem } from "@/components/magazine/mag-toc";
import type { MagPinData, MagTone } from "@/lib/content/magazine-feed";

const AUTHOR_MARK = "/brand/mardekoohestan-seal.png";

export type MagStory = {
  slug: string;
  title: string;
  headline: string;
  excerpt: string;
  body: string;
  image: string;
  author: string;
  date: string;
  publishedAt?: string;
  updatedAt?: string;
  updatedLabel?: string;
  minutes?: number;
  wordCount?: number;
  categorySlug?: string;
  categoryName?: string;
  geo?: string;
  faqs: Array<{ q: string; a: string }>;
  tags: Array<{ slug: string; name: string }>;
  related: MagPinData[];
  tone: MagTone;
  imageAlt?: string;
  imageCaption?: string;
  imagePhoto?: boolean;
  keywords?: string[];
  images?: string[];
  faqTitle?: string;
};

function withHeadingIds(html: string) {
  let index = 0;
  return html.replace(/<h2(\s[^>]*)?>/gi, (full, attrs = "") => {
    if (/\sid=/i.test(attrs)) return full;
    index += 1;
    return `<h2${attrs} id="s-${index}">`;
  });
}

function headingsFrom(html: string): MagTocItem[] {
  return [...html.matchAll(/<h2\b([^>]*)>([\s\S]*?)<\/h2>/gi)]
    .map((match, index) => {
      const attrs = match[1] || "";
      const idMatch = attrs.match(/\sid=["']([^"']+)["']/i);
      return {
        id: idMatch?.[1] || `s-${index + 1}`,
        text: match[2].replace(/<[^>]+>/g, "").trim(),
      };
    })
    .filter((item) => item.text);
}

function AuthorMark({ size }: { size: number }) {
  return (
    <span className="mk-read-avatar" aria-hidden="true">
      <Image src={AUTHOR_MARK} alt="" width={size} height={size} />
    </span>
  );
}

function MetaEmo({ symbol }: { symbol: string }) {
  return (
    <span className="mk-read-emo" aria-hidden="true">
      {symbol}
    </span>
  );
}

export function MagArticle({ story }: { story: MagStory }) {
  const author = story.author || "تحریریه مرد کوهستان";
  const body = withHeadingIds(story.body || "");
  const faqTitle = story.faqTitle || `سوالات متداول درباره ${story.title}`;
  const toc: MagTocItem[] = [
    ...headingsFrom(body),
    ...(story.faqs.length ? [{ id: "faq", text: faqTitle }] : []),
  ];
  const published = story.date || story.updatedLabel || "";
  const updated = story.updatedLabel || story.date || published;
  const minutes = story.minutes
    ? `${story.minutes.toLocaleString("fa-IR")} دقیقه مطالعه`
    : "۲ دقیقه مطالعه";

  return (
    <article className="mk-read" itemScope itemType="https://schema.org/Article">
      <meta itemProp="inLanguage" content="fa-IR" />
      {story.updatedAt ? <meta itemProp="dateModified" content={story.updatedAt} /> : null}

      <div className="mk-read-frame">
        <div className="mk-read-lead">
          <nav className="mk-read-crumbs" aria-label="مسیر صفحه">
            <ol>
              <li>
                <Link href="/">خانه</Link>
              </li>
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

          <header className="mk-read-head">
            <h1 id="hero-title" itemProp="headline">
              {story.headline}
            </h1>
            <ul className="mk-read-meta">
              <li itemProp="author" itemScope itemType="https://schema.org/Organization">
                <AuthorMark size={24} />
                <span itemProp="name">{author}</span>
              </li>
              {published ? (
                <li>
                  <MetaEmo symbol="📅" />
                  {story.publishedAt ? (
                    <time itemProp="datePublished" dateTime={story.publishedAt}>
                      {published}
                    </time>
                  ) : (
                    <span>{published}</span>
                  )}
                </li>
              ) : null}
              {updated ? (
                <li>
                  <MetaEmo symbol="✨" />
                  <span>بروزرسانی {updated}</span>
                </li>
              ) : null}
              <li>
                <MetaEmo symbol="⏳" />
                {minutes}
              </li>
              <li>
                <MetaEmo symbol="💬" />
                {(0).toLocaleString("fa-IR")} نظر
              </li>
              <MagReadMood slug={story.slug} />
            </ul>
            <ul className="mk-read-chips">
              {story.categoryName && story.categorySlug ? (
                <li>
                  <Link href={`/magazine/category/${story.categorySlug}`}>{story.categoryName}</Link>
                </li>
              ) : null}
              {story.tags
                .filter((tag) => tag.slug !== story.categorySlug)
                .map((tag) => (
                  <li key={tag.slug}>
                    <Link href={`/magazine?q=${encodeURIComponent(tag.name)}`}>{tag.name}</Link>
                  </li>
                ))}
            </ul>
          </header>

          <figure className={`mk-read-hero${story.imagePhoto ? " mk-read-hero--photo" : ` mk-read-hero--${story.tone}`}`}>
            <Image
              src={story.image}
              alt={story.imageAlt || story.headline}
              width={1200}
              height={675}
              priority
              sizes="(max-width: 900px) 92vw, 760px"
              itemProp="image"
            />
            <figcaption>{story.imageCaption || story.title}</figcaption>
          </figure>
        </div>

        <aside className="mk-read-rail">
          <MagToc items={toc} />
          <div className="mk-read-cta">
            <p>بعد از دیدن مسیر</p>
            <p className="mk-read-cta-title">از سفره خانه انتخاب کنید</p>
            <p>
              محصولات مرد کوهستان همان راهی است که در این نوشته دیدید. انتخاب را در بخش محصولات صفحه اصلی تمام کنید.
            </p>
            <Link href="/#for-home-kitchen">دیدن همه محصولات</Link>
          </div>
        </aside>

        <div className="mk-read-main">
          {story.geo ? <p className="mk-read-geo">{story.geo}</p> : null}

          <div
            className="mk-mag-body mk-read-body"
            itemProp="articleBody"
            dangerouslySetInnerHTML={{ __html: body }}
          />

          {story.faqs.length ? (
            <section className="mk-read-faq" id="faq">
              <h2>{faqTitle}</h2>
              {story.faqs.map((item, index) => (
                <div key={item.q} className="mk-read-qa">
                  <h3 id={`faq-${index + 1}`}>{item.q}</h3>
                  <p>{item.a}</p>
                </div>
              ))}
            </section>
          ) : null}

          <MagShare title={story.headline} />

          <aside className="mk-read-author">
            <AuthorMark size={36} />
            <div>
              <p>{author}</p>
              <p>
                تحریریه مرد کوهستان مسیر غذا را از مرتع و ارتفاع تا سفره خانه دنبال می‌کند تا خانواده کیفیت‌محور مبدأ را
                ببیند، نه شعار را.
              </p>
            </div>
          </aside>

          {story.related.length ? (
            <section className="mk-read-related" aria-labelledby="mk-related-title">
              <h2 id="mk-related-title">سایر نوشته‌های مرتبط</h2>
              <ul>
                {story.related.slice(0, 6).map((pin) => (
                  <li key={pin.href}>
                    <Link href={pin.href}>
                      <span className={`mk-read-thumb mk-read-thumb--${pin.tone}`}>
                        <Image src={pin.goods[0] || pin.image} alt="" width={280} height={200} sizes="140px" />
                      </span>
                      <span>
                        {pin.category ? <em>{pin.category}</em> : null}
                        <strong>{pin.title}</strong>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>
    </article>
  );
}
