"use client";

import Image from "next/image";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
} from "react";
import HTMLFlipBook from "react-pageflip";

import {
  v2CatalogCopy,
  v2Catalogs,
  type V2CatalogSpread,
} from "@/data/v2-reading-room";

import { V2BookcaseScene } from "./v2-bookcase-scene";
import { V2FlipPage } from "./v2-flip-page";
import { useV2BookFlip } from "./use-v2-book-flip";

const LOGO = "/brand/logo.svg";

function toPersianDigits(value: number) {
  return String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

/** Wrap body into notebook rows — prefer phrase breaks over mid-phrase cuts. */
function wrapNotebookLines(text: string, maxChars = 36): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if ([...next].length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function BookChrome() {
  return (
    <>
      <span className="v2-book-spine" aria-hidden>
        <span className="v2-book-spine-bands" />
      </span>
      <span className="v2-book-headband" aria-hidden />
      <span className="v2-book-foreedge" aria-hidden />
    </>
  );
}

function buildCatalogPages(): ReactElement[] {
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
            src={v2CatalogCopy.cover}
            alt=""
            fill
            sizes="(max-width: 900px) 70vw, 360px"
            className="v2-cover-art-img"
            priority
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
            {v2CatalogCopy.coverTitle}
          </strong>
          <span className="v2-catalog-cover-sub">
            {v2CatalogCopy.coverSubtitle}
          </span>
          <em className="v2-catalog-cover-hint">ورق بزنید</em>
        </div>
      </div>
    </V2FlipPage>,
  );

  v2Catalogs.forEach((item, index) => {
    const theme = {
      ["--page-bg"]: item.theme.background,
      ["--page-ink"]: item.theme.text,
      ["--page-accent"]: item.theme.accent,
    } as CSSProperties;
    const bodyLines = wrapNotebookLines(item.description, 36);

    pages.push(
      <V2FlipPage
        key={`${item.id}-copy`}
        className="v2-flip-page--paper v2-flip-page--brand"
        style={theme}
      >
        <div className="v2-catalog-copy">
          <p className="v2-catalog-line v2-page-running">{v2CatalogCopy.running}</p>
          <p className="v2-catalog-line v2-catalog-copy-kicker">{item.category}</p>
          <h3 className="v2-catalog-line v2-catalog-copy-title">{item.title}</h3>
          {bodyLines.map((line, lineIndex) => (
            <p
              key={`${item.id}-line-${lineIndex}`}
              className="v2-catalog-line v2-catalog-copy-desc"
            >
              {line}
            </p>
          ))}
          <p className="v2-catalog-line v2-catalog-copy-quote">این راه سبز است</p>
        </div>
      </V2FlipPage>,
    );

    pages.push(
      <V2FlipPage
        key={`${item.id}-media`}
        className="v2-flip-page--paper v2-flip-page--media v2-flip-page--brand"
        style={theme}
      >
        <figure className="v2-catalog-media">
          <div className="v2-catalog-media-plate">
            <Image
              src={item.image}
              alt={item.alt}
              fill
              sizes="(max-width: 900px) 70vw, 400px"
              className="v2-catalog-media-img"
              priority={index === 0}
            />
          </div>
          <figcaption className="v2-page-caption">{item.caption}</figcaption>
        </figure>
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
 * Branded catalog hardcover for /v2 — StPageFlip motion preserved, open/close smoothed.
 */
export function V2CatalogFlipbook() {
  const rootRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [size, setSize] = useState({ w: 284, h: 394 });
  const [mounted, setMounted] = useState(false);

  const {
    bookRef,
    page,
    pageCount,
    bookState,
    isOpen,
    isSingleCover,
    onFrontCover,
    onLastCover,
    coverTransit,
    onFlip,
    onInit,
    onChangeState,
    flipNext,
    flipPrev,
    flipTo,
    armOpenLayout,
  } = useV2BookFlip(size, { stableShell: true });

  const pages = useMemo(() => buildCatalogPages(), []);

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
        const w = Math.min(236, vw - 64);
        setSize({ w, h: Math.round(w * 1.39) });
      } else if (vw < 1100) {
        setSize({ w: 258, h: 358 });
      } else {
        setSize({ w: 284, h: 394 });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const goCatalog = (item: V2CatalogSpread) => {
    const idx = v2Catalogs.findIndex((c) => c.id === item.id);
    if (idx < 0) return;
    armOpenLayout();
    flipTo(1 + idx * 2);
  };

  const activeCatalog =
    page <= 0
      ? null
      : v2Catalogs[
          Math.min(
            Math.max(Math.floor((page - 1) / 2), 0),
            v2Catalogs.length - 1,
          )
        ];

  return (
    <section
      ref={rootRef}
      id="v2-catalogs"
      className={`v2-bookcase v2-bookcase--catalog${visible ? " is-visible" : ""}${isOpen ? " is-spread" : ""}`}
      aria-label={v2CatalogCopy.sectionTitle}
    >
      <V2BookcaseScene variant="catalog" />

      <div className="v2-bookcase-shell">
        <div className="v2-bookcase-layout">
          <header className="v2-bookcase-head">
            <p className="v2-bookcase-kicker">این راه سبز است</p>
            <span className="v2-bookcase-mark" aria-hidden />
            <h2 className="v2-bookcase-title">{v2CatalogCopy.sectionTitle}</h2>
            <p className="v2-bookcase-lead">{v2CatalogCopy.sectionLead}</p>
            <div className="v2-bookcase-tabs" role="tablist" aria-label="کاتالوگ‌ها">
              {v2Catalogs.map((item) => (
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
          </header>

          <div className="v2-bookcase-stage">
            <div
              className={`v2-book-object${isOpen ? " is-open" : ""}${
                isSingleCover ? " is-cover" : ""
              }${onFrontCover ? " is-front-cover" : ""}${
                onLastCover ? " is-back-cover" : ""
              }${coverTransit ? " is-cover-transit" : ""}${
                bookState === "flipping" || bookState === "user_fold"
                  ? " is-turning"
                  : ""
              }`}
              style={
                {
                  ["--page-w"]: `${size.w}px`,
                  ["--page-h"]: `${size.h}px`,
                } as CSSProperties
              }
            >
              <div
                className="v2-book-case"
                onPointerDown={page === 0 ? armOpenLayout : undefined}
              >
                <BookChrome />
                <div className="v2-bookcase-book-wrap">
                  {mounted ? (
                    <HTMLFlipBook
                      key={`cat-${size.w}x${size.h}`}
                      ref={bookRef}
                      className="v2-flipbook"
                      style={{}}
                      width={size.w}
                      height={size.h}
                      size="fixed"
                      minWidth={size.w}
                      maxWidth={size.w * 2}
                      minHeight={size.h}
                      maxHeight={size.h}
                      drawShadow
                      flippingTime={1100}
                      usePortrait
                      startZIndex={2}
                      autoSize={false}
                      maxShadowOpacity={0.65}
                      showCover
                      mobileScrollSupport
                      clickEventForward
                      useMouseEvents
                      swipeDistance={16}
                      showPageCorners={page > 0}
                      disableFlipByClick={false}
                      startPage={0}
                      renderOnlyPageLengthChange
                      onFlip={onFlip}
                      onInit={onInit}
                      onChangeState={onChangeState}
                    >
                      {pages}
                    </HTMLFlipBook>
                  ) : (
                    <div
                      className="v2-flipbook-skeleton"
                      style={{ width: size.w, height: size.h }}
                      aria-hidden
                    />
                  )}
                </div>
              </div>
              <span className="v2-book-shadow" aria-hidden />
            </div>

            {onFrontCover && bookState === "read" ? (
              <p className="v2-book-cue" aria-hidden>
                ورق بزنید
              </p>
            ) : null}

            <div
              className={`v2-bookcase-navs${onFrontCover ? " is-cover-hidden" : ""}`}
            >
              <button
                type="button"
                className="v2-bookcase-nav v2-bookcase-nav--prev"
                onClick={() => {
                  armOpenLayout();
                  void flipPrev();
                }}
                aria-label="ورق قبلی"
                disabled={page <= 0 || bookState === "flipping"}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M14 6 8 12l6 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                className="v2-bookcase-nav v2-bookcase-nav--next"
                onClick={() => {
                  armOpenLayout();
                  void flipNext();
                }}
                aria-label="ورق بعدی"
                disabled={
                  (pageCount > 0 && page >= pageCount - 1) ||
                  bookState === "flipping"
                }
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M10 6l6 6-6 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <footer className="v2-bookcase-foot">
          <span className="v2-bookcase-folio">
            {toPersianDigits(Math.min(page + 1, Math.max(pageCount, 1)))}
            <em>/</em>
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
