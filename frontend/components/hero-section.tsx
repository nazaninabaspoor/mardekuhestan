import Image from "next/image";
import Link from "next/link";

import { ContourField, MountainPattern, PeakMark } from "@/components/brand-marks";

export function HeroSection() {
  return (
    <section className="landing" aria-labelledby="hero-title">
      <div className="landing-backdrop" aria-hidden="true">
        <Image
          src="/brand/hero-atmosphere2.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="landing-backdrop-photo"
        />
        <div className="landing-backdrop-veil" />
      </div>
      <ContourField className="landing-contour" />
      <div className="shell">
        <div className="landing-stage">
          <div className="landing-grid">
            <Link href="#for-home-title" className="landing-shot">
              <div className="landing-shot-image">
                <span className="landing-shot-badge">برای خانه</span>
                <div className="landing-shot-frame">
                  <Image
                    src="/brand/landing-home.png"
                    alt="سفره خانه با غذای مرد کوهستان"
                    fill
                    priority
                    sizes="(max-width: 900px) 100vw, 38vw"
                    className="landing-shot-photo"
                  />
                </div>
              </div>
              <p className="landing-shot-name">سفرهٔ گرم و آماده</p>
            </Link>

            <div className="landing-center">
              <div className="landing-copy">
                <Image
                  src="/brand/landing-way.png"
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 900px) 100vw, 24vw"
                  className="landing-copy-photo"
                />
                <div className="landing-copy-plaque">
                  <h1 id="hero-title">این راه سبز است</h1>
                  <PeakMark className="copy-peak" />
                  <p className="landing-lead">از مرتع تا سفرهٔ خانه — مسیری که می‌شود به آن اعتماد کرد</p>
                  <Link href="/chain" className="btn-primary hero-cta">
                    شروع راه سبز
                  </Link>
                </div>
              </div>
              <p className="landing-center-foot" aria-hidden="true">
                &nbsp;
              </p>
            </div>

            <Link href="/chain" className="landing-shot">
              <div className="landing-shot-image">
                <span className="landing-shot-badge">از مرتع</span>
                <div className="landing-shot-frame">
                  <Image
                    src="/brand/landing-pasture.png"
                    alt="دام در مرتع مرد کوهستان"
                    fill
                    sizes="(max-width: 900px) 100vw, 38vw"
                    className="landing-shot-photo"
                  />
                </div>
              </div>
              <p className="landing-shot-name">آرام و روشن</p>
            </Link>
          </div>
        </div>
      </div>
      <MountainPattern />
    </section>
  );
}
