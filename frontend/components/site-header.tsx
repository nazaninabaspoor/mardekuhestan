"use client";

import Link from "next/link";
import { useState } from "react";

import { BrandLogo } from "@/components/brand-logo";
import { navItems } from "@/lib/brand";

function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M20 20l-3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M5 19c1.4-3.2 3.8-5 7-5s5.6 1.8 7 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function IconHeart() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 19s-7-4.4-7-9.2A3.8 3.8 0 0 1 12 7a3.8 3.8 0 0 1 7 2.8C19 14.6 12 19 12 19z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconBag() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6 8h12l-1 12H7L6 8z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9 8V7a3 3 0 0 1 6 0v1" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <p className="topbar-claim">از مزرعه تا سفره</p>

      <div className="shell header-plate">
        <div className="menubar">
          <nav className="primary-nav" aria-label="منوی اصلی">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={"flag" in item ? "nav-spotlight" : undefined}
              >
                {"flag" in item ? <span className="nav-badge">{item.flag}</span> : null}
                {item.label}
              </Link>
            ))}
          </nav>

          <Link href="/" className="logo-badge" aria-label="مرد کوهستان">
            <BrandLogo size={200} priority />
          </Link>

          <div className="menubar-actions">
            <Link href="/wishlist" className="btn-icon" aria-label="علاقه‌مندی">
              <IconHeart />
            </Link>
            <Link href="/account" className="btn-icon" aria-label="حساب کاربری">
              <IconUser />
            </Link>
            <Link href="/cart" className="btn-accent bag" aria-label="سبد خرید">
              <IconBag />
              <span className="bag-label">سبد خرید</span>
            </Link>
            <Link href="/products" className="btn-icon search-btn" aria-label="جستجو">
              <IconSearch />
            </Link>
            <button
              type="button"
              className="menu-toggle"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "بستن منو" : "باز کردن منو"}
              onClick={() => setOpen((value) => !value)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </div>

      <nav
        id="mobile-menu"
        className={`mobile-panel${open ? " is-open" : ""}`}
        aria-label="منوی موبایل"
      >
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={"flag" in item ? "nav-spotlight" : undefined}
            onClick={() => setOpen(false)}
          >
            {"flag" in item ? <span className="nav-badge">{item.flag}</span> : null}
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
