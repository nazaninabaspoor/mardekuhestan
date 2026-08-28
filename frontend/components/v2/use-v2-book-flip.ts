"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export type V2FlipApi = {
  pageFlip: () => {
    flipNext: (corner?: "top" | "bottom") => void;
    flipPrev: (corner?: "top" | "bottom") => void;
    flip: (page: number) => void;
    getCurrentPageIndex: () => number;
    getPageCount: () => number;
    update?: () => void;
  };
};

type Size = { w: number; h: number };

function waitFrames(count = 2): Promise<void> {
  return new Promise((resolve) => {
    const step = (left: number) => {
      if (left <= 0) {
        resolve();
        return;
      }
      requestAnimationFrame(() => step(left - 1));
    };
    step(count);
  });
}

/**
 * Portrait + showCover: single cover at ends, spread in the middle.
 * Layout width only changes on real open/close — never on hover curl.
 */
export function useV2BookFlip(size: Size) {
  const bookRef = useRef<V2FlipApi | null>(null);
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [bookState, setBookState] = useState("read");
  const [layoutOpen, setLayoutOpen] = useState(false);
  const busyRef = useRef(false);
  const preparingRef = useRef(false);
  const lastLayoutRef = useRef(false);

  const onLastCover = pageCount > 1 && page >= pageCount - 1;
  const onFrontCover = page <= 0;
  const isSingleCover = onFrontCover || onLastCover;

  const isOpen =
    (!isSingleCover && page > 0) ||
    layoutOpen ||
    bookState === "flipping" ||
    bookState === "user_fold";

  const onFlip = useCallback((e: { data: number }) => {
    setPage(e.data);
  }, []);

  const onInit = useCallback(() => {
    setPageCount(bookRef.current?.pageFlip()?.getPageCount?.() ?? 0);
  }, []);

  const onChangeState = useCallback((e: { data: string }) => {
    const next = e.data;
    setBookState(next);
    if (next === "flipping" || next === "user_fold") {
      preparingRef.current = false;
      setLayoutOpen(true);
    }
    if (next === "read") {
      busyRef.current = false;
      preparingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (bookState !== "read") return;
    if (preparingRef.current) return;

    const last = pageCount > 1 && page >= pageCount - 1;
    const nextOpen = page > 0 && !last;
    setLayoutOpen(nextOpen);

    if (lastLayoutRef.current === nextOpen) return;
    lastLayoutRef.current = nextOpen;

    const id = requestAnimationFrame(() => {
      bookRef.current?.pageFlip()?.update?.();
    });
    return () => cancelAnimationFrame(id);
  }, [bookState, page, pageCount, size.w, size.h]);

  const prepareOpenLayout = useCallback(async () => {
    if (page > 0 || layoutOpen) return;
    preparingRef.current = true;
    lastLayoutRef.current = true;
    setLayoutOpen(true);
    await waitFrames(2);
    bookRef.current?.pageFlip()?.update?.();
    await waitFrames(2);
  }, [page, layoutOpen]);

  const flipNext = useCallback(async () => {
    if (busyRef.current) return;
    const api = bookRef.current?.pageFlip();
    if (!api) return;
    if (bookState === "flipping" || bookState === "user_fold") return;
    busyRef.current = true;
    try {
      if (page === 0) await prepareOpenLayout();
      api.flipNext("top");
    } catch {
      busyRef.current = false;
      preparingRef.current = false;
    }
  }, [bookState, page, prepareOpenLayout]);

  const flipPrev = useCallback(async () => {
    if (busyRef.current) return;
    const api = bookRef.current?.pageFlip();
    if (!api) return;
    if (bookState === "flipping" || bookState === "user_fold") return;
    if (page <= 0) return;
    busyRef.current = true;
    try {
      api.flipPrev("top");
    } catch {
      busyRef.current = false;
    }
  }, [bookState, page]);

  const flipTo = useCallback(
    async (index: number) => {
      if (busyRef.current) return;
      const api = bookRef.current?.pageFlip();
      if (!api) return;
      if (bookState === "flipping" || bookState === "user_fold") return;
      if (index < 0) return;
      busyRef.current = true;
      try {
        if (page === 0 && index > 0) await prepareOpenLayout();
        api.flip(index);
      } catch {
        busyRef.current = false;
        preparingRef.current = false;
      }
    },
    [bookState, page, prepareOpenLayout],
  );

  /** Expand only when starting a real open from the front cover — not on hover. */
  const armOpenLayout = useCallback(() => {
    if (page > 0 || layoutOpen || preparingRef.current) return;
    void prepareOpenLayout();
  }, [page, layoutOpen, prepareOpenLayout]);

  return {
    bookRef,
    page,
    pageCount,
    bookState,
    isOpen,
    isSingleCover,
    onFrontCover,
    onLastCover,
    onFlip,
    onInit,
    onChangeState,
    flipNext,
    flipPrev,
    flipTo,
    armOpenLayout,
  };
}
