"use client";

import Image from "next/image";
import Link from "next/link";

const OX = "/brand/preview-ogenix";

/**
 * Preview-only first section — structure & motion from Ogenix main-slider,
 * Marde Kuhestan colors / type / copy only. Never used on `/`.
 */
export function PreviewHeroMilka() {
  return (
    <section className="preview-hero" aria-labelledby="preview-hero-title">
      <div
        className="preview-hero-bg-shape"
        style={{ backgroundImage: `url(${OX}/bg-shape.png)` }}
        aria-hidden="true"
      />
      <div
        className="preview-hero-bg-shape-two"
        style={{ backgroundImage: `url(${OX}/bg-shape-two.png)` }}
        aria-hidden="true"
      />

      <div className="preview-hero-shape preview-hero-shape--1 float-bob-y" aria-hidden="true">
        <Image src={`${OX}/shape-1.png`} alt="" width={120} height={120} />
      </div>
      <div className="preview-hero-shape preview-hero-shape--2 float-bob-x" aria-hidden="true">
        <Image src={`${OX}/shape-2.png`} alt="" width={90} height={90} />
      </div>
      <div className="preview-hero-shape preview-hero-shape--3 float-bob-x" aria-hidden="true">
        <Image src={`${OX}/shape-3.png`} alt="" width={70} height={70} />
      </div>
      <div className="preview-hero-shape preview-hero-shape--4 float-bob-y" aria-hidden="true">
        <Image src={`${OX}/shape-4.png`} alt="" width={220} height={180} />
      </div>
      <div className="preview-hero-shape preview-hero-shape--5 zoominout" aria-hidden="true">
        <Image src={`${OX}/shape-5.png`} alt="" width={80} height={80} />
      </div>
      <div className="preview-hero-shape preview-hero-shape--6 float-bob-x" aria-hidden="true">
        <Image src={`${OX}/shape-6.png`} alt="" width={100} height={100} />
      </div>
      <div className="preview-hero-shape preview-hero-shape--7 float-bob-y" aria-hidden="true">
        <Image src={`${OX}/shape-7.png`} alt="" width={90} height={90} />
      </div>
      <div className="preview-hero-shape preview-hero-shape--8 float-bob-x" aria-hidden="true">
        <Image src={`${OX}/shape-8.png`} alt="" width={160} height={140} />
      </div>

      <div className="preview-hero-bowl" aria-hidden="false">
        <Image
          src={`${OX}/hero-bowl.png`}
          alt="سبد سبزیجات تازه"
          width={760}
          height={720}
          priority
          className="preview-hero-bowl-art img-bounce"
          sizes="(max-width: 900px) 78vw, 520px"
        />
      </div>

      <div className="preview-hero-stage">
        <div className="preview-hero-copy">
          <div className="preview-hero-shape preview-hero-shape--9 float-bob-y" aria-hidden="true">
            <Image src={`${OX}/shape-9.png`} alt="" width={180} height={80} />
          </div>
          <p className="preview-hero-kicker">فقط مسیر سبز را انتخاب کنید</p>
          <h1 id="preview-hero-title" className="preview-hero-title">
            غذای سالم را
            <br />
            آگاهانه انتخاب کنید.
          </h1>
          <div className="preview-hero-actions">
            <Link href="/way" className="preview-hero-btn preview-hero-btn--way">
              راه ما
            </Link>
            <Link href="/products" className="preview-hero-btn preview-hero-btn--shop">
              فروشگاه
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
