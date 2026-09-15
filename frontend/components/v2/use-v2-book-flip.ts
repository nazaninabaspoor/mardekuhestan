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
 * stableShell (catalog): hardcover open/close stays single-page.
 * Interior flips keep a full two-page spread — coverTransit must never
 * stay true after landing on an interior page.
 */
export function useV2BookFlip(size: Size, options?: { stableShell?: boolean }) {
  const stableShell = options?.stableShell ?? false;
  const bookRef = useRef<V2FlipApi | null>(null);
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [bookState, setBookState] = useState("read");
  const [layoutOpen, setLayoutOpen] = useState(false);
  const [coverTransit, setCoverTransit] = useState(false);
  const busyRef = useRef(false);
  const preparingRef = useRef(false);
  const lastLayoutRef = useRef(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pageRef = useRef(0);
  const pageCountRef = useRef(0);

  const onLastCover = pageCount > 1 && page >= pageCount - 1;
  const onFrontCover = page <= 0;
  const isSingleCover = onFrontCover || onLastCover;

  const isOpen = stableShell
    ? page > 0 && !onLastCover && !coverTransit
    : (!isSingleCover && page > 0) ||
      layoutOpen ||
      bookState === "flipping" ||
      bookState === "user_fold";

  const syncShellForPage = useCallback(
    (index: number) => {
      if (!stableShell) return;
      const count = pageCountRef.current;
      const last = count > 1 && index >= count - 1;
      if (index <= 0 || last) {
        setCoverTransit(true);
        setLayoutOpen(false);
        lastLayoutRef.current = false;
      } else {
        const wasClosed = !lastLayoutRef.current;
        setCoverTransit(false);
        setLayoutOpen(true);
        lastLayoutRef.current = true;
        // After cover → spread, let StPageFlip remeasure full page widths.
        if (wasClosed) {
          requestAnimationFrame(() => {
            bookRef.current?.pageFlip()?.update?.();
          });
        }
      }
    },
    [stableShell],
  );

  const onFlip = useCallback(
    (e: { data: number }) => {
      const next = e.data;
      pageRef.current = next;
      setPage(next);
      syncShellForPage(next);
    },
    [syncShellForPage],
  );

  const onInit = useCallback(() => {
    const count = bookRef.current?.pageFlip()?.getPageCount?.() ?? 0;
    pageCountRef.current = count;
    setPageCount(count);
  }, []);

  const onChangeState = useCallback(
    (e: { data: string }) => {
      const next = e.data;
      setBookState(next);

      if (next === "flipping" || next === "user_fold") {
        preparingRef.current = false;
        // Gate only while the current index is still a hard cover.
        const current = pageRef.current;
        const count = pageCountRef.current;
        const onBack = count > 1 && current >= count - 1;
        if (stableShell && (current <= 0 || onBack)) {
          setCoverTransit(true);
        }
      }

      if (next === "read") {
        busyRef.current = false;
        preparingRef.current = false;
        if (!stableShell) return;

        // Always read live index — stale React state was re-arming coverTransit
        // after interior flips and hiding the opposite page.
        const current =
          bookRef.current?.pageFlip()?.getCurrentPageIndex?.() ??
          pageRef.current;
        pageRef.current = current;
        setPage(current);
        syncShellForPage(current);
      }
    },
    [stableShell, syncShellForPage],
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
      if (pageRef.current === 0) await prepareOpenLayout();
      api.flipNext("top");
    } catch {
      busyRef.current = false;
      preparingRef.current = false;
    }
  }, [bookState, prepareOpenLayout]);

  const flipPrev = useCallback(async () => {
    if (busyRef.current) return;
    const api = bookRef.current?.pageFlip();
    if (!api) return;
    if (bookState === "flipping" || bookState === "user_fold") return;
    if (pageRef.current <= 0) return;
    busyRef.current = true;
    try {
      if (stableShell && pageRef.current === 1) {
        setCoverTransit(true);
        await waitFrames(2);
        api.update?.();
        await waitFrames(1);
      }
      api.flipPrev("top");
    } catch {
      busyRef.current = false;
    }
  }, [bookState, stableShell]);

  const flipTo = useCallback(
    async (index: number) => {
      if (busyRef.current) return;
      const api = bookRef.current?.pageFlip();
      if (!api) return;
      if (bookState === "flipping" || bookState === "user_fold") return;
      if (index < 0) return;
      busyRef.current = true;
      try {
        const current = pageRef.current;
        if (current === 0 && index > 0) {
          await prepareOpenLayout();
        } else if (stableShell && index <= 0 && current > 0) {
          setCoverTransit(true);
          await waitFrames(2);
          api.update?.();
          await waitFrames(1);
        }
        api.flip(index);
      } catch {
        busyRef.current = false;
        preparingRef.current = false;
      }
    },
    [bookState, prepareOpenLayout, stableShell],
  );

  const armOpenLayout = useCallback(() => {
    if (!stableShell) {
      if (page > 0 || layoutOpen || preparingRef.current) return;
      void prepareOpenLayout();
      return;
    }
    if (pageRef.current > 0) return;
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
