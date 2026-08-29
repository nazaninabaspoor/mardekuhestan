import { FooterContent } from "@/components/footer-content";
import { FooterSceneImage } from "@/components/footer-scene-image";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-scene" aria-hidden="true">
        <FooterSceneImage />
      </div>

      <div className="footer-body">
        <FooterContent />
      </div>
    </footer>
  );
}
