"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { heroVideos, type HeroVideo } from "@/lib/v2-videos";

const FIRST_HERO = heroVideos[0];

function HeroPreviewClip({ src, warm }: { src: string; warm: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [hasFrame, setHasFrame] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.controls = false;
    video.removeAttribute("poster");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");

    if (!warm) {
      video.removeAttribute("src");
      video.load();
      setHasFrame(false);
      return;
    }

    if (video.getAttribute("src") !== src) {
      video.setAttribute("src", src);
      video.load();
      setHasFrame(false);
    }

    const mark = () => setHasFrame(true);
    const tryPlay = () => {
      void video.play().catch(() => undefined);
    };

    tryPlay();
    video.addEventListener("loadeddata", mark);
    video.addEventListener("playing", mark);
    video.addEventListener("canplay", tryPlay);

    return () => {
      video.removeEventListener("loadeddata", mark);
      video.removeEventListener("playing", mark);
      video.removeEventListener("canplay", tryPlay);
    };
  }, [src, warm]);

  return (
    <video
      ref={ref}
      className={hasFrame ? "is-ready" : undefined}
      muted
      loop
      playsInline
      preload="none"
      controls={false}
      disablePictureInPicture
      disableRemotePlayback
      aria-hidden="true"
    />
  );
}

function PreviewPoster({ src }: { src: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      aria-hidden="true"
      loading="eager"
      decoding="async"
      className="is-ready"
    />
  );
}

export function V2HeroSection() {
  const [active, setActive] = useState<HeroVideo>(FIRST_HERO);
  const [previous, setPrevious] = useState<HeroVideo | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [warmPreviewId, setWarmPreviewId] = useState<string | null>(FIRST_HERO.id);
  const activeVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = activeVideoRef.current;
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.removeAttribute("poster");
    setVideoReady(false);

    if (video.src !== new URL(active.src, window.location.origin).href) {
      video.src = active.src;
      video.load();
    }

    const markReady = () => setVideoReady(true);
    const tryPlay = () => {
      void video.play().catch(() => undefined);
    };

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      markReady();
      tryPlay();
    }

    video.addEventListener("loadeddata", markReady);
    video.addEventListener("canplay", markReady);
    video.addEventListener("playing", markReady);
    video.addEventListener("canplay", tryPlay);
    tryPlay();

    return () => {
      video.removeEventListener("loadeddata", markReady);
      video.removeEventListener("canplay", markReady);
      video.removeEventListener("playing", markReady);
      video.removeEventListener("canplay", tryPlay);
    };
  }, [active.id, active.src]);

  useEffect(() => {
    if (!previous || !videoReady) return;
    const timer = window.setTimeout(() => setPrevious(null), 500);
    return () => window.clearTimeout(timer);
  }, [previous, videoReady]);

  function selectVideo(video: HeroVideo) {
    if (video.id === active.id) return;
    setWarmPreviewId(video.id);
    setPrevious(active);
    setVideoReady(false);
    setActive(video);
  }

  return (
    <section className="landing landing--v2" aria-labelledby="hero-title">
      <div className="landing-v2-stage">
        <div className="landing-v2-media">
          {/* Brand plate only — never stock/default photos under the hero. */}
          <div className="landing-v2-video landing-v2-video--plate" aria-hidden="true" />
          {previous ? (
            <video
              key={`previous-${previous.id}`}
              className={`landing-v2-video${previous.id === "product" ? " landing-v2-video--product" : ""}${videoReady ? " is-leaving" : ""}`}
              src={previous.src}
              autoPlay
              muted
              loop
              playsInline
              preload="none"
              aria-hidden="true"
            />
          ) : null}
          <video
            key={active.id}
            ref={activeVideoRef}
            className={`landing-v2-video${active.id === "product" ? " landing-v2-video--product" : ""}${videoReady ? (previous ? " is-entering" : " is-live") : " is-waiting"}`}
            src={active.src}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-label={`مرد کوهستان؛ ${active.label}`}
          />
          <div className="landing-v2-veil" aria-hidden="true" />
        </div>

        <div className="landing-v2-dock">
          <div className="landing-v2-copy">
            <h1 id="hero-title">این راه سبز است</h1>
            <div className="landing-v2-row">
              <p className="landing-v2-lead">از مزرعه تا سفره، مسیری که با اعتماد ساخته می‌شود.</p>
              <Link href="/#product-unveil" className="landing-v2-cta">
                <span key={active.id} className="landing-v2-cta-label">
                  {active.ctaLabel}
                </span>
              </Link>
            </div>
          </div>

          <div className="landing-v2-playlist" aria-label="انتخاب ویدیوی اصلی">
            <div className="landing-v2-playlist-track">
              {heroVideos.map((video, index) => {
                const selected = video.id === active.id;
                const warm = selected || warmPreviewId === video.id;
                return (
                  <button
                    key={video.id}
                    type="button"
                    className={`landing-v2-preview${selected ? " is-active" : ""}`}
                    aria-pressed={selected}
                    onClick={() => selectVideo(video)}
                    onMouseEnter={() => setWarmPreviewId(video.id)}
                    onFocus={() => setWarmPreviewId(video.id)}
                  >
                    <PreviewPoster src={video.poster} />
                    <HeroPreviewClip src={video.src} warm={warm} />
                    <span className="landing-v2-preview-shade" />
                    <span className="landing-v2-preview-index">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="landing-v2-preview-label">{video.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
