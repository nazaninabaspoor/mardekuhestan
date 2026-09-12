"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  minHeight: string;
  rootMargin?: string;
  children: ReactNode;
};

/** Mount heavy homepage sections only when they approach the viewport. */
export function LazyWhenVisible({
  minHeight,
  rootMargin = "96px 0px",
  children,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || ready) return;

    if (!("IntersectionObserver" in window)) {
      setReady(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setReady(true);
        observer.disconnect();
      },
      { rootMargin, threshold: 0.01 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ready, rootMargin]);

  return (
    <div ref={ref} style={{ minHeight: ready ? undefined : minHeight }}>
      {ready ? children : null}
    </div>
  );
}
