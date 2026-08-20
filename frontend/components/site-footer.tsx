import Image from "next/image";
import Link from "next/link";

import { contactInfo } from "@/lib/brand";

/** Geometric mountain ridge — solid brand green silhouette, no stretch distortion. */
function FooterMountains() {
  return (
    <div className="footer-mountains" aria-hidden="true">
      <svg
        className="footer-mountains-svg"
        viewBox="0 0 1440 168"
        preserveAspectRatio="none"
        focusable="false"
      >
        <defs>
          <linearGradient id="footerPeakShade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0a6a52" />
            <stop offset="100%" stopColor="#005040" />
          </linearGradient>
        </defs>

        {/* Far ridge — softer depth */}
        <path
          className="footer-mountains-far"
          d="M0 168 V98
            L48 86 L96 102 L150 70 L198 94 L252 58 L310 88 L372 48 L430 82
            L492 40 L556 76 L618 34 L686 72 L750 28 L812 68 L876 36 L938 74
            L1002 30 L1068 66 L1134 42 L1196 78 L1260 50 L1324 84 L1384 62 L1440 90
            V168 Z"
        />

        {/* Mid ridge */}
        <path
          className="footer-mountains-mid"
          d="M0 168 V118
            L56 104 L112 122 L176 92 L236 116 L300 78 L364 110 L432 70 L498 104
            L566 62 L636 98 L704 54 L776 94 L844 66 L912 100 L980 58 L1050 96
            L1120 72 L1190 104 L1260 80 L1330 108 L1390 88 L1440 112
            V168 Z"
        />

        {/* Near ridge — main body color, crisp brand peaks */}
        <path
          fill="url(#footerPeakShade)"
          d="M0 168 V132
            L40 122 L84 136 L130 114 L178 132 L230 100 L286 128 L340 96 L398 124
            L456 88 L518 120 L576 84 L640 118 L702 90 L766 122 L828 86 L894 118
            L958 92 L1024 124 L1088 98 L1154 126 L1218 104 L1284 130 L1344 112 L1440 128
            V168 Z"
        />

        {/* Snow highlights on key summits */}
        <path
          className="footer-mountains-snow"
          d="M252 58 L268 74 L238 74 Z
             M492 40 L512 58 L474 58 Z
             L750 28 L772 48 L730 48 Z
             M1002 30 L1024 50 L982 50 Z
             M618 34 L638 52 L600 52 Z"
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
              width={176}
              height={176}
              className="footer-seal-img"
              priority={false}
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
