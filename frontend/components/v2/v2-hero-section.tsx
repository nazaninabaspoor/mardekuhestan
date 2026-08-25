"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { heroVideos, type HeroVideo } from "@/lib/v2-videos";

export function V2HeroSection() {
  const [active, setActive] = useState<HeroVideo>(heroVideos[0]);
  const [previous, setPrevious] = useState<HeroVideo | null>(null);

  useEffect(() => {
    if (!previous) return;
    const timer = window.setTimeout(() => setPrevious(null), 900);
    return () => window.clearTimeout(timer);
  }, [previous]);

  function selectVideo(video: HeroVideo) {
    if (video.id === active.id) return;
    setPrevious(active);
    setActive(video);
  }

  return (
    <section className="landing landing--v2" aria-labelledby="hero-title">
      <div className="landing-v2-stage">
        <div className="landing-v2-media">
          {previous ? (
            <video
              key={`previous-${previous.id}`}
              className="landing-v2-video is-leaving"
              autoPlay muted loop playsInline preload="metadata"
              poster={previous.poster}
              aria-hidden="true"
            >
              <source src={previous.src} type="video/mp4" />
            </video>
          ) : null}
          <video
            key={active.id}
            className={`landing-v2-video${previous ? " is-entering" : ""}`}
            autoPlay muted loop playsInline preload="metadata"
            poster={active.poster}
            aria-label={`مرد کوهستان؛ ${active.label}`}
          >
            <source src={active.src} type="video/mp4" />
          </video>
          <div className="landing-v2-veil" aria-hidden="true" />
        </div>

        <div className="shell landing-v2-shell">
          <div className="landing-v2-copy">
            <p className="landing-v2-eyebrow">مرد کوهستان</p>
            <h1 id="hero-title">این راه سبز است</h1>
            <p className="landing-v2-lead">از مزرعه تا سفره؛ مسیری که با اعتماد ساخته می‌شود.</p>
            <Link href="/chain" className="landing-v2-cta">شروع مسیر سبز</Link>
          </div>
        </div>

        <div className="landing-v2-playlist" aria-label="انتخاب ویدیوی اصلی">
          <div className="landing-v2-playlist-track">
            {heroVideos.map((video, index) => {
              const selected = video.id === active.id;
              return (
                <button
                  key={video.id}
                  type="button"
                  className={`landing-v2-preview${selected ? " is-active" : ""}`}
                  aria-pressed={selected}
                  onClick={() => selectVideo(video)}
                >
                  <video autoPlay muted loop playsInline preload="metadata" poster={video.poster} aria-hidden="true">
                    <source src={video.src} type="video/mp4" />
                  </video>
                  <span className="landing-v2-preview-shade" />
                  <span className="landing-v2-preview-index">{String(index + 1).padStart(2, "0")}</span>
                  <span className="landing-v2-preview-label">{video.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
