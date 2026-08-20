import Image from "next/image";
import Link from "next/link";

import { contactInfo } from "@/lib/brand";

function FooterMountains() {
  return (
    <svg
      className="footer-mountains"
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        className="footer-mountains-back"
        d="M0 120 V68 L70 42 L140 62 L210 28 L300 58 L380 18 L470 52 L560 24 L650 56 L740 12 L830 48 L920 22 L1010 54 L1100 16 L1190 50 L1280 30 L1360 58 L1440 36 V120 Z"
      />
      <path
        className="footer-mountains-mid"
        d="M0 120 V78 L90 54 L170 74 L260 44 L350 70 L450 38 L540 66 L640 42 L730 68 L820 34 L910 64 L1000 40 L1090 66 L1180 46 L1270 70 L1360 52 L1440 66 V120 Z"
      />
      <path
        className="footer-mountains-front"
        d="M0 120 V92 L110 72 L200 88 L290 66 L390 86 L490 64 L590 84 L690 60 L790 82 L890 58 L990 80 L1090 62 L1190 84 L1290 68 L1440 86 V120 Z"
      />
    </svg>
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
              width={168}
              height={168}
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

      <div className="shell footer-bottom">
        <p>
          کلیه حقوق این سایت متعلق به صنایع غذایی مرد کوهستان می‌باشد | All
          Rights Reserved to Mard-e-Kuhestan
        </p>
      </div>
    </footer>
  );
}
