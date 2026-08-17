import Image from "next/image";
import Link from "next/link";

import { PeakMark } from "@/components/brand-marks";
import { productShortcuts, trustSignals } from "@/lib/brand";

export function ForHomeSection() {
  return (
    <section className="for-home" aria-labelledby="for-home-title">
      <div className="shell">
        <header className="for-home-head">
          <PeakMark className="for-home-peak" />
          <h2 id="for-home-title">برای خانه</h2>
          <p className="for-home-lead">غذایی که می‌شود فهمید از کجا آمده.</p>
          <p className="for-home-trust">
            {trustSignals.map((item, index) => (
              <span key={item}>
                {index > 0 ? <span className="for-home-dot" aria-hidden="true" /> : null}
                {item}
              </span>
            ))}
          </p>
        </header>

        <nav className="for-home-grid" aria-label="برای خانه">
          {productShortcuts.map((item) => (
            <Link key={item.href} href={item.href} className="for-home-card">
              <Image
                src={item.image}
                alt={item.alt}
                fill
                sizes="(max-width: 700px) 100vw, 50vw"
              />
              <span className="for-home-copy">
                <h3>{item.label}</h3>
                <p>{item.line}</p>
              </span>
            </Link>
          ))}
        </nav>

        <p className="for-home-more">
          <Link href="/products">همه محصولات</Link>
        </p>
      </div>
    </section>
  );
}
