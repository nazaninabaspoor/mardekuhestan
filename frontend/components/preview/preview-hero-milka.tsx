"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const SLIDES = [
  {
    id: "tender-green",
    kicker: "از مرتع تا سفره",
    title: "این راه سبز است",
    lead: "غذای تازهٔ کوهستان؛ آرام، قابل‌اعتماد، برای سفرهٔ خانواده.",
    cta: "شروع راه سبز",
    href: "/chain",
    atmosphere: "/brand/hero-atmosphere.png",
    product: "/brand/home-dairy.png",
    productAlt: "لبنیات مرد کوهستان",
  },
  {
    id: "alpine-table",
    kicker: "تازگی قابل دیدن",
    title: "طعمی که ریشه دارد",
    lead: "از هوای پاک کوه تا آماده‌سازی دقیق — بدون شلوغی و ادعا.",
    cta: "کشف محصولات",
    href: "/products",
    atmosphere: "/brand/hero-atmosphere2.png",
    product: "/brand/home-meat.png",
    productAlt: "گوشت تازه مرد کوهستان",
  },
  {
    id: "sea-path",
    kicker: "مسیر روشن",
    title: "از آب تا آشپزخانه",
    lead: "انتخاب با حوصله؛ همان تازگی که روی سفره دیده می‌شود.",
    cta: "ادامه مسیر",
    href: "/products?cat=seafood",
    atmosphere: "/brand/landing-way.png",
    product: "/brand/home-seafood.png",
    productAlt: "خوراک دریایی مرد کوهستان",
  },
] as const;

/**
 * Preview-only first section — Milka homepage rhythm:
 * full-bleed alpine stage, tender headline, product float, slide dots.
 * Colors / type / logo language = Marde Kuhestan only.
 */
export function PreviewHeroMilka() {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % SLIDES.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="preview-hero" aria-labelledby="preview-hero-title">
      {SLIDES.map((item, i) => (
        <div
          key={item.id}
          className={`preview-hero-slide${i === index ? " is-active" : ""}`}
          aria-hidden={i !== index}
        >
          <Image
            src={item.atmosphere}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            className="preview-hero-atmosphere"
          />
        </div>
      ))}

      <div className="preview-hero-wash" aria-hidden="true" />
      <div className="preview-hero-mist" aria-hidden="true" />

      <div className="preview-hero-stage">
        <div className="preview-hero-copy">
          <p className="preview-hero-kicker">{slide.kicker}</p>
          <h1 id="preview-hero-title" className="preview-hero-title">
            {slide.title}
          </h1>
          <p className="preview-hero-lead">{slide.lead}</p>
          <Link href={slide.href} className="preview-hero-cta">
            {slide.cta}
          </Link>
        </div>

        <div className="preview-hero-product" key={slide.id}>
          <Image
            src={slide.product}
            alt={slide.productAlt}
            width={720}
            height={720}
            sizes="(max-width: 900px) 70vw, 380px"
            className="preview-hero-product-art"
            priority
          />
        </div>
      </div>

      <div className="preview-hero-dots" role="tablist" aria-label="اسلایدهای هیرو">
        {SLIDES.map((item, i) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`اسلاید ${i + 1}`}
            className={`preview-hero-dot${i === index ? " is-active" : ""}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </section>
  );
}
