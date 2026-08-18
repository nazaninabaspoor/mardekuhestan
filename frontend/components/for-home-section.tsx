"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";

import { homeCategoryProducts, homeDoors, type HomeDoorId } from "@/lib/brand";

function BlockTitleIcon() {
  return (
    <svg
      className="for-home-block-icon"
      viewBox="0 0 512 512"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M128 32c-5.2 0-10.1 2.5-13.1 6.8l-112 160c-4.3 6.2-3.7 14.6 1.4 20.1l240 256c3 3.2 7.2 5.1 11.7 5.1s8.6-1.8 11.7-5.1l240-256c5.2-5.5 5.8-13.9 1.4-20.1l-112-160c-3-4.3-7.9-6.8-13.1-6.8H128zm.9 42.7L222.7 192H46.7L128.9 74.7zM52.9 224H256 459.1L256 440.6 52.9 224zm412.3-32h-176L383.1 74.7 465.3 192zM350.7 64 256 182.4 161.3 64H350.7z" />
    </svg>
  );
}

function ViewMoreIcon() {
  return (
    <svg
      className="for-home-view-more-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M14 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

const LEAVE_DELAY_MS = 360;

type PopupPosition = {
  top: number;
  left: number;
  width: number;
};

function getPopupPosition(anchor: HTMLElement): PopupPosition {
  const rect = anchor.getBoundingClientRect();
  const width = Math.min(Math.max(rect.width + 48, 300), 380);
  const left = Math.min(
    Math.max(rect.left + rect.width / 2, width / 2 + 12),
    window.innerWidth - width / 2 - 12,
  );

  return {
    top: rect.bottom + 10,
    left,
    width,
  };
}

export function ForHomeSection() {
  const [activeDoorId, setActiveDoorId] = useState<HomeDoorId | null>(null);
  const [popupStyle, setPopupStyle] = useState<CSSProperties | null>(null);
  const [mounted, setMounted] = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const anchorRefs = useRef<Map<HomeDoorId, HTMLElement>>(new Map());

  useEffect(() => {
    setMounted(true);
  }, []);

  const clearLeaveTimer = useCallback(() => {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
  }, []);

  const activateDoor = useCallback(
    (id: HomeDoorId) => {
      clearLeaveTimer();
      setActiveDoorId(id);
    },
    [clearLeaveTimer],
  );

  const scheduleClear = useCallback(() => {
    clearLeaveTimer();
    leaveTimer.current = setTimeout(() => {
      setActiveDoorId(null);
      leaveTimer.current = null;
    }, LEAVE_DELAY_MS);
  }, [clearLeaveTimer]);

  const activeDoor = activeDoorId
    ? homeDoors.find((door) => door.id === activeDoorId)
    : null;
  const previewProducts = activeDoorId ? homeCategoryProducts[activeDoorId] : [];

  useLayoutEffect(() => {
    if (!activeDoorId) {
      setPopupStyle(null);
      return;
    }

    const updatePosition = () => {
      const anchor = anchorRefs.current.get(activeDoorId);
      if (!anchor) {
        return;
      }

      const position = getPopupPosition(anchor);
      setPopupStyle({
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${position.width}px`,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [activeDoorId]);

  useEffect(() => {
    if (!activeDoorId) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveDoorId(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeDoorId]);

  const popup =
    mounted && activeDoor && popupStyle
      ? createPortal(
          <>
            <div className="for-home-popup-backdrop" aria-hidden="true" />
            <div
              className="for-home-popup"
              style={popupStyle}
              role="dialog"
              aria-label={`محصولات ${activeDoor.label}`}
              onMouseEnter={clearLeaveTimer}
              onMouseLeave={scheduleClear}
            >
              <div key={activeDoor.id} className="for-home-popup-panel">
                <div className="for-home-popup-head">
                  <p className="for-home-popup-kicker">{activeDoor.line}</p>
                  <h3>{activeDoor.label}</h3>
                </div>

                <ul className="for-home-popup-grid">
                  {previewProducts.map((product) => (
                    <li key={product.id}>
                      <Link href={product.href} className="for-home-popup-card">
                        <div className="for-home-popup-card-image">
                          <Image
                            src={product.image}
                            alt={product.alt}
                            fill
                            sizes="72px"
                            style={{ objectFit: "contain" }}
                          />
                        </div>
                        <div className="for-home-popup-card-copy">
                          <strong>{product.name}</strong>
                          <span>{product.note}</span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>

                <Link href={activeDoor.href} className="for-home-popup-more">
                  مشاهده همه {activeDoor.label}
                  <ViewMoreIcon />
                </Link>
              </div>
            </div>
          </>,
          document.body,
        )
      : null;

  return (
    <section className="for-home" aria-labelledby="for-home-title">
      <div className="shell">
        <div className="for-home-block">
          <div className="for-home-block-title">
            <div className="for-home-block-title-text" id="for-home-title">
              <BlockTitleIcon />
              چه به خانه می‌رسد
            </div>
            <Link href="/products" className="for-home-view-more" title="همه محصولات">
              <ViewMoreIcon />
              مشاهده همه
            </Link>
          </div>

          <div className="for-home-block-content">
            <ul className="for-home-products">
              {homeDoors.map((item) => {
                const isActive = activeDoorId === item.id;

                return (
                  <li key={item.id} className="for-home-product">
                    <article
                      ref={(node) => {
                        if (node) {
                          anchorRefs.current.set(item.id, node);
                        } else {
                          anchorRefs.current.delete(item.id);
                        }
                      }}
                      className={`for-home-product-area${isActive ? " is-active" : ""}`}
                      onMouseEnter={() => activateDoor(item.id)}
                      onMouseLeave={scheduleClear}
                      onFocus={() => activateDoor(item.id)}
                    >
                      <div className="for-home-product-image">
                        <Link href={item.href} title={item.label}>
                          <span className="for-home-product-badge">{item.line}</span>
                          <Image
                            src={item.image}
                            alt={item.alt}
                            width={230}
                            height={230}
                            sizes="(min-width: 1024px) 230px, (min-width: 768px) 45vw, 88vw"
                            style={{ objectPosition: item.position }}
                          />
                        </Link>
                      </div>
                      <h3 className="for-home-product-name">
                        <Link href={item.href}>{item.label}</Link>
                      </h3>
                      <div className="for-home-product-actions">
                        <Link href={item.href} className="for-home-product-cta">
                          مشاهده {item.label}
                        </Link>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
      {popup}
    </section>
  );
}
