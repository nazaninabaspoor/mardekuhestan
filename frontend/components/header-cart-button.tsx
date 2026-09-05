"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";

interface HeaderCartButtonProps {
  className?: string;
  variant?: "desktop" | "mobile";
  onItemClick?: () => void;
}

export function HeaderCartButton({
  className = "",
  variant = "desktop",
  onItemClick,
}: HeaderCartButtonProps) {
  const { user } = useAuth();
  const { itemsCount, bumpCart, cartNotice, dismissCartNotice } = useCart();

  // If user is not logged in, we can either hide or show login modal on click
  if (!user) {
    return null;
  }

  if (variant === "mobile") {
    return (
      <Link
        href="/profile?tab=orders"
        className={`v2-nav-link v2-mobile-cart-link ${bumpCart ? "is-bumped" : ""} ${className}`}
        onClick={onItemClick}
      >
        <div className="v2-cart-icon-wrapper">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.2" fill="none">
            <circle cx="8" cy="21" r="1.2" />
            <circle cx="19" cy="21" r="1.2" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
          </svg>
          {itemsCount > 0 && (
            <span className="v2-cart-badge">{itemsCount}</span>
          )}
        </div>
        <span className="v2-nav-label">سبد خرید شما ({itemsCount})</span>
      </Link>
    );
  }

  return (
    <div className={`v2-header-cart-container ${className}`}>
      <Link
        href="/profile?tab=orders"
        className={`v2-tool-link v2-cart-trigger ${bumpCart ? "is-bumped" : ""} ${itemsCount > 0 ? "has-items" : ""}`}
        aria-label={`سبد خرید با ${itemsCount} بسته`}
        title="مشاهده سبد خرید و سفارش‌ها"
      >
        <div className="v2-cart-icon-wrapper">
          <svg
            viewBox="0 0 24 24"
            width="19"
            height="19"
            stroke="currentColor"
            strokeWidth="2.2"
            fill="none"
            className="v2-cart-svg"
          >
            <circle cx="8" cy="21" r="1.2" />
            <circle cx="19" cy="21" r="1.2" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
          </svg>
          {itemsCount > 0 && (
            <span className={`v2-cart-badge ${bumpCart ? "is-pulse" : ""}`}>
              {itemsCount}
            </span>
          )}
        </div>
        <span className="v2-cart-label">سبد خرید</span>
      </Link>

      {/* Floating AJAX Toast Notification */}
      {cartNotice.visible && (
        <div className="v2-cart-floating-toast" role="status">
          <div className="v2-toast-content">
            <span className="v2-toast-icon">✓</span>
            <span className="v2-toast-msg">{cartNotice.message}</span>
          </div>
          <div className="v2-toast-actions">
            <Link
              href="/profile?tab=orders"
              className="v2-toast-view-btn"
              onClick={() => dismissCartNotice()}
            >
              مشاهده سبد
            </Link>
            <button
              type="button"
              className="v2-toast-close"
              onClick={() => dismissCartNotice()}
              aria-label="بستن"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
