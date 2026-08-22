import type { Metadata } from "next";

import { ComingSoonSection } from "@/components/coming-soon-section";
import { ForHomeSection } from "@/components/for-home-section";
import { FreshWaySection } from "@/components/fresh-way-section";
import { HeroSection } from "@/components/hero-section";
import { LatestArticlesSection } from "@/components/latest-articles-section";
import { OurWaySection } from "@/components/our-way-section";

export const metadata: Metadata = {
  title: "آزمایشگاه UI | مرد کوهستان",
  description:
    "نسخهٔ آزمایشی صفحهٔ اصلی برای الهام از تم Ogenix — صفحهٔ اصلی دست‌نخورده می‌ماند.",
  robots: { index: false, follow: false },
};

/**
 * Exact clone of `/` for UI experiments.
 * Apply Ogenix-inspired changes here only — leave `app/page.tsx` alone.
 */
export default function PlaygroundHomePage() {
  return (
    <main className="home-main">
      <HeroSection />
      <ForHomeSection />
      <FreshWaySection />
      <OurWaySection />
      <ComingSoonSection />
      <LatestArticlesSection />
    </main>
  );
}
