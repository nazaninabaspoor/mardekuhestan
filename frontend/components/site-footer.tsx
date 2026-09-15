"use client";

import { usePathname } from "next/navigation";
import { FooterContent } from "@/components/footer-content";
import { FooterSceneImage } from "@/components/footer-scene-image";

export function SiteFooter() {
  const pathname = usePathname();

  // Hide footer on /profile and magazine pages
  if (pathname?.startsWith("/profile") || pathname?.startsWith("/magazine")) {
    return null;
  }

  return (
    <footer className="site-footer">
      <span className="v2-section-edge v2-section-edge--top" aria-hidden="true" />
      <div className="footer-scene" aria-hidden="true">
        <FooterSceneImage />
      </div>

      <div className="footer-body">
        <FooterContent />
      </div>
    </footer>
  );
}

