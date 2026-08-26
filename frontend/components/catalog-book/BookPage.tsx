"use client";

import Image from "next/image";

import type { CatalogItem } from "@/data/catalogs";

type BookPageProps = {
  catalog: CatalogItem;
  side: "content" | "media";
  revealKey: string;
  onOpenReader: () => void;
};

export function BookPage({ catalog, side, revealKey, onOpenReader }: BookPageProps) {
  const isFarm = catalog.id === "farm";
  const accentStyle = {
    ["--cb-accent" as string]: catalog.theme.accent,
    ["--cb-text" as string]: catalog.theme.text,
    ["--cb-page-bg" as string]:
      side === "content" && isFarm ? "#005B48" : catalog.theme.background,
  };

  if (side === "media") {
    if (catalog.layout === "editorial-collage") {
      return (
        <article
          className="catalog-book-page catalog-book-page--media"
          style={accentStyle}
        >
          <div className="catalog-book-collage">
            {catalog.images.slice(0, 3).map((src, index) => (
              <figure key={`${catalog.id}-col-${index}`}>
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="(max-width: 900px) 80vw, 28vw"
                  priority={index === 0}
                />
              </figure>
            ))}
          </div>
          <span className="catalog-book-media-label">{catalog.year}</span>
        </article>
      );
    }

    return (
      <article
        className="catalog-book-page catalog-book-page--media"
        style={accentStyle}
      >
        <div className="catalog-book-media">
          <Image
            src={catalog.image}
            alt={catalog.title}
            fill
            sizes="(max-width: 900px) 90vw, 42vw"
            priority
          />
        </div>
        <span className="catalog-book-media-label">{catalog.metaLabel}</span>
      </article>
    );
  }

  return (
    <article
      className={`catalog-book-page catalog-book-page--content${
        isFarm ? " is-green" : ""
      }`}
      style={accentStyle}
    >
      <span
        key={`${revealKey}-kicker`}
        className="catalog-book-kicker catalog-book-reveal catalog-book-reveal--title"
      >
        {catalog.category}
      </span>
      <h3
        key={`${revealKey}-title`}
        className="catalog-book-title catalog-book-reveal catalog-book-reveal--title"
      >
        {catalog.title}
      </h3>
      <p
        key={`${revealKey}-desc`}
        className="catalog-book-desc catalog-book-reveal catalog-book-reveal--desc"
      >
        {catalog.description}
      </p>
      <div
        key={`${revealKey}-meta`}
        className="catalog-book-meta catalog-book-reveal catalog-book-reveal--meta"
      >
        <span>{catalog.year}</span>
        <span>{catalog.format}</span>
        <span>{catalog.pageCount} صفحه</span>
      </div>
      <button
        key={`${revealKey}-cta`}
        type="button"
        className="catalog-book-cta catalog-book-reveal catalog-book-reveal--cta"
        onClick={onOpenReader}
        aria-label={`مشاهده کاتالوگ ${catalog.title}`}
      >
        مشاهده کاتالوگ
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path
            d="M15 6 9 12l6 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </article>
  );
}
