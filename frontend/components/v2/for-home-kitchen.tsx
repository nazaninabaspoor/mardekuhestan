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
import { playCategoryBell } from "@/lib/v2-bell-audio";

const KITCHEN_BG = "/brand/v2/kitchen-wall-clean.png";
const BRAND_MARK = "/brand/logo.svg";
const BRAND_SEAL = "/brand/orginal-clear.png";
const DEFAULT_DOOR: HomeDoorId = "fresh-meat";
const VISIBLE = 5;

/** Short labels for the hanging category dock */
const CATEGORY_DOCK: ReadonlyArray<{ id: HomeDoorId; short: string }> = [
  { id: "fresh-meat", short: "گوشت" },
  { id: "seafood", short: "دریایی" },
  { id: "dairy", short: "لبنیات" },
  { id: "ready-meal", short: "آماده" },
  { id: "farm", short: "کشاورزی" },
];

/** Rope tint per kitchen category */
const ROPE_TONE: Record<HomeDoorId, string> = {
  "fresh-meat": "#c0392b",
  seafood: "#2f6fad",
  dairy: "#005b48",
  "ready-meal": "#be6516",
  farm: "#50af47",
};

/** Matching cubic topology so Framer can morph the rope realistically */
const ROPE_D = {
  /** Long slack cord while lowering the new note */
  enter: "M 24 0 C 4 55, 44 110, 14 165 C 0 210, 40 245, 24 270",
  /** Settled natural hang above the note */
  rest: "M 24 0 C 32 70, 14 140, 30 200 C 38 230, 16 255, 24 270",
  /** Taut short pull as the note is yanked up */
  leave: "M 24 0 C 22 50, 26 110, 23 170 C 21 210, 25 245, 24 270",
} as const;

function HangingBell() {
  return (
    <svg
      className="kui-bell-svg"
      viewBox="0 0 64 80"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="kuiBellBody" x1="12" y1="10" x2="52" y2="70" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFE9A8" />
          <stop offset="0.45" stopColor="#F0C15A" />
          <stop offset="1" stopColor="#C48A2A" />
        </linearGradient>
        <linearGradient id="kuiBellShine" x1="20" y1="20" x2="34" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF8E0" stopOpacity="0.9" />
          <stop offset="1" stopColor="#FFF8E0" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M18 28c0-10.5 6-18 14-18s14 7.5 14 18v16c0 2.2-1.2 3.5-3.2 3.5H21.2c-2 0-3.2-1.3-3.2-3.5V28Z"
        fill="url(#kuiBellBody)"
      />
      <path
        d="M22 30c1.5-9 5.5-14.5 10-14.5 2.2 0 4.4 1.2 6 3.4"
        stroke="url(#kuiBellShine)"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.75"
      />
      <ellipse cx="32" cy="46.5" rx="17.5" ry="4.2" fill="#D4A045" opacity="0.55" />
      <path d="M20 47.5h24" stroke="#E8C56A" strokeWidth="2.4" strokeLinecap="round" opacity="0.8" />
      <circle cx="32" cy="58" r="4.2" fill="#F2D27A" stroke="#C48A2A" strokeWidth="1.2" />
      <circle cx="32" cy="58" r="1.5" fill="#FFF3C8" />
    </svg>
  );
}

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

/**
 * Kitchen-wall product showcase:
 * hanging bell · category dock · editorial plate · rope-hoisted note · product rail.
 */
export function ForHomeKitchen() {
  const rootRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [doorId, setDoorId] = useState<HomeDoorId>(DEFAULT_DOOR);
  const [idx, setIdx] = useState(0);
  const [tab, setTab] = useState<"overview" | "ingredients">("overview");

  const door = homeDoors.find((d) => d.id === doorId) ?? homeDoors[0];
  const products = homeCategoryProducts[doorId] as ReadonlyArray<{
    id: string;
    name: string;
    note: string;
    teaser: string;
    story: string;
    href: string;
    image: string;
    alt: string;
  }>;
  const active = products[mod(idx, Math.max(products.length, 1))] ?? products[0];

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

    const reveal = () => setVisible(true);

    const onArrive = () => reveal();
    window.addEventListener("v2:kitchen-arrive", onArrive);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          reveal();
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      window.removeEventListener("v2:kitchen-arrive", onArrive);
    };
  }, []);

  const snap: Transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.34, ease: [0.16, 1, 0.3, 1] };

  const cycle = (dir: 1 | -1) => {
    setIdx((i) => mod(i + dir, products.length));
    setTab("overview");
  };

  const selectDoor = (id: HomeDoorId) => {
    if (id === doorId) return;
    setDoorId(id);
    setIdx(0);
    setTab("overview");
    void playCategoryBell();
  };

  if (!active) {
    return null;
  }

  return (
    <section
      ref={rootRef}
      id="for-home-kitchen"
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

      {/* Cord starts exactly at the top edge of this section */}
      <div className="kui-pendant" aria-hidden={false}>
        <span className="kui-bell-line" aria-hidden="true" />
        <motion.div
          className="kui-pendant-inner"
          initial={
            reduceMotion ? false : { opacity: 0, y: -72, scale: 0.72, rotate: -8 }
          }
          animate={
            visible
              ? { opacity: 1, y: 0, scale: 1, rotate: 0 }
              : undefined
          }
          transition={{ ...snap, delay: 0.14 }}
        >
          <div className="kui-bell" aria-hidden="true">
            <span className="kui-bell-glow" />
            <HangingBell />
            <span className="kui-bell-wash" />
          </div>

          <nav className="kui-dock" aria-label="دسته‌بندی محصولات">
            {CATEGORY_DOCK.map(({ id, short }) => {
              const cat = homeDoors.find((d) => d.id === id);
              if (!cat) return null;
              const activeCat = id === doorId;
              return (
                <button
                  key={id}
                  type="button"
                  className={`kui-dock-btn${activeCat ? " is-active" : ""}`}
                  aria-pressed={activeCat}
                  aria-label={cat.label}
                  title={cat.label}
                  onClick={() => selectDoor(id)}
                >
                  <span className="kui-dock-label">{short}</span>
                </button>
              );
            })}
          </nav>
        </motion.div>
      </div>

      <div className="kui-stage">
        {/* Hero: tilted plate + type */}
        <div className="kui-hero">
          <motion.div
            className="kui-plate-wrap"
            initial={
              reduceMotion
                ? false
                : { opacity: 0, y: 90, scale: 0.55, rotate: -28, x: 36 }
            }
            animate={
              visible
                ? { opacity: 1, y: 0, scale: 1, rotate: 14, x: 0 }
                : undefined
            }
            transition={{ ...snap, delay: 0 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                className="kui-plate"
                initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={snap}
              >
                <motion.div
                  className="kui-plate-boomerang"
                  whileHover={
                    reduceMotion
                      ? undefined
                      : {
                          scale: [1, 1.07, 0.97, 1.05, 1],
                          rotate: [0, 2.8, -2.2, 1.6, 0],
                          transition: {
                            duration: 0.78,
                            ease: "easeInOut",
                            repeat: Infinity,
                          },
                        }
                  }
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
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <motion.div
            className="kui-hero-copy"
            initial={
              reduceMotion
                ? false
                : { opacity: 0, x: -56, y: 12, filter: "blur(10px)" }
            }
            animate={
              visible
                ? { opacity: 1, x: 0, y: 0, filter: "blur(0px)" }
                : undefined
            }
            transition={{ ...snap, delay: 0.08 }}
          >
            <p className="kui-kicker">
              {doorId === "fresh-meat"
                ? "برش تازهٔ امروز"
                : doorId === "seafood"
                  ? "تازگی امروز دریا"
                  : doorId === "dairy"
                    ? "لبنیات امروز خانه"
                    : door.line}
            </p>
            <h2 id="kitchen-ui-title" className="kui-title">
              <AnimatePresence mode="wait">
                <motion.span
                  key={active.id}
                  className="kui-title-line"
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={snap}
                >
                  {active.name}
                </motion.span>
              </AnimatePresence>
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

            <motion.div
              className="kui-rail"
              initial={
                reduceMotion ? false : { opacity: 0, y: 28, scale: 0.92 }
              }
              animate={
                visible ? { opacity: 1, y: 0, scale: 1 } : undefined
              }
              transition={{ ...snap, delay: 0.2 }}
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
          </motion.div>
        </div>

        {/* Recipe note — hoisted by a category-colored rope */}
        <motion.aside
          className="kui-card"
          style={{ ["--rope-tone" as string]: ROPE_TONE[doorId] ?? "#005b48" }}
          initial={
            reduceMotion
              ? false
              : { opacity: 0, x: 40, y: -24, rotate: -8, scale: 0.9 }
          }
          animate={
            visible
              ? { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }
              : undefined
          }
          transition={{ ...snap, delay: 0.18 }}
        >
          <div className="kui-note-hoist">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active.id}
                className="kui-note-hang"
                initial={
                  reduceMotion
                    ? false
                    : { y: -340, opacity: 0.9, rotate: -5.5 }
                }
                animate={{
                  y: 0,
                  opacity: 1,
                  rotate: -1.8,
                  transition: reduceMotion
                    ? { duration: 0 }
                    : {
                        type: "spring",
                        stiffness: 220,
                        damping: 20,
                        mass: 0.7,
                        delay: 0.02,
                      },
                }}
                exit={
                  reduceMotion
                    ? { opacity: 0 }
                    : {
                        y: -360,
                        opacity: 0.88,
                        rotate: 3.5,
                        transition: {
                          duration: 0.42,
                          ease: [0.55, 0.02, 0.85, 0.35],
                        },
                      }
                }
              >
                <svg
                  className="kui-note-rope"
                  viewBox="0 0 48 270"
                  preserveAspectRatio="xMidYMax meet"
                  aria-hidden="true"
                  focusable="false"
                >
                  <motion.path
                    d={ROPE_D.rest}
                    fill="none"
                    stroke={ROPE_TONE[doorId] ?? "#005b48"}
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    initial={reduceMotion ? false : { d: ROPE_D.enter }}
                    animate={{
                      d: ROPE_D.rest,
                      transition: reduceMotion
                        ? { duration: 0 }
                        : { duration: 0.72, ease: [0.22, 0.7, 0.2, 1] },
                    }}
                    exit={
                      reduceMotion
                        ? undefined
                        : {
                            d: ROPE_D.leave,
                            transition: {
                              duration: 0.4,
                              ease: [0.4, 0, 0.8, 0.2],
                            },
                          }
                    }
                  />
                  <motion.path
                    d={ROPE_D.rest}
                    fill="none"
                    stroke="rgb(255 255 255 / 32%)"
                    strokeWidth="0.85"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    initial={reduceMotion ? false : { d: ROPE_D.enter }}
                    animate={{
                      d: ROPE_D.rest,
                      transition: reduceMotion
                        ? { duration: 0 }
                        : { duration: 0.72, ease: [0.22, 0.7, 0.2, 1] },
                    }}
                    exit={
                      reduceMotion
                        ? undefined
                        : {
                            d: ROPE_D.leave,
                            transition: {
                              duration: 0.4,
                              ease: [0.4, 0, 0.8, 0.2],
                            },
                          }
                    }
                    transform="translate(0.8 0)"
                  />
                </svg>

                <span className="kui-note-knot" aria-hidden="true" />

                <div className="kui-note-sheet">
                  <div className="kui-note-brand">
                    <Image
                      src={BRAND_MARK}
                      alt=""
                      width={151}
                      height={30}
                      className="kui-note-brand-mark"
                    />
                  </div>

                  <header className="kui-card-chrome">
                    <div className="kui-tabs" role="tablist" aria-label="جزئیات محصول">
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
                    <span className="kui-note-seal" aria-hidden="true">
                      <Image
                        src={BRAND_SEAL}
                        alt=""
                        width={40}
                        height={40}
                        sizes="18px"
                        className="kui-note-seal-img"
                      />
                    </span>
                  </header>

                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={tab}
                      className="kui-card-dossier"
                      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: reduceMotion ? 0 : 0.22 }}
                    >
                      <p className="kui-card-eyebrow">{door.label}</p>
                      <h3 className="kui-card-title">{active.name}</h3>
                      <p className="kui-card-note">{active.note}</p>
                      <p className="kui-card-body">
                        {tab === "overview"
                          ? active.teaser || active.story
                          : active.story}
                      </p>
                    </motion.div>
                  </AnimatePresence>

                  <footer className="kui-card-foot">
                    <Link href={active.href} className="kui-card-cta">
                      مشاهده در فروشگاه
                    </Link>
                  </footer>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.aside>
      </div>

      <div className="kui-lamp-fx" aria-hidden="true">
        <span className="kui-lamp-glow" />
        <span className="kui-lamp-beam" />
        <span className="kui-lamp-pool" />
      </div>
    </section>
  );
}
