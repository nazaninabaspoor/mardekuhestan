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
      { threshold: 0.18 },
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

          <div className="coming-soon-case">
            <div className="coming-soon-showcase">
              <ul className="coming-soon-drops">
                {upcomingDrops.items.map((item, index) => (
                  <li
                    key={item.id}
                    className="coming-soon-drop"
                    style={{ ["--drop-i" as string]: index }}
                  >
                    <article className="coming-soon-spot">
                      <div className="coming-soon-spot-stage">
                        <div className="coming-soon-product">
                          <Image
                            src={item.image}
                            alt={item.alt}
                            width={720}
                            height={720}
                            sizes="(max-width: 760px) 72vw, 340px"
                            className="coming-soon-art"
                            priority={false}
                          />
                        </div>

                        <div className="coming-soon-base" aria-hidden="true">
                          <span className="coming-soon-base-top" />
                          <span className="coming-soon-base-body" />
                          <span className="coming-soon-base-rim" />
                          <span className="coming-soon-base-shadow" />
                        </div>
                      </div>

                      <div className="coming-soon-meta">
                        <span className="coming-soon-eta">{item.eta}</span>
                        <h3 className="coming-soon-name">{item.name}</h3>
                        <p className="coming-soon-note">{item.note}</p>
                      </div>
                    </article>
                  </li>
                ))}
              </ul>

              <span className="coming-soon-divider" aria-hidden="true" />
            </div>
          </div>

          <div className="coming-soon-foot">
            <Link href={upcomingDrops.ctaHref} className="coming-soon-cta">
              {upcomingDrops.ctaLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
