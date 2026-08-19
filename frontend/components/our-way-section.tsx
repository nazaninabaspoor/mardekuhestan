import Image from "next/image";
import Link from "next/link";

import { PeakMark } from "@/components/brand-marks";
import { ourWay } from "@/lib/brand";

function MountainTrail() {
  return (
    <svg
      className="our-way-trail"
      viewBox="0 0 48 720"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        className="our-way-trail-glow"
        d="M24 8 C 24 48, 40 72, 40 120 S 8 180, 8 240 S 40 300, 40 360 S 8 420, 8 480 S 40 540, 40 600 S 24 660, 24 712"
        fill="none"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        className="our-way-trail-line"
        d="M24 8 C 24 48, 40 72, 40 120 S 8 180, 8 240 S 40 300, 40 360 S 8 420, 8 480 S 40 540, 40 600 S 24 660, 24 712"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeDasharray="3 9"
      />
    </svg>
  );
}

export function OurWaySection() {
  return (
    <section className="our-way" aria-labelledby="our-way-title">
      <div className="shell">
        <div className="our-way-head">
          <h2 className="our-way-title" id="our-way-title">
            <PeakMark className="our-way-title-peak" />
            {ourWay.title}
          </h2>
          <span className="our-way-title-rule" aria-hidden="true" />
          <Link href={ourWay.moreHref} className="our-way-more" title={ourWay.moreLabel}>
            {ourWay.moreLabel}
            <span className="our-way-more-mark" aria-hidden="true">
              <PeakMark />
            </span>
          </Link>
        </div>

        <div className="our-way-stage">
          <aside className="our-way-guide">
            <div className="our-way-guide-figure">
              <span className="our-way-guide-ground" aria-hidden="true" />
              <Image
                src="/brand/mardekoohestan-walker.png"
                alt=""
                width={420}
                height={630}
                className="our-way-guide-img"
                priority={false}
              />
            </div>
            <div className="our-way-intro">
              <p className="our-way-kicker">{ourWay.kicker}</p>
              <p className="our-way-lead">{ourWay.lead}</p>
            </div>
          </aside>

          <div className="our-way-route-wrap">
            <div className="our-way-route-rail" aria-hidden="true">
              <MountainTrail />
            </div>

            <ol className="our-way-route">
              {ourWay.steps.map((step, index) => {
                const tone = index % 2 === 0 ? "peak" : "valley";
                return (
                  <li
                    key={step.id}
                    className={`our-way-route-stop our-way-route-stop--${tone}`}
                    style={{ animationDelay: `${index * 70}ms` }}
                  >
                    <div className="our-way-route-node" aria-hidden="true">
                      <span className="our-way-route-beacon">
                        <PeakMark className="our-way-route-peak" />
                      </span>
                      <span className="our-way-route-num">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <article className="our-way-route-copy">
                      <h3 className="our-way-route-title">{step.title}</h3>
                      <p className="our-way-route-text">{step.body}</p>
                    </article>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        <p className="our-way-note">{ourWay.note}</p>
      </div>
    </section>
  );
}
