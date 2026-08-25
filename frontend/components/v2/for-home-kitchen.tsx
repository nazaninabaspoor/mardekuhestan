"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
} from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  homeCategoryProducts,
  homeDoors,
  type HomeDoorId,
} from "@/lib/brand";

const KITCHEN_BG = "/brand/v2/kitchen-wall-clean.png";
const DEFAULT_DOOR: HomeDoorId = "fresh-meat";
const VISIBLE = 4;

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

function splitTitle(name: string): [string, string] {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return [name, ""];
  const mid = Math.ceil(parts.length / 2);
  return [parts.slice(0, mid).join(" "), parts.slice(mid).join(" ")];
}

/**
 * Pixel-faithful port of the kitchen-wall food UI reference:
 * fridge + island scene, tilted plate, hero type, overview card,
 * circular dish rail, glass dock + mic.
 */
export function ForHomeKitchen() {
  const rootRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [doorId, setDoorId] = useState<HomeDoorId>(DEFAULT_DOOR);
  const [idx, setIdx] = useState(0);
  const [tab, setTab] = useState<"overview" | "ingredients">("overview");
  const [liked, setLiked] = useState(36);
  const [menuOpen, setMenuOpen] = useState(false);

  const door = homeDoors.find((d) => d.id === doorId) ?? homeDoors[0];
  const products = homeCategoryProducts[doorId];
  const active = products[mod(idx, products.length)] ?? products[0];
  const [line1, line2] = splitTitle(active.name);

  const rail = useMemo(() => {
    const n = products.length;
    if (!n) return [];
    /* Active sits in 3rd slot like the reference rail */
    const start = mod(idx - 2, n);
    return Array.from({ length: Math.min(VISIBLE, n) }, (_, i) => {
      const p = products[mod(start + i, n)];
      return { product: p, absolute: mod(start + i, n), highlight: i === 2 };
    });
  }, [products, idx]);

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
      { threshold: 0.08 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const ease: Transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.65, ease: [0.22, 0.7, 0.2, 1] };

  const cycle = (dir: 1 | -1) => {
    setIdx((i) => mod(i + dir, products.length));
    setTab("overview");
  };

  const selectDoor = (id: HomeDoorId) => {
    setDoorId(id);
    setIdx(0);
    setMenuOpen(false);
  };

  return (
    <section
      ref={rootRef}
      className={`for-home for-home--catalog for-home--v2 kitchen-ui${
        visible ? " is-visible" : ""
      }`}
      aria-labelledby="kitchen-ui-title"
    >
      <div className="kui-scene" aria-hidden="true">
        <Image
          src={KITCHEN_BG}
          alt=""
          fill
          priority
          sizes="100vw"
          className="kui-scene-img"
        />
        <span className="kui-blob kui-blob--peach" />
        <span className="kui-blob kui-blob--teal" />
      </div>

      <div className="kui-stage">
        {/* Top-right utilities */}
        <div className="kui-utils">
          <button type="button" className="kui-icon-btn" aria-label="جستجو">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <path d="M16.2 16.2 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
          <button
            type="button"
            className="kui-icon-btn"
            aria-label="منو"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 7h14M5 12h14M5 17h14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
          {menuOpen ? (
            <div className="kui-menu" role="listbox">
              {homeDoors.slice(0, 8).map((d) => (
                <button
                  key={d.id}
                  type="button"
                  role="option"
                  aria-selected={d.id === doorId}
                  className={d.id === doorId ? "is-active" : undefined}
                  onClick={() => selectDoor(d.id)}
                >
                  {d.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* Left scroll dots */}
        <div className="kui-dots" aria-hidden="true">
          <span className="is-on" />
          <span />
          <span />
          <span />
        </div>

        {/* Hero: tilted plate + type */}
        <div className="kui-hero">
          <motion.div
            className="kui-plate-wrap"
            initial={reduceMotion ? false : { opacity: 0, y: 28, rotate: 8 }}
            animate={visible ? { opacity: 1, y: 0, rotate: 14 } : undefined}
            transition={{ ...ease, delay: 0.15 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                className="kui-plate"
                initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={ease}
              >
                <Image
                  src={active.image}
                  alt={active.alt}
                  width={640}
                  height={640}
                  sizes="(max-width: 900px) 55vw, 340px"
                  priority
                />
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <motion.div
            className="kui-hero-copy"
            initial={reduceMotion ? false : { opacity: 0, x: 18 }}
            animate={visible ? { opacity: 1, x: 0 } : undefined}
            transition={{ ...ease, delay: 0.28 }}
          >
            <p className="kui-kicker">#{mod(idx, 9) + 1} محبوب‌ترین انتخاب</p>
            <h2 id="kitchen-ui-title" className="kui-title">
              <AnimatePresence mode="wait">
                <motion.span
                  key={`t1-${active.id}`}
                  className="kui-title-thin"
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={ease}
                >
                  {line1}
                </motion.span>
              </AnimatePresence>
              {line2 ? (
                <AnimatePresence mode="wait">
                  <motion.span
                    key={`t2-${active.id}`}
                    className="kui-title-bold"
                    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={ease}
                  >
                    {line2}
                  </motion.span>
                </AnimatePresence>
              ) : null}
            </h2>
            <div className="kui-hero-actions">
              <button type="button" className="kui-text-action">
                <span className="kui-play" aria-hidden="true" />
                پخش ویدیو
              </button>
              <Link href={active.href} className="kui-text-action">
                <span className="kui-home-ico" aria-hidden="true">
                  <svg viewBox="0 0 20 20">
                    <path
                      d="M3.5 9.2 10 3.8l6.5 5.4V16a1 1 0 0 1-1 1h-3.2v-4.2H7.7V17H4.5a1 1 0 0 1-1-1V9.2Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                سفارش غذا
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Overview card */}
        <motion.aside
          className="kui-card"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={visible ? { opacity: 1, y: 0 } : undefined}
          transition={{ ...ease, delay: 0.4 }}
        >
          <div className="kui-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={tab === "overview"}
              className={tab === "overview" ? "is-active" : undefined}
              onClick={() => setTab("overview")}
            >
              نگاه کلی
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "ingredients"}
              className={tab === "ingredients" ? "is-active" : undefined}
              onClick={() => setTab("ingredients")}
            >
              ترکیبات
            </button>
          </div>

          <div className="kui-rating">
            <span>۴.۶</span>
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M8 1.6l1.7 3.5 3.8.6-2.7 2.7.6 3.8L8 10.4 4.6 12.2l.6-3.8L2.5 5.7l3.8-.6L8 1.6Z"
                fill="currentColor"
              />
            </svg>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${active.id}-${tab}`}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <h3 className="kui-card-title">{active.name}</h3>
              <p className="kui-card-sub">
                {door.label} · مرد کوهستان
              </p>
              <p className="kui-card-body">
                {tab === "overview"
                  ? active.teaser || active.story
                  : `${active.note}. ${active.story}`}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="kui-card-foot">
            <button
              type="button"
              className="kui-like"
              onClick={() => setLiked((n) => n + 1)}
            >
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path
                  d="M6.2 17H4.4a1 1 0 0 1-1-1V9.2a1 1 0 0 1 1-1h1.8V17Zm2-9.2 2.7-3.4a1.4 1.4 0 0 1 2.4 1v2.2h3.2a1.4 1.4 0 0 1 1.4 1.6l-.9 5.2A1.8 1.8 0 0 1 15.1 17H8.2V7.8Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinejoin="round"
                />
              </svg>
              {liked} پسند
            </button>
            <button type="button" className="kui-dislike" aria-label="نپسندیدن">
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path
                  d="M13.8 3H15.6a1 1 0 0 1 1 1v6.8a1 1 0 0 1-1 1h-1.8V3Zm-2 9.2-2.7 3.4a1.4 1.4 0 0 1-2.4-1v-2.2H3.5a1.4 1.4 0 0 1-1.4-1.6l.9-5.2A1.8 1.8 0 0 1 4.9 3h6.9v9.2Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </motion.aside>

        {/* Dish carousel */}
        <motion.div
          className="kui-rail"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={visible ? { opacity: 1, y: 0 } : undefined}
          transition={{ ...ease, delay: 0.5 }}
        >
          <button
            type="button"
            className="kui-rail-arrow"
            aria-label="قبلی"
            onClick={() => cycle(-1)}
          >
            ‹
          </button>
          <ul className="kui-rail-list">
            {rail.map(({ product, absolute, highlight }) => (
              <li key={`${product.id}-${absolute}`}>
                <button
                  type="button"
                  className={`kui-rail-item${highlight ? " is-active" : ""}`}
                  onClick={() => setIdx(absolute)}
                >
                  <span className="kui-rail-thumb">
                    <Image
                      src={product.image}
                      alt=""
                      width={120}
                      height={120}
                      sizes="72px"
                    />
                  </span>
                  <span className="kui-rail-label">{product.name}</span>
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="kui-rail-arrow"
            aria-label="بعدی"
            onClick={() => cycle(1)}
          >
            ›
          </button>
        </motion.div>

        {/* Bottom dock + mic */}
        <motion.div
          className="kui-dock-wrap"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={visible ? { opacity: 1, y: 0 } : undefined}
          transition={{ ...ease, delay: 0.58 }}
        >
          <nav className="kui-dock" aria-label="میانبر">
            <Link href="/products" className="kui-dock-btn is-active" aria-label="محصولات">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 4v4M16 4v4M5 9.5c.8 6 3.2 9 7 9s6.2-3 7-9H5Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M9 13.5h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </Link>
            <Link href="/chain" className="kui-dock-btn" aria-label="مسیر غذا">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 19V8.5M8 8.5c0-2 1.2-3.5 3-3.5h.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M16 5v14M12.5 9H16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </Link>
            <Link href="/contact" className="kui-dock-btn" aria-label="پیام">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 7.5h14v9.2a1.5 1.5 0 0 1-1.5 1.5H9l-4 2v-2.2A1.5 1.5 0 0 1 5 16.7V7.5Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link href="/account" className="kui-dock-btn" aria-label="حساب">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="9" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="M6.5 18.2c1.4-2.4 3.2-3.5 5.5-3.5s4.1 1.1 5.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </Link>
          </nav>
          <button type="button" className="kui-mic" aria-label="دستور صوتی">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="9" y="3.5" width="6" height="10" rx="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <path d="M7 11.5a5 5 0 0 0 10 0M12 16.5v3.2M9.5 19.7h5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
