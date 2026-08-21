"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { upcomingDrops } from "@/lib/brand";

function SparkIcon() {
  return (
    <svg
      className="coming-soon-title-icon"
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
      <div className="shell">
        <div className="coming-soon-block">
          <div className="coming-soon-block-title">
            <h2 className="coming-soon-block-title-text" id="coming-soon-title">
              <SparkIcon />
              {upcomingDrops.title}
            </h2>
            <span className="coming-soon-block-title-rule" aria-hidden="true" />
            <span className="coming-soon-flag">{upcomingDrops.kicker}</span>
          </div>

          <p className="coming-soon-lead">{upcomingDrops.lead}</p>

          <div className="coming-soon-stage">
            <ul className="coming-soon-drops">
              {upcomingDrops.items.map((item, index) => (
                <li
                  key={item.id}
                  className={`coming-soon-drop coming-soon-drop--${index === 0 ? "east" : "west"}`}
                  style={{ ["--drop-i" as string]: index }}
                >
                  <article className="coming-soon-card">
                    <div className="coming-soon-visual">
                      <span className="coming-soon-ring" aria-hidden="true" />
                      <Image
                        src={item.image}
                        alt={item.alt}
                        width={640}
                        height={640}
                        sizes="(max-width: 700px) 70vw, 300px"
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
            </Link>
            <p className="coming-soon-hint">اولین نفرهایی باش که به سفره می‌رسند.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
