"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type Props = {
  minHeight: string;
  /** How many viewports ahead to start mounting (IntersectionObserver only accepts px/%). */
  leadVh?: number;
  /** How many viewports behind to keep mounted before unload (nearby mode). */
  trailVh?: number;
  /**
   * nearby = unmount when far away (frees GPU for hero/kitchen).
   * once = stay mounted after first visit.
   */
  mode?: "once" | "nearby";
  placeholderStyle?: CSSProperties;
  children: ReactNode;
};

function isNearViewport(rect: DOMRectReadOnly, vh: number, lead: number, trail: number) {
  return rect.bottom > -trail && rect.top < vh + lead;
}

/** Mount heavy homepage sections near the viewport; optionally unload when far. */
export function LazyWhenVisible({
  minHeight,
  leadVh = 0.7,
  trailVh = 1.15,
  mode = "once",
  placeholderStyle,
  children,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);
  const seenRef = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (!("IntersectionObserver" in window)) {
      setReady(true);
      return;
    }

    const sync = () => {
      if (mode === "once" && seenRef.current) return;
      const vh = window.innerHeight || 1;
      const lead = Math.round(vh * leadVh);
      const trail = Math.round(vh * trailVh);
      const rect = node.getBoundingClientRect();
      const near = isNearViewport(rect, vh, lead, trail);
      if (near) {
        seenRef.current = true;
        setReady(true);
        return;
      }
      if (mode === "nearby" && seenRef.current) {
        setReady(false);
      }
    };

    const makeMargin = () => {
      const vh = window.innerHeight || 1;
      const lead = Math.round(vh * leadVh);
      const trail = Math.round(vh * trailVh);
      // CSS rootMargin: top right bottom left — expand root so we load early.
      return `${lead}px 0px ${trail}px 0px`;
    };

    sync();
    let observer = new IntersectionObserver(() => sync(), {
      rootMargin: makeMargin(),
      threshold: [0, 0.01],
    });
    observer.observe(node);

    const onResize = () => {
      observer.disconnect();
      observer = new IntersectionObserver(() => sync(), {
        rootMargin: makeMargin(),
        threshold: [0, 0.01],
      });
      observer.observe(node);
      sync();
    };

    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", onResize);
    };
  }, [leadVh, mode, trailVh]);

  return (
    <div
      ref={ref}
      style={{
        minHeight: ready ? undefined : minHeight,
        background: "#F4F0E8",
        ...placeholderStyle,
      }}
    >
      {ready ? children : null}
    </div>
  );
}
