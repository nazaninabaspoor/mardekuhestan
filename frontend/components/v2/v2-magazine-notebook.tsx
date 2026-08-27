"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactElement,
} from "react";
import HTMLFlipBook from "react-pageflip";

import {
  articleGroups,
  brand,
  getArticlesByIds,
} from "@/lib/brand";

import { V2FlipPage } from "./v2-flip-page";

const LOGO = "/brand/logo.svg";
const MAGAZINE_COVER_ART = "/brand/v2/magazine-cover.png";

function toPersianDigits(value: number) {
  return String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

type FlipApi = {
  pageFlip: () => {
    flipNext: () => void;
    flipPrev: () => void;
    getPageCount: () => number;
  };
};

/**
 * Cute minimal magazine notebook for /v2 — same StPageFlip curl as catalogs.
 */
export function V2MagazineNotebook() {
  const rootRef = useRef<HTMLElement | null>(null);
  const bookRef = useRef<FlipApi | null>(null);
  const [visible, setVisible] = useState(false);
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [size, setSize] = useState({ w: 280, h: 380, portrait: false });
  const [mounted, setMounted] = useState(false);

  const articles = getArticlesByIds(articleGroups[0].articleIds).slice(0, 4);

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
        const w = Math.min(280, vw - 56);
        setSize({ w, h: Math.round(w * 1.32), portrait: true });
      } else if (vw < 1100) {
        setSize({ w: 285, h: 395, portrait: false });
      } else {
        setSize({ w: 375, h: 520, portrait: false });
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
    setPageCount(bookRef.current?.pageFlip()?.getPageCount?.() ?? 0);
  }, []);

  const pages: ReactElement[] = [];

  pages.push(
    <V2FlipPage
      key="mag-cover"
      className="v2-flip-page--cover v2-flip-page--hard v2-mag-cover-page"
      density="hard"
    >
      <div className="v2-mag-cover">
        <div className="v2-cover-art">
          <Image
            src={MAGAZINE_COVER_ART}
            alt=""
            fill
            sizes="(max-width: 900px) 60vw, 300px"
            className="v2-cover-art-img"
            priority={false}
            aria-hidden
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
            aria-hidden
          />
          <strong className="v2-mag-cover-title">مجله {brand.name}</strong>
          <span className="v2-mag-cover-sub">داستان‌هایی از مرتع تا سفره</span>
          <em className="v2-mag-cover-hint">ورق بزنید</em>
        </div>
      </div>
    </V2FlipPage>,
  );

  articles.forEach((article) => {
    pages.push(
      <V2FlipPage key={`${article.id}-story`} className="v2-flip-page--paper v2-mag-story">
        <div className="v2-mag-story-inner">
          <span className="v2-mag-story-kicker">{article.category}</span>
          <h3 className="v2-mag-story-title">{article.title}</h3>
          <p className="v2-mag-story-excerpt">{article.excerpt}</p>
          <span className="v2-mag-story-date">{article.date}</span>
          <Link href={`/magazine/${article.slug}`} className="v2-mag-story-link">
            خواندن مطلب
          </Link>
        </div>
      </V2FlipPage>,
    );

    pages.push(
      <V2FlipPage key={`${article.id}-photo`} className="v2-flip-page--paper v2-mag-photo">
        <div className="v2-mag-photo-frame">
          <Image
            src={article.image}
            alt={article.alt}
            fill
            sizes="(max-width: 900px) 60vw, 320px"
            className="v2-mag-photo-img"
          />
        </div>
      </V2FlipPage>,
    );
  });

  pages.push(
    <V2FlipPage
      key="mag-back"
      className="v2-flip-page--cover v2-flip-page--hard v2-flip-page--back"
      density="hard"
    >
      <div className="v2-mag-cover v2-mag-cover--back">
        <Link href="/magazine" className="v2-mag-all">
          همهٔ داستان‌ها
        </Link>
        <span>این راه سبز است</span>
      </div>
    </V2FlipPage>,
  );

  return (
    <section
      ref={rootRef}
      id="v2-magazine"
      className={`v2-bookcase v2-bookcase--magazine${visible ? " is-visible" : ""}`}
      aria-label={`مجله ${brand.name}`}
    >
      <div className="v2-bookcase-shell">
        <header className="v2-bookcase-head">
          <p className="v2-bookcase-kicker">دفترچهٔ داستان</p>
          <h2 className="v2-bookcase-title">مجله {brand.name}</h2>
          <p className="v2-bookcase-lead">
            داستان‌هایی برای خواندن؛ کوچک، گرم، و نزدیک به سفره.
          </p>
        </header>

        <div className="v2-bookcase-stage">
          <button
            type="button"
            className="v2-bookcase-nav v2-bookcase-nav--prev"
            onClick={() => bookRef.current?.pageFlip()?.flipPrev()}
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

          <div className="v2-bookcase-book-wrap v2-bookcase-book-wrap--notebook">
            {mounted ? (
              <HTMLFlipBook
                key={`mag-${size.w}x${size.h}-${size.portrait ? "p" : "l"}`}
                ref={bookRef}
                className="v2-flipbook v2-flipbook--notebook"
                style={{}}
                width={size.w}
                height={size.h}
                size="fixed"
                minWidth={220}
                maxWidth={460}
                minHeight={300}
                maxHeight={640}
                drawShadow
                flippingTime={920}
                usePortrait={size.portrait}
                startZIndex={2}
                autoSize={false}
                maxShadowOpacity={0.26}
                showCover
                mobileScrollSupport
                clickEventForward
                useMouseEvents
                swipeDistance={24}
                showPageCorners
                disableFlipByClick={false}
                startPage={0}
                onFlip={onFlip}
                onInit={onInit}
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

          <button
            type="button"
            className="v2-bookcase-nav v2-bookcase-nav--next"
            onClick={() => bookRef.current?.pageFlip()?.flipNext()}
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
          <Link href="/magazine" className="v2-bookcase-more">
            مشاهده همه
          </Link>
        </footer>
      </div>
    </section>
  );
}
