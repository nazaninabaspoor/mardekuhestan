"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ProductDetailData } from "@/lib/catalog/product-details";

interface ProductDetailViewProps {
  product: ProductDetailData;
  onClose?: () => void;
  isModal?: boolean;
}

export function ProductDetailView({
  product,
  onClose,
  isModal = false,
}: ProductDetailViewProps) {
  const [selectedPortion, setSelectedPortion] = useState(
    product.portionOptions[0] || "۱ کیلوگرم",
  );
  const [selectedCut, setSelectedCut] = useState(
    product.cutOptions[0] || "برش استاندارد",
  );
  const [quantity, setQuantity] = useState(1);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const calculateTotalPrice = () => {
    let multiplier = 1;
    if (selectedPortion.includes("۵۰۰")) multiplier = 0.5;
    if (selectedPortion.includes("۲")) multiplier = 2;
    if (selectedPortion.includes("۱.۵")) multiplier = 1.5;
    if (selectedPortion.includes("۵")) multiplier = 4.5;
    return Math.round(product.price * multiplier * quantity);
  };

  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  return (
    <div className={`pdetail-container ${isModal ? "is-in-modal" : ""}`}>
      {/* Top Breadcrumbs / Modal Close Bar */}
      <div className="pdetail-topbar">
        <div className="pdetail-breadcrumb">
          <Link href="/">صفحه اصلی</Link>
          <span className="pdetail-sep">/</span>
          <span>محصولات مرد کوهستان</span>
          <span className="pdetail-sep">/</span>
          <span className="pdetail-curr">{product.name}</span>
        </div>

        {isModal && onClose && (
          <button
            type="button"
            className="pdetail-close-btn"
            onClick={onClose}
            aria-label="بستن پنجره جزئیات محصول"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="pdetail-main-layout">
        {/* Left Column: Cinematic Video Frame & Visuals */}
        <div className="pdetail-media-column">
          {/* Main Cinematic Video Player Frame */}
          <div className="pdetail-cinematic-card">
            <div className="pdetail-video-header">
              <div className="pdetail-video-badge">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="m3 18 6.2-10 2.4 3.7L14.5 7 21 18H3Z" />
                </svg>
                <span>مستند اصالت مرتع مرد کوهستان</span>
              </div>
              <span className="pdetail-video-duration">{product.video.duration}</span>
            </div>

            {/* Video Frame Window */}
            <div className="pdetail-video-viewport">
              <Image
                src={product.video.poster || product.image}
                alt={product.name}
                fill
                priority
                className={`pdetail-video-poster ${isVideoPlaying ? "is-hidden" : ""}`}
                sizes="(max-width: 900px) 100vw, 550px"
              />

              {/* Glassmorphic Brand Vignette */}
              <div className="pdetail-video-vignette" />

              {/* Mountain Geometry Watermark */}
              <div className="pdetail-video-watermark" aria-hidden="true">
                <svg viewBox="0 0 100 40" className="pdetail-mountain-svg">
                  <polygon points="0,40 50,0 100,40" />
                </svg>
                <span>MARDE KUHESTAN</span>
              </div>

              {/* Play Button Overlay */}
              {!isVideoPlaying ? (
                <button
                  type="button"
                  className="pdetail-play-trigger"
                  onClick={() => setIsVideoPlaying(true)}
                  aria-label="پخش ویدیوی مستند مزرعه"
                >
                  <span className="pdetail-play-ring" />
                  <span className="pdetail-play-icon">
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                      <path d="m8 5 11 7-11 7V5Z" />
                    </svg>
                  </span>
                  <span className="pdetail-play-label">مشاهده مستند مسیر سبز</span>
                </button>
              ) : (
                <div className="pdetail-video-active-placeholder">
                  <video
                    src={product.video.videoUrl || "/brand/teaser.mp4"}
                    controls
                    autoPlay
                    className="pdetail-html-video"
                  />
                </div>
              )}
            </div>

            <div className="pdetail-video-footer">
              <p className="pdetail-video-title">{product.video.title}</p>
              <div className="pdetail-video-tags">
                <span>کیفیت 4K سینمایی</span>
                <span>•</span>
                <span>تصویربرداری هوایی از مرتع</span>
              </div>
            </div>
          </div>

          {/* Farm Passport Card */}
          <div className="pdetail-passport-card">
            <div className="pdetail-card-title-row">
              <div className="pdetail-icon-circle">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9Z" />
                </svg>
              </div>
              <div>
                <h3>شناسنامه اصالت مرتع و مزرعه</h3>
                <p>ردیابی ۱۰۰٪ شفاف از بلندای کوهستان تا سفره خانه</p>
              </div>
            </div>

            <div className="pdetail-passport-grid">
              <div className="pdetail-pass-item">
                <span className="pdetail-pass-key">محل پرورش و چرا:</span>
                <strong className="pdetail-pass-val">{product.origin.pastureName}</strong>
              </div>
              <div className="pdetail-pass-item">
                <span className="pdetail-pass-key">ارتفاع مرتع از دریا:</span>
                <strong className="pdetail-pass-val">{product.origin.altitude}</strong>
              </div>
              <div className="pdetail-pass-item">
                <span className="pdetail-pass-key">تغذیه و رشد:</span>
                <strong className="pdetail-pass-val">{product.origin.diet}</strong>
              </div>
              <div className="pdetail-pass-item">
                <span className="pdetail-pass-key">دمای زنجیره سرد:</span>
                <strong className="pdetail-pass-val">{product.origin.coldChainTemp}</strong>
              </div>
              <div className="pdetail-pass-item pdetail-pass-item--full">
                <span className="pdetail-pass-key">استاندارد بسته‌بندی:</span>
                <strong className="pdetail-pass-val">{product.origin.ecoPack}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Product Story, Pricing, Cuts & Purchase */}
        <div className="pdetail-info-column">
          <div className="pdetail-header-section">
            <span className="pdetail-category-tag">{product.categoryTitle}</span>
            <h1 className="pdetail-main-name">{product.name}</h1>
            <p className="pdetail-headline-lead">{product.headline}</p>
          </div>

          {/* Product Story */}
          <div className="pdetail-story-box">
            <p>{product.story}</p>
          </div>

          {/* Nutrition Table */}
          <div className="pdetail-nutrition-card">
            <h4>ارزش غذایی و ترکیبات سلامت (در هر ۱۰۰ گرم)</h4>
            <div className="pdetail-nutrition-grid">
              <div className="pdetail-nutri-item">
                <span className="pdetail-nutri-val">{product.nutrition.protein}</span>
                <span className="pdetail-nutri-lbl">پروتئین خالص</span>
              </div>
              <div className="pdetail-nutri-item">
                <span className="pdetail-nutri-val">{product.nutrition.calories}</span>
                <span className="pdetail-nutri-lbl">انرژی زیستی</span>
              </div>
              <div className="pdetail-nutri-item">
                <span className="pdetail-nutri-val">{product.nutrition.fat}</span>
                <span className="pdetail-nutri-lbl">چربی طبیعی</span>
              </div>
              <div className="pdetail-nutri-item">
                <span className="pdetail-nutri-val">{product.nutrition.ironOrOmega}</span>
                <span className="pdetail-nutri-lbl">مواد معدنی</span>
              </div>
            </div>
          </div>

          {/* Chef Cooking Tips */}
          <div className="pdetail-chef-card">
            <div className="pdetail-chef-header">
              <span className="pdetail-chef-badge">👨‍🍳 راز سرآشپز کوهستان</span>
              <strong>نحوه طبخ اصیل: {product.chefTip.cookingStyle}</strong>
            </div>
            <p className="pdetail-chef-desc">{product.chefTip.description}</p>
            <div className="pdetail-chef-meta">
              <span><strong>ادویه‌های همراه:</strong> {product.chefTip.spices}</span>
              <span><strong>زمان استراحت:</strong> {product.chefTip.restTime}</span>
            </div>
          </div>

          {/* Purchasing Options Form */}
          <div className="pdetail-purchase-card">
            {/* Portions */}
            <div className="pdetail-option-group">
              <label>انتخاب وزن و حجم سفارش:</label>
              <div className="pdetail-pills-row">
                {product.portionOptions.map((portion) => (
                  <button
                    key={portion}
                    type="button"
                    className={`pdetail-pill-btn ${selectedPortion === portion ? "is-selected" : ""}`}
                    onClick={() => setSelectedPortion(portion)}
                  >
                    {portion}
                  </button>
                ))}
              </div>
            </div>

            {/* Cuts */}
            <div className="pdetail-option-group">
              <label>نوع آماده‌سازی و برش سفارشی:</label>
              <div className="pdetail-pills-row">
                {product.cutOptions.map((cut) => (
                  <button
                    key={cut}
                    type="button"
                    className={`pdetail-pill-btn ${selectedCut === cut ? "is-selected" : ""}`}
                    onClick={() => setSelectedCut(cut)}
                  >
                    {cut}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity & Price Row */}
            <div className="pdetail-price-action-row">
              <div className="pdetail-qty-control">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="کاهش تعداد"
                >
                  -
                </button>
                <span className="pdetail-qty-num">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="افزایش تعداد"
                >
                  +
                </button>
              </div>

              <div className="pdetail-total-price">
                <span className="pdetail-price-kicker">مبلغ نهایی:</span>
                <strong className="pdetail-price-number">
                  {calculateTotalPrice().toLocaleString("fa-IR")}
                  <small>تومان</small>
                </strong>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pdetail-cta-group">
              <button
                type="button"
                className={`pdetail-submit-btn ${addedToCart ? "is-added" : ""}`}
                onClick={handleAddToCart}
              >
                {addedToCart ? (
                  <>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9Z" />
                    </svg>
                    <span>به سفره شما افزوده شد</span>
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                      <circle cx="8" cy="21" r="1" />
                      <circle cx="19" cy="21" r="1" />
                      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                    </svg>
                    <span>افزودن به سبد تازه کوهستان</span>
                  </>
                )}
              </button>

              <Link
                href={`/profile?tab=ai-nutrition`}
                className="pdetail-ai-btn"
                title="مشاوره درباره این محصول با هوش مصنوعی"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
                  <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z" />
                </svg>
                <span>مشاوره رژیم و طبخ با هوش مصنوعی</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
