"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { headerTools, navItems } from "@/lib/brand";

/**
 * Preview-only header — Milka-like clean chrome over hero,
 * Marde Kuhestan logo / font / green.
 */
export function PreviewHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="preview-header">
      <div className="preview-header-bar">
        <nav className="preview-header-nav" aria-label="منوی پیش‌نمایش">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="preview-header-link">
              {item.label}
              {"flag" in item ? (
                <span className="preview-header-flag">{item.flag}</span>
              ) : null}
            </Link>
          ))}
        </nav>

        <Link href="/preview" className="preview-header-logo" aria-label="مرد کوهستان">
          <Image
            src="/brand/logo-white.svg"
            alt="مرد کوهستان"
            width={220}
            height={48}
            priority
            className="preview-header-logo-art"
          />
        </Link>

        <div className="preview-header-tools">
          {headerTools.map((tool) => (
            <Link key={tool.href} href={tool.href} className="preview-header-tool">
              {tool.label}
            </Link>
          ))}
          <button
            type="button"
            className="preview-header-toggle"
            aria-expanded={open}
            aria-controls="preview-mobile-nav"
            aria-label={open ? "بستن منو" : "باز کردن منو"}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <nav
        id="preview-mobile-nav"
        className={`preview-header-mobile${open ? " is-open" : ""}`}
        aria-label="منوی موبایل پیش‌نمایش"
      >
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
