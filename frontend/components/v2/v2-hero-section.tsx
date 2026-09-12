"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { heroVideos, type HeroVideo } from "@/lib/v2-videos";

function HeroPreviewClip({ src, warm }: { src: string; warm: boolean }) {
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

    if (!warm) {
      video.removeAttribute("src");
      video.load();
      return;
    }

    if (video.getAttribute("src") !== src) {
      video.setAttribute("src", src);
      video.load();
    }

    const tryPlay = () => {
      void video.play().catch(() => undefined);
    };

    tryPlay();
    video.addEventListener("loadeddata", tryPlay);
    video.addEventListener("canplay", tryPlay);

    return () => {
      video.removeEventListener("loadeddata", tryPlay);
      video.removeEventListener("canplay", tryPlay);
    };
  }, [src, warm]);

  return (
    <video
      ref={ref}
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

export function V2HeroSection() {
  const [active, setActive] = useState<HeroVideo>(heroVideos[0]);
  const [previous, setPrevious] = useState<HeroVideo | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [mediaArmed, setMediaArmed] = useState(false);
  const [warmPreviewId, setWarmPreviewId] = useState<string | null>(null);
  const activeVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      if (!cancelled) setMediaArmed(true);
    }, 320);
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (!mediaArmed) return;
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
  }, [active.id, mediaArmed]);

  useEffect(() => {
    if (!previous || !videoReady) return;
    const timer = window.setTimeout(() => setPrevious(null), 900);
    return () => window.clearTimeout(timer);
  }, [previous, videoReady]);

  function selectVideo(video: HeroVideo) {
    if (video.id === active.id) return;
    setMediaArmed(true);
    setPrevious(active);
    setVideoReady(false);
    setActive(video);
  }

  return (
    <section className="landing landing--v2" aria-labelledby="hero-title">
      <div className="landing-v2-stage">
        <div className="landing-v2-media">
          {mediaArmed && active.id === "product" ? (
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
          {mediaArmed && previous ? (
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
          {mediaArmed ? (
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
          ) : (
            // Poster first — arm video after idle so first paint stays light.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="landing-v2-video"
              src={active.poster}
              alt=""
              aria-hidden="true"
              fetchPriority="high"
            />
          )}
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
                  const warm = mediaArmed && (selected || warmPreviewId === video.id);
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
                      <HeroPreviewClip src={video.src} warm={warm} />
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
