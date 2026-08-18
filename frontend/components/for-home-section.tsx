import Image from "next/image";
import Link from "next/link";

import { homeDoors } from "@/lib/brand";

function BlockTitleIcon() {
  return (
    <svg
      className="for-home-block-icon"
      viewBox="0 0 512 512"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M128 32c-5.2 0-10.1 2.5-13.1 6.8l-112 160c-4.3 6.2-3.7 14.6 1.4 20.1l240 256c3 3.2 7.2 5.1 11.7 5.1s8.6-1.8 11.7-5.1l240-256c5.2-5.5 5.8-13.9 1.4-20.1l-112-160c-3-4.3-7.9-6.8-13.1-6.8H128zm.9 42.7L222.7 192H46.7L128.9 74.7zM52.9 224H256 459.1L256 440.6 52.9 224zm412.3-32h-176L383.1 74.7 465.3 192zM350.7 64 256 182.4 161.3 64H350.7z" />
    </svg>
  );
}

function ViewMoreIcon() {
  return (
    <svg
      className="for-home-view-more-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M14 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function ForHomeSection() {
  return (
    <section className="for-home" aria-labelledby="for-home-title">
      <div className="shell">
        <div className="for-home-block">
          <div className="for-home-block-title">
            <div className="for-home-block-title-text" id="for-home-title">
              <BlockTitleIcon />
              چه به خانه می‌رسد
            </div>
            <Link href="/products" className="for-home-view-more" title="همه محصولات">
              <ViewMoreIcon />
              مشاهده همه
            </Link>
          </div>

          <div className="for-home-block-content">
            <ul className="for-home-products">
              {homeDoors.map((item) => (
                <li key={item.id} className="for-home-product">
                  <article className="for-home-product-area">
                    <div className="for-home-product-image">
                      <Link href={item.href} title={item.label}>
                        <span className="for-home-product-badge">{item.line}</span>
                        <Image
                          src={item.image}
                          alt={item.alt}
                          width={230}
                          height={230}
                          sizes="(min-width: 1024px) 230px, (min-width: 768px) 45vw, 88vw"
                          style={{ objectPosition: item.position }}
                        />
                      </Link>
                    </div>
                    <h3 className="for-home-product-name">
                      <Link href={item.href}>{item.label}</Link>
                    </h3>
                    <div className="for-home-product-actions">
                      <Link href={item.href} className="for-home-product-cta">
                        مشاهده {item.label}
                      </Link>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
