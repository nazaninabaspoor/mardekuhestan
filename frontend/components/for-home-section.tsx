"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState, type CSSProperties } from "react";

import {
  homeCategoryProducts,
  homeDoors,
  type HomeDoorId,
} from "@/lib/brand";
import { ForHomeKitchen } from "@/components/v2/for-home-kitchen";

const DEFAULT_DOOR: HomeDoorId = "fresh-meat";
const CAT_PAGE_SIZE = 6;
const PRODUCT_VISIBLE = 6;
const MARK_SHOP = "/brand/our-way-04-balance.png";
const MARK_STORY = "/brand/our-way-03-quality.png";
const MARK_SOON = "/brand/our-way-05-ahead.png";
const BRAND_SEAL = "/brand/orginal-clear.png";
const FIGURE_CHAR = "/brand/mardekoohestan-walker1.png";
/** مسیر موقت داستان کوتاه — بعداً به صفحهٔ واقعی وصل می‌شود */
const STORY_PLACEHOLDER = "#product-story";

type ProductItem = (typeof homeCategoryProducts)[HomeDoorId][number];

/** جفت رنگ برند برای هر کارت محصول: پایه / هاور و انتخاب */
const DOOR_PRODUCT_TONES: Partial<
  Record<HomeDoorId, ReadonlyArray<{ base: string; hot: string }>>
> = {
  "fresh-meat": [
    { base: "#903828", hot: "#BE6516" },
    { base: "#861309", hot: "#C45A38" },
    { base: "#A04828", hot: "#D4782A" },
    { base: "#6E2A1C", hot: "#BE6516" },
    { base: "#B84A2E", hot: "#E08A3A" },
    { base: "#7A321F", hot: "#C45A38" },
  ],
  seafood: [
    { base: "#204078", hot: "#86C2EB" },
    { base: "#2A5A9A", hot: "#5B9FD4" },
    { base: "#163058", hot: "#86C2EB" },
    { base: "#3A6FB0", hot: "#A8D4F0" },
    { base: "#1A4870", hot: "#6FB0D8" },
  ],
  sausage: [
    { base: "#BE6516", hot: "#E08A3A" },
    { base: "#903828", hot: "#D4782A" },
    { base: "#861309", hot: "#BE6516" },
  ],
  "cook-ready": [
    { base: "#861309", hot: "#BE6516" },
    { base: "#903828", hot: "#D4782A" },
    { base: "#A03820", hot: "#E08A3A" },
  ],
  "ready-meal": [
    { base: "#005B48", hot: "#50AF47" },
    { base: "#0A6B54", hot: "#6BC45A" },
    { base: "#004838", hot: "#50AF47" },
  ],
  dairy: [
    { base: "#5D9BC8", hot: "#86C2EB" },
    { base: "#86C2EB", hot: "#E2D6C2" },
    { base: "#3A7AA8", hot: "#A8D4F0" },
  ],
  farm: [
    { base: "#50AF47", hot: "#86C2EB" },
    { base: "#3A8F3A", hot: "#6BC45A" },
    { base: "#2E7A38", hot: "#50AF47" },
    { base: "#5D686E", hot: "#86C2EB" },
  ],
  bakery: [
    { base: "#BE6516", hot: "#E08A3A" },
    { base: "#903828", hot: "#D4782A" },
    { base: "#A85420", hot: "#F4F0E8" },
  ],
  poultry: [
    { base: "#903828", hot: "#BE6516" },
    { base: "#BE6516", hot: "#E08A3A" },
    { base: "#861309", hot: "#C45A38" },
  ],
  frozen: [
    { base: "#204078", hot: "#86C2EB" },
    { base: "#5D686E", hot: "#86C2EB" },
    { base: "#3A6FB0", hot: "#A8D4F0" },
  ],
  breakfast: [
    { base: "#BE6516", hot: "#E08A3A" },
    { base: "#86C2EB", hot: "#F4F0E8" },
    { base: "#903828", hot: "#D4782A" },
  ],
  condiments: [
    { base: "#5D686E", hot: "#BE6516" },
    { base: "#861309", hot: "#BE6516" },
    { base: "#005B48", hot: "#50AF47" },
  ],
  special: [
    { base: "#005B48", hot: "#50AF47" },
    { base: "#903828", hot: "#BE6516" },
    { base: "#204078", hot: "#86C2EB" },
  ],
};

const FALLBACK_TONES = [
  { base: "#005B48", hot: "#50AF47" },
  { base: "#903828", hot: "#BE6516" },
  { base: "#204078", hot: "#86C2EB" },
  { base: "#5D686E", hot: "#86C2EB" },
  { base: "#861309", hot: "#BE6516" },
  { base: "#50AF47", hot: "#86C2EB" },
] as const;

/** Soft, minimal tones for /v2 catalog cards */
const V2_DOOR_PRODUCT_TONES: Partial<
  Record<HomeDoorId, ReadonlyArray<{ base: string; hot: string }>>
> = {
  "fresh-meat": [
    { base: "#7A2E2E", hot: "#8F3A3A" },
    { base: "#6B2828", hot: "#824040" },
    { base: "#862F2F", hot: "#9A4545" },
    { base: "#5C2428", hot: "#7A3838" },
    { base: "#703030", hot: "#8A4242" },
    { base: "#652A2A", hot: "#7E3C3C" },
  ],
  seafood: [
    { base: "#1E3558", hot: "#2A4568" },
    { base: "#243D68", hot: "#335278" },
    { base: "#182E4C", hot: "#274060" },
    { base: "#2A4570", hot: "#3A5A80" },
    { base: "#1A324F", hot: "#284668" },
  ],
  sausage: [
    { base: "#8A4A28", hot: "#9C5A34" },
    { base: "#7A3E24", hot: "#8E4E30" },
    { base: "#6E3420", hot: "#824030" },
  ],
  "cook-ready": [
    { base: "#6E2E24", hot: "#824038" },
    { base: "#7A3830", hot: "#8E4840" },
    { base: "#5C2820", hot: "#703830" },
  ],
  "ready-meal": [
    { base: "#1F4A3E", hot: "#2A5A4C" },
    { base: "#245248", hot: "#306054" },
    { base: "#1A4038", hot: "#265048" },
  ],
  dairy: [
    { base: "#4A6E88", hot: "#5A7E98" },
    { base: "#5A7E96", hot: "#6A8EA6" },
    { base: "#3E6280", hot: "#4E7290" },
  ],
  farm: [
    { base: "#3A6A3A", hot: "#4A7A4A" },
    { base: "#2E5E32", hot: "#3E6E42" },
    { base: "#4A6E48", hot: "#5A7E58" },
    { base: "#4A5558", hot: "#5A6568" },
  ],
  bakery: [
    { base: "#8A5228", hot: "#9C6234" },
    { base: "#7A4224", hot: "#8E5230" },
    { base: "#6E3A20", hot: "#824A30" },
  ],
  poultry: [
    { base: "#7A3A2E", hot: "#8E4A3A" },
    { base: "#8A4A30", hot: "#9C5A40" },
    { base: "#6E3028", hot: "#824038" },
  ],
  frozen: [
    { base: "#1E3558", hot: "#2A4568" },
    { base: "#3E4A52", hot: "#4E5A62" },
    { base: "#2A4570", hot: "#3A5A80" },
  ],
  breakfast: [
    { base: "#8A5228", hot: "#9C6234" },
    { base: "#5A7E96", hot: "#6A8EA6" },
    { base: "#7A3E24", hot: "#8E4E30" },
  ],
  condiments: [
    { base: "#4A5558", hot: "#5A6568" },
    { base: "#6E2E24", hot: "#824038" },
    { base: "#1F4A3E", hot: "#2A5A4C" },
  ],
  special: [
    { base: "#1F4A3E", hot: "#2A5A4C" },
    { base: "#7A2E2E", hot: "#8F3A3A" },
    { base: "#1E3558", hot: "#2A4568" },
  ],
};

const V2_FALLBACK_TONES = [
  { base: "#1F4A3E", hot: "#2A5A4C" },
  { base: "#7A2E2E", hot: "#8F3A3A" },
  { base: "#1E3558", hot: "#2A4568" },
  { base: "#4A5558", hot: "#5A6568" },
  { base: "#6E2E24", hot: "#824038" },
  { base: "#3A6A3A", hot: "#4A7A4A" },
] as const;

function productTone(
  doorId: HomeDoorId,
  index: number,
  variant: "default" | "v2" = "default",
) {
  if (variant === "v2") {
    const palette = V2_DOOR_PRODUCT_TONES[doorId] ?? V2_FALLBACK_TONES;
    return palette[index % palette.length] ?? V2_FALLBACK_TONES[0];
  }
  const palette = DOOR_PRODUCT_TONES[doorId] ?? FALLBACK_TONES;
  return palette[index % palette.length] ?? FALLBACK_TONES[0];
}

function MarkEmoji({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  return (
    <Image
      src={src}
      alt=""
      width={48}
      height={48}
      sizes="18px"
      className={className}
      aria-hidden="true"
    />
  );
}

function figurePitch(product: ProductItem) {
  return `ای جان، «${product.name}» همینه که می‌گفتم! سوالی داشتی ازم بپرس — من هوش طبیعی‌ام، نه مصنوعی 😄`;
}

/**
 * «چه به خانه می‌رسد»
 * Products live inside the green copy plate; compact LuxLunch glass.
 * `variant="v2"` — softer tones, no character / scrollbar (employer page).
 */
export function ForHomeSection({
  variant = "default",
}: {
  variant?: "default" | "v2";
} = {}) {
  if (variant === "v2") {
    return <ForHomeKitchen />;
  }
  return <ForHomeSectionDefault />;
}

function ForHomeSectionDefault() {
  const rootRef = useRef<HTMLElement | null>(null);
  const dialogTitleId = useId();
  const [visible, setVisible] = useState(false);
  const [activeDoorId, setActiveDoorId] = useState<HomeDoorId>(DEFAULT_DOOR);
  const [activeProductId, setActiveProductId] = useState<string>(
    homeCategoryProducts[DEFAULT_DOOR][0].id,
  );
  const [storyOpen, setStoryOpen] = useState(false);
  const [tipOpen, setTipOpen] = useState(false);
  const [catPage, setCatPage] = useState(0);
  const [plateSpinning, setPlateSpinning] = useState(true);

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

  useEffect(() => {
    setPlateSpinning(true);
    const timer = window.setTimeout(() => setPlateSpinning(false), 1000);
    return () => window.clearTimeout(timer);
  }, [activeProduct.id]);

  const selectDoor = (id: HomeDoorId) => {
    setActiveDoorId(id);
    setActiveProductId(homeCategoryProducts[id][0].id);
    setStoryOpen(false);
    setTipOpen(false);
  };

  const selectProduct = (id: string) => {
    setActiveProductId(id);
    setStoryOpen(false);
    setTipOpen(true);
  };

  const cycleCats = () => {
    setCatPage((page) => (page + 1) % catPageCount);
  };

  const cycleProduct = (dir: 1 | -1) => {
    const next = (activeIndex + dir + products.length) % products.length;
    setActiveProductId(products[next].id);
    setStoryOpen(false);
    setTipOpen(true);
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

  const catsNav = (
    <nav
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
  );

  const productsGrid = (
    <div
      className="for-home-products"
      role="listbox"
      aria-label={activeDoor.label}
      key={activeDoor.id}
    >
      <div className="for-home-products-row">
        {visibleProducts.map((product, index) => {
          const selected = product.id === activeProduct.id;
          const tone = productTone(activeDoorId, index);
          return (
            <button
              key={product.id}
              type="button"
              role="option"
              aria-selected={selected}
              className={`for-home-product-card${selected ? " is-active" : ""}`}
              style={
                {
                  ["--fh-i"]: index,
                  ["--fh-tone"]: tone.base,
                  ["--fh-tone-hot"]: tone.hot,
                } as CSSProperties
              }
              onClick={() => selectProduct(product.id)}
            >
              <span className="for-home-product-card-accent" aria-hidden="true" />
              <span className="for-home-product-card-media">
                <Image
                  src={product.image}
                  alt=""
                  width={112}
                  height={112}
                  sizes="54px"
                />
              </span>
              <span className="for-home-product-card-body">
                <strong>{product.name}</strong>
                <span className="for-home-product-card-pick">{product.note}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const copyActions = (
    <div className="for-home-copy-actions">
      <Link href={activeProduct.href} className="for-home-shop">
        <MarkEmoji src={MARK_SHOP} className="for-home-mark-emoji" />
        <span>این را برای سفره بردار</span>
      </Link>
      <button
        type="button"
        className="for-home-copy-story"
        onClick={() => setStoryOpen(true)}
      >
        <MarkEmoji src={MARK_STORY} className="for-home-mark-emoji" />
        <span>داستان کوتاه این محصول</span>
      </button>
      <button
        type="button"
        className="for-home-copy-buy is-soon"
        disabled
        aria-disabled="true"
        title="به‌زودی"
      >
        <MarkEmoji src={MARK_SOON} className="for-home-mark-emoji" />
        <span>خرید این محصول</span>
        <span className="for-home-copy-buy-badge">به‌زودی</span>
      </button>
    </div>
  );

  const storyPopup = storyOpen ? (
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
  ) : null;

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

            {catsNav}
          </div>

          <div className="for-home-stage">
            <div className="for-home-panel">
              <div className="for-home-copy-plate">
                <h2 id="for-home-title" className="for-home-title">
                  <span className="for-home-title-soft">چه به </span>
                  <span className="for-home-title-accent">خانه</span>
                  <span className="for-home-title-soft"> می‌رسد</span>
                  <span className="for-home-title-mark" aria-hidden="true">
                    <Image
                      src={MARK_SHOP}
                      alt=""
                      width={64}
                      height={64}
                      sizes="28px"
                      className="for-home-title-mark-img"
                    />
                  </span>
                </h2>

                <p className="for-home-lead">
                  امروز{" "}
                  <em className="for-home-lead-name">{activeProduct.name}</em> را
                  از مسیر{" "}
                  <span className="for-home-lead-accent">مرتع تا سفره</span>{" "}
                  می‌بینی؛{" "}
                  <span className="for-home-lead-accent">تازه</span>، روشن و
                  قابل اعتماد. همان حسی که خانواده می‌خواهد روی میز داشته باشد.
                </p>

                {copyActions}

                <div className="for-home-copy-rule" aria-hidden="true">
                  <span className="for-home-copy-rule-line" />
                  <span className="for-home-copy-rule-mark">
                    <Image
                      src={BRAND_SEAL}
                      alt=""
                      width={72}
                      height={72}
                      sizes="28px"
                      className="for-home-copy-rule-logo"
                    />
                  </span>
                  <span className="for-home-copy-rule-line" />
                </div>

                {productsGrid}
              </div>
            </div>

            <div className="for-home-showcase">
              <div className="for-home-showcase-stage">
                <div
                  className={`for-home-figure${tipOpen ? " is-talking" : ""}`}
                >
                  {tipOpen ? (
                    <div
                      className="for-home-figure-tip"
                      key={activeProduct.id}
                      role="status"
                    >
                      <p className="for-home-figure-tip-kicker">از راه سبز</p>
                      <p className="for-home-figure-tip-title">
                        {activeProduct.name}
                      </p>
                      <p className="for-home-figure-tip-text">
                        {figurePitch(activeProduct)}
                      </p>
                      <div className="for-home-figure-tip-actions">
                        <Link
                          href={STORY_PLACEHOLDER}
                          className="for-home-figure-tip-btn"
                        >
                          داستان کوتاه
                        </Link>
                        <Link
                          href={activeProduct.href}
                          className="for-home-figure-tip-cta"
                        >
                          ببر برای سفره
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <p className="for-home-figure-hint" aria-hidden="true">
                      یکی رو بزن رفیق؛ بذار راه سبز رو با هم بچشیم 😉
                    </p>
                  )}
                  <Image
                    src={FIGURE_CHAR}
                    alt="مرد کوهستان"
                    width={360}
                    height={520}
                    sizes="(max-width: 900px) 32vw, 210px"
                    className="for-home-figure-art"
                    priority
                  />
                </div>

                <div className="for-home-slider" aria-label="جابه‌جایی محصول">
                  <button
                    type="button"
                    className="for-home-slider-btn for-home-slider-btn--prev"
                    aria-label="محصول قبلی"
                    onClick={() => cycleProduct(-1)}
                  >
                    <span className="for-home-slider-cloud">بریم قبلی</span>
                    <MarkEmoji
                      src={MARK_SOON}
                      className="for-home-slider-mark"
                    />
                  </button>
                  <div className="for-home-slider-track" aria-hidden="true">
                    <span className="for-home-slider-rail" />
                    {products.map((product, index) => (
                      <span
                        key={product.id}
                        className={`for-home-slider-seg${
                          index === activeIndex ? " is-active" : ""
                        }`}
                      />
                    ))}
                    <span
                      className="for-home-slider-walker"
                      style={
                        {
                          ["--fh-walk"]:
                            products.length <= 1
                              ? "0%"
                              : `${(activeIndex / (products.length - 1)) * 100}%`,
                        } as CSSProperties
                      }
                    >
                      🚶
                    </span>
                  </div>
                  <button
                    type="button"
                    className="for-home-slider-btn for-home-slider-btn--next"
                    aria-label="محصول بعدی"
                    onClick={() => cycleProduct(1)}
                  >
                    <MarkEmoji
                      src={MARK_SOON}
                      className="for-home-slider-mark"
                    />
                    <span className="for-home-slider-cloud">بریم بعدی</span>
                  </button>
                </div>

                <div className="for-home-plate-wrap">
                  <div className="for-home-plate">
                    <span className="for-home-plate-arc" aria-hidden="true" />
                    <span
                      className="for-home-plate-arc for-home-plate-arc--b"
                      aria-hidden="true"
                    />
                    <span className="for-home-plate-ring" aria-hidden="true" />
                    <Image
                      key={activeProduct.id}
                      src={activeProduct.image}
                      alt={activeProduct.alt}
                      width={720}
                      height={720}
                      sizes="(max-width: 900px) 52vw, 360px"
                      className={`for-home-plate-art${
                        plateSpinning ? " is-spinning" : ""
                      }`}
                      priority
                    />
                    <span className="for-home-plate-badge" aria-hidden="true">
                      <Image
                        src={FIGURE_CHAR}
                        alt=""
                        width={160}
                        height={220}
                        sizes="72px"
                        className="for-home-plate-badge-img"
                        priority
                      />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {storyPopup}
    </section>
  );
}
