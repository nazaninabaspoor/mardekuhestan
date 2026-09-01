"use client";

import React, { useEffect, useRef, useState } from "react";
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
        aria-label="ورود یا ثبت‌نام در حساب کاربری"
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
        <span className="auth-btn-text">ورود / ثبت‌نام</span>
      </button>
    );
  }

  // Logged in -> Show User Name & Dropdown
  const displayName = user.name || user.email.split("@")[0] || "کاربر";

  const handleLogout = async () => {
    setDropdownOpen(false);
    onItemClick?.();
    await logout();
  };

  if (variant === "mobile") {
    return (
      <div className={`auth-mobile-box ${className}`}>
        <div className="auth-mobile-user-info">
          <div className="auth-user-avatar" aria-hidden="true">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="auth-user-meta">
            <span className="auth-user-name">{displayName}</span>
            <span className="auth-user-email">{user.email}</span>
          </div>
        </div>

        <div className="auth-mobile-actions">
          {user.is_staff && (
            <a
              href="http://127.0.0.1:8000/admin/"
              target="_blank"
              rel="noreferrer"
              className="auth-mobile-link auth-mobile-link--admin"
              onClick={() => onItemClick?.()}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M3 9h18M9 21V9" />
              </svg>
              <span>پنل مدیریت</span>
            </a>
          )}

          <button
            type="button"
            className="auth-mobile-link auth-mobile-link--logout"
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
    );
  }

  return (
    <div className={`auth-user-dropdown-container ${className}`} ref={containerRef}>
      <button
        type="button"
        className={`v2-tool-link auth-user-trigger ${dropdownOpen ? "is-active" : ""}`}
        onClick={() => setDropdownOpen((s) => !s)}
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
        aria-label={`حساب کاربری ${displayName}`}
      >
        <div className="auth-user-avatar" aria-hidden="true">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <span className="auth-btn-text">{displayName}</span>
        <svg
          viewBox="0 0 24 24"
          width="14"
          height="14"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          className={`auth-chevron ${dropdownOpen ? "is-rotated" : ""}`}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {dropdownOpen && (
        <div className="auth-dropdown-menu" role="menu">
          <div className="auth-dropdown-header">
            <span className="auth-dropdown-name">{displayName}</span>
            <span className="auth-dropdown-email">{user.email}</span>
          </div>

          <div className="auth-dropdown-divider" />

          {user.is_staff && (
            <a
              href="http://127.0.0.1:8000/admin/"
              target="_blank"
              rel="noreferrer"
              className="auth-dropdown-item auth-dropdown-item--admin"
              role="menuitem"
              onClick={() => setDropdownOpen(false)}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M3 9h18M9 21V9" />
              </svg>
              <span>ورود به پنل مدیریت</span>
            </a>
          )}

          <button
            type="button"
            className="auth-dropdown-item auth-dropdown-item--logout"
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
      )}
    </div>
  );
}
