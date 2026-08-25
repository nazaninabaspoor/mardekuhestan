import type { Metadata } from "next";

import { ComingSoonSection } from "@/components/coming-soon-section";
import { ForHomeSection } from "@/components/for-home-section";
import { LatestArticlesSection } from "@/components/latest-articles-section";
import { OurWaySection } from "@/components/our-way-section";
import { V2HeroSection } from "@/components/v2/v2-hero-section";
import { V2PageEffects } from "@/components/v2/v2-page-effects";

import "./v2.css";

export const metadata: Metadata = {
  title: "مرد کوهستان | نسخهٔ آزمایشی کارفرما",
  description:
    "نسخهٔ جدا از صفحهٔ اصلی برای آزمایش تغییرات — صفحهٔ اصلی دست‌نخورده می‌ماند.",
  robots: { index: false, follow: false },
};

/**
 * Exact structural clone of `/` for employer experiments.
 * Leave `app/page.tsx` alone — change this route only.
 */
export default function HomeV2Page() {
  return (
    <>
      <V2PageEffects />
      <main className="home-main home-v2">
        <V2HeroSection />
        <ForHomeSection />
        <OurWaySection />
        <ComingSoonSection />
        <LatestArticlesSection />
      </main>
    </>
  );
}
