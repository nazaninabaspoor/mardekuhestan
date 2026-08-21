"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { upcomingDrops } from "@/lib/brand";

function SparkIcon() {
  return (
    <svg
      className="coming-soon-kicker-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M12 3.5 13.2 9.2 18.5 10.5 13.2 11.8 12 17.5 10.8 11.8 5.5 10.5 10.8 9.2 12 3.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ComingSoonSection() {
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
      { threshold: 0.2 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={rootRef}
      className={`coming-soon${visible ? " is-visible" : ""}`}
      aria-labelledby="coming-soon-title"
    >
      <div className="coming-soon-atmosphere" aria-hidden="true">
        <span className="coming-soon-glow coming-soon-glow--a" />
        <span className="coming-soon-glow coming-soon-glow--b" />
        <span className="coming-soon-grid" />
      </div>

      <div className="shell coming-soon-shell">
        <header className="coming-soon-head">
          <p className="coming-soon-kicker">
            <SparkIcon />
            <span>{upcomingDrops.kicker}</span>
          </p>
          <h2 className="coming-soon-title" id="coming-soon-title">
            {upcomingDrops.title}
          </h2>
          <p className="coming-soon-lead">{upcomingDrops.lead}</p>
        </header>

        <div className="coming-soon-stage" style={{ perspective: "1400px" }}>
          <ul className="coming-soon-drops">
            {upcomingDrops.items.map((item, index) => (
              <li
                key={item.id}
                className={`coming-soon-drop coming-soon-drop--${index === 0 ? "east" : "west"}`}
                style={{ ["--drop-i" as string]: index }}
              >
                <article className="coming-soon-card">
                  <div className="coming-soon-orbits" aria-hidden="true">
                    <span className="coming-soon-orbit coming-soon-orbit--outer" />
                    <span className="coming-soon-orbit coming-soon-orbit--inner" />
                  </div>

                  <div className="coming-soon-pedestal" aria-hidden="true">
                    <span className="coming-soon-pedestal-disc" />
                    <span className="coming-soon-pedestal-shadow" />
                  </div>

                  <div className="coming-soon-visual">
                    <Image
                      src={item.image}
                      alt={item.alt}
                      width={640}
                      height={640}
                      sizes="(max-width: 700px) 58vw, 280px"
                      className="coming-soon-art"
                    />
                  </div>

                  <div className="coming-soon-copy">
                    <span className="coming-soon-eta">{item.eta}</span>
                    <h3 className="coming-soon-name">{item.name}</h3>
                    <p className="coming-soon-note">{item.note}</p>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </div>

        <div className="coming-soon-foot">
          <Link href={upcomingDrops.ctaHref} className="coming-soon-cta">
            {upcomingDrops.ctaLabel}
            <span className="coming-soon-cta-glow" aria-hidden="true" />
          </Link>
          <p className="coming-soon-hint">اولین نفرهایی باش که به سفره می‌رسند.</p>
        </div>
      </div>
    </section>
  );
}
