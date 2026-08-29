"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { v2Footer } from "@/data/v2-footer";
import { contactInfo } from "@/lib/brand";

export function FooterContent() {
  const pathname = usePathname();
  const isV2 = pathname === "/v2" || pathname?.startsWith("/v2/");

  if (isV2) {
    return (
      <>
        <div className="shell footer-grid footer-grid--v2">
          <div className="footer-brand">
            <div className="footer-brand-copy">
              <p className="footer-kicker">{v2Footer.tagline}</p>
              <p className="footer-company">{v2Footer.company}</p>
              <p className="footer-blurb">{v2Footer.blurb}</p>
              <p className="footer-hours">{v2Footer.hours}</p>
            </div>
            <Link href="/v2" className="footer-seal footer-brand-seal" aria-label="مرد کوهستان">
              <Image
                src="/brand/orginal-clear.png"
                alt="مرد کوهستان — این راه سبز است"
                width={180}
                height={180}
                className="footer-seal-img"
              />
            </Link>
          </div>

          <nav className="footer-col footer-col--products" aria-label="دسته محصولات">
            <p className="footer-col-title">{v2Footer.productsTitle}</p>
            <ul>
              {v2Footer.products.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="footer-col footer-col--pages" aria-label="صفحات">
            <p className="footer-col-title">{v2Footer.pagesTitle}</p>
            <ul>
              {v2Footer.pages.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="footer-col footer-col--contact">
            <p className="footer-col-title">{v2Footer.contactTitle}</p>
            <address>
              <p>{v2Footer.address}</p>
              {v2Footer.phones.map((phone) => (
                <p key={phone.href}>
                  <a href={phone.href} dir="ltr">
                    {phone.label}
                  </a>
                </p>
              ))}
              <p>
                <a href={`mailto:${v2Footer.email}`}>{v2Footer.email}</a>
              </p>
            </address>
          </div>

          <div className="footer-col footer-col--actions">
            <p className="footer-col-title">دسترسی سریع</p>
            <div className="footer-actions">
              {v2Footer.actions.map((action) => (
                <Link key={action.href} href={action.href} className="footer-action">
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="shell">
            <p>{v2Footer.copyright}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="shell footer-grid">
        <div className="footer-brand">
          <div className="footer-brand-copy">
            <p className="footer-company">{contactInfo.company}</p>
            <p className="footer-blurb">{contactInfo.blurb}</p>
          </div>
          <Link href="/" className="footer-seal footer-brand-seal" aria-label="مرد کوهستان">
            <Image
              src="/brand/orginal-clear.png"
              alt="مرد کوهستان — این راه سبز است"
              width={180}
              height={180}
              className="footer-seal-img"
            />
          </Link>
        </div>

        <nav className="footer-col footer-col--pages" aria-label="صفحات">
          <p className="footer-col-title">صفحات</p>
          <ul>
            {contactInfo.pages.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer-col footer-col--contact">
          <p className="footer-col-title">راه‌های تماس</p>
          <address>
            <p>{contactInfo.address}</p>
            {contactInfo.phones.map((phone) => (
              <p key={phone.href}>
                <a href={phone.href} dir="ltr">
                  {phone.label}
                </a>
              </p>
            ))}
            <p>
              <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>
            </p>
          </address>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="shell">
          <p>
            کلیه حقوق این سایت متعلق به صنایع غذایی مرد کوهستان می‌باشد | All Rights
            Reserved to Mard-e-Kuhestan
          </p>
        </div>
      </div>
    </>
  );
}
