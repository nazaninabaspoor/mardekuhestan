import Image from "next/image";
import Link from "next/link";

import { PeakMark } from "@/components/brand-marks";
import { ourWay } from "@/lib/brand";

function JourneyPath() {
  return (
    <svg
      className="our-way-path"
      viewBox="0 0 1000 1180"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        className="our-way-path-glow"
        d="M780 70
           C 820 140, 880 190, 760 250
           S 420 310, 280 360
           S 120 430, 220 500
           S 520 560, 720 620
           S 900 700, 760 760
           S 420 820, 260 880
           S 120 960, 300 1020
           S 560 1080, 640 1140"
        fill="none"
        stroke="currentColor"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <path
        className="our-way-path-line"
        d="M780 70
           C 830 150, 900 200, 740 255
           C 560 320, 360 300, 250 365
           C 120 440, 90 470, 210 505
           C 390 555, 610 575, 730 625
           C 880 690, 930 730, 740 770
           C 500 825, 340 835, 240 890
           C 110 960, 140 990, 310 1030
           C 500 1080, 600 1100, 655 1155"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="2 10"
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

        <p className="our-way-lead-line">
          <span className="our-way-kicker">{ourWay.kicker}</span>
          {ourWay.lead}
        </p>

        <div className="our-way-journey">
          <JourneyPath />

          <ol className="our-way-stops">
            {ourWay.steps.map((step, index) => {
              const walker = "walker" in step ? step.walker : null;
              const overlay = "overlay" in step ? step.overlay : null;
              const num = String(index + 1).padStart(2, "0");

              return (
                <li
                  key={step.id}
                  className={`our-way-stop our-way-stop--${step.side} our-way-stop--${step.pose}`}
                >
                  <div className="our-way-stop-pin" aria-hidden="true">
                    <PeakMark className="our-way-stop-peak" />
                    <span className="our-way-stop-num">{num}</span>
                  </div>

                  <figure className="our-way-stop-scene">
                    <Image
                      src={step.scene}
                      alt={step.sceneAlt}
                      fill
                      sizes="(max-width: 900px) 88vw, 260px"
                      className="our-way-stop-photo"
                    />
                    {overlay ? (
                      <Image
                        src={overlay}
                        alt=""
                        width={420}
                        height={280}
                        className="our-way-stop-overlay"
                      />
                    ) : null}
                    {walker ? (
                      <Image
                        src={walker}
                        alt=""
                        width={280}
                        height={420}
                        className="our-way-stop-walker"
                      />
                    ) : null}
                    <span className="our-way-stop-veil" aria-hidden="true" />
                  </figure>

                  <article className="our-way-stop-copy">
                    <h3 className="our-way-stop-title">{step.title}</h3>
                    <p className="our-way-stop-text">{step.body}</p>
                  </article>
                </li>
              );
            })}
          </ol>
        </div>

        <p className="our-way-note">{ourWay.note}</p>
      </div>
    </section>
  );
}
