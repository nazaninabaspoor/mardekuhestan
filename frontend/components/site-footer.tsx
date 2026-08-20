import Image from "next/image";
import Link from "next/link";

import { contactInfo } from "@/lib/brand";

/**
 * Irregular mountain crest — few dramatic peaks (not dense diamonds).
 * Solid footer green so the cream page ends in a real skyline.
 */
function FooterMountains() {
  return (
    <div className="footer-mountains" aria-hidden="true">
      <svg
        className="footer-mountains-svg"
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        focusable="false"
      >
        <path
          className="footer-mountains-far"
          d="M0 100 L0 58
            L95 40 L180 62 L290 22 L400 54 L520 14 L640 48 L760 18 L880 52
            L1000 12 L1120 46 L1240 24 L1360 50 L1440 34
            L1440 100 Z"
        />
        <path
          className="footer-mountains-main"
          d="M0 100 L0 72
            L70 58 L150 78 L250 38 L360 70 L470 28 L590 66 L700 32 L820 68
            L930 24 L1050 64 L1160 36 L1280 70 L1380 48 L1440 62
            L1440 100 Z"
        />
      </svg>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <FooterMountains />

      <div className="shell footer-grid">
        <div className="footer-col footer-col--seal">
          <Link href="/" className="footer-seal" aria-label="مرد کوهستان">
            <Image
              src="/brand/orginal-clear.png"
              alt="مرد کوهستان — این راه سبز است"
              width={180}
              height={180}
              className="footer-seal-img"
            />
          </Link>
        </div>

        <div className="footer-col footer-col--about">
          <p className="footer-company">{contactInfo.company}</p>
          <p className="footer-blurb">{contactInfo.blurb}</p>
        </div>

        <nav className="footer-col" aria-label="صفحات">
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
            کلیه حقوق این سایت متعلق به صنایع غذایی مرد کوهستان می‌باشد | All
            Rights Reserved to Mard-e-Kuhestan
          </p>
        </div>
      </div>
    </footer>
  );
}
