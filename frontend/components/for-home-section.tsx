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
const PRODUCT_VISIBLE = 3;

type ProductItem = (typeof homeCategoryProducts)[HomeDoorId][number];

/**
 * «چه به خانه می‌رسد»
 * Ultra-clear liquid glass — compact, branded category chips, no scrollbars.
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
  const activeProduct: ProductItem =
    products.find((item) => item.id === activeProductId) ?? products[0];

  const selectDoor = (id: HomeDoorId) => {
    setActiveDoorId(id);
    setActiveProductId(homeCategoryProducts[id][0].id);
    setStoryOpen(false);
  };

  const cycleCats = () => {
    setCatPage((page) => (page + 1) % catPageCount);
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
      style={{ ["--fh-tint" as string]: activeDoor.tint }}
    >
      <div className="shell">
        <div className="for-home-case">
          <div className="for-home-case-shine" aria-hidden="true" />

          <div className="for-home-stage">
            <div className="for-home-panel">
              <header className="for-home-head">
                <h2 id="for-home-title" className="for-home-title">
                  <span className="for-home-title-soft">چه به </span>
                  <span className="for-home-title-accent">خانه</span>
                  <span className="for-home-title-soft"> می‌رسد</span>
                </h2>
                <Link href="/products" className="for-home-all">
                  مشاهده همه
                </Link>
              </header>

              <p className="for-home-lead">
                <span>از مرتع تا سفره —</span>{" "}
                <span className="for-home-lead-accent">طعمی که اعتماد می‌سازد.</span>
              </p>

              <div className="for-home-nav-shell">
                <div className="for-home-cats-wrap">
                  <div
                    className="for-home-cats"
                    role="tablist"
                    aria-label="دسته‌های محصول"
                    key={catPage}
                  >
                    {visibleDoors.map((item) => {
                      const selected = item.id === activeDoorId;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          role="tab"
                          aria-selected={selected}
                          className={`for-home-cat${selected ? " is-active" : ""}`}
                          style={{ ["--cat-tint" as string]: item.tint }}
                          onClick={() => selectDoor(item.id)}
                        >
                          <span className="for-home-cat-ico" aria-hidden="true">
                            {item.emoji}
                          </span>
                          <span className="for-home-cat-label">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {catPageCount > 1 ? (
                    <button
                      type="button"
                      className="for-home-cats-more"
                      onClick={cycleCats}
                      aria-label={
                        catPage + 1 < catPageCount
                          ? "دسته‌های بعدی"
                          : "بازگشت به دسته‌های اول"
                      }
                    >
                      <PeakMark className="for-home-cats-more-peak" aria-hidden="true" />
                      <span className="for-home-cats-more-arrow" aria-hidden="true">
                        {catPage + 1 < catPageCount ? "↓" : "↑"}
                      </span>
                      <span className="for-home-cats-more-text">
                        {catPage + 1 < catPageCount ? "بیشتر" : "بازگشت"}
                      </span>
                    </button>
                  ) : null}
                </div>

                <div
                  className="for-home-products"
                  role="listbox"
                  aria-label={`محصولات ${activeDoor.label}`}
                  key={activeDoor.id}
                >
                  <p className="for-home-products-caption">{activeDoor.label}</p>
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
                        <span className="for-home-product-card-media">
                          <Image
                            src={product.image}
                            alt=""
                            width={96}
                            height={96}
                            sizes="48px"
                          />
                        </span>
                        <span className="for-home-product-card-body">
                          <strong>{product.name}</strong>
                          <span className="for-home-product-card-foot">
                            <em>{product.note}</em>
                            {selected ? (
                              <span className="for-home-product-card-pick">انتخاب</span>
                            ) : null}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="for-home-showcase" key={activeProduct.id}>
              <div className="for-home-plate">
                <span className="for-home-plate-arc" aria-hidden="true" />
                <span className="for-home-plate-ring" aria-hidden="true" />
                <Image
                  src={activeProduct.image}
                  alt={activeProduct.alt}
                  width={640}
                  height={640}
                  sizes="(max-width: 900px) 60vw, 300px"
                  className="for-home-plate-art"
                  priority
                />
                <span className="for-home-plate-badge">
                  <Image
                    src={activeDoor.image}
                    alt=""
                    width={88}
                    height={88}
                    sizes="56px"
                  />
                </span>
              </div>

              <div className="for-home-showcase-foot">
                <div className="for-home-teaser">
                  <p className="for-home-teaser-meta">
                    <span className="for-home-teaser-door">{activeDoor.label}</span>
                    <span className="for-home-teaser-dot" aria-hidden="true">
                      ·
                    </span>
                    <span className="for-home-teaser-note">{activeProduct.note}</span>
                  </p>
                  <h3 className="for-home-teaser-name">{activeProduct.name}</h3>
                  <p className="for-home-teaser-text">{activeProduct.teaser}</p>
                  <button
                    type="button"
                    className="for-home-teaser-cta"
                    onClick={() => setStoryOpen(true)}
                    aria-haspopup="dialog"
                    aria-expanded={storyOpen}
                  >
                    ادامه داستان
                  </button>
                </div>
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
