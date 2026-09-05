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

import { resolveProductImage } from "@/app/profile/page";
import { V2FlipPage } from "./v2-flip-page";
import { useV2BookFlip } from "./use-v2-book-flip";

const LOGO = "/brand/logo.svg";

function toPersianDigits(value: number | string) {
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

export type PastureOrderProps = {
  id: string;
  title: string;
  date: string;
  pastureName: string;
  altitude: string;
  grazing: string;
  vetCode: string;
  packDate?: string;
  tempLog?: string;
  status?: string;
  items: Array<{
    name: string;
    image?: string;
    cut?: string;
    price: string;
  }>;
  finalPrice: string;
};

interface OrdersPastureFlipbookProps {
  orders: PastureOrderProps[];
  buyerInfo: {
    name: string;
    phone: string;
    address: string;
    nationalCode?: string;
  };
  onDownloadPdf: (order: PastureOrderProps) => void;
  onReorder: () => void;
}

export function OrdersPastureFlipbook({
  orders,
  buyerInfo,
  onDownloadPdf,
  onReorder,
}: OrdersPastureFlipbookProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const [size, setSize] = useState({ w: 290, h: 410 });
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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const update = () => {
      const vw = window.innerWidth;
      if (vw < 640) {
        const w = Math.min(220, vw - 48);
        setSize({ w, h: Math.round(w * 1.38) });
      } else if (vw < 1000) {
        setSize({ w: 250, h: 355 });
      } else {
        setSize({ w: 290, h: 410 });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const displayOrders = useMemo(() => {
    return orders.slice(0, 15);
  }, [orders]);

  const pages = useMemo<ReactElement[]>(() => {
    const list: ReactElement[] = [];

    // 1. FRONT COVER — مرد کوهستان پس از تحویل سفارش‌ها با رضایت و حال خوب در مرتع
    list.push(
      <V2FlipPage
        key="cover"
        className="v2-flip-page--cover v2-flip-page--hard"
        density="hard"
      >
        <div className="v2-catalog-cover">
          <div className="v2-cover-art">
            <Image
              src="/brand/v2/book/cat-work-photo-full.png"
              alt="مرد کوهستان پس از تحویل سفارش‌ها در مرتع"
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
              width={150}
              height={30}
              className="v2-catalog-cover-logo"
              aria-hidden
            />
            <strong className="v2-catalog-cover-title">
              دفترچه شناسنامه و سوابق مرتع
            </strong>
            <span className="v2-catalog-cover-sub">
              {toPersianDigits(displayOrders.length)} سفارش تحویل‌شده با زنجیره سرد
            </span>
            <em className="v2-catalog-cover-hint">ورق بزنید</em>
          </div>
        </div>
      </V2FlipPage>,
    );

    // 2. SPREADS FOR EACH ORDER (15 Orders = 15 Spreads)
    displayOrders.forEach((ord, index) => {
      const orderNumPersian = toPersianDigits(index + 1);
      const primaryItemImg = resolveProductImage(
        ord.items[0]?.name || "",
        ord.items[0]?.image,
      );

      // Page A (Right Page in Spread — Order Passport & Pasture Story)
      list.push(
        <V2FlipPage
          key={`ord-${ord.id}-right`}
          className="v2-flip-page--paper v2-flip-page--brand"
          style={
            {
              ["--page-bg"]: "#FAF6EE",
              ["--page-ink"]: "#005B48",
              ["--page-accent"]: "#005B48",
            } as CSSProperties
          }
        >
          <div className="v2-catalog-copy" style={{ gap: "4px", padding: "16px 18px" }}>
            <p className="v2-catalog-line v2-page-running">
              سفارش #{ord.id} · ورق {orderNumPersian}
            </p>
            <p className="v2-catalog-line v2-catalog-copy-kicker" style={{ color: "#D4A359", fontWeight: 800 }}>
              تحویل‌شده در {ord.date}
            </p>
            <h3 className="v2-catalog-line v2-catalog-copy-title" style={{ fontSize: "14px", margin: "2px 0 6px" }}>
              {ord.title}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px", margin: "6px 0", fontSize: "11.5px", color: "#1D1D1B" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span>📍</span>
                <strong>خاستگاه:</strong> <span>{ord.pastureName}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span>⛰️</span>
                <strong>ارتفاع چراگاه:</strong> <span>{ord.altitude}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span>🌿</span>
                <strong>تغذیه مرتع:</strong> <span>{ord.grazing}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span>🛡️</span>
                <strong>تأییدیه بهداشت:</strong> <span>{ord.vetCode}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span>❄️</span>
                <strong>پایش زنجیره سرد:</strong> <span>{ord.tempLog || "۲.۴°C"}</span>
              </div>
            </div>

            <div style={{ marginTop: "auto", paddingTop: "8px", borderTop: "1px dashed rgba(212,163,89,0.4)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <small style={{ fontSize: "10px", color: "#5D686E" }}>مبلغ کل پرداخت‌شده:</small>
                <strong style={{ fontSize: "13.5px", color: "#005B48", fontWeight: 900 }}>{ord.finalPrice}</strong>
              </div>
              <button
                type="button"
                style={{
                  background: "#005B48",
                  border: "1px solid #005B48",
                  color: "#FFFFFF",
                  fontSize: "11px",
                  fontWeight: 800,
                  padding: "5px 10px",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onDownloadPdf(ord);
                }}
              >
                دانلود رسید PDF
              </button>
            </div>
          </div>
        </V2FlipPage>,
      );

      // Page B (Left Page in Spread — Products List & Photo)
      list.push(
        <V2FlipPage
          key={`ord-${ord.id}-left`}
          className="v2-flip-page--paper v2-flip-page--media v2-flip-page--brand"
          style={
            {
              ["--page-bg"]: "#FAF6EE",
              ["--page-ink"]: "#005B48",
              ["--page-accent"]: "#005B48",
            } as CSSProperties
          }
        >
          <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "16px 18px", boxSizing: "border-box", gap: "8px" }}>
            <p style={{ margin: 0, fontSize: "11px", fontWeight: 800, color: "#005B48" }}>
              محتویات داخل این بسته ({toPersianDigits(ord.items.length)} قلم):
            </p>

            <div style={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
              {ord.items.map((it, itemIdx) => {
                const itImg = resolveProductImage(it.name, it.image);
                return (
                  <div
                    key={itemIdx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "6px 8px",
                      background: "#FFFFFF",
                      borderRadius: "8px",
                      border: "1px solid #E5E0D8",
                    }}
                  >
                    <div style={{ width: "32px", height: "32px", borderRadius: "6px", background: "#FAF8F5", border: "1px solid #E5E0D8", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                      <Image
                        src={itImg}
                        alt={it.name}
                        width={26}
                        height={26}
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
                      <strong style={{ fontSize: "11.5px", color: "#1D1D1B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {it.name}
                      </strong>
                      <span style={{ fontSize: "10px", color: "#5D686E" }}>{it.cut || "سفارش مرتع"}</span>
                    </div>
                    <strong style={{ fontSize: "11.5px", color: "#005B48", fontWeight: 900, whiteSpace: "nowrap" }}>
                      {it.price}
                    </strong>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: "auto", padding: "8px 10px", background: "#EBF5F1", borderRadius: "8px", border: "1px solid rgba(0,91,72,0.2)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "10.5px", color: "#005B48", fontWeight: 800 }}>
                ❄️ زنجیره سرد پایش‌شده
              </span>
              <button
                type="button"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#005B48",
                  fontSize: "11px",
                  fontWeight: 900,
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onReorder();
                }}
              >
                سفارش مجدد اقلام
              </button>
            </div>
          </div>
        </V2FlipPage>,
      );
    });

    // 3. BACK COVER
    list.push(
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

    return list;
  }, [displayOrders, buyerInfo, onDownloadPdf, onReorder]);

  const activeIndex = page <= 0 ? null : Math.min(Math.max(Math.floor((page - 1) / 2), 0), displayOrders.length - 1);

  return (
    <div
      className={`v2-bookcase v2-bookcase--catalog is-visible${isOpen ? " is-spread" : ""}`}
      style={{ background: "transparent", minHeight: 0, padding: 0 }}
    >
      <div className="v2-bookcase-shell" style={{ maxWidth: "100%", padding: 0 }}>
        <div className="v2-bookcase-layout" style={{ maxWidth: "100%" }}>
          {/* Top Tabs Selector for jumping to any of the 15 orders */}
          <div className="v2-bookcase-tabs" role="tablist" style={{ justifyContent: "center", marginBottom: "8px", flexWrap: "nowrap", overflowX: "auto", maxWidth: "100%", padding: "4px 8px" }}>
            {displayOrders.map((ord, idx) => (
              <button
                key={ord.id}
                type="button"
                role="tab"
                className={`v2-bookcase-tab${activeIndex === idx ? " is-active" : ""}`}
                aria-selected={activeIndex === idx}
                onClick={() => {
                  armOpenLayout();
                  flipTo(1 + idx * 2);
                }}
                style={{ fontSize: "11px", padding: "4px 10px", whiteSpace: "nowrap" }}
              >
                بسته #{toPersianDigits(idx + 1)}
              </button>
            ))}
          </div>

          <div className="v2-bookcase-stage" style={{ padding: "4px 0 16px" }}>
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
                      key={`orders-${size.w}x${size.h}-${displayOrders.length}`}
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

            {/* Navigation Arrows */}
            <div className={`v2-bookcase-navs${onFrontCover ? " is-cover-hidden" : ""}`}>
              <button
                type="button"
                className="v2-bookcase-nav v2-bookcase-nav--prev"
                onClick={() => {
                  armOpenLayout();
                  void flipPrev();
                }}
                aria-label="سفارش قبلی"
                disabled={page <= 0 || bookState === "flipping"}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
                  <path
                    d="M14 6 8 12l6 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
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
                aria-label="سفارش بعدی"
                disabled={onLastCover || bookState === "flipping"}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
                  <path
                    d="M10 6 16 12l-6 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Bottom Folio Progress Bar */}
          <footer className="v2-bookcase-foot" style={{ marginTop: "4px" }}>
            <div className="v2-bookcase-folio" aria-live="polite">
              <span>
                {page === 0
                  ? "روی جلد کتاب سوابق مرتع"
                  : onLastCover
                  ? "پشت جلد کتاب"
                  : `سفارش ${toPersianDigits(activeIndex !== null ? activeIndex + 1 : 1)} از ${toPersianDigits(displayOrders.length)}`}
              </span>
              <em>·</em>
              <span>دسته‌های ۱۵ تایی</span>
            </div>
            <div className="v2-bookcase-progress" aria-hidden>
              <span
                style={{
                  width: `${
                    pageCount > 1
                      ? Math.min(100, Math.max(0, (page / (pageCount - 1)) * 100))
                      : 0
                  }%`,
                }}
              />
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
