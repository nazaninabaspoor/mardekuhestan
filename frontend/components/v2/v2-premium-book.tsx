"use client";

import HTMLFlipBook from "react-pageflip";
import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
  type ReactNode,
} from "react";

import { V2FlipPage } from "./v2-flip-page";

export type V2BookPage = {
  id: string;
  kind: "cover" | "paper" | "back";
  node: ReactNode;
};

type FlipApi = {
  pageFlip: () => {
    flipNext: () => void;
    flipPrev: () => void;
    getCurrentPageIndex: () => number;
    getPageCount: () => number;
  };
};

function toPersianDigits(value: number) {
  return String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

type V2FlipReaderProps = {
  pages: V2BookPage[];
  title: string;
  width: number;
  height: number;
  startPage?: number;
  onClose: () => void;
};

/**
 * Single lightbox flipbook (DearFlip / Issuu pattern).
 * Only one instance should mount at a time.
 */
export function V2FlipReader({
  pages,
  title,
  width,
  height,
  startPage = 0,
  onClose,
}: V2FlipReaderProps) {
  const bookRef = useRef<FlipApi | null>(null);
  const [index, setIndex] = useState(startPage);
  const total = Math.max(pages.length, 1);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      const api = bookRef.current?.pageFlip?.();
      if (!api) return;
      if (event.key === "ArrowLeft") api.flipNext();
      if (event.key === "ArrowRight") api.flipPrev();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const FlipBook = HTMLFlipBook as unknown as ComponentType<any>;

  return (
    <div
      className="v2-reader"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={
        {
          ["--pb-w"]: `${width}px`,
          ["--pb-h"]: `${height}px`,
        } as CSSProperties
      }
    >
      <button
        type="button"
        className="v2-reader-scrim"
        aria-label="بستن"
        onClick={onClose}
      />

      <div className="v2-reader-panel">
        <header className="v2-reader-bar">
          <p className="v2-reader-title">{title}</p>
          <button
            type="button"
            className="v2-reader-close"
            onClick={onClose}
            aria-label="بستن کتاب"
          >
            بستن
          </button>
        </header>

        <div className="v2-reader-stage">
          <button
            type="button"
            className="v2-reader-nav v2-reader-nav--prev"
            onClick={() => bookRef.current?.pageFlip()?.flipPrev()}
            disabled={index <= 0}
            aria-label="ورق قبلی"
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

          <div className="v2-reader-book">
            <FlipBook
              ref={bookRef}
              className="v2-pb-flip"
              style={{ margin: "0 auto" }}
              width={width}
              height={height}
              size="fixed"
              minWidth={width}
              maxWidth={width}
              minHeight={height}
              maxHeight={height}
              drawShadow={true}
              maxShadowOpacity={0.55}
              showCover={true}
              usePortrait={true}
              startZIndex={5}
              autoSize={false}
              mobileScrollSupport={false}
              clickEventForward={true}
              useMouseEvents={true}
              swipeDistance={18}
              showPageCorners={true}
              disableFlipByClick={false}
              flippingTime={900}
              startPage={Math.min(startPage, total - 1)}
              onFlip={(event: { data: number }) => setIndex(event.data)}
            >
              {pages.map((item) => (
                <V2FlipPage
                  key={item.id}
                  density={item.kind === "paper" ? "soft" : "hard"}
                  className={`v2-pb-flip-leaf v2-pb-flip-leaf--${item.kind}`}
                >
                  {item.node}
                </V2FlipPage>
              ))}
            </FlipBook>
          </div>

          <button
            type="button"
            className="v2-reader-nav v2-reader-nav--next"
            onClick={() => bookRef.current?.pageFlip()?.flipNext()}
            disabled={index >= total - 1}
            aria-label="ورق بعدی"
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

        <div className="v2-reader-meter" aria-hidden="true">
          <span>
            {toPersianDigits(index + 1)} / {toPersianDigits(total)}
          </span>
          <div className="v2-reader-progress">
            <span
              style={{
                width: `${total > 1 ? (index / (total - 1)) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
