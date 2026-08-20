"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

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

function MagazineIcon() {
  return (
    <svg
      className="stories-shelf-title-icon"
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

function CatalogIcon() {
  return (
    <svg
      className="stories-shelf-title-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M12 3 4 7v10l8 4 8-4V7l-8-4z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M12 11v10M4 7l8 4 8-4" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

type ShelfCard = {
  id: string;
  href: string;
  kicker: string;
  title: string;
  meta: string;
  image: string;
  alt: string;
};

function ShelfPane({
  paneId,
  title,
  icon,
  viewAllHref,
  cards,
}: {
  paneId: string;
  title: string;
  icon: ReactNode;
  viewAllHref: string;
  cards: ShelfCard[];
}) {
  return (
    <div className={`stories-shelf-pane stories-shelf-pane--${paneId}`}>
      <div className="stories-shelf-title">
        <h2 className="stories-shelf-title-text">
          {icon}
          {title}
        </h2>
        <span className="stories-shelf-title-rule" aria-hidden="true" />
        <Link href={viewAllHref} className="stories-shelf-more" title="مشاهده همه">
          <ViewMoreIcon />
          مشاهده همه
        </Link>
      </div>

      <ul className="stories-shelf-grid">
        {cards.map((card, index) => (
          <li
            key={card.id}
            className="stories-shelf-item"
            style={{ ["--shelf-i" as string]: index }}
          >
            <Link href={card.href} className="stories-shelf-card">
              <span className="stories-shelf-neon" aria-hidden="true" />
              <span className="stories-shelf-neon stories-shelf-neon--spin" aria-hidden="true" />
              <div className="stories-shelf-visual">
                <Image
                  src={card.image}
                  alt={card.alt}
                  fill
                  sizes="(max-width: 900px) 44vw, 240px"
                  style={{ objectFit: "contain" }}
                />
              </div>
              <div className="stories-shelf-copy">
                <span className="stories-shelf-kicker">{card.kicker}</span>
                <strong>{card.title}</strong>
                <span className="stories-shelf-meta">{card.meta}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LatestArticlesSection() {
  const rootRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.18 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const magazineCards: ShelfCard[] = getArticlesByIds(articleGroups[0].articleIds)
    .slice(0, 2)
    .map((article) => ({
      id: article.id,
      href: `/magazine/${article.slug}`,
      kicker: article.category,
      title: article.title,
      meta: article.date,
      image: article.image,
      alt: article.alt,
    }));

  const catalogCards: ShelfCard[] = getCatalogByIds(catalogGroups[0].itemIds)
    .slice(0, 2)
    .map((item) => ({
      id: item.id,
      href: item.href,
      kicker: item.category,
      title: item.title,
      meta: item.meta,
      image: item.image,
      alt: item.alt,
    }));

  return (
    <section
      ref={rootRef}
      className={`stories-shelf${visible ? " is-visible" : ""}`}
      aria-label="مجله و کاتالوگ مرد کوهستان"
    >
      <div className="shell">
        <div className="stories-shelf-split">
          <ShelfPane
            paneId="magazine"
            title={`مجله ${brand.name}`}
            icon={<MagazineIcon />}
            viewAllHref="/magazine"
            cards={magazineCards}
          />
          <ShelfPane
            paneId="catalog"
            title="کاتالوگ و گالری"
            icon={<CatalogIcon />}
            viewAllHref="/products"
            cards={catalogCards}
          />
        </div>
      </div>
    </section>
  );
}
