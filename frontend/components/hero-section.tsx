import Image from "next/image";
import Link from "next/link";

import { PeakMark } from "@/components/brand-marks";

export function HeroSection() {
  return (
    <section className="landing" aria-labelledby="hero-title">
      <div className="shell">
        <div className="landing-stage">
          <div className="landing-grid">
            <figure className="landing-shot">
              <Image
                src="/brand/landing-home.png"
                alt="سفره خانه با غذای مرد کوهستان"
                fill
                priority
                sizes="(max-width: 900px) 100vw, 38vw"
              />
              <figcaption className="shot-caption">
                <h2>برای خانه</h2>
              </figcaption>
            </figure>

            <div className="landing-copy">
              <Image
                src="/brand/landing-way.png"
                alt=""
                fill
                priority
                sizes="(max-width: 900px) 100vw, 24vw"
              />
              <Link href="/chain" className="btn-primary hero-cta">
                شروع راه سبز
              </Link>
              <h1 id="hero-title">این راه سبز است</h1>
              <PeakMark className="copy-peak" />
            </div>

            <figure className="landing-shot">
              <Image
                src="/brand/landing-pasture.png"
                alt="دام در مرتع مرد کوهستان"
                fill
                sizes="(max-width: 900px) 100vw, 38vw"
              />
              <figcaption className="shot-caption">
                <h2>از مرتع</h2>
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
