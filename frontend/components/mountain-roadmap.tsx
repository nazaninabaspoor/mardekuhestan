"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const STAGES = [
  { number: "01", title: "از کوهستان", text: "شروع مسیر مرد کوهستان", image: "/brand/our-way-01-climb.png", side: "right" },
  { number: "02", title: "کنار مرتع", text: "زمین سبز، طبیعت سالم", image: "/brand/stage-02.png", side: "left" },
  { number: "03", title: "با دقت", text: "انتخاب درست، با وسواس", image: "/brand/our-way-03-quality.png", side: "right" },
  { number: "04", title: "سفره‌خانه", text: "رسیدن کیفیت به خانواده", image: "/brand/our-way-04-balance.png", side: "left" },
  { number: "05", title: "یک قدم بعد", text: "راه سبز ادامه دارد", image: "/brand/our-way-05-ahead.png", side: "right" },
] as const;

const PATH = "M 450 25 C 610 120 625 230 450 300 C 270 380 275 495 450 570 C 625 650 625 765 450 840 C 280 920 290 1040 450 1120 C 610 1200 600 1310 450 1380";

export function MountainRoadmap() {
  const stageRefs = useRef<Array<HTMLElement | null>>([]);
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        const index = Number((entry.target as HTMLElement).dataset.stage);
        if (Number.isFinite(index)) setActiveStage(index);
      }),
      { threshold: 0.58, rootMargin: "-8% 0px -22%" },
    );
    stageRefs.current.forEach((stage) => stage && observer.observe(stage));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="mountain-story" aria-labelledby="mountain-story-title">
      <div className="mountain-story__hero">
        <Image src="/brand/misho-clean.png" alt="چشم‌انداز کوه میشو" fill priority unoptimized sizes="100vw" className="mountain-story__mountain" />
        <div className="mountain-story__mist" aria-hidden="true" />
        <div className="mountain-story__hero-grade" aria-hidden="true" />
      </div>

      <div className="mountain-story__container">
        <header className="mountain-story__header">
          <span>فصل‌های یک راه سبز</span>
          <h2 id="mountain-story-title">سفر مرد کوهستان</h2>
          <p>از دامنه‌های میشو تا قله کیفیت</p>
        </header>

        <div className="mountain-story__journey" style={{ "--walker-top": `${3 + activeStage * 21.25}%` } as React.CSSProperties}>
          <svg className="mountain-story__route" viewBox="0 0 900 1410" preserveAspectRatio="none" aria-hidden="true">
            <defs><linearGradient id="story-route-gradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#50af47" /><stop offset="1" stopColor="#005b48" /></linearGradient></defs>
            <path className="mountain-story__route-base" d={PATH} />
            <path className="mountain-story__route-progress" d={PATH} pathLength="1" style={{ strokeDashoffset: 1 - activeStage / 4 }} />
          </svg>

          <div className="mountain-story__walker" aria-hidden="true">
            <div className="mountain-story__walker-shadow" />
            <Image src="/brand/mountain-man.png" alt="" width={130} height={220} priority />
          </div>

          {STAGES.map((stage, index) => (
            <article key={stage.number} ref={(node) => { stageRefs.current[index] = node; }} data-stage={index} className={`mountain-story__stage is-${stage.side}${activeStage === index ? " is-active" : ""}`}>
              <div className="mountain-story__image" aria-hidden="true"><Image src={stage.image} alt="" fill sizes="190px" /></div>
              <button type="button" className="mountain-story__dot" onClick={() => setActiveStage(index)} aria-label={`فصل ${stage.number}: ${stage.title}`} aria-pressed={activeStage === index}><span>{stage.number}</span></button>
              <div className="mountain-story__card"><small>فصل {stage.number}</small><h3>{stage.title}</h3><p>{stage.text}</p></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
