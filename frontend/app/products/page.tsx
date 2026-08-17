import Link from "next/link";

import { productShortcuts } from "@/lib/brand";

export default function ProductsPage() {
  return (
    <section className="inner">
      <div className="shell">
        <p className="inner-kicker">برای خانه</p>
        <h1>محصولات</h1>
        <p className="inner-lead">گوشت، لبنیات، ماهی و غذای آماده. از مزرعه می‌آید.</p>
        <nav className="inner-cards" aria-label="دسته‌ها">
          {productShortcuts.map((item) => (
            <Link key={item.href} href={item.href} className="inner-card">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
