import type { Metadata } from "next";

import { ForHomeSection } from "@/components/for-home-section";
import { V2CatalogFlipbook } from "@/components/v2/v2-catalog-flipbook";
import { V2ComingSoonSection } from "@/components/v2/v2-coming-soon";
import { V2HeroSection } from "@/components/v2/v2-hero-section";
import { V2MagazineNotebook } from "@/components/v2/v2-magazine-notebook";
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
        <ForHomeSection variant="v2" />
        <V2ComingSoonSection />
        <V2MagazineNotebook />
        <V2CatalogFlipbook />
      </main>
    </>
  );
}
