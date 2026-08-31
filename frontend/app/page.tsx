import { ComingSoonSection } from "@/components/coming-soon-section";
import { ForHomeSectionContainer } from "@/components/for-home-section-container";
import { HeroSection } from "@/components/hero-section";
import { LatestArticlesSection } from "@/components/latest-articles-section";
import { OurWaySection } from "@/components/our-way-section";

export default function HomePage() {
  return (
    <main className="home-main">
      <HeroSection />
      <ForHomeSectionContainer />
      <OurWaySection />
      <ComingSoonSection />
      <LatestArticlesSection />
    </main>
  );
}
