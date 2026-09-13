import type { MagazineBoard } from "@/data/magazine-issue";
import { magazineBoards as staticBoards } from "@/data/magazine-issue";
import {
  getMagazinePageSettings,
  listCategories,
  unwrapResults,
} from "@/lib/api/content";
import type { ContentCategory, MagazinePageSettings } from "@/lib/api/content.types";
import { resolveMediaUrl } from "@/lib/content/media";

const FALLBACK_IMAGES: Record<string, string> = {
  "rah-ma": "/magazine/png/png-way-green.png",
  "masir-ghaza": "/magazine/png/png-lamb-chops.png",
  "zendegi-khane": "/magazine/png/png-bread.png",
  mazraeh: "/magazine/png/png-sheep.png",
};

export const defaultMagazinePage: MagazinePageSettings = {
  hero_eyebrow: "مجله مرد کوهستان",
  hero_title: "این راه سبز است",
  search_placeholder: "در مجله بگردید یک مسیر و یک طعم و یک نوشته",
};

export function categoryToBoard(category: ContentCategory): MagazineBoard {
  const raw = (category.image || "").trim();
  const image = raw
    ? resolveMediaUrl(raw)
    : FALLBACK_IMAGES[category.slug] || "/magazine/png/png-way-green.png";
  return {
    slug: category.slug,
    name: category.name,
    description: category.description || "",
    image,
  };
}

export async function loadMagazineBoards(): Promise<MagazineBoard[]> {
  try {
    const payload = await listCategories({ magazineOnly: true });
    const categories = unwrapResults(payload).filter(
      (item) => item.is_active !== false && item.show_on_magazine !== false,
    );
    if (!categories.length) return staticBoards;
    return categories
      .slice()
      .sort((a, b) => (a.sort_order ?? 100) - (b.sort_order ?? 100))
      .map(categoryToBoard);
  } catch {
    return staticBoards;
  }
}

export async function loadMagazinePage(): Promise<MagazinePageSettings> {
  try {
    return await getMagazinePageSettings();
  } catch {
    return defaultMagazinePage;
  }
}
