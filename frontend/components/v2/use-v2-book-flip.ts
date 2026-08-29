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
 * When `stableShell` is true, the spread shell opens only after the cover
 * has landed (and closes before/while the cover returns) so a real book
 * cover never shows an empty opposite page.
 */
export function useV2BookFlip(size: Size, options?: { stableShell?: boolean }) {
  const stableShell = options?.stableShell ?? false;
  const bookRef = useRef<V2FlipApi | null>(null);
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [bookState, setBookState] = useState("read");
  const [layoutOpen, setLayoutOpen] = useState(false);
  /** True while opening/closing the hard cover — force single-page chrome. */
  const [coverTransit, setCoverTransit] = useState(false);
  const busyRef = useRef(false);
  const preparingRef = useRef(false);
  const lastLayoutRef = useRef(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const coverTransitRef = useRef(false);

  const onLastCover = pageCount > 1 && page >= pageCount - 1;
  const onFrontCover = page <= 0;
  const isSingleCover = onFrontCover || onLastCover;

  const setCoverGate = useCallback((next: boolean) => {
    coverTransitRef.current = next;
    setCoverTransit(next);
  }, []);

  const isOpen = stableShell
    ? page > 0 && !onLastCover && !coverTransit && layoutOpen
    : (!isSingleCover && page > 0) ||
      layoutOpen ||
      bookState === "flipping" ||
      bookState === "user_fold";

  const onFlip = useCallback(
    (e: { data: number }) => {
      const next = e.data;
      setPage(next);
      const last = pageCount > 1 && next >= pageCount - 1;
      if (next <= 0 || last) {
        setCoverGate(true);
        if (stableShell) {
          setLayoutOpen(false);
          lastLayoutRef.current = false;
        }
      } else {
        setCoverGate(false);
        if (stableShell) {
          setLayoutOpen(true);
          lastLayoutRef.current = true;
        }
      }
    },
    [pageCount, setCoverGate, stableShell],
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
        // Stay single while the hard cover is the active page.
        if (stableShell && (page <= 0 || onLastCover)) {
          setCoverGate(true);
          setLayoutOpen(false);
          lastLayoutRef.current = false;
        } else if (stableShell && page === 1) {
          // Closing cover via drag: FlipDirection.BACK === 1
          requestAnimationFrame(() => {
            try {
              const flip = bookRef.current?.pageFlip() as unknown as {
                getRender?: () => { getDirection?: () => number };
              };
              const dir = flip?.getRender?.()?.getDirection?.();
              if (dir === 1) {
                setCoverGate(true);
                setLayoutOpen(false);
                lastLayoutRef.current = false;
              }
            } catch {
              /* engine internals may differ by build */
            }
          });
        }
      }

      if (next === "read") {
        busyRef.current = false;
        preparingRef.current = false;
        const last = pageCount > 1 && page >= pageCount - 1;
        if (stableShell) {
          if (page > 0 && !last) {
            setCoverGate(false);
            setLayoutOpen(true);
            lastLayoutRef.current = true;
          } else {
            setCoverGate(page <= 0 || last);
            setLayoutOpen(false);
            lastLayoutRef.current = false;
          }
          requestAnimationFrame(() => {
            bookRef.current?.pageFlip()?.update?.();
          });
        }
      }
    },
    [stableShell, page, onLastCover, pageCount, setCoverGate],
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

  /** Catalog: never pre-expand — cover must flip as a single page first. */
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

    setCoverGate(true);
    setLayoutOpen(false);
    lastLayoutRef.current = false;
    await waitFrames(2);
    bookRef.current?.pageFlip()?.update?.();
  }, [page, layoutOpen, stableShell, setCoverGate]);

  const flipNext = useCallback(async () => {
    if (busyRef.current) return;
    const api = bookRef.current?.pageFlip();
    if (!api) return;
    if (bookState === "flipping" || bookState === "user_fold") return;
    busyRef.current = true;
    try {
      if (page === 0) {
        setCoverGate(true);
        await prepareOpenLayout();
      }
      api.flipNext("top");
    } catch {
      busyRef.current = false;
      preparingRef.current = false;
    }
  }, [bookState, page, prepareOpenLayout, setCoverGate]);

  const flipPrev = useCallback(async () => {
    if (busyRef.current) return;
    const api = bookRef.current?.pageFlip();
    if (!api) return;
    if (bookState === "flipping" || bookState === "user_fold") return;
    if (page <= 0) return;
    busyRef.current = true;
    try {
      // Closing onto the front cover — drop the opposite page first.
      if (stableShell && page <= 1) {
        setCoverGate(true);
        setLayoutOpen(false);
        lastLayoutRef.current = false;
        await waitFrames(2);
        api.update?.();
        await waitFrames(2);
      }
      api.flipPrev("top");
    } catch {
      busyRef.current = false;
    }
  }, [bookState, page, stableShell, setCoverGate]);

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
          setCoverGate(true);
          await prepareOpenLayout();
        } else if (stableShell && index <= 0) {
          setCoverGate(true);
          setLayoutOpen(false);
          lastLayoutRef.current = false;
          await waitFrames(2);
          api.update?.();
        }
        api.flip(index);
      } catch {
        busyRef.current = false;
        preparingRef.current = false;
      }
    },
    [bookState, page, prepareOpenLayout, setCoverGate, stableShell],
  );

  const armOpenLayout = useCallback(() => {
    if (!stableShell) {
      if (page > 0 || layoutOpen || preparingRef.current) return;
      void prepareOpenLayout();
      return;
    }
    // Catalog: mark cover transit only — do not widen to a spread yet.
    if (page > 0) return;
    setCoverGate(true);
    setLayoutOpen(false);
  }, [page, layoutOpen, prepareOpenLayout, stableShell, setCoverGate]);

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
