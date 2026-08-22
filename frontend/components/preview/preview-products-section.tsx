"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/**
 * Preview products — layout from mardekuhestan.com «محصولات ما»
 * + motion energy from Ogenix main-slider (float / bounce / stage).
 * Brand tokens only. Never used on `/`.
 */
const CATALOG = [
  {
    id: "fresh-meat",
    href: "/products?cat=fresh-meat",
    title: "گوشت تازه",
    body: "ترکیبی کامل از گوشت‌های تازه؛ انتخابی مطمئن برای طعمی که باید واقعی، ساده و بی‌واسطه باشد.",
    image: "/brand/home-meat.png",
    alt: "بشقاب گوشت تازه مرد کوهستان",
  },
  {
    id: "seafood",
    href: "/products?cat=seafood",
    title: "محصولات دریایی",
    body: "ماهی و میگو از منابع دریایی و آبزی‌پروری، با تازگی پایدار و کیفیتی که از دریا تا سفره حفظ می‌شود.",
    image: "/brand/home-seafood.png",
    alt: "بشقاب محصولات دریایی مرد کوهستان",
  },
  {
    id: "sausage",
    href: "/products?cat=ready",
    title: "سوسیس و کالباس",
    body: "سوسیس‌های تخمیری و کالباس بلونیا، دور از حس صنعتی و با طعمی عمیق.",
    image: "/brand/akhary.png",
    alt: "سوسیس و کالباس مرد کوهستان",
  },
  {
    id: "cook-ready",
    href: "/products?cat=ready",
    title: "غذاهای آماده پخت",
    body: "ناگت، برگر، پیتزا و …؛ آماده برای وقتی که سرعت مهم است اما طعم نباید قربانی شود.",
    image: "/brand/home-ready.png",
    alt: "غذاهای آماده پخت مرد کوهستان",
  },
  {
    id: "ready-meal",
    href: "/products?cat=ready",
    title: "غذای آماده",
    body: "از فسنجان ایرانی تا پاستا و پنینی؛ غذاهایی آماده برای وقتی که دلتان یک وعده کامل خانگی می‌خواهد.",
    image: "/brand/landing-table.png",
    alt: "غذای آماده مرد کوهستان",
  },
  {
    id: "dairy",
    href: "/products?cat=dairy",
    title: "محصولات لبنی",
    body: "پنیرهای طبیعی و لبنیات خاص بر پایه شیر گوسفند و بز؛ طعمی طبیعی، غنی و اصیل.",
    image: "/brand/home-dairy.png",
    alt: "لبنیات مرد کوهستان",
  },
  {
    id: "farm",
    href: "/products",
    title: "محصولات کشاورزی",
    body: "عسل کوهستان، خرما، برنج، زیتون و ادویه؛ سبدی از طعم‌های زمین، رنگارنگ و زنده.",
    image: "/brand/landing-farm.png",
    alt: "محصولات کشاورزی مرد کوهستان",
  },
  {
    id: "bakery",
    href: "/products",
    title: "نان و راهکارهای آشپزی",
    body: "از نان و خمیر پیتزا تا دیپ و درسینگ؛ ابزارهایی برای آشپزی راحت و خوش‌طعم.",
    image: "/brand/landing-home.png",
    alt: "نان و راهکار آشپزی مرد کوهستان",
  },
] as const;

type CatalogId = (typeof CATALOG)[number]["id"];

function FloatLeaf({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 40 52" aria-hidden="true">
      <path
        d="M20 48S6 34 6 20C6 10 12 4 20 4s14 6 14 16c0 14-14 28-14 28Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path d="M20 8v34" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function FloatPeak({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 64 28" aria-hidden="true">
      <path
        d="M4 24 L32 4 L60 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PreviewProductsSection() {
  const rootRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [activeId, setActiveId] = useState<CatalogId>("fresh-meat");
  const active = CATALOG.find((item) => item.id === activeId) ?? CATALOG[0];

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={rootRef}
      className={`preview-products${visible ? " is-visible" : ""}`}
      aria-labelledby="preview-products-title"
    >
      <div className="shell">
        <h2 id="preview-products-title" className="preview-products-title">
          محصولات ما
        </h2>

        <div className="preview-products-stage">
          {/* RTL: first = right — category pills like official site */}
          <div className="preview-products-tabs" role="tablist" aria-label="دسته‌های محصول">
            {CATALOG.map((item) => {
              const selected = item.id === activeId;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  className={`preview-products-tab${selected ? " is-active" : ""}`}
                  onClick={() => setActiveId(item.id)}
                >
                  {item.title}
                </button>
              );
            })}
          </div>

          <div className="preview-products-detail" key={active.id}>
            <h3 className="preview-products-detail-title">{active.title}</h3>
            <p className="preview-products-detail-body">{active.body}</p>
            <Link href={active.href} className="preview-products-detail-cta">
              مشاهده دسته
            </Link>
          </div>

          <div className="preview-products-showcase" aria-hidden={false}>
            <span className="preview-products-shape preview-products-shape--a" aria-hidden="true" />
            <span className="preview-products-shape preview-products-shape--b" aria-hidden="true" />
            <FloatLeaf className="preview-products-floater preview-products-floater--leaf-1" />
            <FloatLeaf className="preview-products-floater preview-products-floater--leaf-2" />
            <FloatPeak className="preview-products-floater preview-products-floater--peak" />

            <div className="preview-products-plate" key={active.id}>
              <span className="preview-products-badge" aria-hidden="true">
                <svg viewBox="0 0 48 48" focusable="false">
                  <circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" strokeWidth="1.4" />
                  <path
                    d="M12 30 L24 12 L36 30"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <Image
                src={active.image}
                alt={active.alt}
                width={900}
                height={900}
                sizes="(max-width: 900px) 78vw, 420px"
                className="preview-products-plate-art"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
