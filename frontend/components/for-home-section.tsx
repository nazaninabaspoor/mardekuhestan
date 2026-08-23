"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

import { PeakMark } from "@/components/brand-marks";
import {
  homeCategoryProducts,
  homeDoors,
  type HomeDoorId,
} from "@/lib/brand";

const DEFAULT_DOOR: HomeDoorId = "fresh-meat";

type ProductItem = (typeof homeCategoryProducts)[HomeDoorId][number];

/**
 * «چه به خانه می‌رسد»
 * Liquid-glass catalog: nav glass (cats | products) over mountain + content showcase.
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

  const activeDoor = homeDoors.find((item) => item.id === activeDoorId) ?? homeDoors[0];
  const products = homeCategoryProducts[activeDoorId];
  const activeProduct: ProductItem =
    products.find((item) => item.id === activeProductId) ?? products[0];

  const selectDoor = (id: HomeDoorId) => {
    setActiveDoorId(id);
    setActiveProductId(homeCategoryProducts[id][0].id);
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

          <header className="for-home-head">
            <div className="for-home-head-copy">
              <PeakMark className="for-home-peak" aria-hidden="true" />
              <h2 id="for-home-title" className="for-home-title">
                چه به خانه می‌رسد
              </h2>
            </div>
            <Link href="/products" className="for-home-all">
              مشاهده همه
            </Link>
          </header>

          <div className="for-home-stage">
            {/* RTL: right = cats, left-of-cats = products, far-left = showcase */}
            <nav className="for-home-nav" aria-label="دسته‌ها و محصولات">
              <div className="for-home-cats" role="tablist" aria-label="دسته‌های محصول">
                {homeDoors.map((item) => {
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
                      <span className="for-home-cat-label">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="for-home-nav-split" aria-hidden="true" />

              <div
                className="for-home-products"
                role="listbox"
                aria-label={`محصولات ${activeDoor.label}`}
                key={activeDoor.id}
              >
                <p className="for-home-products-caption">{activeDoor.label}</p>
                {products.map((product, index) => {
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
                      <span className="for-home-product-card-media">
                        <Image
                          src={product.image}
                          alt=""
                          width={96}
                          height={96}
                          sizes="40px"
                        />
                      </span>
                      <span className="for-home-product-card-body">
                        <strong>{product.name}</strong>
                        <em>{product.note}</em>
                      </span>
                    </button>
                  );
                })}
              </div>
            </nav>

            <div className="for-home-showcase" key={activeProduct.id}>
              <div className="for-home-plate">
                <Image
                  src={activeProduct.image}
                  alt={activeProduct.alt}
                  width={560}
                  height={560}
                  sizes="(max-width: 900px) 58vw, 300px"
                  className="for-home-plate-art"
                  priority
                />
              </div>

              <div className="for-home-teaser-wrap">
                <button
                  type="button"
                  className="for-home-teaser"
                  onClick={() => setStoryOpen(true)}
                  aria-haspopup="dialog"
                  aria-expanded={storyOpen}
                >
                  <span className="for-home-teaser-meta">
                    <span className="for-home-teaser-door">{activeDoor.label}</span>
                    <PeakMark className="for-home-teaser-peak" aria-hidden="true" />
                    <span className="for-home-teaser-kicker">{activeProduct.note}</span>
                  </span>
                  <span className="for-home-teaser-name">{activeProduct.name}</span>
                  <span className="for-home-teaser-text">{activeProduct.teaser}</span>
                  <span className="for-home-teaser-cta">ادامه داستان</span>
                </button>

                <Link href={activeProduct.href} className="for-home-shop">
                  رفتن به فروشگاه
                </Link>
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
