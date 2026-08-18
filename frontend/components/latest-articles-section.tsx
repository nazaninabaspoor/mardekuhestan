"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { articleGroups, brand, getArticlesByIds } from "@/lib/brand";

function useMaxArticleCards() {
  const [maxCards, setMaxCards] = useState(8);

  useEffect(() => {
    const narrow = window.matchMedia("(max-width: 574px)");
    const medium = window.matchMedia("(max-width: 899px)");

    const update = () => {
      if (narrow.matches) {
        setMaxCards(4);
      } else if (medium.matches) {
        setMaxCards(6);
      } else {
        setMaxCards(8);
      }
    };

    update();
    narrow.addEventListener("change", update);
    medium.addEventListener("change", update);

    return () => {
      narrow.removeEventListener("change", update);
      medium.removeEventListener("change", update);
    };
  }, []);

  return maxCards;
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

function GroupIcon({ type }: { type: (typeof articleGroups)[number]["icon"] }) {
  const className = "latest-articles-filter-icon";

  switch (type) {
    case "popular":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M12 20.5s-6.2-3.8-6.2-8.4c0-2.4 1.9-4.3 4.3-4.3 1.4 0 2.7.7 3.5 1.8.8-1.1 2.1-1.8 3.5-1.8 2.4 0 4.3 1.9 4.3 4.3 0 4.6-6.2 8.4-6.2 8.4z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "essential":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M12 4.5 4.5 18h15L12 4.5z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "latest":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="12" cy="12" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M12 4v2M12 18v2M4 12h2M18 12h2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case "path":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="5" cy="18" r="1.5" fill="currentColor" />
          <circle cx="15" cy="13" r="1.5" fill="currentColor" />
          <circle cx="17.5" cy="6" r="1.5" fill="currentColor" />
          <path
            d="M6.5 16.5 13.5 13.5 16 7.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case "home":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M5 10.5 12 5l7 5.5V19a1 1 0 0 1-1 1h-4.5v-5.5H10.5V20H6a1 1 0 0 1-1-1v-8.5z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

export function LatestArticlesSection() {
  const maxCards = useMaxArticleCards();
  const [activeGroupId, setActiveGroupId] = useState(articleGroups[0].id);
  const activeGroup =
    articleGroups.find((group) => group.id === activeGroupId) ?? articleGroups[0];
  const articles = getArticlesByIds(activeGroup.articleIds).slice(0, maxCards);

  return (
    <section className="latest-articles" aria-labelledby="latest-articles-title">
      <div className="latest-articles-watermark" aria-hidden="true">
        <Image src="/brand/orginal-clear.png" alt="" width={180} height={180} />
      </div>

      <div className="shell">
        <div className="for-home-block">
          <div className="for-home-block-title latest-articles-head">
            <div className="for-home-block-title-text" id="latest-articles-title">
              <Image
                className="latest-articles-head-mark"
                src="/brand/orginal-clear.png"
                alt=""
                width={28}
                height={28}
                aria-hidden="true"
              />
              مجله {brand.name}
            </div>
            <Link href="/magazine" className="for-home-view-more" title="همه مقالات">
              <ViewMoreIcon />
              مشاهده همه
            </Link>
          </div>

          <div
            className="latest-articles-filters"
            role="tablist"
            aria-label="دسته‌بندی مقالات"
          >
            {articleGroups.map((group) => {
              const isActive = group.id === activeGroupId;

              return (
                <button
                  key={group.id}
                  type="button"
                  role="tab"
                  id={`articles-tab-${group.id}`}
                  aria-selected={isActive}
                  aria-controls="articles-panel"
                  className={`latest-articles-filter${isActive ? " is-active" : ""}`}
                  onClick={() => setActiveGroupId(group.id)}
                >
                  <span className="latest-articles-filter-icon-shell">
                    <GroupIcon type={group.icon} />
                  </span>
                  {group.label}
                </button>
              );
            })}
          </div>

          <p className="latest-articles-active-line" id="articles-panel" role="tabpanel">
            {activeGroup.line}
          </p>

          <ul className="latest-articles-cards" aria-labelledby={`articles-tab-${activeGroupId}`}>
            {articles.map((article) => (
              <li key={article.id}>
                <Link href={`/magazine/${article.slug}`} className="latest-articles-card">
                  <div className="latest-articles-card-image">
                    <Image
                      src={article.image}
                      alt={article.alt}
                      fill
                      sizes="132px"
                      style={{ objectFit: "contain" }}
                    />
                    <Image
                      className="latest-articles-card-stamp"
                      src="/brand/orginal-clear.png"
                      alt=""
                      width={16}
                      height={16}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="latest-articles-card-copy">
                    <span className="latest-articles-card-kicker">{article.category}</span>
                    <strong>{article.title}</strong>
                    <span className="latest-articles-card-date">{article.date}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          <div className="latest-articles-foot">
            <Image
              src="/brand/mardekoohestan.png"
              alt={brand.name}
              width={120}
              height={32}
              className="latest-articles-foot-logo"
            />
            <p>این راه سبز است — داستان‌هایی که می‌شود فهمید از کجا آمده.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
