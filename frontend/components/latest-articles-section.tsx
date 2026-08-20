"use client";

import Image from "next/image";
import Link from "next/link";

import {
  articleGroups,
  brand,
  catalogGroups,
  getArticlesByIds,
  getCatalogByIds,
} from "@/lib/brand";

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
  const magazineItems = getArticlesByIds(articleGroups[0].articleIds).slice(0, 2);
  const catalogItems = getCatalogByIds(catalogGroups[0].itemIds).slice(0, 2);

  return (
    <section className="latest-articles" aria-label="مجله و کاتالوگ مرد کوهستان">
      <div className="shell">
        <div className="latest-articles-split">
          <div className="latest-articles-pane latest-articles-pane--magazine">
            <div className="latest-articles-pane-head">
              <h2 className="latest-articles-pane-title">مجله {brand.name}</h2>
              <Link href="/magazine" className="latest-articles-pane-more" title="مشاهده همه">
                <ViewMoreIcon />
                همه
              </Link>
            </div>
            <ul className="latest-articles-cards">
              {magazineItems.map((article) => (
                <li key={article.id}>
                  <Link href={`/magazine/${article.slug}`} className="latest-articles-card">
                    <div className="latest-articles-card-image">
                      <Image
                        src={article.image}
                        alt={article.alt}
                        fill
                        sizes="72px"
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                    <div className="latest-articles-card-copy">
                      <span className="latest-articles-card-kicker">{article.category}</span>
                      <strong>{article.title}</strong>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="latest-articles-divider" aria-hidden="true">
            <span />
          </div>

          <div className="latest-articles-pane latest-articles-pane--catalog">
            <div className="latest-articles-pane-head">
              <h2 className="latest-articles-pane-title">کاتالوگ</h2>
              <Link href="/products" className="latest-articles-pane-more" title="مشاهده همه">
                <ViewMoreIcon />
                همه
              </Link>
            </div>
            <ul className="latest-articles-cards">
              {catalogItems.map((item) => (
                <li key={item.id}>
                  <Link href={item.href} className="latest-articles-card">
                    <div className="latest-articles-card-image">
                      <Image
                        src={item.image}
                        alt={item.alt}
                        fill
                        sizes="72px"
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                    <div className="latest-articles-card-copy">
                      <span className="latest-articles-card-kicker">{item.category}</span>
                      <strong>{item.title}</strong>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
