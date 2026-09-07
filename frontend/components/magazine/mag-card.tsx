import Image from "next/image";
import Link from "next/link";

import type { MagPinData } from "@/lib/content/magazine-feed";

export function MagPin({ pin, priority = false }: { pin: MagPinData; priority?: boolean }) {
  return (
    <Link href={pin.href} className={`mk-pin mk-pin--${pin.height}`}>
      <div className="mk-pin-media">
        <Image
          src={pin.image}
          alt={pin.title}
          fill
          priority={priority}
          sizes="(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 20vw"
        />
        <div className="mk-pin-veil">
          {pin.category ? <span>{pin.category}</span> : null}
          <strong>خواندن</strong>
        </div>
      </div>
      <h3>{pin.title}</h3>
      {pin.excerpt ? <p>{pin.excerpt}</p> : null}
    </Link>
  );
}

export function MagMasonry({ pins }: { pins: MagPinData[] }) {
  return (
    <div className="mk-pin-masonry">
      {pins.map((pin, index) => (
        <MagPin key={pin.href} pin={pin} priority={index < 8} />
      ))}
    </div>
  );
}
