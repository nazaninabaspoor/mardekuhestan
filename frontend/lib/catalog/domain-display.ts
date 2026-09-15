/** Brand visuals keyed by backend `frontend_query_key`. */
export const DOMAIN_DISPLAY: Record<
  string,
  { emoji: string; tint: string; plateImage: string }
> = {
  "fresh-meat": { emoji: "🥩", tint: "#903828", plateImage: "/brand/home-meat.png" },
  seafood: { emoji: "🐟", tint: "#204078", plateImage: "/brand/home-seafood.png" },
  sausage: { emoji: "🌭", tint: "#BE6516", plateImage: "/brand/home-ready.png" },
  "ready-to-cook": { emoji: "🍳", tint: "#861309", plateImage: "/brand/home-ready.png" },
  ready: { emoji: "🍲", tint: "#005B48", plateImage: "/brand/home-ready.png" },
  dairy: { emoji: "🧀", tint: "#86C2EB", plateImage: "/brand/home-dairy.png" },
  agriculture: { emoji: "🌿", tint: "#50AF47", plateImage: "/brand/home-dairy.png" },
  bakery: { emoji: "🥖", tint: "#BE6516", plateImage: "/brand/home-ready.png" },
};

export const DEFAULT_DOMAIN_DISPLAY = {
  emoji: "🍃",
  tint: "#005B48",
  plateImage: "/brand/home-meat.png",
} as const;

/** Maps API frontend keys to tone palette keys in for-home-section. */
export const TONE_DOOR_KEY: Record<string, string> = {
  agriculture: "farm",
  "ready-to-cook": "cook-ready",
  ready: "ready-meal",
};

export function domainDisplay(frontendQueryKey: string) {
  return DOMAIN_DISPLAY[frontendQueryKey] ?? DEFAULT_DOMAIN_DISPLAY;
}

export function toneDoorKey(frontendQueryKey: string): string {
  return TONE_DOOR_KEY[frontendQueryKey] ?? frontendQueryKey;
}
