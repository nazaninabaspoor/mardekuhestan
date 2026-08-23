"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { PeakMark } from "@/components/brand-marks";
import {
  homeCategoryProducts,
  homeDoors,
  type HomeDoorId,
} from "@/lib/brand";

const DEFAULT_DOOR: HomeDoorId = "fresh-meat";
const CAT_PAGE_SIZE = 4;
const PRODUCT_VISIBLE = 2;

type ProductItem = (typeof homeCategoryProducts)[HomeDoorId][number];

/**
 * «چه به خانه می‌رسد»
 * LuxLunch structure + brand guide bubble + emoji cats.
 */
export function ForHomeSection() {
  const rootRef = useRef<HTMLElement | null>(null);
  const dialogTitleId = useId();
  const [visible, setVisible] = useState(false);
  const [activeDoorId, setActiveDoorId] = useState<HomeDoorId>(DEFAULT_DOOR);
  const [activeProductId, setActiveProductId] = useState<string>(
    homeCategoryProducts[DEFAULT_DOOR][0].id,
  );
  const [storyOpen, setStoryOpen] = useState(false);
  const [catPage, setCatPage] = useState(0);

  const catPageCount = Math.ceil(homeDoors.length / CAT_PAGE_SIZE);
  const visibleDoors = useMemo(
    () =>
      homeDoors.slice(
        catPage * CAT_PAGE_SIZE,
        catPage * CAT_PAGE_SIZE + CAT_PAGE_SIZE,
      ),
    [catPage],
  );

  const activeDoor =
    homeDoors.find((item) => item.id === activeDoorId) ?? homeDoors[0];
  const products = homeCategoryProducts[activeDoorId];
  const visibleProducts = products.slice(0, PRODUCT_VISIBLE);
  const activeIndex = Math.max(
    0,
    products.findIndex((item) => item.id === activeProductId),
  );
  const activeProduct: ProductItem = products[activeIndex] ?? products[0];

  const selectDoor = (id: HomeDoorId) => {
    setActiveDoorId(id);
    setActiveProductId(homeCategoryProducts[id][0].id);
    setStoryOpen(false);
  };

  const cycleCats = () => {
    setCatPage((page) => (page + 1) % catPageCount);
  };

  const cycleProduct = (dir: 1 | -1) => {
    const next = (activeIndex + dir + products.length) % products.length;
    setActiveProductId(products[next].id);
    setStoryOpen(false);
  };

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

  useEffect(() => {
    if (!storyOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setStoryOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [storyOpen]);

  return (
    <section
      ref={rootRef}
      className={`for-home for-home--catalog${visible ? " is-visible" : ""}`}
      aria-labelledby="for-home-title"
    >
      <div className="shell">
        <div className="for-home-case">
          <div className="for-home-case-shine" aria-hidden="true" />

          <div className="for-home-topbar">
            <Link href="/" className="for-home-brand" aria-label="مرد کوهستان">
              <Image
                src="/brand/orginal-clear.png"
                alt=""
                width={40}
                height={40}
                className="for-home-brand-mark"
                priority
              />
              <Image
                src="/brand/logo-white.svg"
                alt=""
                width={160}
                height={44}
                className="for-home-brand-logo"
                priority
              />
            </Link>

            <nav className="for-home-cats" role="tablist" aria-label="دسته‌های محصول" key={catPage}>
              {visibleDoors.map((item) => {
                const selected = item.id === activeDoorId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    className={`for-home-cat${selected ? " is-active" : ""}`}
                    onClick={() => selectDoor(item.id)}
                  >
                    <span className="for-home-cat-emoji" aria-hidden="true">
                      {item.emoji}
                    </span>
                    <span className="for-home-cat-label">{item.label}</span>
                  </button>
                );
              })}
              {catPageCount > 1 ? (
                <button
                  type="button"
                  className="for-home-cats-more"
                  onClick={cycleCats}
                  aria-label="دسته‌های بعدی"
                >
                  بیشتر
                </button>
              ) : null}
            </nav>

            <Link href="/products" className="for-home-all">
              مشاهده همه
            </Link>
          </div>

          <div className="for-home-stage">
            <div className="for-home-panel">
              <div className="for-home-copy-plate">
                <p className="for-home-copy-kicker">
                  <PeakMark className="for-home-copy-peak" aria-hidden="true" />
                  <span>این راه سبز است</span>
                </p>
                <h2 id="for-home-title" className="for-home-title">
                  <span className="for-home-title-soft">چه به </span>
                  <span className="for-home-title-accent">خانه</span>
                  <span className="for-home-title-soft"> می‌رسد</span>
                </h2>
                <p className="for-home-lead">
                  امروز «{activeProduct.name}» را از مسیر مرتع تا سفره می‌بینی.
                  تازه، روشن و قابل اعتماد؛ همان حسی که خانواده می‌خواهد روی میز
                  داشته باشد.
                </p>
                <div className="for-home-copy-actions">
                  <Link href={activeProduct.href} className="for-home-shop">
                    <span>این را برای سفره بردار</span>
                    <PeakMark className="for-home-shop-peak" aria-hidden="true" />
                  </Link>
                  <button
                    type="button"
                    className="for-home-copy-story"
                    onClick={() => setStoryOpen(true)}
                  >
                    داستان کوتاه این محصول
                  </button>
                </div>
              </div>

              <div
                className="for-home-products"
                role="listbox"
                aria-label={activeDoor.label}
                key={activeDoor.id}
              >
                <p className="for-home-products-caption">
                  <span aria-hidden="true">{activeDoor.emoji}</span>
                  <span>{activeDoor.label}</span>
                </p>
                <div className="for-home-products-row">
                  {visibleProducts.map((product, index) => {
                    const selected = product.id === activeProduct.id;
                    return (
                      <button
                        key={product.id}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        className={`for-home-product-card${selected ? " is-active" : ""}`}
                        style={{ ["--fh-i" as string]: index }}
                        onClick={() => {
                          setActiveProductId(product.id);
                          setStoryOpen(false);
                        }}
                      >
                        <span className="for-home-product-card-accent" aria-hidden="true" />
                        <span className="for-home-product-card-media">
                          <Image
                            src={product.image}
                            alt=""
                            width={96}
                            height={96}
                            sizes="52px"
                          />
                        </span>
                        <span className="for-home-product-card-body">
                          <strong>{product.name}</strong>
                          <span className="for-home-product-card-pick">انتخاب کن</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="for-home-showcase" key={activeProduct.id}>
              <div className="for-home-plate-wrap">
                <div className="for-home-plate">
                  <span className="for-home-plate-arc" aria-hidden="true" />
                  <span className="for-home-plate-arc for-home-plate-arc--b" aria-hidden="true" />
                  <span className="for-home-plate-ring" aria-hidden="true" />
                  <Image
                    src={activeProduct.image}
                    alt={activeProduct.alt}
                    width={720}
                    height={720}
                    sizes="(max-width: 900px) 70vw, 420px"
                    className="for-home-plate-art"
                    priority
                  />
                  <span className="for-home-plate-badge">
                    <Image
                      src={activeDoor.image}
                      alt=""
                      width={120}
                      height={120}
                      sizes="88px"
                    />
                  </span>
                </div>

                <button
                  type="button"
                  className="for-home-guide"
                  onClick={() => setStoryOpen(true)}
                  aria-haspopup="dialog"
                  aria-expanded={storyOpen}
                  aria-label="اطلاعات بیشتر درباره این محصول"
                >
                  <span className="for-home-guide-bubble">
                    برو بریم اطلاعات بیشتر!
                  </span>
                  <span className="for-home-guide-avatar">
                    <Image
                      src="/brand/orginal-clear.png"
                      alt=""
                      width={88}
                      height={88}
                      sizes="64px"
                    />
                  </span>
                </button>
              </div>

              <div className="for-home-showcase-tools">
                <div className="for-home-slider" aria-label="جابه‌جایی محصول">
                  <button
                    type="button"
                    className="for-home-slider-btn"
                    aria-label="قبلی"
                    onClick={() => cycleProduct(-1)}
                  >
                    ›
                  </button>
                  <div className="for-home-slider-track" aria-hidden="true">
                    {products.map((product, index) => (
                      <span
                        key={product.id}
                        className={`for-home-slider-seg${index === activeIndex ? " is-active" : ""}`}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    className="for-home-slider-btn"
                    aria-label="بعدی"
                    onClick={() => cycleProduct(1)}
                  >
                    ‹
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {storyOpen ? (
        <div
          className="for-home-popup"
          role="presentation"
          onClick={() => setStoryOpen(false)}
        >
          <div
            className="for-home-popup-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="for-home-popup-close"
              aria-label="بستن"
              onClick={() => setStoryOpen(false)}
            >
              ×
            </button>
            <div className="for-home-popup-media">
              <Image
                src={activeProduct.image}
                alt={activeProduct.alt}
                width={360}
                height={360}
                sizes="168px"
              />
            </div>
            <p className="for-home-popup-kicker">{activeDoor.label}</p>
            <h3 id={dialogTitleId} className="for-home-popup-title">
              {activeProduct.name}
            </h3>
            <p className="for-home-popup-story">{activeProduct.story}</p>
            <Link href={activeProduct.href} className="for-home-popup-cta">
              مشاهده در فروشگاه
            </Link>
          </div>
        </div>
      ) : null}
    </section>
  );
}
