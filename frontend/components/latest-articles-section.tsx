import Image from "next/image";
import Link from "next/link";

import { latestArticles } from "@/lib/brand";

function ArticlesTitleIcon() {
  return (
    <svg
      className="for-home-block-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M6 4h10a2 2 0 0 1 2 2v14l-4-2-4 2-4-2-4 2V6a2 2 0 0 1 2-2z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M8 8h8M8 12h6" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function ViewMoreIcon() {
  return (
    <svg
      className="for-home-view-more-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M14 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function LatestArticlesSection() {
  const [featured, ...rest] = latestArticles;

  return (
    <section className="latest-articles" aria-labelledby="latest-articles-title">
      <div className="shell">
        <div className="for-home-block">
          <div className="for-home-block-title">
            <div className="for-home-block-title-text" id="latest-articles-title">
              <ArticlesTitleIcon />
              آخرین مقالات
            </div>
            <Link href="/magazine" className="for-home-view-more" title="همه مقالات">
              <ViewMoreIcon />
              مشاهده همه
            </Link>
          </div>

          <div className="latest-articles-layout">
            <article className="latest-articles-featured">
              <Link
                href={`/magazine/${featured.slug}`}
                className="latest-articles-featured-link"
              >
                <div className="latest-articles-featured-media">
                  <Image
                    src={featured.image}
                    alt={featured.alt}
                    fill
                    sizes="(min-width: 900px) 58vw, 88vw"
                    style={{ objectPosition: featured.position }}
                  />
                  <span className="latest-articles-featured-badge">{featured.category}</span>
                </div>
                <div className="latest-articles-featured-body">
                  <h3>{featured.title}</h3>
                  <p>{featured.excerpt}</p>
                  <div className="latest-articles-featured-foot">
                    <span className="latest-articles-meta">{featured.date}</span>
                    <span className="latest-articles-read">بیشتر بخوانید</span>
                  </div>
                </div>
              </Link>
            </article>

            <div className="latest-articles-side">
              {rest.map((article) => (
                <article key={article.id} className="latest-articles-card">
                  <Link href={`/magazine/${article.slug}`} className="latest-articles-card-link">
                    <div className="latest-articles-card-media">
                      <Image
                        src={article.image}
                        alt={article.alt}
                        fill
                        sizes="(min-width: 900px) 280px, 88vw"
                        style={{ objectPosition: article.position }}
                      />
                      <span className="latest-articles-card-badge">{article.category}</span>
                    </div>
                    <div className="latest-articles-card-copy">
                      <h3>{article.title}</h3>
                      <p>{article.excerpt}</p>
                      <div className="latest-articles-card-foot">
                        <span className="latest-articles-meta">{article.date}</span>
                        <span className="latest-articles-read">بیشتر بخوانید</span>
                      </div>
                    </div>
                    <span className="latest-articles-card-cta">مطالعه مقاله</span>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
