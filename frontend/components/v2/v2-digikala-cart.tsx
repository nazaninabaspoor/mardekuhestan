"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { resolveProductImage } from "@/app/profile/page";

export type CartItemData = {
  id: number;
  product_name: string;
  product_image?: string;
  portion: string;
  quantity: number;
  unit_price_toman: number;
  total_price_toman: number;
};

interface DigikalaCartProps {
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

function toPersianDigits(value: number | string) {
  return String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

export function DigikalaCart({
  items,
  cartTotalPriceToman,
  buyerInfo,
  onUpdateQuantity,
  onRemoveFromCart,
  onClearCart,
  onCheckout,
  onDownloadPdf,
  onExploreProducts,
}: DigikalaCartProps) {
  const FREE_SHIPPING_THRESHOLD = 500000;
  const shippingCost =
    cartTotalPriceToman >= FREE_SHIPPING_THRESHOLD || cartTotalPriceToman === 0
      ? 0
      : 40000;
  const finalPayable =
    cartTotalPriceToman > 0 ? cartTotalPriceToman + shippingCost : 0;
  const progressPercent = Math.min(
    100,
    Math.round((cartTotalPriceToman / FREE_SHIPPING_THRESHOLD) * 100),
  );
  const remainingForFreeShipping = Math.max(
    0,
    FREE_SHIPPING_THRESHOLD - cartTotalPriceToman,
  );

  return (
    <motion.div
      className="mk-cart-page-full"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      {items.length > 0 ? (
        <div className="mk-cart-columns-grid">
          {/* Main Column: Items List */}
          <div className="mk-cart-main-col">
            {/* Delivery Banner (Single clean line) */}
            <div className="mk-cart-top-notice">
              <div className="mk-cart-notice-left">
                <span className="mk-notice-truck">🚚</span>
                <span className="mk-notice-msg">
                  ارسال اختصاصی با ناوگان یخچال‌دار مرد کوهستان (تحویل درب منزل با حفظ کامل زنجیره سرد)
                </span>
              </div>
              <button
                type="button"
                className="mk-clear-cart-link"
                onClick={onClearCart}
                title="تخلیه کامل سبد خرید"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="14"
                  height="14"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  fill="none"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                <span>تخلیه سبد</span>
              </button>
            </div>

            {/* Items Stack */}
            <div className="mk-cart-products-stack">
              {items.map((it, index) => {
                const itemImg = resolveProductImage(
                  it.product_name,
                  it.product_image,
                );
                return (
                  <motion.div
                    key={it.id}
                    className="mk-cart-product-card"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.06 * Math.min(index, 6), ease: [0.16, 1, 0.3, 1] }}
                  >
                    {/* Product Photo */}
                    <div className="mk-product-photo-wrap">
                      <Image
                        src={itemImg}
                        alt={it.product_name}
                        width={90}
                        height={90}
                        style={{ objectFit: "contain" }}
                      />
                    </div>

                    {/* Product Details */}
                    <div className="mk-product-content">
                      <div className="mk-product-title-row">
                        <h3 className="mk-product-name">{it.product_name}</h3>
                        <span className="mk-product-portion-tag">
                          {it.portion || "بسته‌بندی استریل ۱ کیلوگرم"}
                        </span>
                      </div>

                      {/* Bottom row: Stepper + Delete + Price */}
                      <div className="mk-product-bottom-row">
                        {/* Stepper */}
                        <div className="mk-clean-stepper">
                          <button
                            type="button"
                            className="mk-stepper-btn is-add"
                            onClick={() => onUpdateQuantity(it.id, it.quantity + 1)}
                            aria-label="افزایش تعداد"
                          >
                            +
                          </button>
                          <span className="mk-stepper-num">
                            {toPersianDigits(it.quantity)}
                          </span>
                          <button
                            type="button"
                            className={`mk-stepper-btn is-sub${
                              it.quantity <= 1 ? " is-delete" : ""
                            }`}
                            onClick={() => {
                              if (it.quantity <= 1) {
                                onRemoveFromCart(it.id);
                              } else {
                                onUpdateQuantity(it.id, it.quantity - 1);
                              }
                            }}
                            aria-label={
                              it.quantity <= 1 ? "حذف کالا" : "کاهش تعداد"
                            }
                            title={
                              it.quantity <= 1 ? "حذف کالا" : "کاهش تعداد"
                            }
                          >
                            {it.quantity <= 1 ? (
                              <svg
                                viewBox="0 0 24 24"
                                width="14"
                                height="14"
                                stroke="currentColor"
                                strokeWidth="2.4"
                                fill="none"
                              >
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            ) : (
                              "-"
                            )}
                          </button>
                        </div>

                        {/* Quick Remove Link */}
                        <button
                          type="button"
                          className="mk-remove-item-link"
                          onClick={() => onRemoveFromCart(it.id)}
                        >
                          حذف از سبد
                        </button>

                        {/* Price */}
                        <div className="mk-product-price-box">
                          {it.quantity > 1 && (
                            <span className="mk-unit-price-text">
                              واحد: {it.unit_price_toman.toLocaleString("fa-IR")} تومان
                            </span>
                          )}
                          <strong className="mk-total-price-text">
                            {it.total_price_toman.toLocaleString("fa-IR")} تومان
                          </strong>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Sidebar Column: Summary & Checkout */}
          <div className="mk-cart-summary-col">
            <motion.div
              className="mk-sticky-summary-card"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            >
              <h3 className="mk-summary-title">خلاصه پیش‌فاکتور</h3>

              <div className="mk-summary-details-list">
                <div className="mk-summary-item-row">
                  <span className="mk-sum-text">
                    قیمت کالاها ({toPersianDigits(items.length)} قلم)
                  </span>
                  <span className="mk-sum-val">
                    {cartTotalPriceToman.toLocaleString("fa-IR")} تومان
                  </span>
                </div>

                <div className="mk-summary-item-row">
                  <span className="mk-sum-text">هزینه ارسال یخچال‌دار</span>
                  <span
                    className={`mk-sum-val${
                      shippingCost === 0 ? " is-free-tag" : ""
                    }`}
                  >
                    {shippingCost === 0
                      ? "رایگان (طرح همسفر)"
                      : "۴۰,۰۰۰ تومان"}
                  </span>
                </div>

                {/* Free Shipping Meter */}
                <div className="mk-shipping-meter-wrap">
                  <div className="mk-meter-track">
                    <div
                      className="mk-meter-fill"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span className="mk-meter-text">
                    {cartTotalPriceToman >= FREE_SHIPPING_THRESHOLD ? (
                      <strong>
                        ارسال این سفارش رایگان شد
                      </strong>
                    ) : (
                      <span>
                        با خرید <strong>{remainingForFreeShipping.toLocaleString("fa-IR")} تومان</strong> دیگر، ارسال <strong>رایگان</strong> می‌شود.
                      </span>
                    )}
                  </span>
                </div>

                <div className="mk-summary-divider" />

                {/* Total Payable */}
                <div className="mk-summary-item-row is-payable-row">
                  <span className="mk-payable-label">مبلغ قابل پرداخت</span>
                  <strong className="mk-payable-value">
                    {finalPayable.toLocaleString("fa-IR")} تومان
                  </strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mk-summary-actions">
                <button
                  type="button"
                  className="mk-primary-checkout-btn"
                  onClick={onCheckout}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    fill="none"
                  >
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                  <span>تکمیل خرید و پرداخت آنلاین</span>
                </button>

                <button
                  type="button"
                  className="mk-secondary-pdf-btn"
                  onClick={onDownloadPdf}
                  title="دانلود پیش‌فاکتور رسمی PDF"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="15"
                    height="15"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    fill="none"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>دانلود پیش‌فاکتور رسمی (PDF)</span>
                </button>
              </div>

              {/* Delivery Address Summary */}
              <div className="mk-quick-address-card">
                <span className="mk-address-pin">📍</span>
                <div className="mk-address-texts">
                  <span className="mk-address-name">
                    تحویل به: <strong>{buyerInfo.name}</strong> ({buyerInfo.phone || "۰۹۳۷۹۱۴۶۱۳۰"})
                  </span>
                  <p className="mk-address-full">
                    {buyerInfo.address || "تهران، اقدسیه، خیابان سپند، پلاک ۱۲"}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      ) : (
        /* Clean Empty Cart */
        <div className="mk-empty-cart-view">
          <div className="mk-empty-cart-ico">🧺</div>
          <h2>سبد خرید شما خالی است</h2>
          <p>
            برای مشاهده محصولات تازه، ارگانیک و طبیعی به فروشگاه محصولات مرتع سر بزنید.
          </p>
          <button
            type="button"
            className="mk-explore-products-btn"
            onClick={onExploreProducts}
          >
            <span>مشاهده محصولات مرتع</span>
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              stroke="currentColor"
              strokeWidth="2.5"
              fill="none"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      )}
    </motion.div>
  );
}
