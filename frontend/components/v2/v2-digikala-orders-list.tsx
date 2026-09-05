"use client";

import React, { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { resolveProductImage } from "@/app/profile/page";

export type PastureOrderData = {
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
  totalAmount?: string;
  discount?: string;
  finalPrice: string;
};

interface DigikalaOrdersListProps {
  orders: PastureOrderData[];
  buyerInfo: {
    name: string;
    phone: string;
    address: string;
    nationalCode?: string;
  };
  onDownloadPdf: (order: PastureOrderData) => void;
  onReorder: () => void;
}

function toPersianDigits(value: number | string) {
  return String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

export function DigikalaOrdersList({
  orders,
  buyerInfo,
  onDownloadPdf,
  onReorder,
}: DigikalaOrdersListProps) {
  const [activeFilter, setActiveFilter] = useState<"all" | "delivered" | "processing">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const ORDERS_PER_PAGE = 15;

  const filteredOrders = orders.filter((ord) => {
    if (activeFilter === "processing") return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));
  const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + ORDERS_PER_PAGE);

  return (
    <motion.div
      className="mk-orders-page-full"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Top Filter Tabs */}
      <div className="mk-orders-filter-row">
        <div className="mk-filter-pill-group">
          <button
            type="button"
            className={`mk-filter-pill-btn${activeFilter === "all" ? " is-active" : ""}`}
            onClick={() => {
              setActiveFilter("all");
              setCurrentPage(1);
            }}
          >
            <span>همه سفارش‌ها</span>
            <span className="mk-filter-pill-badge">{toPersianDigits(orders.length)}</span>
          </button>
          <button
            type="button"
            className={`mk-filter-pill-btn${activeFilter === "delivered" ? " is-active" : ""}`}
            onClick={() => {
              setActiveFilter("delivered");
              setCurrentPage(1);
            }}
          >
            <span>تحویل‌شده</span>
            <span className="mk-filter-pill-badge">{toPersianDigits(orders.length)}</span>
          </button>
          <button
            type="button"
            className={`mk-filter-pill-btn${activeFilter === "processing" ? " is-active" : ""}`}
            onClick={() => {
              setActiveFilter("processing");
              setCurrentPage(1);
            }}
          >
            <span>در حال پردازش</span>
            <span className="mk-filter-pill-badge">۰</span>
          </button>
        </div>

        {totalPages > 1 && (
          <span className="mk-paging-indicator">
            صفحه {toPersianDigits(currentPage)} از {toPersianDigits(totalPages)}
          </span>
        )}
      </div>

      {/* Orders Stack */}
      {paginatedOrders.length > 0 ? (
        <div className="mk-orders-cards-stack">
          {paginatedOrders.map((ord, index) => {
            const isExpanded = expandedOrderId === ord.id;
            return (
              <motion.div
                key={ord.id}
                className="mk-order-card-clean"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.06 * Math.min(index, 6), ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Order Top Bar: ID, Date, Status, Total Paid */}
                <div className="mk-order-card-head">
                  <div className="mk-order-meta-info">
                    <span className="mk-order-id-label">
                      کد سفارش: <strong>#{ord.id}</strong>
                    </span>
                    <span className="mk-order-dot-sep">·</span>
                    <span className="mk-order-date-text">🗓️ {ord.date}</span>
                    <span className="mk-order-dot-sep">·</span>
                    <span className="mk-order-status-badge">
                      <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" strokeWidth="3" fill="none">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>تحویل‌شده</span>
                    </span>
                  </div>

                  <div className="mk-order-amount-box">
                    <span className="mk-order-amount-label">مبلغ کل:</span>
                    <strong className="mk-order-amount-val">
                      {ord.finalPrice || "۱,۰۶۰,۰۰۰ تومان"}
                    </strong>
                  </div>
                </div>

                {/* Items List in this Order */}
                <div className="mk-order-items-grid">
                  {ord.items.map((item, idx) => {
                    const itemImg = resolveProductImage(item.name, item.image);
                    return (
                      <div key={idx} className="mk-order-product-item">
                        <div className="mk-order-product-photo">
                          <Image
                            src={itemImg}
                            alt={item.name}
                            width={64}
                            height={64}
                            style={{ objectFit: "contain" }}
                          />
                        </div>
                        <div className="mk-order-product-info">
                          <h4 className="mk-order-product-title">{item.name}</h4>
                          <div className="mk-order-product-sub">
                            <span className="mk-order-product-cut">{item.cut || "سهمیه ۱ کیلوگرم"}</span>
                            <span className="mk-order-product-price">{item.price}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Order Action Buttons */}
                <div className="mk-order-card-foot">
                  <div className="mk-order-items-count-text">
                    <span>مجموع اقلام: <strong>{toPersianDigits(ord.items.length)} قلم کالا</strong></span>
                  </div>

                  <div className="mk-order-buttons-group">
                    <button
                      type="button"
                      className="mk-reorder-action-btn"
                      onClick={onReorder}
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.4" fill="none">
                        <polyline points="1 4 1 10 7 10" />
                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                      </svg>
                      <span>خرید مجدد این سفارش</span>
                    </button>

                    <button
                      type="button"
                      className="mk-download-invoice-btn"
                      onClick={() => onDownloadPdf(ord)}
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.2" fill="none">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      <span>دانلود پیش‌فاکتور (PDF)</span>
                    </button>

                    <button
                      type="button"
                      className="mk-view-details-btn"
                      onClick={() => setExpandedOrderId(isExpanded ? null : ord.id)}
                    >
                      <span>{isExpanded ? "بستن ریزاقلام" : "مشاهده ریز اقلام"}</span>
                      <svg
                        viewBox="0 0 24 24"
                        width="14"
                        height="14"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        fill="none"
                        style={{
                          transform: isExpanded ? "rotate(180deg)" : "none",
                          transition: "transform 0.2s ease",
                        }}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      className="mk-order-details-table-box"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <table className="mk-clean-table">
                        <thead>
                          <tr>
                            <th>ردیف</th>
                            <th>نام محصول</th>
                            <th>وزن / سهمیه</th>
                            <th>مبلغ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ord.items.map((item, idx) => (
                            <tr key={idx}>
                              <td>{toPersianDigits(idx + 1)}</td>
                              <td><strong>{item.name}</strong></td>
                              <td>{item.cut || "۱ کیلوگرم"}</td>
                              <td><strong className="mk-table-price">{item.price}</strong></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="mk-empty-state-clean">
          <div className="mk-empty-state-icon">📦</div>
          <h3>هیچ سفارشی یافت نشد</h3>
          <p>شما تاکنون در این بخش سفارشی ثبت نکرده‌اید.</p>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mk-pagination-row">
          <button
            type="button"
            className="mk-page-step-btn"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            صفحه قبلی
          </button>
          <div className="mk-page-numbers-wrap">
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              return (
                <button
                  key={pageNum}
                  type="button"
                  className={`mk-page-number-btn${currentPage === pageNum ? " is-active" : ""}`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {toPersianDigits(pageNum)}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className="mk-page-step-btn"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            صفحه بعدی
          </button>
        </div>
      )}
    </motion.div>
  );
}
