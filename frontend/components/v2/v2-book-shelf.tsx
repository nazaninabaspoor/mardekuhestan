"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

import { catalogBookCopy, catalogs } from "@/data/catalogs";
import { articleGroups, brand, getArticlesByIds } from "@/lib/brand";

import { V2FlipReader, type V2BookPage } from "./v2-premium-book";

const LOGO = "/brand/logo.svg";
const MAGAZINE_COVER_ART = "/brand/v2/magazine-cover.png";
const CATALOG_COVER_ART = "/brand/v2/catalog-cover.png";
const FIELD = "/brand/v2/bookcase-desk-field.png";

type OpenBook = "magazine" | "catalog" | null;

function toPersianDigits(value: number) {
  return String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

/**
 * DearFlip / Issuu bookshelf pattern:
 * closed hardcover covers on a calm cream field → one lightbox flipbook.
 */
export function V2BookShelf() {
  const rootRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState<OpenBook>(null);
  const [startPage, setStartPage] = useState(0);
  const [readerSize, setReaderSize] = useState({ w: 360, h: 500 });

  const articles = useMemo(
    () => getArticlesByIds(articleGroups[0].articleIds).slice(0, 4),
    [],
  );

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
      { threshold: 0.12 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const update = () => {
      const vw = window.innerWidth;
      if (vw < 720) {
        const w = Math.min(280, vw - 72);
        setReaderSize({ w, h: Math.round(w * 1.38) });
      } else if (vw < 1100) {
        setReaderSize({ w: 340, h: 470 });
      } else {
        setReaderSize({ w: 380, h: 520 });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const magazinePages: V2BookPage[] = useMemo(() => {
    const list: V2BookPage[] = [
      {
        id: "mag-cover",
        kind: "cover",
        node: (
          <div className="v2-mag-cover">
            <div className="v2-cover-art">
              <Image
                src={MAGAZINE_COVER_ART}
                alt=""
                fill
                sizes="400px"
                className="v2-cover-art-img"
              />
            </div>
            <div className="v2-cover-meta">
              <span className="v2-mag-cover-band">مجله</span>
              <Image
                src={LOGO}
                alt=""
                width={140}
                height={28}
                className="v2-mag-cover-logo"
              />
              <strong className="v2-mag-cover-title">مجله {brand.name}</strong>
              <span className="v2-mag-cover-sub">داستان‌هایی از مرتع تا سفره</span>
            </div>
          </div>
        ),
      },
    ];

    articles.forEach((article) => {
      list.push({
        id: `${article.id}-story`,
        kind: "paper",
        node: (
          <div className="v2-mag-story-inner">
            <span className="v2-mag-story-kicker">{article.category}</span>
            <h3 className="v2-mag-story-title">{article.title}</h3>
            <p className="v2-mag-story-excerpt">{article.excerpt}</p>
            <span className="v2-mag-story-date">{article.date}</span>
            <Link
              href={`/magazine/${article.slug}`}
              className="v2-mag-story-link"
            >
              خواندن مطلب
            </Link>
          </div>
        ),
      });
      list.push({
        id: `${article.id}-photo`,
        kind: "paper",
        node: (
          <div className="v2-mag-photo-frame">
            <Image
              src={article.image}
              alt={article.alt}
              fill
              sizes="400px"
              className="v2-mag-photo-img"
            />
          </div>
        ),
      });
    });

    list.push({
      id: "mag-back",
      kind: "back",
      node: (
        <div className="v2-mag-cover v2-mag-cover--back">
          <Link href="/magazine" className="v2-mag-all">
            همهٔ داستان‌ها
          </Link>
          <span>این راه سبز است</span>
        </div>
      ),
    });

    return list;
  }, [articles]);

  const catalogPages: V2BookPage[] = useMemo(() => {
    const list: V2BookPage[] = [
      {
        id: "cover",
        kind: "cover",
        node: (
          <div className="v2-catalog-cover">
            <div className="v2-cover-art">
              <Image
                src={CATALOG_COVER_ART}
                alt=""
                fill
                sizes="400px"
                className="v2-cover-art-img"
              />
            </div>
            <div className="v2-cover-meta">
              <Image
                src={LOGO}
                alt=""
                width={150}
                height={30}
                className="v2-catalog-cover-logo"
              />
              <strong className="v2-catalog-cover-title">
                {catalogBookCopy.coverTitle}
              </strong>
              <span className="v2-catalog-cover-sub">
                {catalogBookCopy.coverSubtitle}
              </span>
            </div>
          </div>
        ),
      },
    ];

    catalogs.forEach((item) => {
      list.push({
        id: `${item.id}-copy`,
        kind: "paper",
        node: (
          <div
            className="v2-catalog-copy"
            style={
              {
                ["--page-bg"]: item.theme.background,
                ["--page-ink"]: item.theme.text,
                ["--page-accent"]: item.theme.accent,
              } as CSSProperties
            }
          >
            <span className="v2-catalog-copy-kicker">{item.category}</span>
            <h3 className="v2-catalog-copy-title">{item.title}</h3>
            <p className="v2-catalog-copy-desc">{item.description}</p>
            <div className="v2-catalog-copy-meta">
              <span>{item.year}</span>
              <span>{toPersianDigits(item.pageCount)} صفحه</span>
            </div>
          </div>
        ),
      });
      list.push({
        id: `${item.id}-media`,
        kind: "paper",
        node: (
          <div className="v2-catalog-media">
            <Image
              src={item.image}
              alt={item.title}
              fill
              sizes="400px"
              className="v2-catalog-media-img"
            />
          </div>
        ),
      });
    });

    list.push({
      id: "back",
      kind: "back",
      node: (
        <div className="v2-catalog-cover v2-catalog-cover--back">
          <Image
            src="/brand/orginal-clear.png"
            alt=""
            width={72}
            height={72}
            className="v2-catalog-cover-seal"
          />
          <span>این راه سبز است</span>
        </div>
      ),
    });

    return list;
  }, []);

  const openMagazine = () => {
    setStartPage(0);
    setOpen("magazine");
  };

  const openCatalog = (page = 0) => {
    setStartPage(page);
    setOpen("catalog");
  };

  const goCatalogTab = (id: string) => {
    const idx = catalogs.findIndex((c) => c.id === id);
    if (idx < 0) return;
    openCatalog(1 + idx * 2);
  };

  return (
    <section
      ref={rootRef}
      id="v2-books"
      className={`v2-bookcase${visible ? " is-visible" : ""}`}
      aria-label="دفترچه‌های مرد کوهستان"
    >
      <div className="v2-bookcase-atmosphere" aria-hidden="true">
        <Image
          src={FIELD}
          alt=""
          fill
          sizes="100vw"
          className="v2-bookcase-atmosphere-img"
          priority={false}
        />
        <span className="v2-bookcase-atmosphere-wash" />
        <span className="v2-bookcase-peaks" />
      </div>

      <div className="v2-bookcase-shell">
        <header className="v2-bookcase-head">
          <p className="v2-bookcase-kicker">این راه سبز است</p>
          <h2 className="v2-bookcase-title">مجله و کاتالوگ</h2>
          <p className="v2-bookcase-lead">
            جلد را انتخاب کنید؛ دفترچه در حالت مطالعه باز می‌شود.
          </p>
        </header>

        <div className="v2-bookcase-tabs" role="tablist" aria-label="کاتالوگ‌ها">
          {catalogs.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              className="v2-bookcase-tab"
              onClick={() => goCatalogTab(item.id)}
            >
              <span className="v2-bookcase-tab-thumb">
                <Image
                  src={item.image}
                  alt=""
                  width={36}
                  height={36}
                  className="v2-bookcase-tab-img"
                />
              </span>
              <span>{item.tabLabel}</span>
            </button>
          ))}
        </div>

        <div className="v2-shelf-row">
          <button
            type="button"
            className="v2-cover-card v2-cover-card--magazine"
            onClick={openMagazine}
            aria-label="باز کردن مجله مرد کوهستان"
          >
            <span className="v2-cover-card-spine" aria-hidden="true" />
            <span className="v2-cover-card-edges" aria-hidden="true" />
            <span className="v2-cover-card-face">
              <span className="v2-cover-card-art">
                <Image
                  src={MAGAZINE_COVER_ART}
                  alt=""
                  fill
                  sizes="280px"
                  className="v2-cover-card-img"
                />
              </span>
              <span className="v2-cover-card-meta">
                <span className="v2-cover-card-band">مجله</span>
                <strong>مجله {brand.name}</strong>
                <em>باز کردن</em>
              </span>
            </span>
            <span className="v2-cover-card-shadow" aria-hidden="true" />
          </button>

          <button
            type="button"
            className="v2-cover-card v2-cover-card--catalog"
            onClick={() => openCatalog(0)}
            aria-label="باز کردن کاتالوگ مرد کوهستان"
          >
            <span className="v2-cover-card-spine" aria-hidden="true" />
            <span className="v2-cover-card-edges" aria-hidden="true" />
            <span className="v2-cover-card-face">
              <span className="v2-cover-card-art">
                <Image
                  src={CATALOG_COVER_ART}
                  alt=""
                  fill
                  sizes="280px"
                  className="v2-cover-card-img"
                />
              </span>
              <span className="v2-cover-card-meta">
                <span className="v2-cover-card-band">کاتالوگ</span>
                <strong>{catalogBookCopy.coverTitle}</strong>
                <em>باز کردن</em>
              </span>
            </span>
            <span className="v2-cover-card-shadow" aria-hidden="true" />
          </button>
        </div>

        <footer className="v2-bookcase-foot">
          <Link href="/magazine" className="v2-bookcase-more">
            همهٔ داستان‌ها
          </Link>
        </footer>
      </div>

      {open === "magazine" ? (
        <V2FlipReader
          pages={magazinePages}
          title={`مجله ${brand.name}`}
          width={readerSize.w}
          height={readerSize.h}
          startPage={startPage}
          onClose={() => setOpen(null)}
        />
      ) : null}

      {open === "catalog" ? (
        <V2FlipReader
          pages={catalogPages}
          title={catalogBookCopy.sectionTitle}
          width={readerSize.w}
          height={readerSize.h}
          startPage={startPage}
          onClose={() => setOpen(null)}
        />
      ) : null}
    </section>
  );
}
