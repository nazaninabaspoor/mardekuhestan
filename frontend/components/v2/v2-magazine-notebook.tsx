"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
} from "react";
import HTMLFlipBook from "react-pageflip";

import { brand } from "@/lib/brand";
import { v2MagazineIssue } from "@/data/v2-reading-room";

import { V2BookcaseScene } from "./v2-bookcase-scene";
import { V2FlipPage } from "./v2-flip-page";
import { useV2BookFlip } from "./use-v2-book-flip";

const LOGO = "/brand/logo.svg";

function toPersianDigits(value: number) {
  return String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
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

function buildMagazinePages(): ReactElement[] {
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
            src={v2MagazineIssue.cover}
            alt=""
            fill
            sizes="(max-width: 900px) 60vw, 320px"
            className="v2-cover-art-img"
            priority
            aria-hidden
          />
        </div>
        <div className="v2-cover-meta">
          <span className="v2-mag-cover-band">مجله · {v2MagazineIssue.season}</span>
          <Image
            src={LOGO}
            alt=""
            width={140}
            height={28}
            className="v2-mag-cover-logo"
            aria-hidden
          />
          <strong className="v2-mag-cover-title">{v2MagazineIssue.coverTitle}</strong>
          <span className="v2-mag-cover-sub">{v2MagazineIssue.coverSubtitle}</span>
          <em className="v2-mag-cover-hint">ورق بزنید</em>
        </div>
      </div>
    </V2FlipPage>,
  );

  v2MagazineIssue.stories.forEach((story, index) => {
    pages.push(
      <V2FlipPage
        key={`${story.id}-story`}
        className="v2-flip-page--paper v2-flip-page--brand v2-mag-story"
      >
        <div className="v2-mag-story-inner">
          <span className="v2-mag-story-peak" aria-hidden />
          <span className="v2-page-running">{v2MagazineIssue.running}</span>
          <span className="v2-mag-story-kicker">{story.kicker}</span>
          <h3 className="v2-mag-story-title">{story.title}</h3>
          <p className="v2-mag-story-excerpt">{story.excerpt}</p>
          <p className="v2-mag-story-body">{story.body}</p>
          <div className="v2-mag-story-foot">
            <span className="v2-mag-story-motto">این راه سبز است</span>
            <span className="v2-page-folio">{story.folio}</span>
          </div>
          <span className="v2-mag-story-band" aria-hidden />
        </div>
      </V2FlipPage>,
    );

    pages.push(
      <V2FlipPage
        key={`${story.id}-photo`}
        className="v2-flip-page--paper v2-flip-page--media v2-flip-page--brand v2-mag-photo"
      >
        <figure className="v2-mag-photo-frame">
          <Image
            src={story.image}
            alt={story.alt}
            fill
            sizes="(max-width: 900px) 60vw, 320px"
            className="v2-mag-photo-img"
            priority={index === 0}
          />
          <figcaption className="v2-page-caption">{story.caption}</figcaption>
        </figure>
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
        <Image
          src="/brand/orginal-clear.png"
          alt=""
          width={88}
          height={88}
          className="v2-catalog-cover-seal"
          aria-hidden
        />
        <span>این راه سبز است</span>
        <Link href="/magazine" className="v2-mag-all">
          همهٔ داستان‌ها
        </Link>
      </div>
    </V2FlipPage>,
  );

  return pages;
}

/**
 * Branded magazine hardcover for /v2 — StPageFlip motion preserved, open/close smoothed.
 */
export function V2MagazineNotebook() {
  const rootRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [size, setSize] = useState({ w: 272, h: 378 });
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
    onFlip,
    onInit,
    onChangeState,
    flipNext,
    flipPrev,
    armOpenLayout,
  } = useV2BookFlip(size);

  const pages = useMemo(() => buildMagazinePages(), []);

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
        const w = Math.min(228, vw - 72);
        setSize({ w, h: Math.round(w * 1.39) });
      } else if (vw < 1100) {
        setSize({ w: 248, h: 344 });
      } else {
        setSize({ w: 272, h: 378 });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <section
      ref={rootRef}
      id="v2-magazine"
      className={`v2-bookcase v2-bookcase--magazine${visible ? " is-visible" : ""}${isOpen ? " is-spread" : ""}`}
      aria-label={`مجله ${brand.name}`}
    >
      <V2BookcaseScene variant="magazine" />
      <span className="v2-section-edge v2-section-edge--top" aria-hidden="true" />

      <div className="v2-bookcase-shell">
        <div className="v2-bookcase-layout">
          <header className="v2-bookcase-head">
            <p className="v2-bookcase-kicker">{v2MagazineIssue.kicker}</p>
            <span className="v2-bookcase-mark" aria-hidden />
            <h2 className="v2-bookcase-title">{v2MagazineIssue.title}</h2>
            <p className="v2-bookcase-lead">{v2MagazineIssue.lead}</p>
          </header>

          <div className="v2-bookcase-stage">
            <div
              className={`v2-book-object${isOpen ? " is-open" : ""}${
                isSingleCover ? " is-cover" : ""
              }${onFrontCover ? " is-front-cover" : ""}${
                onLastCover ? " is-back-cover" : ""
              }${
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
                <div className="v2-bookcase-book-wrap v2-bookcase-book-wrap--notebook">
                  {mounted ? (
                    <HTMLFlipBook
                      key={`mag-${size.w}x${size.h}`}
                      ref={bookRef}
                      className="v2-flipbook v2-flipbook--notebook"
                      style={{}}
                      width={size.w}
                      height={size.h}
                      size="fixed"
                      minWidth={size.w}
                      maxWidth={size.w * 2}
                      minHeight={size.h}
                      maxHeight={size.h}
                      drawShadow
                      flippingTime={1000}
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

            <div className="v2-bookcase-navs">
              <button
                type="button"
                className="v2-bookcase-nav v2-bookcase-nav--prev"
                onClick={() => void flipPrev()}
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
                onClick={() => void flipNext()}
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
          <Link href="/magazine" className="v2-bookcase-more">
            {v2MagazineIssue.footHint}
          </Link>
        </footer>
      </div>
      <span className="v2-section-edge v2-section-edge--bottom" aria-hidden="true" />
    </section>
  );
}
