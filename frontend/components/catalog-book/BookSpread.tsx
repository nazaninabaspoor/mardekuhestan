"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import type { CatalogItem } from "@/data/catalogs";

import { BookPage } from "./BookPage";

type BookSpreadProps = {
  catalog: CatalogItem;
  index: number;
  onOpenReader: () => void;
};

export function BookSpread({ catalog, index, onOpenReader }: BookSpreadProps) {
  const reduceMotion = useReducedMotion();
  const mediaFirst = catalog.layout !== "hero-left";

  const content = (
    <BookPage
      catalog={catalog}
      side="content"
      revealKey={`${catalog.id}-${index}`}
      onOpenReader={onOpenReader}
    />
  );
  const media = (
    <BookPage
      catalog={catalog}
      side="media"
      revealKey={`${catalog.id}-${index}`}
      onOpenReader={onOpenReader}
    />
  );

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={catalog.id}
        className={`catalog-book-spread-wrap catalog-book-layout--${catalog.layout}`}
        style={{
          ["--cb-page-bg" as string]: catalog.theme.background,
          transformStyle: "preserve-3d",
        }}
        initial={
          reduceMotion ? { opacity: 1 } : { opacity: 0.25, rotateY: -12, filter: "blur(1px)" }
        }
        animate={
          reduceMotion ? { opacity: 1 } : { opacity: 1, rotateY: 0, filter: "blur(0px)" }
        }
        exit={
          reduceMotion ? { opacity: 0 } : { opacity: 0.15, rotateY: 14, filter: "blur(1px)" }
        }
        transition={{ duration: reduceMotion ? 0 : 0.74, ease: [0.22, 0.7, 0.2, 1] }}
      >
        {mediaFirst ? (
          <>
            {media}
            {content}
          </>
        ) : (
          <>
            {content}
            {media}
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
