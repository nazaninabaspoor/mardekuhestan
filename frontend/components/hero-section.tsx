import Image from "next/image";
import Link from "next/link";

import { PeakMark } from "@/components/brand-marks";

export function HeroSection() {
  return (
    <section className="landing" aria-labelledby="hero-title">
      <div className="shell">
        <div className="landing-stage">
          <div className="landing-grid">
            <Link
              href="#for-home-title"
              className="landing-shot landing-shot--home"
              aria-label="برای خانه — سفرهٔ گرم و آماده"
            >
              <div className="landing-panel landing-media-panel">
                <div className="landing-panel-frame landing-media-frame">
                  <div className="landing-media-slot">
                    <video
                      className="landing-media-video"
                      autoPlay
                      muted
                      loop
                      playsInline
                      poster="/brand/landing-home.png"
                      aria-hidden="true"
                    >
                      <source
                        src="/brand/Pin%20on%20Come%20with%20me%20%E2%9C%A8.mp4"
                        type="video/mp4"
                      />
                    </video>
                  </div>
                </div>
              </div>
              <div className="landing-panel-caption">
                <p className="landing-panel-kicker">برای خانه</p>
                <p className="landing-panel-title">سفرهٔ گرم و آماده</p>
              </div>
            </Link>

            <div className="landing-center">
              <div className="landing-panel landing-copy landing-media-panel">
                <div className="landing-panel-frame landing-media-frame landing-copy-frame">
                  <div className="landing-media-slot">
                    <Image
                      src="/brand/%23road%20%23gloomy%20%23forest.jpg"
                      alt=""
                      fill
                      priority
                      sizes="(max-width: 900px) 100vw, 24vw"
                      className="landing-media-cover landing-copy-photo"
                    />
                  </div>
                  <div className="landing-copy-vignette" aria-hidden="true" />
                </div>
                <div className="landing-copy-body">
                  <div className="landing-copy-statement">
                    <h1 id="hero-title">این راه سبز است</h1>
                    <PeakMark className="copy-peak" aria-hidden="true" />
                    <p className="landing-lead">
                      <span className="landing-lead-line">از مرتع تا سفرهٔ خانه</span>
                      <span className="landing-lead-line landing-lead-line--trust">
                        مسیری که می‌شود به آن اعتماد کرد
                      </span>
                    </p>
                  </div>
                  <div className="landing-copy-foot">
                    <Link href="/chain" className="hero-cta">
                      <span className="hero-cta-glow" aria-hidden="true" />
                      <span className="hero-cta-inner">
                        <PeakMark className="hero-cta-mark" aria-hidden="true" />
                        <span className="hero-cta-text">شروع راه سبز</span>
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="landing-panel-caption landing-panel-caption--center">
                <p className="landing-panel-kicker">مرد کوهستان</p>
                <p className="landing-panel-title">مسیر قابل اعتماد</p>
              </div>
            </div>

            <Link
              href="/chain"
              className="landing-shot landing-shot--pasture"
              aria-label="از مرتع — آرام و روشن"
            >
              <div className="landing-panel landing-media-panel">
                <div className="landing-panel-frame landing-media-frame">
                  <div className="landing-media-slot">
                    <video
                      className="landing-media-video"
                      autoPlay
                      muted
                      loop
                      playsInline
                      poster="/brand/landing-pasture.png"
                      aria-label="مرد کوهستان؛ پنجره رو به کوهستان"
                    >
                      <source
                        src="/brand/Man_opening_window_to_mountains_202608221109.mp4"
                        type="video/mp4"
                      />
                    </video>
                  </div>
                </div>
              </div>
              <div className="landing-panel-caption">
                <p className="landing-panel-kicker">از مرتع</p>
                <p className="landing-panel-title">آرام و روشن</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
