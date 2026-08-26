"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
} from "react";
import HTMLFlipBook from "react-pageflip";

import {
  catalogBookCopy,
  catalogs,
  type CatalogItem,
} from "@/data/catalogs";

import { V2FlipPage } from "./v2-flip-page";

const LOGO = "/brand/logo.svg";
const CATALOG_COVER_ART = "/brand/v2/catalog-cover.png";

function toPersianDigits(value: number) {
  return String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

type FlipApi = {
  pageFlip: () => {
    flipNext: () => void;
    flipPrev: () => void;
    flip: (page: number) => void;
    getCurrentPageIndex: () => number;
    getPageCount: () => number;
  };
};

function catalogPages(): ReactElement[] {
  const pages: ReactElement[] = [];

  pages.push(
    <V2FlipPage
      key="cover"
      className="v2-flip-page--cover v2-flip-page--hard"
      density="hard"
    >
      <div className="v2-catalog-cover">
        <div className="v2-cover-art">
          <Image
            src={CATALOG_COVER_ART}
            alt=""
            fill
            sizes="(max-width: 900px) 70vw, 360px"
            className="v2-cover-art-img"
            priority={false}
            aria-hidden
          />
        </div>
        <div className="v2-cover-meta">
          <Image
            src={LOGO}
            alt=""
            width={160}
            height={32}
            className="v2-catalog-cover-logo"
            aria-hidden
          />
          <strong className="v2-catalog-cover-title">
            {catalogBookCopy.coverTitle}
          </strong>
          <span className="v2-catalog-cover-sub">
            {catalogBookCopy.coverSubtitle}
          </span>
          <em className="v2-catalog-cover-hint">ورق بزنید</em>
        </div>
      </div>
    </V2FlipPage>,
  );

  catalogs.forEach((item) => {
    const theme = {
      ["--page-bg"]: item.theme.background,
      ["--page-ink"]: item.theme.text,
      ["--page-accent"]: item.theme.accent,
    } as CSSProperties;

    pages.push(
      <V2FlipPage
        key={`${item.id}-copy`}
        className="v2-flip-page--paper"
        style={theme}
      >
        <div className="v2-catalog-copy">
          <span className="v2-catalog-copy-kicker">{item.category}</span>
          <h3 className="v2-catalog-copy-title">{item.title}</h3>
          <p className="v2-catalog-copy-desc">{item.description}</p>
          <div className="v2-catalog-copy-meta">
            <span>{item.year}</span>
            <span>{toPersianDigits(item.pageCount)} صفحه</span>
          </div>
        </div>
      </V2FlipPage>,
    );

    pages.push(
      <V2FlipPage
        key={`${item.id}-media`}
        className="v2-flip-page--paper v2-flip-page--media"
        style={theme}
      >
        <div className="v2-catalog-media">
          <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="(max-width: 900px) 70vw, 400px"
            className="v2-catalog-media-img"
          />
        </div>
      </V2FlipPage>,
    );
  });

  pages.push(
    <V2FlipPage
      key="back"
      className="v2-flip-page--cover v2-flip-page--hard v2-flip-page--back"
      density="hard"
    >
      <div className="v2-catalog-cover v2-catalog-cover--back">
        <Image
          src="/brand/orginal-clear.png"
          alt=""
          width={88}
          height={88}
          className="v2-catalog-cover-seal"
          aria-hidden
        />
        <span>این راه سبز است</span>
      </div>
    </V2FlipPage>,
  );

  return pages;
}

/**
 * Branded 3D catalog booklet for /v2 — StPageFlip page curl.
 */
export function V2CatalogFlipbook() {
  const rootRef = useRef<HTMLElement | null>(null);
  const bookRef = useRef<FlipApi | null>(null);
  const [visible, setVisible] = useState(false);
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [size, setSize] = useState({ w: 340, h: 470, portrait: false });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  useEffect(() => {
    const update = () => {
      const vw = window.innerWidth;
      if (vw < 720) {
        const w = Math.min(300, vw - 48);
        setSize({ w, h: Math.round(w * 1.35), portrait: true });
      } else if (vw < 1100) {
        setSize({ w: 300, h: 420, portrait: false });
      } else {
        setSize({ w: 340, h: 470, portrait: false });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const onFlip = useCallback((e: { data: number }) => {
    setPage(e.data);
  }, []);

  const onInit = useCallback(() => {
    const count = bookRef.current?.pageFlip()?.getPageCount?.() ?? 0;
    setPageCount(count);
  }, []);

  const flipNext = () => bookRef.current?.pageFlip()?.flipNext();
  const flipPrev = () => bookRef.current?.pageFlip()?.flipPrev();

  const goCatalog = (item: CatalogItem) => {
    const idx = catalogs.findIndex((c) => c.id === item.id);
    if (idx < 0) return;
    bookRef.current?.pageFlip()?.flip(1 + idx * 2);
  };

  const activeCatalog =
    page <= 0
      ? null
      : catalogs[
          Math.min(
            Math.max(Math.floor((page - 1) / 2), 0),
            catalogs.length - 1,
          )
        ];

  return (
    <section
      ref={rootRef}
      id="v2-catalogs"
      className={`v2-bookcase v2-bookcase--catalog${visible ? " is-visible" : ""}`}
      aria-label={catalogBookCopy.sectionTitle}
    >
      <div className="v2-bookcase-shell">
        <header className="v2-bookcase-head">
          <p className="v2-bookcase-kicker">دفترچهٔ سبز</p>
          <h2 className="v2-bookcase-title">{catalogBookCopy.sectionTitle}</h2>
          <p className="v2-bookcase-lead">{catalogBookCopy.sectionSubtitle}</p>
        </header>

        <div className="v2-bookcase-tabs" role="tablist" aria-label="کاتالوگ‌ها">
          {catalogs.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              className={`v2-bookcase-tab${
                activeCatalog?.id === item.id ? " is-active" : ""
              }`}
              aria-selected={activeCatalog?.id === item.id}
              onClick={() => goCatalog(item)}
            >
              {item.tabLabel}
            </button>
          ))}
        </div>

        <div className="v2-bookcase-stage">
          <button
            type="button"
            className="v2-bookcase-nav v2-bookcase-nav--prev"
            onClick={flipPrev}
            aria-label="ورق قبلی"
            disabled={page <= 0}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M14 6 8 12l6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <div className="v2-bookcase-book-wrap">
            {mounted ? (
              <HTMLFlipBook
                key={`${size.w}x${size.h}-${size.portrait ? "p" : "l"}`}
                ref={bookRef}
                className="v2-flipbook"
                style={{}}
                width={size.w}
                height={size.h}
                size="fixed"
                minWidth={240}
                maxWidth={480}
                minHeight={320}
                maxHeight={640}
                drawShadow
                flippingTime={1000}
                usePortrait={size.portrait}
                startZIndex={2}
                autoSize={false}
                maxShadowOpacity={0.3}
                showCover
                mobileScrollSupport
                clickEventForward
                useMouseEvents
                swipeDistance={28}
                showPageCorners
                disableFlipByClick={false}
                startPage={0}
                onFlip={onFlip}
                onInit={onInit}
              >
                {catalogPages()}
              </HTMLFlipBook>
            ) : (
              <div
                className="v2-flipbook-skeleton"
                style={{ width: size.w, height: size.h }}
                aria-hidden
              />
            )}
          </div>

          <button
            type="button"
            className="v2-bookcase-nav v2-bookcase-nav--next"
            onClick={flipNext}
            aria-label="ورق بعدی"
            disabled={pageCount > 0 && page >= pageCount - 1}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M10 6l6 6-6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <footer className="v2-bookcase-foot">
          <span>
            {toPersianDigits(Math.min(page + 1, Math.max(pageCount, 1)))} /{" "}
            {toPersianDigits(Math.max(pageCount, 1))}
          </span>
          <div className="v2-bookcase-progress" aria-hidden="true">
            <span
              style={{
                width: `${pageCount > 1 ? (page / (pageCount - 1)) * 100 : 0}%`,
              }}
            />
          </div>
        </footer>
      </div>
    </section>
  );
}
