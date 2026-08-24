"use client";

import Image from "next/image";
import { useState } from "react";

type Stage = {
  id: number;
  number: string;
  title: string;
  short: string;
  description: string;
  image: string;
};

const STAGES: Stage[] = [
  {
    id: 1,
    number: "01",
    title: "از کوهستان",
    short: "آغاز راهی پاک",
    description: "سفر مرد کوهستان از دامنه‌های میشو آغاز می‌شود؛ جایی که طبیعت، اصالت و شروع یک مسیر سالم در کنار هم قرار می‌گیرند.",
    image: "/brand/our-way-01-climb.png",
  },
  {
    id: 2,
    number: "02",
    title: "کنار مرتع",
    short: "دام سالم، زمین سبز",
    description: "در مرتع، سلامت دام و کیفیت طبیعت پایه انتخاب درست است. اینجا کیفیت از زمین و زندگی واقعی شروع می‌شود.",
    image: "/brand/stage-02.png",
  },
  {
    id: 3,
    number: "03",
    title: "با دقت",
    short: "انتخاب درست، دست هنرمند",
    description: "در این مرحله، انتخاب مواد اولیه و دقت در آماده‌سازی، شخصیت و کیفیت نهایی برند را شکل می‌دهد.",
    image: "/brand/our-way-03-quality.png",
  },
  {
    id: 4,
    number: "04",
    title: "سفره‌خانه",
    short: "گرم، ساده، دور هم",
    description: "محصول وقتی معنا پیدا می‌کند که کنار خانواده، روی سفره و در لحظه‌های واقعی زندگی قرار بگیرد.",
    image: "/brand/our-way-04-balance.png",
  },
  {
    id: 5,
    number: "05",
    title: "یک قدم بعد",
    short: "راه سبز ادامه دارد",
    description: "مرد کوهستان فقط یک شروع نیست؛ این مسیر ادامه دارد و هر قدم آن به آینده‌ای سالم‌تر و اصیل‌تر می‌رسد.",
    image: "/brand/our-way-05-ahead.png",
  },
];

export function OurWaySimple() {
  const [activeId, setActiveId] = useState(1);
  const activeStage = STAGES.find((stage) => stage.id === activeId) ?? STAGES[0];

  return (
    <section className="simple-roadmap" aria-labelledby="simple-roadmap-title">
      <div className="simple-roadmap__bg" aria-hidden="true">
        <Image src="/brand/misho-clean.png" alt="" fill priority unoptimized sizes="100vw" className="simple-roadmap__bg-image" />
        <div className="simple-roadmap__overlay" />
      </div>

      <div className="simple-roadmap__container">
        <header className="simple-roadmap__header">
          <span className="simple-roadmap__eyebrow">نقشه راه برند</span>
          <h2 id="simple-roadmap-title" className="simple-roadmap__title">سفر مرد کوهستان</h2>
          <p className="simple-roadmap__subtitle">از دامنه‌های میشو تا رسیدن به کیفیتی که روی سفره می‌آید</p>
        </header>

        <div className="simple-roadmap__content">
          <div className="simple-roadmap__timeline" aria-label="مراحل سفر">
            <div className="simple-roadmap__line" aria-hidden="true" />
            {STAGES.map((stage, index) => {
              const isActive = activeStage.id === stage.id;
              return (
                <div key={stage.id} className={`simple-roadmap__item ${index % 2 === 0 ? "is-left" : "is-right"}${isActive ? " is-active" : ""}`}>
                  <button type="button" className="simple-roadmap__dot" onClick={() => setActiveId(stage.id)} aria-label={`مرحله ${stage.number}: ${stage.title}`} aria-pressed={isActive}>
                    <span>{stage.id}</span>
                  </button>
                  <button type="button" className="simple-roadmap__card" onClick={() => setActiveId(stage.id)} aria-pressed={isActive}>
                    <span className="simple-roadmap__card-number">{stage.number}</span>
                    <h3>{stage.title}</h3>
                    <p>{stage.short}</p>
                  </button>
                </div>
              );
            })}
          </div>

          <aside className="simple-roadmap__detail" aria-live="polite">
            <div className="simple-roadmap__detail-card" key={activeStage.id}>
              <span className="simple-roadmap__detail-badge">فصل {activeStage.number}</span>
              <h3>{activeStage.title}</h3>
              <p>{activeStage.description}</p>
              <strong>{activeStage.short}</strong>
              <div className="simple-roadmap__detail-image">
                <Image src={activeStage.image} alt={activeStage.title} fill sizes="170px" className="simple-roadmap__detail-image-tag" />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
