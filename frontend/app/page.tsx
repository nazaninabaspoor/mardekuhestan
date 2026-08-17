import { HeroSection } from "@/components/hero-section";
import { ProofBar } from "@/components/proof-bar";

export default function HomePage() {
  return (
    <main>
      <a className="skip-link btn-accent" href="#hero-title">
        رفتن به محتوای اصلی
      </a>
      <HeroSection />
      <ProofBar />
    </main>
  );
}
