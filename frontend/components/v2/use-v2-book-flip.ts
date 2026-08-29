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
 *
 * stableShell (catalog): only the hard-cover open/close stays single-page.
 * Interior flips keep the normal two-page spread the whole time.
 */
export function useV2BookFlip(size: Size, options?: { stableShell?: boolean }) {
  const stableShell = options?.stableShell ?? false;
  const bookRef = useRef<V2FlipApi | null>(null);
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [bookState, setBookState] = useState("read");
  const [layoutOpen, setLayoutOpen] = useState(false);
  /** Only while the hardcover is opening or closing — never for interior flips. */
  const [coverTransit, setCoverTransit] = useState(false);
  const busyRef = useRef(false);
  const preparingRef = useRef(false);
  const lastLayoutRef = useRef(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onLastCover = pageCount > 1 && page >= pageCount - 1;
  const onFrontCover = page <= 0;
  const isSingleCover = onFrontCover || onLastCover;

  const isOpen = stableShell
    ? // Interior spread stays open during normal page turns.
      page > 0 && !onLastCover && !coverTransit
    : (!isSingleCover && page > 0) ||
      layoutOpen ||
      bookState === "flipping" ||
      bookState === "user_fold";

  const onFlip = useCallback(
    (e: { data: number }) => {
      const next = e.data;
      setPage(next);
      const last = pageCount > 1 && next >= pageCount - 1;

      if (!stableShell) return;

      if (next <= 0 || last) {
        // Landed on a hard cover
        setCoverTransit(true);
        setLayoutOpen(false);
        lastLayoutRef.current = false;
      } else {
        // Landed on an interior spread
        setCoverTransit(false);
        setLayoutOpen(true);
        lastLayoutRef.current = true;
      }
    },
    [pageCount, stableShell],
  );

  const onInit = useCallback(() => {
    setPageCount(bookRef.current?.pageFlip()?.getPageCount?.() ?? 0);
  }, []);

  const onChangeState = useCallback(
    (e: { data: string }) => {
      const next = e.data;
      setBookState(next);

      if (next === "flipping" || next === "user_fold") {
        preparingRef.current = false;
        // Cover motion only when we are still on a hard cover page.
        // Do NOT gate page 1 here — that broke normal interior flips.
        if (stableShell && (page <= 0 || onLastCover)) {
          setCoverTransit(true);
        }
      }

      if (next === "read") {
        busyRef.current = false;
        preparingRef.current = false;
        if (!stableShell) return;

        const last = pageCount > 1 && page >= pageCount - 1;
        if (page > 0 && !last) {
          setCoverTransit(false);
          setLayoutOpen(true);
          lastLayoutRef.current = true;
        } else {
          setCoverTransit(true);
          setLayoutOpen(false);
          lastLayoutRef.current = false;
        }
        requestAnimationFrame(() => {
          bookRef.current?.pageFlip()?.update?.();
        });
      }
    },
    [stableShell, page, onLastCover, pageCount],
  );

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (stableShell) return;
    if (bookState !== "read") return;
    if (preparingRef.current) return;

    const last = pageCount > 1 && page >= pageCount - 1;
    const nextOpen = page > 0 && !last;

    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    setLayoutOpen(nextOpen);
    if (lastLayoutRef.current === nextOpen) return;
    lastLayoutRef.current = nextOpen;

    const id = requestAnimationFrame(() => {
      bookRef.current?.pageFlip()?.update?.();
    });
    return () => cancelAnimationFrame(id);
  }, [bookState, page, pageCount, size.w, size.h, stableShell]);

  /** Catalog: do not pre-expand to a spread before the cover flips. */
  const prepareOpenLayout = useCallback(async () => {
    if (!stableShell) {
      if (page > 0 || layoutOpen) return;
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      preparingRef.current = true;
      lastLayoutRef.current = true;
      setLayoutOpen(true);
      await waitFrames(2);
      bookRef.current?.pageFlip()?.update?.();
      await waitFrames(2);
      return;
    }

    setCoverTransit(true);
    setLayoutOpen(false);
    lastLayoutRef.current = false;
    await waitFrames(2);
    bookRef.current?.pageFlip()?.update?.();
  }, [page, layoutOpen, stableShell]);

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
      // Only when leaving the first interior spread back onto the cover.
      if (stableShell && page === 1) {
        setCoverTransit(true);
        await waitFrames(2);
        api.update?.();
        await waitFrames(1);
      }
      api.flipPrev("top");
    } catch {
      busyRef.current = false;
    }
  }, [bookState, page, stableShell]);

  const flipTo = useCallback(
    async (index: number) => {
      if (busyRef.current) return;
      const api = bookRef.current?.pageFlip();
      if (!api) return;
      if (bookState === "flipping" || bookState === "user_fold") return;
      if (index < 0) return;
      busyRef.current = true;
      try {
        if (page === 0 && index > 0) {
          await prepareOpenLayout();
        } else if (stableShell && index <= 0 && page > 0) {
          setCoverTransit(true);
          await waitFrames(2);
          api.update?.();
          await waitFrames(1);
        }
        // Interior jump (tab): keep spread open — do not touch coverTransit.
        api.flip(index);
      } catch {
        busyRef.current = false;
        preparingRef.current = false;
      }
    },
    [bookState, page, prepareOpenLayout, stableShell],
  );

  const armOpenLayout = useCallback(() => {
    if (!stableShell) {
      if (page > 0 || layoutOpen || preparingRef.current) return;
      void prepareOpenLayout();
      return;
    }
    if (page > 0) return;
    setCoverTransit(true);
  }, [page, layoutOpen, prepareOpenLayout, stableShell]);

  return {
    bookRef,
    page,
    pageCount,
    bookState,
    isOpen,
    isSingleCover,
    onFrontCover,
    onLastCover,
    coverTransit,
    onFlip,
    onInit,
    onChangeState,
    flipNext,
    flipPrev,
    flipTo,
    armOpenLayout,
  };
}
