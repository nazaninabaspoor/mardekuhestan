import Image from "next/image";
import Link from "next/link";

import type { MagPinData } from "@/lib/content/magazine-feed";

const BLOB =
  "M24 22C8 48 10 110 18 188C28 268 70 322 110 328C158 334 198 292 208 214C218 132 204 52 164 24C118 -2 58 0 24 22Z";

function Diamond({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="none" stroke="currentColor" strokeWidth="1.8" d="M12 2.5 21.5 12 12 21.5 2.5 12Z" />
    </svg>
  );
}

export function MagPin({ pin, priority = false }: { pin: MagPinData; priority?: boolean }) {
  const src = pin.goods[0] || pin.image;
  return (
    <Link href={pin.href} className={`mk-poster mk-poster--${pin.tone}`}>
      <span className="mk-poster-stage" />
      <Diamond className="mk-spark mk-spark--a" />
      <Diamond className="mk-spark mk-spark--b" />
      <Diamond className="mk-spark mk-spark--c" />
      <div className="mk-poster-well">
        <svg className="mk-poster-blob" viewBox="0 0 220 340" preserveAspectRatio="none" aria-hidden="true">
          <path d={BLOB} />
        </svg>
        <div className="mk-poster-copy">
          {pin.category ? <p>{pin.category}</p> : null}
          <h3>{pin.title}</h3>
        </div>
        <div className="mk-poster-png">
          <Image src={src} alt="" width={800} height={800} priority={priority} sizes="(max-width: 700px) 46vw, 18vw" />
        </div>
        <em className="mk-poster-cta">خواندن</em>
      </div>
    </Link>
  );
}

export function MagMasonry({ pins, feed = false }: { pins: MagPinData[]; feed?: boolean }) {
  return (
    <div className="mk-posters" id={feed ? "mk-feed" : undefined}>
      {pins.map((pin, index) => (
        <MagPin key={pin.href} pin={pin} priority={index < 5} />
      ))}
    </div>
  );
}
