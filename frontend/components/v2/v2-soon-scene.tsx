"use client";

import Image from "next/image";

const SOON_SCENE = "/brand/v2/v2-soon-mountain-stage.png";

/**
 * Full-bleed mountain stage — same stack as V2BookcaseScene.
 */
export function V2SoonScene() {
  return (
    <div className="v2-bookcase-scene v2-bookcase-scene--soon" aria-hidden>
      <Image
        src={SOON_SCENE}
        alt=""
        fill
        sizes="100vw"
        quality={95}
        className="v2-bookcase-scene-img"
        priority={false}
        style={{ objectFit: "cover", objectPosition: "50% 56%" }}
      />
      <span className="v2-bookcase-scene-veil" />
    </div>
  );
}
