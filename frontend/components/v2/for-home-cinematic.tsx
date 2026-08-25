"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
} from "framer-motion";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import {
  homeCategoryProducts,
  homeDoors,
  type HomeDoorId,
} from "@/lib/brand";

const DEFAULT_DOOR: HomeDoorId = "fresh-meat";
const CAT_PAGE_SIZE = 6;
const PRODUCT_COUNT = 4;

type FloatSpec = {
  id: string;
  image: string;
  className: string;
  blur: number;
  duration: number;
  y: number;
  rotate: number;
  delay: number;
};

/**
 * Cinematic for-home band for /v2 — adapted from
 * "Smart Kitchen app/web design UI" reference video:
 * cream stage, oversized watermark, depth-of-field floaters,
 * hero product, copy + dual CTA, side features.
 */
export function ForHomeCinematic() {
  const rootRef = useRef<HTMLElement | null>(null);
  const dialogTitleId = useId();
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [activeDoorId, setActiveDoorId] = useState<HomeDoorId>(DEFAULT_DOOR);
  const [catPage, setCatPage] = useState(0);
  const [productIdx, setProductIdx] = useState(0);
  const [storyOpen, setStoryOpen] = useState(false);

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
  const products = homeCategoryProducts[activeDoorId].slice(0, PRODUCT_COUNT);
  const safeIdx = productIdx % Math.max(products.length, 1);
  const active = products[safeIdx] ?? products[0];
  const sideA = products[(safeIdx + 1) % products.length] ?? active;
  const sideB = products[(safeIdx + 2) % products.length] ?? active;

  const floaters: FloatSpec[] = useMemo(() => {
    const imgs = [
      active.image,
      sideA.image,
      sideB.image,
      "/brand/orginal-clear.png",
      active.image,
      sideA.image,
    ];
    const layout = [
      { className: "cine-float--tl", blur: 10, duration: 7.2, y: 28, rotate: 14, delay: 0 },
      { className: "cine-float--tr", blur: 2, duration: 5.8, y: 18, rotate: -12, delay: 0.4 },
      { className: "cine-float--ml", blur: 6, duration: 6.5, y: 22, rotate: 10, delay: 0.8 },
      { className: "cine-float--mr", blur: 14, duration: 8.1, y: 30, rotate: -18, delay: 0.2 },
      { className: "cine-float--bl", blur: 18, duration: 7.6, y: 24, rotate: 16, delay: 1.1 },
      { className: "cine-float--br", blur: 4, duration: 6.2, y: 20, rotate: -8, delay: 0.6 },
    ];
    return layout.map((item, i) => ({
      id: `f-${i}`,
      image: imgs[i % imgs.length],
      ...item,
    }));
  }, [active.image, sideA.image, sideB.image]);

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

  const selectDoor = (id: HomeDoorId) => {
    setActiveDoorId(id);
    setProductIdx(0);
    setStoryOpen(false);
  };

  const cycle = (dir: 1 | -1) => {
    const n = products.length;
    if (!n) return;
    setProductIdx((i) => (i + dir + n) % n);
    setStoryOpen(false);
  };

  const ease: Transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.75, ease: [0.22, 0.7, 0.2, 1] };

  return (
    <section
      ref={rootRef}
      className={`for-home for-home--catalog for-home--v2 cine${
        visible ? " is-visible" : ""
      }`}
      aria-labelledby="for-home-title"
    >
      <div className="cine-atmosphere" aria-hidden="true">
        <span className="cine-wash cine-wash--a" />
        <span className="cine-wash cine-wash--b" />
        <p className="cine-watermark">کوهستان</p>
        <svg className="cine-path" viewBox="0 0 1200 400" fill="none">
          <path
            d="M40 320 C 220 260, 320 180, 480 200 S 780 280, 980 160 S 1120 90, 1180 120"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeDasharray="6 10"
            opacity="0.28"
          />
        </svg>
      </div>

      {!reduceMotion && visible
        ? floaters.map((item) => (
            <motion.span
              key={`${active.id}-${item.id}`}
              className={`cine-float ${item.className}`}
              style={{ filter: `blur(${item.blur}px)` }}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{
                opacity: item.blur > 12 ? 0.55 : 0.9,
                y: [0, -item.y, 0],
                rotate: [0, item.rotate, 0],
                scale: 1,
              }}
              transition={{
                opacity: { delay: 1, duration: 0.6 },
                scale: { delay: 1, duration: 0.6 },
                y: {
                  delay: 1 + item.delay,
                  duration: item.duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                rotate: {
                  delay: 1 + item.delay,
                  duration: item.duration * 1.05,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
              aria-hidden="true"
            >
              <Image src={item.image} alt="" width={160} height={160} sizes="120px" />
            </motion.span>
          ))
        : null}

      <div className="cine-shell">
        <nav className="cine-tabs" role="tablist" aria-label="دسته‌های محصول">
          {visibleDoors.map((item) => {
            const selected = item.id === activeDoorId;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                className={`cine-tab${selected ? " is-active" : ""}`}
                onClick={() => selectDoor(item.id)}
              >
                {item.label}
              </button>
            );
          })}
          {catPageCount > 1 ? (
            <button
              type="button"
              className="cine-tab cine-tab--more"
              onClick={() => setCatPage((p) => (p + 1) % catPageCount)}
              aria-label="دسته‌های بعدی"
            >
              بیشتر
            </button>
          ) : null}
        </nav>

        <div className="cine-stage">
          <motion.div
            className="cine-copy"
            initial={reduceMotion ? false : { opacity: 0, x: 28 }}
            animate={visible ? { opacity: 1, x: 0 } : undefined}
            transition={{ ...ease, delay: 0.45 }}
          >
            <p className="cine-kicker">{activeDoor.label}</p>
            <AnimatePresence mode="wait">
              <motion.h2
                key={active.id}
                id="for-home-title"
                className="cine-title"
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={ease}
              >
                {active.name}
              </motion.h2>
            </AnimatePresence>
            <AnimatePresence mode="wait">
              <motion.p
                key={`d-${active.id}`}
                className="cine-lead"
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={ease}
              >
                {active.teaser || active.story}
              </motion.p>
            </AnimatePresence>
            <div className="cine-actions">
              <Link href={active.href} className="cine-btn cine-btn--primary">
                شروع مسیر
              </Link>
              <Link href="/products" className="cine-btn cine-btn--ghost">
                مشاهده محصولات
              </Link>
            </div>
            <button
              type="button"
              className="cine-story-link"
              onClick={() => setStoryOpen(true)}
            >
              داستان کوتاه این محصول
            </button>
          </motion.div>

          <motion.div
            className="cine-hero"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.85 }}
            animate={visible ? { opacity: 1, scale: 1 } : undefined}
            transition={{ ...ease, delay: 0.75 }}
          >
            <div className="cine-hero-glow" aria-hidden="true" />
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                className="cine-hero-plate"
                initial={
                  reduceMotion
                    ? false
                    : { opacity: 0, rotateY: -18, y: 20, scale: 0.92 }
                }
                animate={{ opacity: 1, rotateY: 0, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={ease}
              >
                <Image
                  src={active.image}
                  alt={active.alt}
                  width={720}
                  height={720}
                  sizes="(max-width: 900px) 70vw, 380px"
                  priority
                />
              </motion.div>
            </AnimatePresence>
            <div className="cine-hero-controls">
              <button
                type="button"
                className="cine-nav-btn"
                aria-label="محصول قبلی"
                onClick={() => cycle(-1)}
              >
                ‹
              </button>
              <button
                type="button"
                className="cine-nav-btn"
                aria-label="محصول بعدی"
                onClick={() => cycle(1)}
              >
                ›
              </button>
            </div>
          </motion.div>

          <motion.aside
            className="cine-side"
            initial={reduceMotion ? false : { opacity: 0, x: -20 }}
            animate={visible ? { opacity: 1, x: 0 } : undefined}
            transition={{ ...ease, delay: 0.55 }}
          >
            <div className="cine-side-thumbs">
              {[sideA, sideB].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="cine-side-thumb"
                  aria-label={item.name}
                  onClick={() => {
                    const idx = products.findIndex((p) => p.id === item.id);
                    if (idx >= 0) setProductIdx(idx);
                  }}
                >
                  <Image
                    src={item.image}
                    alt=""
                    width={120}
                    height={120}
                    sizes="72px"
                  />
                </button>
              ))}
            </div>
            <p className="cine-side-title">{active.note}</p>
            <ul className="cine-side-list">
              <li>
                <span className="cine-side-dot" aria-hidden="true" />
                تازه از مسیر مرتع تا سفره
              </li>
              <li>
                <span className="cine-side-dot" aria-hidden="true" />
                انتخاب کیفیت‌محور برای خانه
              </li>
            </ul>
          </motion.aside>
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
                src={active.image}
                alt={active.alt}
                width={360}
                height={360}
                sizes="168px"
              />
            </div>
            <p className="for-home-popup-kicker">{activeDoor.label}</p>
            <h3 id={dialogTitleId} className="for-home-popup-title">
              {active.name}
            </h3>
            <p className="for-home-popup-story">{active.story}</p>
            <Link href={active.href} className="for-home-popup-cta">
              مشاهده در فروشگاه
            </Link>
          </div>
        </div>
      ) : null}
    </section>
  );
}
