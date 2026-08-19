"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

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

const LEAVE_DELAY_MS = 380;

export function ForHomeSection() {
  const [activeDoorId, setActiveDoorId] = useState<HomeDoorId | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  return (
    <section className="for-home" aria-labelledby="for-home-title">
      <div className="shell">
        <div className="for-home-block">
          <div className="for-home-block-title">
            <h2 className="for-home-block-title-text" id="for-home-title">
              <BlockTitleIcon />
              چه به خانه می‌رسد
            </h2>
            <span className="for-home-block-title-rule" aria-hidden="true" />
            <Link href="/products" className="for-home-view-more" title="همه محصولات">
              <ViewMoreIcon />
              مشاهده همه
            </Link>
          </div>

          <div className="for-home-block-content">
            <ul className="for-home-products">
              {homeDoors.map((item) => {
                const isActive = activeDoorId === item.id;
                const previewProducts = homeCategoryProducts[item.id];

                return (
                  <li
                    key={item.id}
                    className={`for-home-product${isActive ? " is-popup-open" : ""}`}
                  >
                    <article
                      className={`for-home-product-area${isActive ? " is-active" : ""}`}
                      onMouseEnter={() => activateDoor(item.id)}
                      onMouseLeave={scheduleClear}
                      onFocus={() => activateDoor(item.id)}
                    >
                      <div className="for-home-product-visual">
                        <div className="for-home-product-image">
                          <span className="for-home-product-badge">{item.line}</span>
                          <Link href={item.href} className="for-home-product-photo" title={item.label}>
                            <span
                              className="for-home-product-photo-stage"
                              style={{ ["--product-focus" as string]: item.position }}
                            >
                              <Image
                                src={item.image}
                                alt={item.alt}
                                width={280}
                                height={280}
                                sizes="(min-width: 1024px) 280px, (min-width: 768px) 46vw, 88vw"
                                className="for-home-product-photo-img"
                              />
                            </span>
                          </Link>

                          {isActive ? (
                            <div
                              className="for-home-popup"
                              role="dialog"
                              aria-label={`محصولات ${item.label}`}
                            >
                              <div className="for-home-popup-panel">
                                <ul className="for-home-popup-grid">
                                  {previewProducts.map((product) => (
                                    <li key={product.id}>
                                      <Link href={product.href} className="for-home-popup-card">
                                        <div className="for-home-popup-card-frame">
                                          <Image
                                            src={product.image}
                                            alt={product.alt}
                                            width={120}
                                            height={120}
                                            sizes="120px"
                                            className="for-home-popup-card-img"
                                          />
                                        </div>
                                        <p className="for-home-popup-card-label">
                                          {product.name}
                                          <span>{product.note}</span>
                                        </p>
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                                <Link href={item.href} className="for-home-popup-more">
                                  مشاهده بیشتر
                                  <ViewMoreIcon />
                                </Link>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <h3 className="for-home-product-name">
                        <Link href={item.href}>{item.label}</Link>
                      </h3>
                    </article>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
