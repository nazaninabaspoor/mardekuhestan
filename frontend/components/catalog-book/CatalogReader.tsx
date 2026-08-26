"use client";

import Image from "next/image";
import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

import type { CatalogItem } from "@/data/catalogs";

type CatalogReaderProps = {
  open: boolean;
  catalogs: readonly CatalogItem[];
  activeId: string;
  onClose: () => void;
  onChangeCatalog: (id: string) => void;
};

export function CatalogReader({
  open,
  catalogs,
  activeId,
  onClose,
  onChangeCatalog,
}: CatalogReaderProps) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const index = Math.max(
    0,
    catalogs.findIndex((item) => item.id === activeId),
  );
  const catalog = catalogs[index] ?? catalogs[0];
  const pages = catalog?.images ?? [];
  const safePage = pages.length ? page % pages.length : 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setPage(0);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") {
        setPage((current) => (current + 1) % Math.max(pages.length, 1));
      }
      if (event.key === "ArrowRight") {
        setPage((current) =>
          (current - 1 + Math.max(pages.length, 1)) % Math.max(pages.length, 1),
        );
      }
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose, pages.length]);

  if (!mounted || !open || !catalog) return null;

  const goCatalog = (dir: 1 | -1) => {
    const next = (index + dir + catalogs.length) % catalogs.length;
    onChangeCatalog(catalogs[next].id);
    setPage(0);
  };

  return createPortal(
    <div
      className="catalog-book-reader"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        className={`catalog-book-reader-panel${
          fullscreen ? " is-fullscreen" : ""
        }`}
      >
        <div className="catalog-book-reader-top">
          <h3 id={titleId}>{catalog.title}</h3>
          <div className="catalog-book-reader-actions">
            <button
              type="button"
              onClick={() => setFullscreen((value) => !value)}
              aria-label={fullscreen ? "خروج از تمام‌صفحه" : "نمایش تمام‌صفحه"}
            >
              تمام‌صفحه
            </button>
            <a
              href={catalog.pdf}
              download
              aria-label={`دانلود ${catalog.title}`}
            >
              دانلود
            </a>
            <button type="button" onClick={onClose} aria-label="بستن نمایشگر کاتالوگ">
              بستن
            </button>
          </div>
        </div>

        <div className="catalog-book-reader-stage">
          <Image
            src={pages[safePage] ?? catalog.image}
            alt={`${catalog.title} — صفحه ${safePage + 1}`}
            fill
            sizes="100vw"
            priority
          />
        </div>

        <div className="catalog-book-reader-bottom">
          <div className="catalog-book-reader-actions">
            <button
              type="button"
              onClick={() => goCatalog(-1)}
              aria-label="کاتالوگ قبلی"
            >
              قبلی
            </button>
            <button
              type="button"
              onClick={() =>
                setPage(
                  (current) =>
                    (current - 1 + Math.max(pages.length, 1)) %
                    Math.max(pages.length, 1),
                )
              }
              aria-label="صفحه قبلی"
            >
              ←
            </button>
            <span className="catalog-book-indicator">
              {String(safePage + 1).padStart(2, "0")} /{" "}
              {String(Math.max(pages.length, 1)).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={() =>
                setPage((current) => (current + 1) % Math.max(pages.length, 1))
              }
              aria-label="صفحه بعدی"
            >
              →
            </button>
            <button
              type="button"
              onClick={() => goCatalog(1)}
              aria-label="کاتالوگ بعدی"
            >
              بعدی
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
