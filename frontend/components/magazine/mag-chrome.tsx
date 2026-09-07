"use client";

import { useEffect } from "react";

export function MagRouteClass() {
  useEffect(() => {
    document.documentElement.classList.add("is-magazine-route");
    return () => document.documentElement.classList.remove("is-magazine-route");
  }, []);
  return null;
}

export function MagReadProgress() {
  useEffect(() => {
    const bar = document.querySelector<HTMLElement>(".mk-mag-progress > span");
    if (!bar) return;
    const onScroll = () => {
      const el = document.querySelector(".mk-mag-body");
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const start = window.scrollY + rect.top - 120;
      const height = el.scrollHeight - window.innerHeight + 160;
      const p = height <= 0 ? 1 : Math.min(1, Math.max(0, (window.scrollY - start) / height));
      bar.style.width = `${Math.round(p * 100)}%`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="mk-mag-progress" aria-hidden="true">
      <span />
    </div>
  );
}
