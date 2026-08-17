import Link from "next/link";

import { productShortcuts, trustSignals } from "@/lib/brand";

export function ProofBar() {
  return (
    <section className="proof" aria-label="محصولات">
      <div className="shell">
        <p className="proof-trust">
          {trustSignals.map((item, index) => (
            <span key={item}>
              {index > 0 ? <span className="proof-dot" aria-hidden="true" /> : null}
              {item}
            </span>
          ))}
        </p>
        <nav className="proof-products" aria-label="دسته‌ها">
          {productShortcuts.map((item) => (
            <Link key={item.href} href={item.href} className="btn-outline">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
