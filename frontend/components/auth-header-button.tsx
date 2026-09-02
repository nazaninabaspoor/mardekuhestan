"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

interface AuthHeaderButtonProps {
  className?: string;
  variant?: "desktop" | "mobile";
  onItemClick?: () => void;
}

export function AuthHeaderButton({
  className = "",
  variant = "desktop",
  onItemClick,
}: AuthHeaderButtonProps) {
  const { user, isLoading, openLoginModal, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const handleMouseEnter = () => {
    if (variant === "desktop") {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      setDropdownOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (variant === "desktop") {
      closeTimerRef.current = setTimeout(() => {
        setDropdownOpen(false);
      }, 240);
    }
  };

  if (isLoading) {
    return (
      <div className={`auth-header-loading ${className}`} aria-hidden="true">
        <span className="auth-skeleton-btn" />
      </div>
    );
  }

  // Not logged in -> Show Login / Register button
  if (!user) {
    return (
      <button
        type="button"
        className={`v2-tool-link auth-login-trigger ${className}`}
        onClick={() => {
          openLoginModal();
          onItemClick?.();
        }}
        aria-label="ورود یا ثبت‌نام در باشگاه راه سبز مرد کوهستان"
      >
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          className="auth-btn-icon"
          aria-hidden="true"
        >
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span className="auth-btn-text">ورود / عضویت</span>
      </button>
    );
  }

  // Logged in -> Show User Profile & Green Way Badge
  const displayName = user.name || user.email.split("@")[0] || "همسفر گرامی";

  const handleLogout = async () => {
    setDropdownOpen(false);
    onItemClick?.();
    await logout();
  };

  if (variant === "mobile") {
    return (
      <div className={`auth-mobile-box ${className}`}>
        {/* Mobile User Card */}
        <div className="auth-mobile-user-card">
          <div className="auth-user-avatar auth-user-avatar--mobile">
            {displayName.charAt(0).toUpperCase()}
            <span className="auth-avatar-ring" aria-hidden="true" />
          </div>
          <div className="auth-user-meta">
            <div className="auth-user-title-row">
              <span className="auth-user-name">{displayName}</span>
              <span className="auth-club-badge">همسفر سبز</span>
            </div>
            <span className="auth-user-email">{user.email}</span>
          </div>
        </div>

        {/* Member Quick Stats */}
        <div className="auth-mobile-stats">
          <div className="auth-stat-item">
            <span className="auth-stat-label">اعتبار هدیه</span>
            <strong className="auth-stat-val">۵۰,۰۰۰ ت</strong>
          </div>
          <div className="auth-stat-divider" />
          <div className="auth-stat-item">
            <span className="auth-stat-label">امتیاز کوهستان</span>
            <strong className="auth-stat-val">۱۲۰</strong>
          </div>
        </div>

        <div className="auth-mobile-actions">
          <Link
            href="/profile?tab=personal"
            className="auth-mobile-link"
            onClick={() => onItemClick?.()}
          >
            <svg viewBox="0 0 24 24" width="17" height="17" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>اطلاعات شخصی و امنیت</span>
          </Link>

          <Link
            href="/profile?tab=ai-nutrition"
            className="auth-mobile-link auth-mobile-link--ai"
            onClick={() => onItemClick?.()}
          >
            <svg viewBox="0 0 24 24" width="17" height="17" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z" />
            </svg>
            <span>دستیار هوش مصنوعی تغذیه</span>
            <span className="auth-pill-tag">جدید</span>
          </Link>

          <Link
            href="/profile?tab=wallet"
            className="auth-mobile-link"
            onClick={() => onItemClick?.()}
          >
            <svg viewBox="0 0 24 24" width="17" height="17" stroke="currentColor" strokeWidth="2" fill="none">
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
            <span>کیف پول و امتیاز سبز</span>
          </Link>

          <Link
            href="/profile?tab=subscription"
            className="auth-mobile-link"
            onClick={() => onItemClick?.()}
          >
            <svg viewBox="0 0 24 24" width="17" height="17" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            </svg>
            <span>اشتراک هفتگی سبد تازه</span>
          </Link>

          <Link
            href="/profile?tab=orders"
            className="auth-mobile-link"
            onClick={() => onItemClick?.()}
          >
            <svg viewBox="0 0 24 24" width="17" height="17" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="m7.5 4.27 9 5.15" />
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              <path d="m3.3 7 8.7 5 8.7-5" />
              <path d="M12 22V12" />
            </svg>
            <span>رهگیری سفارش‌ها و سبد تازه</span>
          </Link>

          {user.is_staff && (
            <a
              href="http://127.0.0.1:8000/admin/"
              target="_blank"
              rel="noreferrer"
              className="auth-mobile-link auth-mobile-link--admin"
              onClick={() => onItemClick?.()}
            >
              <svg viewBox="0 0 24 24" width="17" height="17" stroke="currentColor" strokeWidth="2" fill="none">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M3 9h18M9 21V9" />
              </svg>
              <span>پنل مدیریت سازمان</span>
            </a>
          )}

          <button
            type="button"
            className="auth-mobile-link auth-mobile-link--logout"
            onClick={handleLogout}
          >
            <svg viewBox="0 0 24 24" width="17" height="17" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>خروج امن از حساب</span>
          </button>
        </div>
      </div>
    );
  }

  // Desktop Trigger & Dropdown Menu
  return (
    <div
      className={`auth-user-dropdown-container ${className}`}
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        className={`v2-tool-link auth-user-trigger ${dropdownOpen ? "is-active" : ""}`}
        onClick={() => setDropdownOpen((s) => !s)}
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
        aria-label={`پنل اختصاصی همسفر ${displayName}`}
      >
        <div className="auth-user-avatar" aria-hidden="true">
          {displayName.charAt(0).toUpperCase()}
          <span className="auth-avatar-ring" />
        </div>
        <div className="auth-user-badge-wrap">
          <span className="auth-btn-text">{displayName}</span>
          <span className="auth-btn-sub">باشگاه راه سبز</span>
        </div>
        <svg
          viewBox="0 0 24 24"
          width="14"
          height="14"
          stroke="currentColor"
          strokeWidth="2.5"
          fill="none"
          className={`auth-chevron ${dropdownOpen ? "is-rotated" : ""}`}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {dropdownOpen && (
        <div className="auth-dropdown-menu auth-dropdown-menu--premium" role="menu">
          {/* Header Card with Green Way Membership Theme */}
          <div className="auth-dropdown-hero">
            <div className="auth-dropdown-hero-top">
              <div className="auth-user-avatar auth-user-avatar--lg">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="auth-dropdown-hero-meta">
                <div className="auth-dropdown-name-row">
                  <span className="auth-dropdown-name">{displayName}</span>
                  <span className="auth-badge-vip">همسفر سبز</span>
                </div>
                <span className="auth-dropdown-email">{user.email}</span>
              </div>
            </div>

            {/* Quick Member Wallet & Points */}
            <div className="auth-dropdown-balance-bar">
              <div className="auth-balance-box">
                <span className="auth-balance-title">اعتبار سبز</span>
                <span className="auth-balance-num">۵۰,۰۰۰ <small>تومان</small></span>
              </div>
              <div className="auth-balance-sep" />
              <div className="auth-balance-box">
                <span className="auth-balance-title">امتیاز کوهستان</span>
                <span className="auth-balance-num">۱۲۰ <small>امتیاز</small></span>
              </div>
            </div>
          </div>

          <div className="auth-dropdown-body">
            {/* 1. Personal Info & Security */}
            <Link
              href="/profile?tab=personal"
              className="auth-dropdown-item"
              role="menuitem"
              onClick={() => setDropdownOpen(false)}
            >
              <div className="auth-item-icon">
                <svg viewBox="0 0 24 24" width="17" height="17" stroke="currentColor" strokeWidth="2" fill="none">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div className="auth-item-text">
                <strong>اطلاعات شخصی و امنیت</strong>
                <small>ویرایش مشخصات، رمز عبور، آدرس‌ها</small>
              </div>
            </Link>

            {/* 2. AI Nutrition & Healthy Recipes Assistant */}
            <Link
              href="/profile?tab=ai-nutrition"
              className="auth-dropdown-item auth-dropdown-item--ai"
              role="menuitem"
              onClick={() => setDropdownOpen(false)}
            >
              <div className="auth-item-icon auth-item-icon--sparkle">
                <svg viewBox="0 0 24 24" width="17" height="17" stroke="currentColor" strokeWidth="2" fill="none">
                  <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z" />
                </svg>
              </div>
              <div className="auth-item-text">
                <div className="auth-item-title-row">
                  <strong>دستیار هوش مصنوعی سلامت و تغذیه</strong>
                  <span className="auth-tag-pill">هوشمند</span>
                </div>
                <small>رژیم متناسب، مشاوره پروتئین و دستور پخت</small>
              </div>
            </Link>

            {/* 3. Green Way Wallet & Loyalty */}
            <Link
              href="/profile?tab=wallet"
              className="auth-dropdown-item"
              role="menuitem"
              onClick={() => setDropdownOpen(false)}
            >
              <div className="auth-item-icon">
                <svg viewBox="0 0 24 24" width="17" height="17" stroke="currentColor" strokeWidth="2" fill="none">
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>
              <div className="auth-item-text">
                <strong>کیف پول و باشگاه وفاداری</strong>
                <small>مدیریت موجودی، تخفیف‌ها و شارژ</small>
              </div>
            </Link>

            {/* 4. Weekly Fresh Subscription */}
            <Link
              href="/profile?tab=subscription"
              className="auth-dropdown-item"
              role="menuitem"
              onClick={() => setDropdownOpen(false)}
            >
              <div className="auth-item-icon">
                <svg viewBox="0 0 24 24" width="17" height="17" stroke="currentColor" strokeWidth="2" fill="none">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                </svg>
              </div>
              <div className="auth-item-text">
                <strong>اشتراک هفتگی سبد تازه</strong>
                <small>تحویل منظم پروتئین و لبنیات با زنجیره سرد</small>
              </div>
            </Link>

            {/* 5. Orders & Traceability */}
            <Link
              href="/profile?tab=orders"
              className="auth-dropdown-item"
              role="menuitem"
              onClick={() => setDropdownOpen(false)}
            >
              <div className="auth-item-icon">
                <svg viewBox="0 0 24 24" width="17" height="17" stroke="currentColor" strokeWidth="2" fill="none">
                  <path d="m7.5 4.27 9 5.15" />
                  <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                  <path d="m3.3 7 8.7 5 8.7-5" />
                  <path d="M12 22V12" />
                </svg>
              </div>
              <div className="auth-item-text">
                <strong>پیگیری سفارش‌ها و سبد تازه</strong>
                <small>رهگیری مبدأ مرتع تا درب منزل</small>
              </div>
            </Link>

            {user.is_staff && (
              <>
                <div className="auth-dropdown-divider" />
                <a
                  href="http://127.0.0.1:8000/admin/"
                  target="_blank"
                  rel="noreferrer"
                  className="auth-dropdown-item auth-dropdown-item--admin"
                  role="menuitem"
                  onClick={() => setDropdownOpen(false)}
                >
                  <div className="auth-item-icon">
                    <svg viewBox="0 0 24 24" width="17" height="17" stroke="currentColor" strokeWidth="2" fill="none">
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <path d="M3 9h18M9 21V9" />
                    </svg>
                  </div>
                  <div className="auth-item-text">
                    <strong>ورود به پنل مدیریت سازمان</strong>
                    <small>کاتالوگ، انبار، سفارش‌ها و محتوا</small>
                  </div>
                </a>
              </>
            )}
          </div>

          <div className="auth-dropdown-footer">
            <button
              type="button"
              className="auth-dropdown-logout-btn"
              role="menuitem"
              onClick={handleLogout}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>خروج از حساب</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
