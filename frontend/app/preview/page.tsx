import type { Metadata } from "next";

import { ComingSoonSection } from "@/components/coming-soon-section";
import { FreshWaySection } from "@/components/fresh-way-section";
import { LatestArticlesSection } from "@/components/latest-articles-section";
import { OurWaySection } from "@/components/our-way-section";
import { PreviewHeader } from "@/components/preview/preview-header";
import { PreviewHeroMilka } from "@/components/preview/preview-hero-milka";
import { PreviewProductsSection } from "@/components/preview/preview-products-section";

export const metadata: Metadata = {
  title: "پیش‌نمایش | مرد کوهستان",
  robots: { index: false, follow: false },
};

/**
 * Isolated experiment surface — changes here must never touch `/`.
 */
export default function HomePreviewPage() {
  return (
    <div className="preview-shell">
      <PreviewHeader />
      <main className="home-main preview-main">
        <PreviewHeroMilka />
        <PreviewProductsSection />
        <FreshWaySection />
        <OurWaySection />
        <ComingSoonSection />
        <LatestArticlesSection />
      </main>
    </div>
  );
}
