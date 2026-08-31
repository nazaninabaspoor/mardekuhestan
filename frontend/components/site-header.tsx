"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { BrandLogo } from "@/components/brand-logo";
import { CatalogSearchBox } from "@/components/catalog-search-box";
import { V2SiteHeader } from "@/components/v2/v2-site-header";
import { headerTools, navItems } from "@/lib/brand";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (pathname === "/v2" || pathname?.startsWith("/v2/")) {
    return <V2SiteHeader />;
  }

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
                className={"flag" in item ? "nav-spotlight nav-link" : "nav-link"}
              >
                {"flag" in item ? <span className="nav-badge">{item.flag}</span> : null}
                <span className="nav-emoji" aria-hidden="true">
                  {item.emoji}
                </span>
                <span className="nav-label">{item.label}</span>
              </Link>
            ))}
          </nav>

          <Link href="/" className="logo-badge" aria-label="مرد کوهستان">
            <BrandLogo size={200} priority />
          </Link>

          <div className="menubar-actions">
            {headerTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className={tool.quiet ? "tool-quiet nav-link" : "nav-link"}
              >
                <span className="nav-emoji" aria-hidden="true">
                  {tool.emoji}
                </span>
                <span className="nav-label">{tool.label}</span>
              </Link>
            ))}
            <CatalogSearchBox />
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
        <CatalogSearchBox className="header-search mobile-search" variant="default" />
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={"flag" in item ? "nav-spotlight nav-link" : "nav-link"}
            onClick={() => setOpen(false)}
          >
            {"flag" in item ? <span className="nav-badge">{item.flag}</span> : null}
            <span className="nav-emoji is-static" aria-hidden="true">
              {item.emoji}
            </span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </header>
  );
}
