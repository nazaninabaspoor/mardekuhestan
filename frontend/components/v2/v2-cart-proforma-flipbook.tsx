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

export type CartItemData = {
  id: number;
  product_name: string;
  product_image?: string;
  portion: string;
  quantity: number;
  unit_price_toman: number;
  total_price_toman: number;
};

interface CartProformaFlipbookProps {
  items: CartItemData[];
  cartTotalPriceToman: number;
  buyerInfo: {
    name: string;
    phone: string;
    address: string;
    nationalCode?: string;
  };
  onUpdateQuantity: (itemId: number, quantity: number) => void;
  onRemoveFromCart: (itemId: number) => void;
  onClearCart: () => void;
  onCheckout: () => void;
  onDownloadPdf: () => void;
  onExploreProducts: () => void;
}

export function CartProformaFlipbook({
  items,
  cartTotalPriceToman,
  buyerInfo,
  onUpdateQuantity,
  onRemoveFromCart,
  onClearCart,
  onCheckout,
  onDownloadPdf,
  onExploreProducts,
}: CartProformaFlipbookProps) {
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

  const shippingCost = cartTotalPriceToman >= 500000 ? 0 : 40000;
  const finalPayable = cartTotalPriceToman > 0 ? cartTotalPriceToman + shippingCost : 0;

  const pages = useMemo<ReactElement[]>(() => {
    const list: ReactElement[] = [];

    // 1. FRONT COVER — مرد کوهستان به همراه کارگران در حال بسته‌بندی سفارش‌های جدید
    list.push(
      <V2FlipPage
        key="cover"
        className="v2-flip-page--cover v2-flip-page--hard"
        density="hard"
      >
        <div className="v2-catalog-cover">
          <div className="v2-cover-art">
            <Image
              src="/brand/v2/book/cat-cover-team.png"
              alt="مرد کوهستان و کارگران در حال بسته‌بندی سفارش‌های تازه"
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
              پیش‌فاکتور و سبد خرید جاری
            </strong>
            <span className="v2-catalog-cover-sub">
              {items.length > 0
                ? `${toPersianDigits(items.length)} قلم کالا آماده ارسال`
                : "سبد خرید جاری شما"}
            </span>
            <em className="v2-catalog-cover-hint">ورق بزنید</em>
          </div>
        </div>
      </V2FlipPage>,
    );

    // 2. SPREAD (Right Page: Buyer & Shipping Terms | Left Page: Interactive Items List)
    // Page A (Right Page — Buyer & Shipping Terms & Price Summary)
    list.push(
      <V2FlipPage
        key="cart-terms-right"
        className="v2-flip-page--paper v2-flip-page--brand"
        style={
          {
            ["--page-bg"]: "#FAF6EE",
            ["--page-ink"]: "#005B48",
            ["--page-accent"]: "#005B48",
          } as CSSProperties
        }
      >
        <div className="v2-catalog-copy" style={{ gap: "6px", padding: "16px 18px", height: "100%", boxSizing: "border-box" }}>
          <p className="v2-catalog-line v2-page-running">
            مرد کوهستان · پیش‌فاکتور خرید جاری
          </p>
          <p className="v2-catalog-line v2-catalog-copy-kicker" style={{ color: "#D4A359", fontWeight: 800 }}>
            ارسال اختصاصی با ناوگان یخچال‌دار
          </p>
          <h3 className="v2-catalog-line v2-catalog-copy-title" style={{ fontSize: "14.5px", margin: "2px 0 6px" }}>
            مشخصات تحویل و هماهنگی
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "11.5px", color: "#1D1D1B", background: "rgba(255,255,255,0.7)", padding: "8px 10px", borderRadius: "8px", border: "1px solid #E5E0D8" }}>
            <div>
              <strong style={{ color: "#5D686E" }}>تحویل‌گیرنده: </strong>
              <strong style={{ color: "#1D1D1B" }}>{buyerInfo.name}</strong>
            </div>
            <div>
              <strong style={{ color: "#5D686E" }}>شماره تماس: </strong>
              <span style={{ color: "#1D1D1B" }}>{buyerInfo.phone || "۰۹۳۷۹۱۴۶۱۳۰"}</span>
            </div>
            <div style={{ fontSize: "11px", lineHeight: "1.4" }}>
              <strong style={{ color: "#5D686E" }}>نشانی: </strong>
              <span style={{ color: "#1D1D1B" }}>{buyerInfo.address || "تهران، اقدسیه، خیابان سپند، پلاک ۱۲"}</span>
            </div>
          </div>

          <div style={{ margin: "4px 0", padding: "6px 8px", background: "#EBF5F1", borderRadius: "6px", border: "1px solid rgba(0,91,72,0.15)", fontSize: "10.5px", color: "#005B48", lineHeight: "1.4" }}>
            ❄️ <strong>تضمین زنجیره سرد:</strong> سفارش شما در دمای ۲.۴°C بسته‌بندی شده و پیش از حرکت ناوگان با شما هماهنگ خواهد شد.
          </div>

          {/* Pricing Box */}
          <div style={{ marginTop: "auto", paddingTop: "8px", borderTop: "1px dashed rgba(212,163,89,0.5)", display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px" }}>
              <span style={{ color: "#5D686E" }}>جمع اقلام:</span>
              <strong>{cartTotalPriceToman.toLocaleString("fa-IR")} تومان</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px" }}>
              <span style={{ color: "#5D686E" }}>هزینه ارسال:</span>
              <strong style={{ color: shippingCost === 0 ? "#2E7D32" : "#1D1D1B" }}>
                {shippingCost === 0 ? "رایگان (طرح همسفر)" : "۴۰,۰۰۰ تومان"}
              </strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", paddingTop: "4px", borderTop: "1px solid #E5E0D8" }}>
              <strong style={{ color: "#1D1D1B" }}>مبلغ نهایی:</strong>
              <strong style={{ color: "#005B48", fontSize: "14px", fontWeight: 900 }}>
                {finalPayable.toLocaleString("fa-IR")} تومان
              </strong>
            </div>

            <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
              <button
                type="button"
                disabled={items.length === 0}
                style={{
                  flex: 1,
                  background: items.length > 0 ? "#005B48" : "#A0B5AE",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "7px 10px",
                  borderRadius: "6px",
                  fontSize: "11.5px",
                  fontWeight: 900,
                  cursor: items.length > 0 ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onCheckout();
                }}
              >
                <span>پرداخت آنلاین</span>
              </button>
              <button
                type="button"
                disabled={items.length === 0}
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #D4A359",
                  color: "#903828",
                  padding: "7px 10px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: 800,
                  cursor: items.length > 0 ? "pointer" : "not-allowed",
                  whiteSpace: "nowrap",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onDownloadPdf();
                }}
                title="دانلود پیش‌فاکتور رسمی PDF"
              >
                پیش‌فاکتور PDF
              </button>
            </div>
          </div>
        </div>
      </V2FlipPage>,
    );

    // Page B (Left Page — Interactive Shopping Cart Items Table)
    list.push(
      <V2FlipPage
        key="cart-items-left"
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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ margin: 0, fontSize: "11.5px", fontWeight: 800, color: "#005B48" }}>
              اقلام انتخابی سبد خرید ({toPersianDigits(items.length)} قلم):
            </p>
            {items.length > 0 && (
              <button
                type="button"
                style={{
                  background: "#FFEBEE",
                  border: "1px solid #FFCDD2",
                  color: "#D32F2F",
                  fontSize: "10.5px",
                  fontWeight: 800,
                  padding: "2px 6px",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onClearCart();
                }}
              >
                تخلیه سبد
              </button>
            )}
          </div>

          {items.length > 0 ? (
            <div style={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
              {items.map((it) => {
                const itImg = resolveProductImage(it.product_name, it.product_image);
                return (
                  <div
                    key={it.id}
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
                        alt={it.product_name}
                        width={26}
                        height={26}
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
                      <strong style={{ fontSize: "11px", color: "#1D1D1B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {it.product_name}
                      </strong>
                      <span style={{ fontSize: "9.5px", color: "#5D686E" }}>{it.portion}</span>
                    </div>

                    {/* Stepper Buttons */}
                    <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                      <button
                        type="button"
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "4px",
                          background: "#F0EBE1",
                          border: "1px solid #D8D2C6",
                          color: "#1D1D1B",
                          fontWeight: 900,
                          fontSize: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          padding: 0,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (it.quantity <= 1) {
                            onRemoveFromCart(it.id);
                          } else {
                            onUpdateQuantity(it.id, it.quantity - 1);
                          }
                        }}
                        title={it.quantity <= 1 ? "حذف کالا" : "کاهش"}
                      >
                        -
                      </button>
                      <strong style={{ fontSize: "11.5px", minWidth: "14px", textAlign: "center" }}>
                        {toPersianDigits(it.quantity)}
                      </strong>
                      <button
                        type="button"
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "4px",
                          background: "#005B48",
                          border: "none",
                          color: "#FFFFFF",
                          fontWeight: 900,
                          fontSize: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          padding: 0,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateQuantity(it.id, it.quantity + 1);
                        }}
                        title="افزایش"
                      >
                        +
                      </button>
                    </div>

                    <strong style={{ fontSize: "11px", color: "#005B48", fontWeight: 900, whiteSpace: "nowrap", minWidth: "55px", textAlign: "left" }}>
                      {it.total_price_toman.toLocaleString("fa-IR")} ت
                    </strong>

                    <button
                      type="button"
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#D32F2F",
                        cursor: "pointer",
                        fontSize: "12px",
                        padding: "2px",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFromCart(it.id);
                      }}
                      title="حذف قلم"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "16px", background: "#FFFFFF", borderRadius: "8px", border: "1px dashed #D4A359" }}>
              <span style={{ fontSize: "24px", marginBottom: "6px" }}>🧺</span>
              <strong style={{ fontSize: "12.5px", color: "#1D1D1B", marginBottom: "4px" }}>
                سبد خرید شما خالی است
              </strong>
              <p style={{ fontSize: "10.5px", color: "#5D686E", margin: "0 0 10px", lineHeight: "1.4" }}>
                فرآورده‌های دست‌چین ییلاقی را به سبد خود اضافه فرمایید.
              </p>
              <button
                type="button"
                style={{
                  background: "#005B48",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onExploreProducts();
                }}
              >
                مشاهده محصولات تازه مرتع
              </button>
            </div>
          )}

          <div style={{ marginTop: "auto", padding: "6px 8px", background: "#FAF0E4", borderRadius: "6px", border: "1px solid rgba(212,163,89,0.3)", textAlign: "center" }}>
            <span style={{ fontSize: "10px", color: "#903828", fontWeight: 800 }}>
              🌿 محصولات دست‌چین و تازه‌برش مرتع
            </span>
          </div>
        </div>
      </V2FlipPage>,
    );

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
  }, [
    items,
    cartTotalPriceToman,
    buyerInfo,
    shippingCost,
    finalPayable,
    onCheckout,
    onDownloadPdf,
    onClearCart,
    onRemoveFromCart,
    onUpdateQuantity,
    onExploreProducts,
  ]);

  return (
    <div
      className={`v2-bookcase v2-bookcase--catalog is-visible${isOpen ? " is-spread" : ""}`}
      style={{ background: "transparent", minHeight: 0, padding: 0 }}
    >
      <div className="v2-bookcase-shell" style={{ maxWidth: "100%", padding: 0 }}>
        <div className="v2-bookcase-layout" style={{ maxWidth: "100%" }}>
          <div className="v2-bookcase-stage" style={{ padding: "8px 0 16px" }}>
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
                      key={`cart-flip-${size.w}x${size.h}-${items.length}`}
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
                aria-label="صفحه قبلی"
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
                aria-label="صفحه بعدی"
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
                  ? "روی جلد دفترچه پیش‌فاکتور"
                  : onLastCover
                  ? "پشت جلد کتاب"
                  : "اقلام و پیش‌فاکتور رسمی سفارش"}
              </span>
              <em>·</em>
              <span>زنجیره سرد ۲.۴°C</span>
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
