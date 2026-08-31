"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";

import styles from "@/components/catalog-search-box.module.css";
import {
  catalogResultsPageUrl,
  navigateCatalogHit,
} from "@/lib/catalog/navigate-hit";
import {
  filterCatalogPrefixHits,
  mergeSearchHits,
  searchStaticCatalog,
  type CatalogSearchHit,
} from "@/lib/catalog/static-search";
import { matchesCatalogPrefix } from "@/lib/catalog/normalize-fa";

type CatalogSearchBoxProps = {
  className?: string;
  inputClassName?: string;
  variant?: "default" | "v2";
  placeholder?: string;
  defaultValue?: string;
  minChars?: number;
};

const API_DEBOUNCE_MS = 320;

export function CatalogSearchBox({
  className = "",
  inputClassName = "",
  variant = "default",
  placeholder = "جستجو در راه سبز…",
  defaultValue = "",
  minChars = 1,
}: CatalogSearchBoxProps) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const apiTimerRef = useRef<number | null>(null);

  const [query, setQuery] = useState(defaultValue);
  const [results, setResults] = useState<CatalogSearchHit[]>([]);
  const [open, setOpen] = useState(false);
  const [apiPending, setApiPending] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [panelRect, setPanelRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const close = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
  }, []);

  const updatePanelRect = useCallback(() => {
    const node = rootRef.current;
    if (!node) return;
    setPanelRect(node.getBoundingClientRect());
  }, []);

  const runLocalSearch = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (trimmed.length < minChars) {
        setResults([]);
        return;
      }
      setResults(searchStaticCatalog(trimmed, 8));
      setActiveIndex(0);
    },
    [minChars],
  );

  const runApiSearch = useCallback(
    async (value: string) => {
      const trimmed = value.trim();
      if (trimmed.length < minChars) return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setApiPending(true);

      try {
        const response = await fetch(
          `/api/catalog/search?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal, cache: "no-store" },
        );
        if (!response.ok) return;
        const data = (await response.json()) as { results: CatalogSearchHit[] };
        const apiHits = filterCatalogPrefixHits(
          data.results.map((item) => ({
            ...item,
            categoryId: item.categoryId ?? "fresh-meat",
            domainLabel: item.domainLabel ?? "",
          })),
          trimmed,
        );
        setResults(
          mergeSearchHits(searchStaticCatalog(trimmed, 8), apiHits, 8),
        );
      } catch (cause) {
        if (cause instanceof DOMException && cause.name === "AbortError") return;
      } finally {
        setApiPending(false);
      }
    },
    [minChars],
  );

  useEffect(() => {
    runLocalSearch(query);
    if (apiTimerRef.current) window.clearTimeout(apiTimerRef.current);
    if (!query.trim()) {
      setApiPending(false);
      return;
    }
    apiTimerRef.current = window.setTimeout(() => {
      void runApiSearch(query);
    }, API_DEBOUNCE_MS);
    return () => {
      if (apiTimerRef.current) window.clearTimeout(apiTimerRef.current);
    };
  }, [query, runLocalSearch, runApiSearch]);

  useEffect(() => {
    close();
    setQuery("");
    setResults([]);
  }, [pathname, close]);

  useLayoutEffect(() => {
    if (!open) return;
    updatePanelRect();
    const onLayout = () => updatePanelRect();
    window.addEventListener("resize", onLayout);
    window.addEventListener("scroll", onLayout, true);
    return () => {
      window.removeEventListener("resize", onLayout);
      window.removeEventListener("scroll", onLayout, true);
    };
  }, [open, query, results.length, updatePanelRect]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      if ((target as HTMLElement).closest?.("[data-catalog-search-panel]")) return;
      close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [close]);

  const goToResultsPage = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    close();
    router.push(catalogResultsPageUrl(trimmed, pathname));
  };

  const selectResult = (hit: CatalogSearchHit) => {
    close();
    setQuery("");
    navigateCatalogHit(hit, router, pathname);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      close();
      inputRef.current?.blur();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) setOpen(true);
      setActiveIndex((index) =>
        results.length ? (index + 1) % results.length : -1,
      );
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) =>
        results.length ? (index - 1 + results.length) % results.length : -1,
      );
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      if (open && activeIndex >= 0 && results[activeIndex]) {
        selectResult(results[activeIndex]);
        return;
      }
      goToResultsPage();
    }
  };

  const showPanel = open && query.trim().length >= minChars;
  const trimmedQuery = query.trim();
  const highlightPrefix = (name: string) => {
    if (!trimmedQuery || !matchesCatalogPrefix(name, trimmedQuery)) {
      return name;
    }
    const visibleLen = Math.min(trimmedQuery.length, name.length);
    return (
      <>
        <mark className={styles.match}>{name.slice(0, visibleLen)}</mark>
        {name.slice(visibleLen)}
      </>
    );
  };
  const viewportWidth = mounted ? window.innerWidth : 360;
  const panelWidth = Math.min(340, viewportWidth - 16);
  const panelStyle =
    panelRect && mounted
      ? {
          position: "fixed" as const,
          top: panelRect.bottom + 8,
          left: Math.max(
            8,
            Math.min(panelRect.right - panelWidth, viewportWidth - panelWidth - 8),
          ),
          width: panelWidth,
          zIndex: 10000,
        }
      : undefined;

  const panel =
    showPanel && panelStyle ? (
      <div
        className={`${styles.panel} ${styles[`panel--${variant}`]}`}
        style={panelStyle}
        data-catalog-search-panel
        role="presentation"
      >
        {results.length ? (
          <ul id={listboxId} className={styles.list} role="listbox" aria-label="پیشنهاد محصولات">
            {results.map((hit, index) => (
              <li key={hit.id} className={styles.item} role="option" aria-selected={index === activeIndex}>
                <button
                  type="button"
                  className={`${styles.option}${index === activeIndex ? ` ${styles.optionActive}` : ""}`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => selectResult(hit)}
                >
                  <span className={styles.thumb}>
                    <Image src={hit.image} alt="" width={40} height={40} sizes="40px" />
                  </span>
                  <span className={styles.copy}>
                    <span className={styles.name}>{highlightPrefix(hit.name)}</span>
                    <span className={styles.meta}>
                      {hit.domainLabel}
                      {hit.note ? ` · ${hit.note}` : ""}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.status} role="status">
            {apiPending ? "در حال جستجو…" : "نتیجه‌ای پیدا نشد."}
          </p>
        )}

        <div className={styles.footer}>
          <button type="button" className={styles.allResults} onClick={goToResultsPage}>
            مشاهده همه نتایج «{query.trim()}»
          </button>
        </div>
      </div>
    ) : null;

  return (
    <>
      <div
        ref={rootRef}
        className={`${styles.root} ${styles[`root--${variant}`]} catalog-search catalog-search--${variant} ${className}`.trim()}
      >
        <input
          ref={inputRef}
          type="search"
          className={`${styles.input} ${inputClassName}`.trim()}
          value={query}
          placeholder={placeholder}
          autoComplete="off"
          aria-label="جستجو در محصولات"
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-expanded={showPanel}
          role="combobox"
          enterKeyHint="search"
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            updatePanelRect();
          }}
          onFocus={() => {
            setOpen(true);
            updatePanelRect();
          }}
          onKeyDown={onKeyDown}
        />
        <button type="button" className={styles.button} aria-label="جستجو" onClick={goToResultsPage}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="6.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <path d="M20 20l-3.4-3.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </button>
      </div>
      {mounted && panel ? createPortal(panel, document.body) : null}
    </>
  );
}
