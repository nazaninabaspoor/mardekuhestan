import Image from "next/image";
import Link from "next/link";

import { contactInfo } from "@/lib/brand";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-scene" aria-hidden="true">
        <Image
          src="/brand/orginalfooter.png"
          alt=""
          width={1591}
          height={988}
          sizes="100vw"
          className="footer-scene-art"
          priority={false}
        />
      </div>

      <div className="footer-body">
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
              کلیه حقوق این سایت متعلق به صنایع غذایی مرد کوهستان می‌باشد | All
              Rights Reserved to Mard-e-Kuhestan
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
