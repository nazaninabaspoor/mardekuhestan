import { ForHomeSection } from "@/components/for-home-section";
import { HeroSection } from "@/components/hero-section";
import { LatestArticlesSection } from "@/components/latest-articles-section";
import { OurWaySection } from "@/components/our-way-section";

export default function HomePage() {
  return (
    <main className="home-main">
      <HeroSection />
      <ForHomeSection />
      <OurWaySection />
      <LatestArticlesSection />
    </main>
  );
}
