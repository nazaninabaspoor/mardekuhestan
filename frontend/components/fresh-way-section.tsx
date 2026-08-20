"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { featuredPicks } from "@/lib/brand";

function LeafTitleIcon() {
  return (
    <svg
      className="fresh-way-block-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M5 14c4-8 10-10 14-10-1 5-3 11-10 14-2-2-3.5-2.8-4-4z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 15.5c2.2-2.4 4.6-4 7.8-5.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
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

export function FreshWaySection() {
  const rootRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.22 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={rootRef}
      className={`fresh-way${visible ? " is-visible" : ""}`}
      aria-labelledby="fresh-way-title"
    >
      <div className="shell">
        <div className="fresh-way-block">
          <div className="fresh-way-block-title">
            <h2 className="fresh-way-block-title-text" id="fresh-way-title">
              <LeafTitleIcon />
              {featuredPicks.title}
            </h2>
            <span className="fresh-way-block-title-rule" aria-hidden="true" />
            <Link
              href={featuredPicks.moreHref}
              className="fresh-way-view-more"
              title={featuredPicks.moreLabel}
            >
              <ViewMoreIcon />
              {featuredPicks.moreLabel}
            </Link>
          </div>

          <p className="fresh-way-lead">{featuredPicks.lead}</p>

          <ul className="fresh-way-grid">
            {featuredPicks.items.map((item, index) => (
              <li
                key={item.id}
                className="fresh-way-item"
                style={{ ["--fresh-i" as string]: index }}
              >
                <Link href={item.href} className="fresh-way-card">
                  <span className="fresh-way-neon" aria-hidden="true" />
                  <span className="fresh-way-neon fresh-way-neon--spin" aria-hidden="true" />
                  <span className="fresh-way-badge">{item.badge}</span>
                  <div className="fresh-way-visual">
                    <Image
                      src={item.image}
                      alt={item.alt}
                      fill
                      sizes="(max-width: 720px) 42vw, 220px"
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                  <div className="fresh-way-copy">
                    <strong>{item.name}</strong>
                    <span>{item.note}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
