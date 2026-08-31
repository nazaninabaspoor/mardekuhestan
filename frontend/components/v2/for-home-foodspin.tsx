"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
} from "framer-motion";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import {
  homeCategoryProducts,
  homeDoors,
  type HomeDoorId,
} from "@/lib/brand";

const DEFAULT_DOOR: HomeDoorId = "fresh-meat";
const CAT_PAGE_SIZE = 6;
const SPIN_COUNT = 5;

/** Exact FoodSpin meal themes (Ismail El Azizi) — structure/color, not brand chrome */
const FOODSPIN_THEMES = [
  { stage: "#EAFFE2", accent: "#54BF29" },
  { stage: "#FFFAE1", accent: "#E8C518" },
  { stage: "#FCDFE7", accent: "#EC819E" },
  { stage: "#FFEEDE", accent: "#F4AD69" },
  { stage: "#F3FFDD", accent: "#9BC604" },
] as const;

type SpinDir = "left" | "right";

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

function ArrowBtn({
  mirrored,
  accent,
  onClick,
  label,
}: {
  mirrored?: boolean;
  accent: string;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      className="foodspin-arrow"
      aria-label={label}
      onClick={onClick}
      style={{ color: accent }}
    >
      <svg
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden="true"
        style={mirrored ? { transform: "scaleX(-1)" } : undefined}
      >
        <circle cx="20" cy="20" r="18.5" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M18 13.5 24.5 20 18 26.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

/**
 * FoodSpin interaction port for /v2 only.
 * Layout + motion mirror Ismail El Azizi FoodSpin / Lemon1903 carousel;
 * copy stays Persian + MardeKuhestan font via page styles.
 */
export function ForHomeFoodSpin() {
  const rootRef = useRef<HTMLElement | null>(null);
  const dialogTitleId = useId();
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [activeDoorId, setActiveDoorId] = useState<HomeDoorId>(DEFAULT_DOOR);
  const [catPage, setCatPage] = useState(0);
  const [absoluteIdx, setAbsoluteIdx] = useState(0);
  const [direction, setDirection] = useState<SpinDir>("right");
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
  const spinItems = homeCategoryProducts[activeDoorId].slice(0, SPIN_COUNT);
  const count = Math.max(spinItems.length, 1);
  const angle = 360 / count;
  const currentIdx = mod(absoluteIdx, count);
  const active = spinItems[currentIdx] ?? spinItems[0];
  const theme = FOODSPIN_THEMES[currentIdx % FOODSPIN_THEMES.length];

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
    setAbsoluteIdx(0);
    setDirection("right");
    setStoryOpen(false);
  };

  const moveBy = (delta: number) => {
    if (!delta) return;
    setDirection(delta > 0 ? "right" : "left");
    setAbsoluteIdx((value) => value + delta);
    setStoryOpen(false);
  };

  const moveToIdx = (idx: number) => {
    const cur = mod(absoluteIdx, count);
    let delta = idx - cur;
    if (delta > count / 2) delta -= count;
    if (delta < -count / 2) delta += count;
    moveBy(delta || 0);
    if (!delta) setStoryOpen(false);
  };

  const textTransition: Transition = reduceMotion
    ? { duration: 0 }
    : { type: "spring", stiffness: 260, damping: 24, mass: 0.7 };

  const heroTransition: Transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.55, ease: [0.22, 0.7, 0.2, 1] };

  const heroFrom = direction === "right" ? 270 : -270;

  const clipStyle = {
    clipPath:
      "circle(calc((100% / 0.4757) / 2) at 50% calc((50% + calc((100% / 0.4757) * 0.01)) * -1))",
  } as CSSProperties;

  return (
    <section
      ref={rootRef}
      className={`for-home for-home--catalog for-home--v2 foodspin${
        visible ? " is-visible" : ""
      }`}
      aria-labelledby="for-home-title"
      style={
        {
          ["--fs-stage"]: theme.stage,
          ["--fs-accent"]: theme.accent,
        } as CSSProperties
      }
    >
      <div className="foodspin-frame">
        <nav className="foodspin-tabs" role="tablist" aria-label="دسته‌های محصول">
          {visibleDoors.map((item) => {
            const selected = item.id === activeDoorId;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                className={`foodspin-tab${selected ? " is-active" : ""}`}
                onClick={() => selectDoor(item.id)}
              >
                {item.label}
              </button>
            );
          })}
          {catPageCount > 1 ? (
            <button
              type="button"
              className="foodspin-tab foodspin-tab--more"
              onClick={() => setCatPage((page) => (page + 1) % catPageCount)}
              aria-label="دسته‌های بعدی"
            >
              بیشتر
            </button>
          ) : null}
        </nav>

        <div className="foodspin-main">
          <div className="foodspin-info">
            <AnimatePresence mode="popLayout">
              <motion.p
                key={`note-${active.id}`}
                className="foodspin-price"
                style={{ color: theme.accent }}
                initial={
                  reduceMotion
                    ? false
                    : { opacity: 0, scale: 0.72, originX: 1, originY: 0 }
                }
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={textTransition}
              >
                {active.note}
              </motion.p>
              <motion.h2
                key={`name-${active.id}`}
                id="for-home-title"
                className="foodspin-title"
                initial={
                  reduceMotion
                    ? false
                    : { opacity: 0, scale: 0.82, originX: 1, originY: 0 }
                }
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={textTransition}
              >
                {active.name}
              </motion.h2>
              <motion.p
                key={`desc-${active.id}`}
                className="foodspin-desc"
                initial={
                  reduceMotion
                    ? false
                    : { opacity: 0, scale: 0.88, originX: 1, originY: 0 }
                }
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={textTransition}
              >
                {active.teaser ?? active.story}
              </motion.p>
              <motion.div
                key={`cta-${active.id}`}
                className="foodspin-cta-wrap"
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={textTransition}
              >
                <Link
                  href={active.href}
                  className="foodspin-order"
                  style={{
                    backgroundColor: theme.accent,
                    boxShadow: `0 4px 14px 1px ${theme.accent}`,
                  }}
                >
                  سفارش بده
                </Link>
                <button
                  type="button"
                  className="foodspin-story"
                  onClick={() => setStoryOpen(true)}
                >
                  داستان کوتاه
                </button>
              </motion.div>
            </AnimatePresence>
            <p className="foodspin-door-hint">{activeDoor.label}</p>
          </div>

          <div className="foodspin-stage" aria-label="چرخ انتخاب محصول">
            <div className="foodspin-stage-disk">
              <div className="foodspin-orbit-slot">
                <div className="foodspin-orbit-clip" style={clipStyle}>
                  <div
                    className="foodspin-orbit"
                    style={{
                      transform: `rotate(${absoluteIdx * -angle}deg)`,
                    }}
                  >
                    <svg
                      className="foodspin-dash"
                      viewBox="0 0 560 560"
                      aria-hidden="true"
                    >
                      <circle
                        cx="280"
                        cy="280"
                        r="278"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray="10 20"
                      />
                    </svg>

                    {spinItems.map((product, idx) => (
                      <div
                        key={product.id}
                        className="foodspin-spoke"
                        style={
                          {
                            ["--spoke-angle"]: `${idx * angle}deg`,
                          } as CSSProperties
                        }
                      >
                        <button
                          type="button"
                          className={`foodspin-thumb${
                            idx === currentIdx ? " is-active" : ""
                          }`}
                          aria-label={product.name}
                          aria-pressed={idx === currentIdx}
                          onClick={() => moveToIdx(idx)}
                        >
                          <Image
                            src={product.image}
                            alt=""
                            width={200}
                            height={200}
                            sizes="120px"
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="foodspin-hero-row">
                  <ArrowBtn
                    accent={theme.accent}
                    label="محصول قبلی"
                    onClick={() => moveBy(-1)}
                    mirrored
                  />
                  <div className="foodspin-hero">
                    <AnimatePresence mode="popLayout">
                      <motion.div
                        key={active.id}
                        className="foodspin-hero-frame"
                        initial={
                          reduceMotion
                            ? false
                            : {
                                rotate: heroFrom,
                                scale: 0.6,
                                opacity: 0.35,
                              }
                        }
                        animate={{ rotate: 0, scale: 1, opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        transition={heroTransition}
                      >
                        <Image
                          src={active.image}
                          alt={active.alt}
                          width={720}
                          height={720}
                          sizes="(max-width: 900px) 42vw, 220px"
                          priority
                        />
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  <ArrowBtn
                    accent={theme.accent}
                    label="محصول بعدی"
                    onClick={() => moveBy(1)}
                  />
                </div>
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
