import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <p className="footer-mark">این راه سبز است</p>
        <nav aria-label="تماس">
          <Link href="/contact">تماس</Link>
          <a href="tel:02156443394">۰۲۱ ۵۶۴۴۳۳۹۴</a>
        </nav>
      </div>
    </footer>
  );
}
