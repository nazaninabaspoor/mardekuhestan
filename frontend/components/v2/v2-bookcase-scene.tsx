"use client";

import Image from "next/image";

const SCENE = {
  magazine: "/brand/v2/bookcase-morning-read.png",
  catalog: "/brand/v2/bookcase-morning-work.png",
} as const;

type V2BookcaseSceneProps = {
  variant?: "magazine" | "catalog";
};

/**
 * One full-bleed plate per section. Character is painted into the landscape.
 * 16:9 art, cover-cropped from the top so proportions never stretch.
 */
export function V2BookcaseScene({ variant = "magazine" }: V2BookcaseSceneProps) {
  return (
    <div className={`v2-bookcase-scene v2-bookcase-scene--${variant}`} aria-hidden>
      <Image
        src={SCENE[variant]}
        alt=""
        fill
        sizes="100vw"
        className="v2-bookcase-scene-img"
        priority={false}
        style={{ objectFit: "cover", objectPosition: "12% 100%" }}
      />
      <span className="v2-bookcase-scene-veil" />
    </div>
  );
}
