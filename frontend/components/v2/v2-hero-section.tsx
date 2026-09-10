"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { heroVideos, type HeroVideo } from "@/lib/v2-videos";

function HeroPreviewClip({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);

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

    const tryPlay = () => {
      void video.play().catch(() => undefined);
    };

    tryPlay();
    video.addEventListener("loadeddata", tryPlay);
    video.addEventListener("canplay", tryPlay);
    video.addEventListener("playing", tryPlay);

    const onVisible = () => {
      if (document.visibilityState === "visible") tryPlay();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      video.removeEventListener("loadeddata", tryPlay);
      video.removeEventListener("canplay", tryPlay);
      video.removeEventListener("playing", tryPlay);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [src]);

  return (
    <video
      ref={ref}
      src={src}
      muted
      loop
      autoPlay
      playsInline
      preload="auto"
      controls={false}
      disablePictureInPicture
      disableRemotePlayback
      aria-hidden="true"
    />
  );
}

export function V2HeroSection() {
  const [active, setActive] = useState<HeroVideo>(heroVideos[0]);
  const [previous, setPrevious] = useState<HeroVideo | null>(null);
  const [videoReady, setVideoReady] = useState(true);
  const activeVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = activeVideoRef.current;
    if (!video) return;

    video.muted = true;

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      setVideoReady(true);
    }

    const playPromise = video.play();
    playPromise?.catch(() => {
      // Muted autoplay is requested again by the media events below.
    });
  }, [active.id]);

  useEffect(() => {
    if (!previous || !videoReady) return;
    const timer = window.setTimeout(() => setPrevious(null), 900);
    return () => window.clearTimeout(timer);
  }, [previous, videoReady]);

  function selectVideo(video: HeroVideo) {
    if (video.id === active.id) return;
    setPrevious(active);
    setVideoReady(false);
    setActive(video);
  }

  return (
    <section className="landing landing--v2" aria-labelledby="hero-title">
      <div className="landing-v2-stage">
        <div className="landing-v2-media">
          {active.id === "product" ? (
            <video
              key="product-ambient"
              className="landing-v2-video landing-v2-video--product-ambient"
              autoPlay
              muted
              loop
              playsInline
              preload="none"
              aria-hidden="true"
            >
              <source src={active.src} type="video/mp4" />
            </video>
          ) : null}
          {previous ? (
            <video
              key={`previous-${previous.id}`}
              className={`landing-v2-video${previous.id === "product" ? " landing-v2-video--product" : ""}${videoReady ? " is-leaving" : ""}`}
              autoPlay
              muted
              loop
              playsInline
              preload="none"
              aria-hidden="true"
            >
              <source src={previous.src} type="video/mp4" />
            </video>
          ) : null}
          <video
            key={active.id}
            ref={activeVideoRef}
            className={`landing-v2-video${active.id === "product" ? " landing-v2-video--product" : ""}${videoReady ? (previous ? " is-entering" : "") : " is-waiting"}`}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={active.poster}
            onLoadedData={() => setVideoReady(true)}
            onCanPlay={() => setVideoReady(true)}
            onPlaying={() => setVideoReady(true)}
            aria-label={`مرد کوهستان؛ ${active.label}`}
          >
            <source src={active.src} type="video/mp4" />
          </video>
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
                  return (
                    <button
                      key={video.id}
                      type="button"
                      className={`landing-v2-preview${selected ? " is-active" : ""}`}
                      aria-pressed={selected}
                      onClick={() => selectVideo(video)}
                    >
                      <HeroPreviewClip src={video.src} />
                      <span className="landing-v2-preview-shade" />
                      <span className="landing-v2-preview-index">{String(index + 1).padStart(2, "0")}</span>
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
