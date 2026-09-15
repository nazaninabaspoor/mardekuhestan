import type { ShowcaseProduct } from "@/components/product-showcase/ProductCard";

const PAIR_CATEGORIES: Record<string, string[]> = {
  "fresh-meat": ["farm", "dairy", "ready-meal", "agriculture", "ready"],
  seafood: ["farm", "dairy", "ready-meal", "agriculture"],
  dairy: ["farm", "ready-meal", "fresh-meat", "agriculture"],
  "ready-meal": ["dairy", "farm", "fresh-meat", "agriculture"],
  ready: ["dairy", "farm", "fresh-meat"],
  farm: ["dairy", "ready-meal", "fresh-meat"],
  agriculture: ["dairy", "ready", "fresh-meat"],
};

export type KitchenCompanionSeed = {
  id: string;
  name: string;
  image?: string | null;
  categoryId: string;
};

export function companionLine(name: string, categoryId: string): string {
  const lines: Record<string, string> = {
    "fresh-meat": `«${name}» از مرتع آمده. برای پختن روی سفره خانه معمولاً لبنیات تازه یا محصول مزرعه کنارش لازم می‌شود.`,
    seafood: `«${name}» سبک است. کنارش یک طعم از مزرعه یا یک غذای آماده مسیر را کامل می‌کند.`,
    dairy: `«${name}» روی میز خانه می‌نشیند. نان مسیر و محصول مزرعه معمولاً همان چیزی است که بعدش دست می‌رود.`,
    farm: `«${name}» از زمین آمده. لبنیات تازه یا یک وعده آماده معمولاً کنارش روی سفره جا می‌گیرد.`,
    agriculture: `«${name}» از زمین آمده. لبنیات تازه یا یک وعده آماده معمولاً کنارش روی سفره جا می‌گیرد.`,
    "ready-meal": `«${name}» برای روز شلوغ است. لبنیات یا گوشت تازه همان مسیر را تا سفره خانه ادامه می‌دهد.`,
    ready: `«${name}» برای روز شلوغ است. لبنیات یا گوشت تازه همان مسیر را تا سفره خانه ادامه می‌دهد.`,
  };
  return (
    lines[categoryId] ||
    `«${name}» در سبد است. این‌ها همان چیزهایی هستند که معمولاً کنارش روی سفره خانه لازم می‌شود.`
  );
}

export function relatedKitchenProducts(
  seed: KitchenCompanionSeed,
  productsByCategory: Record<string, ShowcaseProduct[]>,
  limit = 4,
): ShowcaseProduct[] {
  const preferred = PAIR_CATEGORIES[seed.categoryId] ?? Object.keys(productsByCategory);
  const picked: ShowcaseProduct[] = [];
  const seen = new Set<string>([seed.id, seed.name]);

  for (const categoryId of preferred) {
    for (const item of productsByCategory[categoryId] ?? []) {
      if (seen.has(item.id) || seen.has(item.name)) continue;
      seen.add(item.id);
      seen.add(item.name);
      picked.push(item);
      if (picked.length >= limit) return picked;
    }
  }

  if (picked.length < limit) {
    for (const items of Object.values(productsByCategory)) {
      for (const item of items) {
        if (seen.has(item.id) || seen.has(item.name)) continue;
        seen.add(item.id);
        seen.add(item.name);
        picked.push(item);
        if (picked.length >= limit) return picked;
      }
    }
  }

  return picked;
}
