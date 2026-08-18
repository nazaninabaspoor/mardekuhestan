"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { homeDoors } from "@/lib/brand";

const loopDoors = [...homeDoors, ...homeDoors];

export function ForHomeSection() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = homeDoors.find((item) => item.id === activeId) ?? null;

  function handleDoorClick(id: string) {
    setActiveId((current) => (current === id ? null : id));
  }

  return (
    <section className="for-home" aria-labelledby="for-home-title">
      <div className="shell">
        <header className="for-home-head">
          <h2 id="for-home-title">چه به خانه می‌رسد</h2>
          <p className="for-home-lead">غذایی که می‌شود فهمید از کجا آمده.</p>
        </header>

        <div className="for-home-rail" aria-label="دسته‌های غذایی">
          <div className="for-home-track">
            {loopDoors.map((item, index) => {
              const isActive = activeId === item.id;

              return (
                <button
                  key={`${item.id}-${index}`}
                  type="button"
                  className={`for-home-slide${isActive ? " is-active" : ""}`}
                  aria-expanded={isActive}
                  aria-controls="for-home-story"
                  aria-label={`${item.label} — ${item.line}`}
                  onClick={() => handleDoorClick(item.id)}
                >
                  <span className="for-home-slide-frame">
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      sizes="200px"
                      style={{ objectPosition: item.position }}
                    />
                  </span>
                  <span className="for-home-slide-copy">
                    <span className="for-home-slide-label">{item.label}</span>
                    <span className="for-home-slide-line">{item.line}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div
          id="for-home-story"
          className={`for-home-story${active ? " is-open" : ""}`}
          role="region"
          aria-live="polite"
          aria-hidden={!active}
        >
          {active ? (
            <>
              <p className="for-home-story-text">{active.story}</p>
              <Link href={active.href} className="for-home-story-link">
                {active.label}
              </Link>
            </>
          ) : null}
        </div>

        <p className="for-home-more">
          <Link href="/products">همه محصولات</Link>
        </p>
      </div>
    </section>
  );
}
