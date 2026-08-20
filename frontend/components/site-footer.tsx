import Image from "next/image";
import Link from "next/link";

import { contactInfo } from "@/lib/brand";

/**
 * Sharp geometric mountain silhouette — matches mardekuhestan.com footer crest.
 * Peaks are solid footer green so they cut cleanly into the cream page above.
 */
function FooterMountains() {
  return (
    <div className="footer-mountains" aria-hidden="true">
      <svg
        className="footer-mountains-svg"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        focusable="false"
      >
        {/* Soft distant ridge */}
        <path
          className="footer-mountains-far"
          d="M0 120 V72
            L60 58 L120 78 L190 42 L260 70 L340 28 L420 64 L510 18 L600 58
            L690 22 L780 62 L870 16 L960 54 L1050 24 L1140 60 L1230 30 L1320 66 L1440 40
            V120 Z"
        />
        {/* Main crest — same green as footer body */}
        <path
          className="footer-mountains-main"
          d="M0 120 V88
            L55 74 L115 92 L175 60 L245 86 L320 48 L400 82 L475 44 L560 78
            L640 36 L725 74 L810 40 L900 76 L985 42 L1075 78 L1160 50 L1250 84 L1340 58 L1440 80
            V120 Z"
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
