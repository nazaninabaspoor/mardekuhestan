"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { headerTools, navItems } from "@/lib/brand";

/**
 * Shop header for /v2 — brand ribbon + white plate, logo on the right (RTL).
 */
export function V2SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header site-header--v2">
      <p className="v2-claim">از مزرعه تا سفره</p>

      <div className="v2-header-body">
        <div className="shell v2-header-plate">
          <div className="v2-menubar">
            <Link
              href="/v2"
              className="v2-logo"
              aria-label="مرد کوهستان، بازگشت به خانه"
            >
              <Image
                src="/brand/orginal-clear.png"
                alt=""
                width={88}
                height={88}
                priority
                className="v2-logo-img"
              />
              <span className="v2-logo-word">مرد کوهستان</span>
            </Link>

            <nav className="v2-primary-nav" aria-label="منوی اصلی">
              {navItems.map((item) => {
                const soon = "flag" in item && item.flag === "بزودی";
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={soon ? "v2-nav-link is-soon" : "v2-nav-link"}
                  >
                    <span className="v2-nav-label">{item.label}</span>
                    {soon ? <span className="v2-nav-badge">به‌زودی</span> : null}
                  </Link>
                );
              })}
            </nav>

            <div className="v2-menubar-actions">
              {headerTools.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className={
                    tool.quiet ? "v2-tool-link is-quiet" : "v2-tool-link"
                  }
                >
                  {tool.label}
                </Link>
              ))}
              <form
                className="v2-header-search"
                action="/products"
                role="search"
              >
                <input
                  type="search"
                  name="q"
                  placeholder="جستجو در محصولات"
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
                className="v2-menu-toggle"
                aria-expanded={open}
                aria-controls="v2-mobile-menu"
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
      </div>

      <nav
        id="v2-mobile-menu"
        className={`v2-mobile-panel${open ? " is-open" : ""}`}
        aria-label="منوی موبایل"
      >
        <div className="shell">
          {navItems.map((item) => {
            const soon = "flag" in item && item.flag === "بزودی";
            return (
              <Link
                key={item.href}
                href={item.href}
                className={soon ? "v2-nav-link is-soon" : "v2-nav-link"}
                onClick={() => setOpen(false)}
              >
                <span className="v2-nav-label">{item.label}</span>
                {soon ? <span className="v2-nav-badge">به‌زودی</span> : null}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
