import { ContourField } from "@/components/brand-marks";
import { ForHomeSection } from "@/components/for-home-section";
import { HeroSection } from "@/components/hero-section";
import { LatestArticlesSection } from "@/components/latest-articles-section";

export default function HomePage() {
  return (
    <main className="home-main">
      <ContourField className="site-contour" />
      <a className="skip-link btn-accent" href="#hero-title">
        رفتن به محتوای اصلی
      </a>
      <HeroSection />
      <ForHomeSection />
      <LatestArticlesSection />
    </main>
  );
}
