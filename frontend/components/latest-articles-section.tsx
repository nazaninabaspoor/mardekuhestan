"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

import {
  articleGroups,
  brand,
  catalogGroups,
  getArticlesByIds,
  getCatalogByIds,
} from "@/lib/brand";

type FilterIcon =
  | (typeof articleGroups)[number]["icon"]
  | (typeof catalogGroups)[number]["icon"];

function useMaxPaneCards() {
  const [maxCards, setMaxCards] = useState(4);

  useEffect(() => {
    const narrow = window.matchMedia("(max-width: 899px)");

    const update = () => {
      setMaxCards(narrow.matches ? 4 : 4);
    };

    update();
    narrow.addEventListener("change", update);

    return () => {
      narrow.removeEventListener("change", update);
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

function MagazineTitleIcon() {
  return (
    <svg
      className="latest-articles-pane-icon"
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

function CatalogTitleIcon() {
  return (
    <svg
      className="latest-articles-pane-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x="4"
        y="5"
        width="16"
        height="14"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M8 9h8M8 13h5" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function FilterIconGlyph({ type }: { type: FilterIcon }) {
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
    case "catalog":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M7 4h10v16H7zM9 8h6M9 12h4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "gallery":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <rect
            x="4"
            y="6"
            width="16"
            height="12"
            rx="2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <circle cx="9" cy="11" r="1.5" fill="currentColor" />
          <path
            d="M4 15l4-3 3 2 4-4 5 5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "packaging":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M12 3 4 7v10l8 4 8-4V7l-8-4z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M12 11v10M4 7l8 4 8-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case "brand":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M12 7.5 9 16h6L12 7.5z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

type MiniCard = {
  id: string;
  href: string;
  category: string;
  title: string;
  meta: string;
  image: string;
  alt: string;
};

function ContentPane({
  paneId,
  title,
  titleIcon,
  viewAllHref,
  viewAllLabel,
  groups,
  items,
  activeGroupId,
  onGroupChange,
  tablistLabel,
}: {
  paneId: string;
  title: string;
  titleIcon: ReactNode;
  viewAllHref: string;
  viewAllLabel: string;
  groups: readonly { id: string; label: string; line: string; icon: FilterIcon }[];
  items: MiniCard[];
  activeGroupId: string;
  onGroupChange: (id: string) => void;
  tablistLabel: string;
}) {
  const activeGroup = groups.find((group) => group.id === activeGroupId) ?? groups[0];

  return (
    <div className={`latest-articles-pane latest-articles-pane--${paneId}`}>
      <div className="latest-articles-pane-head">
        <h2 className="latest-articles-pane-title">
          {titleIcon}
          {title}
        </h2>
        <Link href={viewAllHref} className="latest-articles-pane-more" title={viewAllLabel}>
          <ViewMoreIcon />
          {viewAllLabel}
        </Link>
      </div>

      <div className="latest-articles-filters" role="tablist" aria-label={tablistLabel}>
        {groups.map((group) => {
          const isActive = group.id === activeGroupId;

          return (
            <button
              key={group.id}
              type="button"
              role="tab"
              id={`${paneId}-tab-${group.id}`}
              aria-selected={isActive}
              aria-controls={`${paneId}-panel`}
              className={`latest-articles-filter${isActive ? " is-active" : ""}`}
              onClick={() => onGroupChange(group.id)}
            >
              <span className="latest-articles-filter-icon-shell">
                <FilterIconGlyph type={group.icon} />
              </span>
              {group.label}
            </button>
          );
        })}
      </div>

      <p className="latest-articles-active-line" id={`${paneId}-panel`} role="tabpanel">
        {activeGroup.line}
      </p>

      <ul className="latest-articles-cards" aria-labelledby={`${paneId}-tab-${activeGroupId}`}>
        {items.map((item) => (
          <li key={item.id}>
            <Link href={item.href} className="latest-articles-card">
              <div className="latest-articles-card-image">
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  sizes="132px"
                  style={{ objectFit: "contain" }}
                />
              </div>
              <div className="latest-articles-card-copy">
                <span className="latest-articles-card-kicker">{item.category}</span>
                <strong>{item.title}</strong>
                <span className="latest-articles-card-date">{item.meta}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LatestArticlesSection() {
  const maxCards = useMaxPaneCards();
  const [activeArticleGroupId, setActiveArticleGroupId] = useState(articleGroups[0].id);
  const [activeCatalogGroupId, setActiveCatalogGroupId] = useState(catalogGroups[0].id);

  const activeArticleGroup =
    articleGroups.find((group) => group.id === activeArticleGroupId) ?? articleGroups[0];
  const activeCatalogGroup =
    catalogGroups.find((group) => group.id === activeCatalogGroupId) ?? catalogGroups[0];

  const articleCards: MiniCard[] = getArticlesByIds(activeArticleGroup.articleIds)
    .slice(0, maxCards)
    .map((article) => ({
      id: article.id,
      href: `/magazine/${article.slug}`,
      category: article.category,
      title: article.title,
      meta: article.date,
      image: article.image,
      alt: article.alt,
    }));

  const catalogCards: MiniCard[] = getCatalogByIds(activeCatalogGroup.itemIds)
    .slice(0, maxCards)
    .map((item) => ({
      id: item.id,
      href: item.href,
      category: item.category,
      title: item.title,
      meta: item.meta,
      image: item.image,
      alt: item.alt,
    }));

  return (
    <section className="latest-articles" aria-label="مجله و کاتالوگ مرد کوهستان">
      <div className="shell">
        <div className="latest-articles-split">
          <ContentPane
            paneId="magazine"
            title={`مجله ${brand.name}`}
            titleIcon={<MagazineTitleIcon />}
            viewAllHref="/magazine"
            viewAllLabel="مشاهده همه"
            groups={articleGroups}
            items={articleCards}
            activeGroupId={activeArticleGroupId}
            onGroupChange={setActiveArticleGroupId}
            tablistLabel="دسته‌بندی مقالات"
          />

          <div className="latest-articles-divider" aria-hidden="true">
            <span />
          </div>

          <ContentPane
            paneId="catalog"
            title="کاتالوگ و گالری"
            titleIcon={<CatalogTitleIcon />}
            viewAllHref="/products"
            viewAllLabel="مشاهده همه"
            groups={catalogGroups}
            items={catalogCards}
            activeGroupId={activeCatalogGroupId}
            onGroupChange={setActiveCatalogGroupId}
            tablistLabel="دسته‌بندی کاتالوگ و گالری"
          />
        </div>

        <p className="latest-articles-foot-note">
          این راه سبز است — داستان و هویت برند، در دو نگاه: مجله و کاتالوگ.
        </p>
      </div>
    </section>
  );
}
