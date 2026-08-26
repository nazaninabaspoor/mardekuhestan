"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { CatalogBook } from "@/components/catalog-book";
import {
  articleGroups,
  brand,
  getArticlesByIds,
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

type ShelfCard = {
  id: string;
  href: string;
  kicker: string;
  title: string;
  meta: string;
  image: string;
  alt: string;
};

function MagazinePane({
  title,
  lead,
  icon,
  viewAllHref,
  cards,
}: {
  title: string;
  lead: string;
  icon: ReactNode;
  viewAllHref: string;
  cards: ShelfCard[];
}) {
  return (
    <div className="stories-shelf-pane stories-shelf-pane--magazine">
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
      <p className="stories-shelf-lead">{lead}</p>

      <ul className="stories-shelf-grid">
        {cards.map((card, index) => (
          <li
            key={card.id}
            className="stories-shelf-item"
            style={{ ["--shelf-i" as string]: index }}
          >
            <Link
              href={card.href}
              className="stories-shelf-card stories-shelf-card--magazine"
            >
              <div className="stories-shelf-visual">
                <Image
                  src={card.image}
                  alt={card.alt}
                  fill
                  sizes="(max-width: 900px) 44vw, 260px"
                  className="stories-shelf-visual-img"
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
      { threshold: 0.16 },
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

  return (
    <>
      <section
        ref={rootRef}
        className={`stories-shelf stories-shelf--magazine-only${
          visible ? " is-visible" : ""
        }`}
        aria-label={`مجله ${brand.name}`}
      >
        <div className="shell">
          <MagazinePane
            title={`مجله ${brand.name}`}
            lead="داستان‌هایی برای خواندن؛ از مرتع تا سفره."
            icon={<MagazineIcon />}
            viewAllHref="/magazine"
            cards={magazineCards}
          />
        </div>
      </section>

      <CatalogBook />
    </>
  );
}
