"use client";

import { useEffect, useState } from "react";

export type MagTocItem = { id: string; text: string };

export function MagToc({
  items,
  title = "فهرست مطالب",
  variant = "rail",
}: {
  items: MagTocItem[];
  title?: string;
  variant?: "rail" | "box";
}) {
  const [active, setActive] = useState(items[0]?.id || "");

  useEffect(() => {
    if (!items.length) return;
    const nodes = items
      .map((item) => document.getElementById(item.id))
      .filter((node): node is HTMLElement => Boolean(node));
    if (!nodes.length) return;

    const onScroll = () => {
      const mark = window.scrollY + 160;
      let current = items[0].id;
      for (const node of nodes) {
        if (node.offsetTop <= mark) current = node.id;
      }
      setActive(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [items]);

  if (!items.length) return null;

  return (
    <nav className={`mk-toc mk-toc--${variant}`} aria-label={title}>
      <p>{title}</p>
      <ol>
        {items.map((item, index) => (
          <li key={item.id}>
            <a href={`#${item.id}`} className={item.id === active ? "is-active" : undefined}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
