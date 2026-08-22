"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";

import {
  homeCategoryProducts,
  homeDoors,
  type HomeDoorId,
} from "@/lib/brand";

const OX = "/brand/preview-ogenix";
const PRODUCE = [
  `${OX}/shape-1.png`,
  `${OX}/shape-2.png`,
  `${OX}/shape-3.png`,
  `${OX}/shape-5.png`,
  `${OX}/shape-6.png`,
  `${OX}/shape-7.png`,
  `${OX}/shape-8.png`,
] as const;

const DEFAULT_DOOR: HomeDoorId = "fresh-meat";

type ProductItem = (typeof homeCategoryProducts)[HomeDoorId][number];

type ProduceSpec = {
  id: number;
  src: string;
  top: string;
  left: string;
  size: number;
  rot: number;
  delay: number;
  duration: number;
  opacity: number;
  drift: "a" | "b" | "c" | "d";
};

function buildProduceField(): ProduceSpec[] {
  const items: ProduceSpec[] = [];
  const cols = 12;
  const rows = 9;
  const drifts = ["a", "b", "c", "d"] as const;

  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const stagger = (r % 2) * (100 / cols / 2);
      const left = (c / (cols - 1)) * 92 + 3 + stagger * 0.12 + ((r * 3 + c) % 5) * 0.28;
      const top = (r / (rows - 1)) * 86 + 4 + ((c * 2 + r) % 4) * 0.45;
      const inCopyCore = left > 34 && left < 66 && top > 22 && top < 78;
      if (inCopyCore && (r + c) % 2 === 0) continue;

      const i = r * cols + c;
      items.push({
        id: i,
        src: PRODUCE[i % PRODUCE.length],
        top: `${top.toFixed(1)}%`,
        left: `${left.toFixed(1)}%`,
        size: 22 + ((i * 11) % 28),
        rot: ((i * 37) % 56) - 28,
        delay: (i % 14) * 0.11,
        duration: 5.4 + (i % 9) * 0.32,
        opacity: inCopyCore ? 0.2 : 0.36 + ((i % 5) * 0.04),
        drift: drifts[i % 4],
      });
    }
  }

  return items;
}

const PRODUCE_FIELD = buildProduceField();

/**
 * «چه به خانه می‌رسد»
 * Full category row → captivating product cards → plate showcase + teaser popup.
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
          <div className="for-home-case-glow" aria-hidden="true" />
          <div className="for-home-case-frame" aria-hidden="true" />

          <div className="for-home-decor" aria-hidden="true">
            {PRODUCE_FIELD.map((item) => (
              <span
                key={item.id}
                className={`for-home-decor-item for-home-decor--${item.drift}`}
                style={
                  {
                    top: item.top,
                    left: item.left,
                    width: item.size,
                    "--decor-rot": `${item.rot}deg`,
                    "--decor-dur": `${item.duration}s`,
                    "--decor-delay": `${item.delay}s`,
                    "--decor-opacity": item.opacity,
                  } as CSSProperties
                }
              >
                <Image src={item.src} alt="" width={80} height={80} sizes="48px" />
              </span>
            ))}
          </div>

          <div className="for-home-head">
            <h2 id="for-home-title" className="for-home-title">
              چه به خانه می‌رسد
            </h2>
            <Link href="/products" className="for-home-all">
              مشاهده همه
            </Link>
          </div>

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
                  <span className="for-home-cat-line">{item.line}</span>
                </button>
              );
            })}
          </div>

          <div className="for-home-stage" key={activeDoor.id}>
            <div className="for-home-products" role="listbox" aria-label={`محصولات ${activeDoor.label}`}>
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
                        width={160}
                        height={160}
                        sizes="96px"
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

            <div className="for-home-showcase" key={activeProduct.id}>
              <div className="for-home-plate">
                <Image
                  src={activeProduct.image}
                  alt={activeProduct.alt}
                  width={720}
                  height={720}
                  sizes="(max-width: 900px) 70vw, 360px"
                  className="for-home-plate-art img-bounce"
                  priority
                />
              </div>

              <button
                type="button"
                className="for-home-teaser"
                onClick={() => setStoryOpen(true)}
                aria-haspopup="dialog"
                aria-expanded={storyOpen}
              >
                <span className="for-home-teaser-kicker">{activeProduct.note}</span>
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
                width={420}
                height={420}
                sizes="220px"
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
