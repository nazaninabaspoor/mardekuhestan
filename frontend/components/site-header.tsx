"use client";

import Link from "next/link";
import { useState } from "react";

import { BrandLogo } from "@/components/brand-logo";
import { navItems } from "@/lib/brand";

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
            <Link href="/wishlist" className="tool-quiet">
              علاقه‌مندی
            </Link>
            <Link href="/account">ورود</Link>
            <Link href="/cart">سفره من</Link>
            <form className="header-search tool-quiet" action="/products" role="search">
              <input
                type="search"
                name="q"
                placeholder="گوشت، لبنیات، ماهی…"
                autoComplete="off"
                aria-label="جستجو در محصولات"
              />
              <button type="submit" aria-label="جستجو">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle
                    cx="11"
                    cy="11"
                    r="6.2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <path
                    d="M20 20l-3.4-3.4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                </svg>
              </button>
            </form>
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
