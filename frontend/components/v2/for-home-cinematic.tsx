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
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from "react";

import {
  homeCategoryProducts,
  homeDoors,
  type HomeDoorId,
} from "@/lib/brand";

const DEFAULT_DOOR: HomeDoorId = "fresh-meat";
const PRODUCT_COUNT = 4;
const SEAL = "/brand/orginal-clear.png";

type FloatSpec = {
  id: string;
  image: string;
  className: string;
  blur: number;
  duration: number;
  y: number;
  x: number;
  rotate: number;
  delay: number;
  scale: number;
};

/**
 * Pixel-faithful port of "Smart Kitchen app/web design UI" reference video:
 * elevated peach card, in-card nav + center logo, left copy + stacked CTAs,
 * upright pouch product, right features, depth-of-field floaters, watermark.
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
  const farX = useTransform(sx, (v) => v * 0.35);
  const farY = useTransform(sy, (v) => v * 0.35);
  const nearX = useTransform(sx, (v) => v * -0.55);
  const nearY = useTransform(sy, (v) => v * -0.55);

  const activeDoor =
    homeDoors.find((item) => item.id === activeDoorId) ?? homeDoors[0];
  const products = homeCategoryProducts[activeDoorId].slice(0, PRODUCT_COUNT);
  const safeIdx = productIdx % Math.max(products.length, 1);
  const active = products[safeIdx] ?? products[0];
  const sideA = products[(safeIdx + 1) % products.length] ?? active;
  const sideB = products[(safeIdx + 2) % products.length] ?? active;

  const floaters: FloatSpec[] = useMemo(() => {
    const imgs = [active.image, sideA.image, sideB.image, active.image, sideA.image, sideB.image, active.image, active.image];
    const layout: Omit<FloatSpec, "id" | "image">[] = [
      /* foreground bokeh — small, edge of frame */
      { className: "cine-float--fg1", blur: 18, duration: 6.8, y: 18, x: 8, rotate: 16, delay: 0.1, scale: 1 },
      { className: "cine-float--fg2", blur: 24, duration: 7.4, y: 14, x: -6, rotate: -12, delay: 0.45, scale: 1 },
      /* sharp beans hugging the pouch */
      { className: "cine-float--near1", blur: 0.8, duration: 5.4, y: 12, x: 5, rotate: 9, delay: 0.15, scale: 1 },
      { className: "cine-float--near2", blur: 1.2, duration: 5.9, y: 16, x: -4, rotate: -7, delay: 0.55, scale: 1 },
      { className: "cine-float--near3", blur: 1.5, duration: 6.2, y: 10, x: 3, rotate: 11, delay: 0.85, scale: 1 },
      { className: "cine-float--near4", blur: 2, duration: 5.7, y: 13, x: -6, rotate: -10, delay: 1.05, scale: 1 },
      /* mid depth */
      { className: "cine-float--mid1", blur: 6, duration: 7.6, y: 20, x: 7, rotate: -14, delay: 0.3, scale: 1 },
      { className: "cine-float--mid2", blur: 8, duration: 8.0, y: 22, x: -9, rotate: 12, delay: 0.7, scale: 1 },
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
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 28;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 18;
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
      {/* Depth-of-field floaters — outside/over card like the coffee beans */}
      {!reduceMotion && visible
        ? floaters.map((item) => {
            const isFg = item.blur >= 14;
            return (
              <motion.span
                key={`${active.id}-${item.id}`}
                className={`cine-float ${item.className}`}
                style={{
                  filter: `blur(${item.blur}px)`,
                  scale: item.scale,
                  x: isFg ? nearX : farX,
                  y: isFg ? nearY : farY,
                }}
                aria-hidden="true"
              >
                <motion.span
                  className="cine-float-inner"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: isFg ? 0.72 : 0.95,
                    y: [0, -item.y, 0],
                    x: [0, item.x, 0],
                    rotate: [0, item.rotate, 0],
                  }}
                  transition={{
                    opacity: { delay: 0.95, duration: 0.55 },
                    y: {
                      delay: 1 + item.delay,
                      duration: item.duration,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                    x: {
                      delay: 1 + item.delay,
                      duration: item.duration * 1.08,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                    rotate: {
                      delay: 1 + item.delay,
                      duration: item.duration * 1.12,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }}
                >
                  <Image src={item.image} alt="" width={180} height={180} sizes="140px" />
                </motion.span>
              </motion.span>
            );
          })
        : null}

      <div className="cine-shell">
        <motion.div
          className="cine-card"
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={visible ? { opacity: 1, y: 0 } : undefined}
          transition={{ ...ease, delay: 0.05 }}
        >
          <p className="cine-watermark" aria-hidden="true">
            کوهستان
          </p>
          <span className="cine-disc" aria-hidden="true" />

          {/* In-card navbar — exact reference structure */}
          <motion.nav
            className="cine-nav"
            aria-label="ناوبری سکشن"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={visible ? { opacity: 1 } : undefined}
            transition={{ ...ease, delay: 0.28 }}
          >
            <Link href="/" className="cine-nav-link">
              خانه
            </Link>
            <Link href="/chain" className="cine-nav-link">
              داستان ما
            </Link>
            <Link href="/" className="cine-nav-logo" aria-label="مرد کوهستان">
              <Image src={SEAL} alt="" width={40} height={40} sizes="36px" />
              <span>مرد کوهستان</span>
            </Link>
            <div className="cine-nav-drop">
              <button type="button" className="cine-nav-link cine-nav-link--btn" aria-haspopup="listbox">
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
            {/* LEFT — headline + stacked CTAs */}
            <motion.div
              className="cine-copy"
              initial={reduceMotion ? false : { opacity: 0, x: 18 }}
              animate={visible ? { opacity: 1, x: 0 } : undefined}
              transition={{ ...ease, delay: 0.45 }}
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
                  {active.teaser || active.story}
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

            {/* CENTER — upright pouch product */}
            <motion.div
              className="cine-hero"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.86 }}
              animate={visible ? { opacity: 1, scale: 1 } : undefined}
              transition={{ ...ease, delay: 0.72 }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id}
                  className="cine-pouch"
                  initial={
                    reduceMotion
                      ? false
                      : { opacity: 0, y: 28, rotateY: -12, scale: 0.9 }
                  }
                  animate={{ opacity: 1, y: 0, rotateY: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.96 }}
                  transition={ease}
                >
                  <div className="cine-pouch-body">
                    <Image
                      src={active.image}
                      alt={active.alt}
                      width={480}
                      height={640}
                      sizes="(max-width: 900px) 55vw, 260px"
                      className="cine-pouch-art"
                      priority
                    />
                    <div className="cine-pouch-label">
                      <span className="cine-pouch-badge">{active.note}</span>
                      <strong>{active.name}</strong>
                      <span className="cine-pouch-brand">مرد کوهستان</span>
                    </div>
                  </div>
                  <span className="cine-pouch-glow" aria-hidden="true" />
                  <span className="cine-pouch-shadow" aria-hidden="true" />
                </motion.div>
              </AnimatePresence>

              <div className="cine-hero-controls">
                <button type="button" className="cine-nav-btn" aria-label="قبلی" onClick={() => cycle(-1)}>
                  ‹
                </button>
                <button type="button" className="cine-nav-btn" aria-label="بعدی" onClick={() => cycle(1)}>
                  ›
                </button>
              </div>
            </motion.div>

            {/* RIGHT — thumbs + features */}
            <motion.aside
              className="cine-side"
              initial={reduceMotion ? false : { opacity: 0, x: -16 }}
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
                    <Image src={item.image} alt="" width={96} height={96} sizes="56px" />
                  </button>
                ))}
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
              <Image src={active.image} alt={active.alt} width={360} height={360} sizes="168px" />
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
