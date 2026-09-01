import type { Metadata } from "next";

import { ForHomeKitchenContainer } from "@/components/v2/for-home-kitchen-container";
import { V2CatalogFlipbook } from "@/components/v2/v2-catalog-flipbook";
import { V2ComingSoonSection } from "@/components/v2/v2-coming-soon";
import { V2HeroSection } from "@/components/v2/v2-hero-section";
import { V2MagazineNotebook } from "@/components/v2/v2-magazine-notebook";
import { V2PageEffects } from "@/components/v2/v2-page-effects";

export const metadata: Metadata = {
  title: "مرد کوهستان | این راه سبز است",
  description:
    "صنایع غذایی مرد کوهستان. از مزرعه و مرتع تا سفرهٔ خانه.",
};

export default function HomePage() {
  return (
    <>
      <V2PageEffects />
      <main className="home-main home-v2">
        <V2HeroSection />
        <ForHomeKitchenContainer />
        <V2ComingSoonSection />
        <V2MagazineNotebook />
        <V2CatalogFlipbook />
      </main>
    </>
  );
}
