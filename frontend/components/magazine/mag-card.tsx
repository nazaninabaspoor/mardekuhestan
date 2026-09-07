import Image from "next/image";
import Link from "next/link";

import type { MagPinData } from "@/lib/content/magazine-feed";

const BLOBS = [
  "M22 38C6 78 8 150 28 222C50 302 108 328 158 296C210 262 214 176 190 104C168 40 92 10 22 38Z",
  "M48 16C12 44 2 128 26 214C52 308 128 336 176 282C224 228 216 118 172 52C132 4 88 -2 48 16Z",
  "M16 72C4 120 18 198 54 258C96 328 168 322 196 250C224 176 206 88 150 42C96 0 36 20 16 72Z",
  "M34 28C8 70 16 160 46 236C78 318 150 330 188 268C226 204 208 112 164 58C118 8 72 0 34 28Z",
] as const;

function Sparkle({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 0 13.8 9.2 24 12 13.8 14.8 12 24 10.2 14.8 0 12 10.2 9.2Z" />
    </svg>
  );
}

export function MagPin({ pin, priority = false }: { pin: MagPinData; priority?: boolean }) {
  return (
    <Link href={pin.href} className={`mk-poster mk-poster--${pin.tone} mk-poster--v${pin.variant}`}>
      <span className="mk-poster-stage" />
      <svg className="mk-poster-blob" viewBox="0 0 220 340" preserveAspectRatio="none" aria-hidden="true">
        <path d={BLOBS[pin.variant - 1]} />
      </svg>
      <Sparkle className="mk-spark mk-spark--a" />
      <Sparkle className="mk-spark mk-spark--b" />
      <div className="mk-poster-copy">
        {pin.category ? <p>{pin.category}</p> : null}
        <h3>{pin.title}</h3>
        {pin.excerpt ? <span>{pin.excerpt}</span> : null}
        <em>خواندن</em>
      </div>
      <div className="mk-poster-photo">
        <Image
          src={pin.image}
          alt={pin.title}
          fill
          priority={priority}
          sizes="(max-width: 700px) 50vw, 20vw"
        />
      </div>
    </Link>
  );
}

export function MagMasonry({ pins }: { pins: MagPinData[] }) {
  return (
    <div className="mk-posters">
      {pins.map((pin, index) => (
        <MagPin key={pin.href} pin={pin} priority={index < 5} />
      ))}
    </div>
  );
}
