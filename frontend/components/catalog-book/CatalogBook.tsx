"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useReducedMotion } from "framer-motion";

import {
  catalogBookCopy,
  catalogs,
  type CatalogItem,
} from "@/data/catalogs";

import { BookSpread } from "./BookSpread";
import { CatalogReader } from "./CatalogReader";
import { CatalogTabs } from "./CatalogTabs";
import "./catalog-book.css";

function toPersianDigits(value: number) {
  return String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
}

function edgeColors(items: readonly CatalogItem[]) {
  return items.map((item) => item.theme.accent);
}

export function CatalogBook() {
  const rootRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();
  const [inView, setInView] = useState(false);
  const [opened, setOpened] = useState(false);
  const [peek, setPeek] = useState(false);
  const [index, setIndex] = useState(0);
  const [readerOpen, setReaderOpen] = useState(false);
  const dragRef = useRef<{ x: number; active: boolean }>({ x: 0, active: false });

  const total = catalogs.length;
  const active = catalogs[index] ?? catalogs[0];
  const progress = ((index + 1) / total) * 100;

  const goTo = useCallback(
    (next: number) => {
      if (!total) return;
      setIndex(((next % total) + total) % total);
      setOpened(true);
    },
    [total],
  );

  const goBy = useCallback(
    (dir: 1 | -1) => {
      goTo(index + dir);
    },
    [goTo, index],
  );

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.28 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || opened || reduceMotion) return;
    const timer = window.setTimeout(() => setPeek(true), 700);
    return () => window.clearTimeout(timer);
  }, [inView, opened, reduceMotion]);

  useEffect(() => {
    if (!opened) return;
    const onKey = (event: KeyboardEvent) => {
      if (readerOpen) return;
      if (event.key === "ArrowLeft") goBy(1);
      if (event.key === "ArrowRight") goBy(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [opened, readerOpen, goBy]);

  useEffect(() => {
    const next = catalogs[(index + 1) % total];
    const prev = catalogs[(index - 1 + total) % total];
    [next?.image, prev?.image, next?.cover, prev?.cover]
      .filter(Boolean)
      .forEach((src) => {
        const img = new window.Image();
        img.src = src as string;
      });
  }, [index, total]);

  const openBook = () => {
    setPeek(false);
    setOpened(true);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!opened) return;
    dragRef.current = { x: event.clientX, active: true };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    const delta = event.clientX - dragRef.current.x;
    dragRef.current.active = false;
    if (Math.abs(delta) < 56) return;
    // RTL: drag right (positive) → previous, drag left → next
    goBy(delta > 0 ? -1 : 1);
  };

  const selectTab = (id: string) => {
    const next = catalogs.findIndex((item) => item.id === id);
    if (next >= 0) goTo(next);
  };

  const ambient = opened ? active.theme.ambient : "#F4F0E8";

  return (
    <section
      ref={rootRef}
      className="catalog-book-section"
      style={{
        ["--cb-ambient" as string]: ambient,
        ["--cb-page-bg" as string]: active.theme.background,
        ["--cb-accent" as string]: active.theme.accent,
        ["--cb-text" as string]: active.theme.text,
      }}
      aria-label={catalogBookCopy.sectionTitle}
    >
      <div className="catalog-book-shell">
        <header className="catalog-book-header">
          <h2>{catalogBookCopy.sectionTitle}</h2>
          <p>{catalogBookCopy.sectionSubtitle}</p>
        </header>

        <div className="catalog-book-desktop">
          <div className="catalog-book-stage">
            <CatalogTabs
              items={catalogs}
              activeId={active.id}
              onSelect={selectTab}
            />

            <div
              className={`catalog-book-object${inView ? " is-entering" : ""}${
                peek && !opened ? " is-peek" : ""
              }${opened ? " is-open" : ""}`}
              onPointerDown={onPointerDown}
              onPointerUp={onPointerUp}
            >
              <div className="catalog-book-spine" aria-hidden="true" />
              <div className="catalog-book-edges" aria-hidden="true">
                {edgeColors(catalogs).map((color, edgeIndex) => (
                  <span key={`edge-${edgeIndex}`} style={{ background: color }} />
                ))}
              </div>

              <button
                type="button"
                className="catalog-book-cover"
                onClick={openBook}
                aria-label="باز کردن کتاب کاتالوگ"
              >
                <span className="catalog-book-cover-inner">
                  <strong>{catalogBookCopy.coverTitle}</strong>
                  <span>{catalogBookCopy.coverSubtitle}</span>
                  <em>{catalogBookCopy.coverHint}</em>
                </span>
              </button>

              {opened ? (
                <BookSpread
                  catalog={active}
                  index={index}
                  onOpenReader={() => setReaderOpen(true)}
                />
              ) : null}
            </div>

            {opened ? (
              <>
                <button
                  type="button"
                  className="catalog-book-nav catalog-book-nav--prev"
                  onClick={() => goBy(-1)}
                  aria-label="صفحه قبلی"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M10 6l6 6-6 6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  className="catalog-book-nav catalog-book-nav--next"
                  onClick={() => goBy(1)}
                  aria-label="صفحه بعدی"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M14 6l-6 6 6 6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </>
            ) : null}
          </div>
        </div>

        <div className="catalog-book-mobile">
          <CatalogTabs
            items={catalogs}
            activeId={active.id}
            onSelect={selectTab}
            variant="chips"
          />
          <div
            className="catalog-book-mobile-track"
            onScroll={(event) => {
              const track = event.currentTarget;
              const cardWidth = track.clientWidth * 0.86;
              const next = Math.round(track.scrollLeft / (cardWidth + 14));
              if (next !== index && next >= 0 && next < total) {
                setIndex(next);
                setOpened(true);
              }
            }}
          >
            {catalogs.map((item) => (
              <article
                key={item.id}
                className={`catalog-book-mobile-card${
                  item.id === "farm" ? " is-green" : ""
                }`}
                style={{
                  ["--cb-page-bg" as string]:
                    item.id === "farm" ? "#005B48" : item.theme.background,
                  ["--cb-text" as string]: item.theme.text,
                  ["--cb-accent" as string]: item.theme.accent,
                }}
              >
                <div className="catalog-book-mobile-visual">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="86vw"
                  />
                  <span className="catalog-book-media-label">{item.year}</span>
                </div>
                <div className="catalog-book-mobile-copy">
                  <span className="catalog-book-kicker">{item.category}</span>
                  <h3 className="catalog-book-title">{item.title}</h3>
                  <p className="catalog-book-desc">{item.description}</p>
                  <div className="catalog-book-meta">
                    <span>{item.year}</span>
                    <span>{item.format}</span>
                    <span>{item.pageCount} صفحه</span>
                  </div>
                  <button
                    type="button"
                    className="catalog-book-cta"
                    onClick={() => {
                      setIndex(catalogs.findIndex((c) => c.id === item.id));
                      setReaderOpen(true);
                    }}
                    aria-label={`مشاهده کاتالوگ ${item.title}`}
                  >
                    مشاهده کاتالوگ
                    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                      <path
                        d="M15 6 9 12l6 6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="catalog-book-footer">
          <span className="catalog-book-indicator">
            {toPersianDigits(index + 1).padStart(2, "۰")} /{" "}
            {toPersianDigits(total).padStart(2, "۰")}
          </span>
          <div className="catalog-book-progress" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <CatalogReader
        open={readerOpen}
        catalogs={catalogs}
        activeId={active.id}
        onClose={() => setReaderOpen(false)}
        onChangeCatalog={(id) => {
          const next = catalogs.findIndex((item) => item.id === id);
          if (next >= 0) setIndex(next);
        }}
      />
    </section>
  );
}
