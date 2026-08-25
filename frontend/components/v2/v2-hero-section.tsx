import Link from "next/link";

/**
 * Full-bleed landing hero for /v2 — two lines of voice, one CTA.
 */
export function V2HeroSection() {
  return (
    <section className="landing landing--v2" aria-labelledby="hero-title">
      <div className="landing-v2-stage">
        <div className="landing-v2-media">
          <video
            className="landing-v2-video"
            autoPlay
            muted
            loop
            playsInline
            poster="/brand/landing-way.png"
            aria-label="مرد کوهستان؛ منظرهٔ کوهستان از پنجره"
          >
            <source
              src="/brand/Man_opening_window_to_mountains_202608221109.mp4"
              type="video/mp4"
            />
          </video>
          <div className="landing-v2-veil" aria-hidden="true" />
        </div>

        <div className="shell landing-v2-shell">
          <div className="landing-v2-copy">
            <h1 id="hero-title">این راه سبز است</h1>
            <p className="landing-v2-lead">
              از مرتع تا سفرهٔ خانه؛ مسیری که می‌شود به آن اعتماد کرد.
            </p>
            <Link href="/chain" className="landing-v2-cta">
              شروع راه سبز
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
