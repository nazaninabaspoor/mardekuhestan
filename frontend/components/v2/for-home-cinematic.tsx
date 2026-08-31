"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type Transition,
} from "framer-motion";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type MouseEvent,
} from "react";

import {
  homeCategoryProducts,
  homeDoors,
  type HomeCategoryProduct,
  type HomeDoorId,
} from "@/lib/brand";

const DEFAULT_DOOR: HomeDoorId = "fresh-meat";
const PRODUCT_COUNT = 4;

/** Bean floaters — CSS-only silhouettes matching the ref video DoF, not product plates. */
const BEAN_LAYOUT = [
  { className: "cine-bean-float cine-bean-float--fg1", blur: 22, duration: 7.2, y: 16, x: 10, rotate: 18, delay: 0.1 },
  { className: "cine-bean-float cine-bean-float--fg2", blur: 28, duration: 7.8, y: 14, x: -8, rotate: -14, delay: 0.4 },
  { className: "cine-bean-float cine-bean-float--near1", blur: 0.6, duration: 5.2, y: 11, x: 4, rotate: 10, delay: 0.2 },
  { className: "cine-bean-float cine-bean-float--near2", blur: 1, duration: 5.6, y: 14, x: -5, rotate: -8, delay: 0.55 },
  { className: "cine-bean-float cine-bean-float--near3", blur: 1.4, duration: 6.0, y: 9, x: 3, rotate: 12, delay: 0.85 },
  { className: "cine-bean-float cine-bean-float--near4", blur: 1.8, duration: 5.5, y: 12, x: -4, rotate: -11, delay: 1.05 },
  { className: "cine-bean-float cine-bean-float--mid1", blur: 7, duration: 7.4, y: 18, x: 6, rotate: -12, delay: 0.35 },
  { className: "cine-bean-float cine-bean-float--mid2", blur: 9, duration: 8.1, y: 20, x: -7, rotate: 14, delay: 0.7 },
  { className: "cine-bean-float cine-bean-float--edge1", blur: 16, duration: 8.6, y: 12, x: 5, rotate: 8, delay: 0.25 },
  { className: "cine-bean-float cine-bean-float--edge2", blur: 18, duration: 9.0, y: 15, x: -6, rotate: -9, delay: 0.6 },
] as const;

/**
 * Pixel-faithful port of "Smart Kitchen" coffee-card UI:
 * cream page · peach card · lamp disc · tall matte pouch · DoF beans.
 * Only product photo + MardeKuhestan font are brand swaps.
 */
export function ForHomeCinematic() {
  const rootRef = useRef<HTMLElement | null>(null);
  const dialogTitleId = useId();
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [activeDoorId, setActiveDoorId] = useState<HomeDoorId>(DEFAULT_DOOR);
  const [productIdx, setProductIdx] = useState(0);
  const [storyOpen, setStoryOpen] = useState(false);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 40, damping: 18 });
  const sy = useSpring(my, { stiffness: 40, damping: 18 });
  const nearX = useTransform(sx, (v) => v * -0.5);
  const nearY = useTransform(sy, (v) => v * -0.5);
  const farX = useTransform(sx, (v) => v * -0.18);
  const farY = useTransform(sy, (v) => v * -0.18);

  const activeDoor =
    homeDoors.find((item) => item.id === activeDoorId) ?? homeDoors[0];
  const products = homeCategoryProducts[activeDoorId].slice(
    0,
    PRODUCT_COUNT,
  ) as HomeCategoryProduct[];
  const safeIdx = productIdx % Math.max(products.length, 1);
  const active = products[safeIdx] ?? products[0];
  const activeLead = active?.teaser ?? active?.story ?? "";
  const sideA = products[(safeIdx + 1) % products.length] ?? active;
  const sideB = products[(safeIdx + 2) % products.length] ?? active;

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
      { threshold: 0.1 },
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

  const onMove = (event: MouseEvent<HTMLElement>) => {
    if (reduceMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 26;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 16;
    mx.set(x);
    my.set(y);
  };

  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  const cycle = (dir: 1 | -1) => {
    const n = products.length;
    if (!n) return;
    setProductIdx((i) => (i + dir + n) % n);
  };

  const selectDoor = (id: HomeDoorId) => {
    setActiveDoorId(id);
    setProductIdx(0);
  };

  const ease: Transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.7, ease: [0.22, 0.7, 0.2, 1] };

  const titleLines = active.name.trim().split(/\s+/);
  const line1 = titleLines.slice(0, Math.ceil(titleLines.length / 2)).join(" ");
  const line2 = titleLines.slice(Math.ceil(titleLines.length / 2)).join(" ");

  return (
    <section
      ref={rootRef}
      className={`for-home for-home--catalog for-home--v2 cine${
        visible ? " is-visible" : ""
      }`}
      aria-labelledby="for-home-title"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <p className="cine-page-wm" aria-hidden="true">
        کوهستان
      </p>

      {!reduceMotion && visible
        ? BEAN_LAYOUT.filter((b) => b.className.includes("--fg") || b.className.includes("--edge")).map(
            (item, i) => (
              <motion.span
                key={`far-${i}`}
                className={item.className}
                style={{
                  filter: `blur(${item.blur}px)`,
                  x: farX,
                  y: farY,
                }}
                aria-hidden="true"
              >
                <motion.span
                  className="cine-bean-seed"
                  animate={{
                    y: [0, -item.y, 0],
                    x: [0, item.x, 0],
                    rotate: [0, item.rotate, 0],
                  }}
                  transition={{
                    y: { delay: 1 + item.delay, duration: item.duration, repeat: Infinity, ease: "easeInOut" },
                    x: { delay: 1 + item.delay, duration: item.duration * 1.1, repeat: Infinity, ease: "easeInOut" },
                    rotate: { delay: 1 + item.delay, duration: item.duration * 1.15, repeat: Infinity, ease: "easeInOut" },
                  }}
                />
              </motion.span>
            ),
          )
        : null}

      <div className="cine-shell">
        <motion.div
          className="cine-card"
          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
          animate={visible ? { opacity: 1, y: 0 } : undefined}
          transition={{ ...ease, delay: 0.05 }}
        >
          <p className="cine-watermark" aria-hidden="true">
            کوهستان
          </p>
          <span className="cine-disc" aria-hidden="true" />

          <motion.nav
            className="cine-nav"
            aria-label="ناوبری سکشن"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={visible ? { opacity: 1 } : undefined}
            transition={{ ...ease, delay: 0.25 }}
          >
            <Link href="/" className="cine-nav-link">
              خانه
            </Link>
            <Link href="/chain" className="cine-nav-link">
              داستان ما
            </Link>
            <Link href="/" className="cine-nav-logo" aria-label="مرد کوهستان">
              <span>مرد کوهستان</span>
            </Link>
            <div className="cine-nav-drop">
              <button
                type="button"
                className="cine-nav-link cine-nav-link--btn"
                aria-haspopup="listbox"
              >
                محصولات
                <span aria-hidden="true">▾</span>
              </button>
              <div className="cine-nav-menu" role="listbox">
                {homeDoors.slice(0, 8).map((door) => (
                  <button
                    key={door.id}
                    type="button"
                    role="option"
                    aria-selected={door.id === activeDoorId}
                    className={door.id === activeDoorId ? "is-active" : undefined}
                    onClick={() => selectDoor(door.id)}
                  >
                    {door.label}
                  </button>
                ))}
              </div>
            </div>
            <Link href="/#contact" className="cine-nav-link">
              تماس
            </Link>
          </motion.nav>

          <div className="cine-grid">
            <motion.div
              className="cine-copy"
              initial={reduceMotion ? false : { opacity: 0, x: 16 }}
              animate={visible ? { opacity: 1, x: 0 } : undefined}
              transition={{ ...ease, delay: 0.4 }}
            >
              <p className="cine-script">{activeDoor.label}</p>
              <AnimatePresence mode="wait">
                <motion.h2
                  key={active.id}
                  id="for-home-title"
                  className="cine-title"
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={ease}
                >
                  <span>{line1 || active.name}</span>
                  {line2 ? <span>{line2}</span> : null}
                </motion.h2>
              </AnimatePresence>
              <AnimatePresence mode="wait">
                <motion.p
                  key={`lead-${active.id}`}
                  className="cine-lead"
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={ease}
                >
                  {activeLead}
                </motion.p>
              </AnimatePresence>
              <div className="cine-actions">
                <Link href={active.href} className="cine-btn cine-btn--primary">
                  <span>سفارش بده</span>
                  <span className="cine-btn-arrow" aria-hidden="true">
                    →
                  </span>
                </Link>
                <Link href="/products" className="cine-btn cine-btn--dark">
                  <span>مشاهده بیشتر</span>
                  <span className="cine-btn-arrow" aria-hidden="true">
                    →
                  </span>
                </Link>
              </div>
            </motion.div>

            <motion.div
              className="cine-hero"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.88 }}
              animate={visible ? { opacity: 1, scale: 1 } : undefined}
              transition={{ ...ease, delay: 0.65 }}
            >
              {!reduceMotion && visible
                ? BEAN_LAYOUT.filter(
                    (b) =>
                      b.className.includes("--near") || b.className.includes("--mid"),
                  ).map((item, i) => (
                    <motion.span
                      key={`near-${i}`}
                      className={`${item.className} cine-bean-float--local`}
                      style={{ filter: `blur(${item.blur}px)`, x: nearX, y: nearY }}
                      aria-hidden="true"
                    >
                      <motion.span
                        className="cine-bean-seed"
                        animate={{
                          y: [0, -item.y, 0],
                          x: [0, item.x, 0],
                          rotate: [0, item.rotate, 0],
                        }}
                        transition={{
                          y: {
                            delay: item.delay,
                            duration: item.duration,
                            repeat: Infinity,
                            ease: "easeInOut",
                          },
                          x: {
                            delay: item.delay,
                            duration: item.duration * 1.08,
                            repeat: Infinity,
                            ease: "easeInOut",
                          },
                          rotate: {
                            delay: item.delay,
                            duration: item.duration * 1.12,
                            repeat: Infinity,
                            ease: "easeInOut",
                          },
                        }}
                      />
                    </motion.span>
                  ))
                : null}

              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id}
                  className="cine-pouch"
                  initial={
                    reduceMotion
                      ? false
                      : { opacity: 0, y: 26, rotateY: -10, scale: 0.92 }
                  }
                  animate={{ opacity: 1, y: 0, rotateY: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.96 }}
                  transition={ease}
                >
                  <span className="cine-pouch-glow" aria-hidden="true" />
                  <div className="cine-pouch-body">
                    <div className="cine-pouch-print">
                      <Image
                        src={active.image}
                        alt={active.alt}
                        width={480}
                        height={640}
                        sizes="(max-width: 900px) 50vw, 220px"
                        className="cine-pouch-art"
                        priority
                      />
                    </div>
                    <div className="cine-pouch-label">
                      <span className="cine-pouch-badge">{active.note}</span>
                      <strong>{active.name}</strong>
                      <span className="cine-pouch-brand">مرد کوهستان</span>
                    </div>
                  </div>
                  <span className="cine-pouch-shadow" aria-hidden="true" />
                </motion.div>
              </AnimatePresence>

              <div className="cine-hero-controls">
                <button
                  type="button"
                  className="cine-nav-btn"
                  aria-label="قبلی"
                  onClick={() => cycle(-1)}
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="cine-nav-btn"
                  aria-label="بعدی"
                  onClick={() => cycle(1)}
                >
                  ›
                </button>
              </div>
            </motion.div>

            <motion.aside
              className="cine-side"
              initial={reduceMotion ? false : { opacity: 0, x: -14 }}
              animate={visible ? { opacity: 1, x: 0 } : undefined}
              transition={{ ...ease, delay: 0.5 }}
            >
              <div className="cine-side-thumbs">
                <button
                  type="button"
                  className="cine-side-thumb cine-side-thumb--bag"
                  aria-label={sideA.name}
                  onClick={() => {
                    const idx = products.findIndex((p) => p.id === sideA.id);
                    if (idx >= 0) setProductIdx(idx);
                  }}
                >
                  <Image src={sideA.image} alt="" width={96} height={96} sizes="44px" />
                </button>
                <button
                  type="button"
                  className="cine-side-thumb cine-side-thumb--cup"
                  aria-label={sideB.name}
                  onClick={() => {
                    const idx = products.findIndex((p) => p.id === sideB.id);
                    if (idx >= 0) setProductIdx(idx);
                  }}
                >
                  <Image src={sideB.image} alt="" width={96} height={96} sizes="44px" />
                </button>
              </div>
              <p className="cine-side-title">از مرتع تا سفره</p>
              <ul className="cine-side-list">
                <li>
                  <span className="cine-bean" aria-hidden="true" />
                  تازه از مسیر کوتاه؛ بدون عجلهٔ بی‌کیفیت
                </li>
                <li>
                  <span className="cine-bean" aria-hidden="true" />
                  انتخاب کیفیت‌محور برای خانهٔ خانواده
                </li>
                <li>
                  <span className="cine-bean" aria-hidden="true" />
                  از مرتع تا سفره، با استاندارد مرد کوهستان
                </li>
              </ul>
              <button
                type="button"
                className="cine-inline-story"
                onClick={() => setStoryOpen(true)}
              >
                داستان کوتاه این محصول
              </button>
            </motion.aside>
          </div>
        </motion.div>
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
