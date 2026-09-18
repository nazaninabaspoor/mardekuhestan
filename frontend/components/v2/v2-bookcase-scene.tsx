"use client";

type V2BookcaseSceneProps = {
  variant?: "magazine" | "catalog";
};

/**
 * Full-bleed plate via CSS background so the photo cannot collapse
 * under global `img { max-width: 100% }` / Next Image `fill` on mobile.
 */
export function V2BookcaseScene({ variant = "magazine" }: V2BookcaseSceneProps) {
  return (
    <div className={`v2-bookcase-scene v2-bookcase-scene--${variant}`} aria-hidden>
      <span className="v2-bookcase-scene-veil" />
    </div>
  );
}
