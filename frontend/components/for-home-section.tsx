import Image from "next/image";
import Link from "next/link";

import { PeakMark } from "@/components/brand-marks";
import { homeDoors } from "@/lib/brand";

export function ForHomeSection() {
  return (
    <section className="for-home" aria-labelledby="for-home-title">
      <div className="shell">
        <header className="for-home-head">
          <PeakMark className="for-home-peak" />
          <h2 id="for-home-title">چه به خانه می‌رسد</h2>
          <p className="for-home-lead">غذایی که می‌شود فهمید از کجا آمده.</p>
        </header>

        <nav className="for-home-doors" aria-label="برای خانه">
          {homeDoors.map((item) => (
            <Link key={item.href} href={item.href} className="for-home-door">
              <Image
                src={item.image}
                alt={item.alt}
                fill
                sizes="(max-width: 900px) 100vw, 50vw"
                style={{ objectPosition: item.position }}
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
