"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion, type Transition } from "framer-motion";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { homeCategoryProducts, homeDoors, type HomeDoorId } from "@/lib/brand";
import { playCategoryBell } from "@/lib/v2-bell-audio";
import styles from "./for-home-kitchen.module.css";

const DEFAULT_DOOR: HomeDoorId = "fresh-meat";
const VISIBLE = 5;
const CATEGORY_DOCK: ReadonlyArray<{ id: HomeDoorId; short: string }> = [
  { id: "fresh-meat", short: "گوشت" },
  { id: "seafood", short: "دریایی" },
  { id: "dairy", short: "لبنیات" },
  { id: "ready-meal", short: "آماده" },
  { id: "farm", short: "کشاورزی" },
];

const JOURNEY_COPY: Partial<Record<HomeDoorId, string>> = {
  "fresh-meat": "از دامداری تا سفره",
  seafood: "از دریا تا سفره",
  dairy: "از دامداری تا لبنیات تازه",
  "ready-meal": "آماده برای طبخی سریع‌تر",
  farm: "از مزرعه تا سفره",
};

const PRODUCT_COPY: Record<string, string> = {
  "meat-loin": "برشی تازه و خوش‌پخت، مناسب برای خوراک، کباب و پخت آرام.",
  "meat-shoulder": "انتخابی لذیذ و استخوان‌دار، مناسب برای غذاهای آرام‌پز و طعم‌دار.",
  "meat-kebab": "برشی آماده و خوش‌طعم برای کبابی سریع‌تر و نتیجه‌ای مطمئن‌تر.",
  "meat-mix": "ترکیبی کاربردی از برش‌های تازه، مناسب برای چند وعده خانوادگی.",
  "meat-ribs": "برشی لطیف و خوش‌طعم، مناسب برای گریل، کباب و سرو مجلسی.",
  "meat-mince": "گوشت تازه و آماده مصرف، مناسب برای کتلت، کوفته و غذاهای روزمره.",
  "sea-fish": "تازه، سبک و خوش‌طعم؛ مناسب برای پخت روزانه و غذاهای سالم دریایی.",
  "sea-shrimp": "انتخابی لطیف و سریع‌پز، مناسب برای غذاهای دریایی سبک و خوش‌عطر.",
  "sea-mix": "ماهی جنوب با طعمی اصیل، مناسب برای سرخ‌کردن، گریل و پخت روزانه.",
  "sea-salmon": "برشی لطیف و مغذی، مناسب برای گریل و وعده‌های سبک و سالم.",
  "sea-calamar": "بافتی لطیف و سریع‌پز، مناسب برای پیش‌غذا و خوراک‌های دریایی.",
  "dairy-cheese": "بافتی دلپذیر و طعمی متعادل، مناسب برای صبحانه و مصرف روزانه.",
  "dairy-yogurt": "تازه و خوش‌طعم، مناسب برای سرو کنار غذا و سفره روزانه خانواده.",
  "dairy-milk": "تازه و خوش‌نوش، مناسب برای صبحانه و مصرف روزانه خانواده.",
  "meal-fesenjan": "یک غذای اصیل و آماده، مناسب برای وعده‌ای سریع با طعم خانگی.",
  "meal-pasta": "وعده‌ای کامل و آماده برای زمانی که سرعت و طعم هر دو اهمیت دارند.",
  "meal-panini": "انتخابی سبک و سریع برای میان‌وعده یا یک وعده روزانه جمع‌وجور.",
  "farm-honey": "شیرینی طبیعی کوهستان، مناسب برای صبحانه و نوشیدنی‌های گرم.",
  "farm-rice": "دانه‌هایی خوش‌پخت و خوش‌عطر، مناسب برای سفره روزانه خانواده.",
  "farm-olive": "تازه و خوش‌طعم، مناسب برای صبحانه، سالاد و کنار غذا.",
};

type Product = {
  id: string;
  name: string;
  note: string;
  teaser: string;
  story: string;
  href: string;
  image: string;
  alt: string;
};

function SpotlightLamp() {
  return (
    <svg className="kui-spotlight-lamp-svg" viewBox="0 0 64 80" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="kuiSpotlightLamp" x1="12" y1="10" x2="52" y2="70">
          <stop stopColor="#FFE9A8" />
          <stop offset="0.45" stopColor="#F0C15A" />
          <stop offset="1" stopColor="#C48A2A" />
        </linearGradient>
      </defs>
      <path d="M18 28c0-10.5 6-18 14-18s14 7.5 14 18v16c0 2.2-1.2 3.5-3.2 3.5H21.2c-2 0-3.2-1.3-3.2-3.5V28Z" fill="url(#kuiSpotlightLamp)" />
      <ellipse cx="32" cy="46.5" rx="17.5" ry="4.2" fill="#D4A045" opacity="0.62" />
      <circle cx="32" cy="58" r="4.2" fill="#F2D27A" stroke="#C48A2A" strokeWidth="1.2" />
    </svg>
  );
}

function mod(value: number, length: number) {
  return ((value % length) + length) % length;
}

export function ForHomeKitchen() {
  const rootRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [doorId, setDoorId] = useState<HomeDoorId>(DEFAULT_DOOR);
  const [idx, setIdx] = useState(0);
  const switchingRef = useRef(false);

  const products = homeCategoryProducts[doorId] as ReadonlyArray<Product>;
  const active = products[mod(idx, Math.max(products.length, 1))] ?? products[0];

  const rail = useMemo(() => {
    if (!products.length) return [];
    const start = mod(idx - 2, products.length);
    return Array.from({ length: Math.min(VISIBLE, products.length) }, (_, index) => {
      const absolute = mod(start + index, products.length);
      return { product: products[absolute], absolute, highlight: absolute === mod(idx, products.length) };
    });
  }, [products, idx]);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const reveal = () => setVisible(true);
    window.addEventListener("v2:kitchen-arrive", reveal);
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        reveal();
        observer.disconnect();
      }
    }, { threshold: 0.12 });
    observer.observe(node);
    return () => {
      observer.disconnect();
      window.removeEventListener("v2:kitchen-arrive", reveal);
    };
  }, []);

  useLayoutEffect(() => {
    if (reduceMotion || !rootRef.current) return;
    let context: { revert: () => void } | undefined;
    let disposed = false;

    void (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (disposed || !rootRef.current) return;
      gsap.registerPlugin(ScrollTrigger);
      context = gsap.context(() => {
        gsap.timeline({
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top 78%",
            end: "top 46%",
            scrub: 0.7,
          },
        })
          .fromTo(".kui-dark-atmosphere", { opacity: 0.35 }, { opacity: 1, duration: 0.2 })
          .fromTo(".kui-spotlight-lamp", { opacity: 0, y: -20, rotate: -2 }, { opacity: 1, y: 0, rotate: 0, duration: 0.22 })
          .fromTo(".kui-light-beam", { opacity: 0, scaleX: 0.05 }, { opacity: 1, scaleX: 1, duration: 0.28 })
          .fromTo(".kui-product-display", { opacity: 0.05, y: 30, scale: 0.92, filter: "brightness(.25)" }, { opacity: 1, y: 0, scale: 1, filter: "brightness(1.05)", duration: 0.32 }, "-=0.16")
          .fromTo(".kui-gallery-copy", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.24 }, "-=0.12")
          .fromTo(".kui-gallery-header", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.2 }, "-=0.1");
      }, rootRef);
    })();

    return () => {
      disposed = true;
      context?.revert();
    };
  }, [reduceMotion]);

  const transition: Transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.35, ease: [0.16, 1, 0.3, 1] };

  const switchProduct = async (nextIndex: number, nextDoorId = doorId) => {
    if (switchingRef.current || (nextDoorId === doorId && mod(nextIndex, products.length) === mod(idx, products.length))) return;
    if (reduceMotion || !rootRef.current) {
      setDoorId(nextDoorId);
      setIdx(nextIndex);
      return;
    }

    switchingRef.current = true;
    const { default: gsap } = await import("gsap");
    const root = rootRef.current;
    if (!root) {
      switchingRef.current = false;
      return;
    }

    gsap.timeline({
      defaults: { ease: "power2.inOut" },
      onComplete: () => {
        setDoorId(nextDoorId);
        setIdx(nextIndex);
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            if (!rootRef.current) return;
            gsap.timeline({ onComplete: () => { switchingRef.current = false; } })
              .fromTo(rootRef.current.querySelectorAll(".kui-light-beam, .kui-floor-light"), { opacity: 0.45 }, { opacity: 1, duration: 0.3, ease: "power2.out" })
              .fromTo(rootRef.current.querySelector(".kui-gallery-product"), { filter: "brightness(.7)", scale: 0.96 }, { filter: "brightness(1.05)", scale: 1, duration: 0.34, ease: "power2.out" }, "<");
          });
        });
      },
    })
      .to(root.querySelectorAll(".kui-light-beam, .kui-floor-light"), { opacity: 0.45, duration: 0.18 })
      .to(root.querySelector(".kui-gallery-product"), { opacity: 0, scale: 0.96, filter: "brightness(.7)", duration: 0.2 }, "<");
  };

  const selectDoor = (id: HomeDoorId) => {
    if (id === doorId) return;
    void switchProduct(0, id);
    void playCategoryBell();
  };

  const cycle = (direction: 1 | -1) => {
    void switchProduct(mod(idx + direction, products.length));
  };

  if (!active) return null;

  return (
    <section
      ref={rootRef}
      id="for-home-kitchen"
      className={`for-home for-home--catalog for-home--v2 kitchen-ui kui-gallery ${styles.section}${visible ? " is-visible" : ""}`}
      data-category={doorId}
      aria-labelledby="kui-section-title"
    >
      <div className={`kui-dark-atmosphere ${styles.atmosphere}`} aria-hidden="true" />

      <div className={`kui-gallery-shell ${styles.shell}`}>
        <header className={`kui-gallery-header ${styles.header}`}>
          <div className={`kui-glass-title ${styles.titleRow}`}>
            <h2 id="kui-section-title" className={`kui-gallery-section-title ${styles.sectionLabel}`}>منتخب محصولات مرد کوهستان</h2>
            <span className={`kui-minimal-divider ${styles.neonDivider}`} aria-hidden="true" />
          </div>
          <nav className={`kui-category-bar kui-dock ${styles.categoryMenu}`} aria-label="دسته‌بندی محصولات">
            {CATEGORY_DOCK.map(({ id, short }) => {
              const category = homeDoors.find((item) => item.id === id);
              if (!category) return null;
              const selected = id === doorId;
              return (
                <button
                  key={id}
                  type="button"
                  className={`kui-dock-btn ${styles.categoryItem}${selected ? ` is-active ${styles.categoryActive}` : ""}`}
                  aria-pressed={selected}
                  aria-label={category.label}
                  onClick={() => selectDoor(id)}
                >
                  <span className="kui-dock-label">{short}</span>
                </button>
              );
            })}
          </nav>
        </header>

        <main className={`kui-gallery-main ${styles.main}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`copy-${doorId}-${active.id}`}
              className={`kui-gallery-copy ${styles.details}`}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={transition}
            >
              <div className={`kui-brand-journey ${styles.eyebrow}`}>
                <span>{JOURNEY_COPY[doorId] ?? "از مزرعه تا سفره"}</span>
                <span className="kui-journey-line" aria-hidden="true"><i /></span>
              </div>
              <h3 className={`kui-title ${styles.productTitle}`}>
                <motion.span
                  className="kui-title-line"
                  initial={reduceMotion ? false : { y: "110%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-110%" }}
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                >
                  {active.name}
                </motion.span>
              </h3>
              <p className={`kui-description ${styles.description}`}>{PRODUCT_COPY[active.id] ?? active.teaser}</p>
              <div className={`kui-hero-actions ${styles.actions}`}>
                <Link href={active.href} className={`kui-text-action kui-text-action--primary ${styles.primaryAction}`}>مشاهده محصول</Link>
                <button type="button" className={`kui-text-action kui-text-action--secondary ${styles.videoAction}`}>
                  <span className="kui-play" aria-hidden="true" />
                  پخش ویدیو
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className={`kui-product-display ${styles.rig}`}>
            <div className={`kui-spotlight-lamp ${styles.lamp}`} aria-hidden="true">
              <span className="kui-spotlight-wire" />
              <SpotlightLamp />
            </div>
            <div key={`beam-${doorId}-${active.id}`} className={`kui-light-beam ${styles.beam}`} aria-hidden="true">
              <span className="kui-light-beam-soft" />
              <span className="kui-light-beam-middle" />
              <span className="kui-light-beam-core" />
              {Array.from({ length: 8 }, (_, particle) => (
                <i key={particle} style={{ ["--particle" as string]: particle }} />
              ))}
            </div>
            <div className={`kui-product-glow kui-floor-light ${styles.floorGlow}`} aria-hidden="true" />
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                className={`kui-gallery-product ${styles.dish}`}
                initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={transition}
                whileHover={reduceMotion ? undefined : { y: -3 }}
              >
                <Image src={active.image} alt={active.alt} width={720} height={720} sizes="(max-width: 700px) 88vw, 620px" priority />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        <motion.div
          className={`kui-rail ${styles.scroller}`}
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={visible ? { opacity: 1, y: 0 } : undefined}
          transition={{ ...transition, delay: 0.12 }}
        >
          <button type="button" className={`kui-rail-arrow ${styles.arrow}`} aria-label="محصول قبلی" onClick={() => cycle(-1)}>‹</button>
          <ul className={`kui-rail-list ${styles.scrollerList}`}>
            {rail.map(({ product, absolute, highlight }) => (
              <li key={`${product.id}-${absolute}`}>
                <button
                  type="button"
                  className={`kui-rail-item ${styles.thumbItem}${highlight ? ` is-active ${styles.thumbActive}` : ""}`}
                  aria-pressed={highlight}
                  onClick={() => void switchProduct(absolute)}
                >
                  <span className={`kui-rail-thumb ${styles.thumbImage}`}>
                    <Image src={product.image} alt="" width={120} height={120} sizes="72px" />
                  </span>
                  <span className={`kui-rail-label ${styles.thumbLabel}`}>{product.name}</span>
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className={`kui-rail-arrow ${styles.arrow}`} aria-label="محصول بعدی" onClick={() => cycle(1)}>›</button>
        </motion.div>

      </div>
    </section>
  );
}
