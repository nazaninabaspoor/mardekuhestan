"use client";

const SCENE = {
  magazine: "/brand/v2/bookcase-morning-read-daylight.png",
  catalog: "/brand/v2/bookcase-morning-work-daylight.png",
} as const;

type V2BookcaseSceneProps = {
  variant?: "magazine" | "catalog";
};

export function V2BookcaseScene({ variant = "magazine" }: V2BookcaseSceneProps) {
  return (
    <div className={`v2-bookcase-scene v2-bookcase-scene--${variant}`} aria-hidden>
      {/* Regular img — Next fill + global max-width collapses this plate on mobile. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={SCENE[variant]} alt="" className="v2-bookcase-scene-img" />
      <span className="v2-bookcase-scene-veil" />
    </div>
  );
}
