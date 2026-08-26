"use client";

import type { CatalogItem } from "@/data/catalogs";

type CatalogTabsProps = {
  items: readonly CatalogItem[];
  activeId: string;
  onSelect: (id: string) => void;
  variant?: "bookmarks" | "chips";
};

export function CatalogTabs({
  items,
  activeId,
  onSelect,
  variant = "bookmarks",
}: CatalogTabsProps) {
  return (
    <div
      className={`catalog-book-tabs${
        variant === "chips" ? " catalog-book-tabs--chips" : ""
      }`}
      role="tablist"
      aria-label="دسته‌بندی کاتالوگ‌ها"
    >
      {items.map((item) => {
        const active = item.id === activeId;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            className={`catalog-book-tab${active ? " is-active" : ""}`}
            onClick={() => onSelect(item.id)}
            aria-label={`رفتن به کاتالوگ ${item.tabLabel}`}
          >
            {item.tabLabel}
          </button>
        );
      })}
    </div>
  );
}
