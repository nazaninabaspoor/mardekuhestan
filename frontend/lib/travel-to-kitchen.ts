export type TravelTarget = "kitchen" | "catalogs";

export const TRAVEL_SECTION_KEY = "mk_travel_section";
export const TRAVEL_KITCHEN_KEY = "mk_travel_kitchen";

const TARGETS: Record<TravelTarget, { id: string }> = {
  kitchen: { id: "for-home-kitchen" },
  catalogs: { id: "v2-catalogs" },
};

function headerHeight() {
  const header = document.querySelector<HTMLElement>(".site-header--v2");
  if (header) return Math.round(header.getBoundingClientRect().height);
  const token = getComputedStyle(document.documentElement).getPropertyValue("--v2-header-h");
  return Number.parseFloat(token) || 88;
}

function placeSection(id: string) {
  const section = document.getElementById(id);
  if (!section) return false;
  const top = window.scrollY + section.getBoundingClientRect().top - headerHeight();
  window.scrollTo({ top: Math.max(0, Math.round(top)), behavior: "auto" });
  return true;
}

export function travelToSection(target: TravelTarget) {
  return placeSection(TARGETS[target].id);
}

export function markSectionTravel(target: TravelTarget) {
  try {
    sessionStorage.setItem(TRAVEL_SECTION_KEY, target);
  } catch {
    // ignore
  }
}

export function consumeSectionTravel(): TravelTarget | null {
  try {
    const next = sessionStorage.getItem(TRAVEL_SECTION_KEY);
    sessionStorage.removeItem(TRAVEL_SECTION_KEY);
    sessionStorage.removeItem(TRAVEL_KITCHEN_KEY);
    if (next === "kitchen" || next === "catalogs") return next;
    return null;
  } catch {
    return null;
  }
}

export function travelToKitchenSection() {
  return travelToSection("kitchen");
}

export function markKitchenTravel() {
  markSectionTravel("kitchen");
}

export function consumeKitchenTravel() {
  return consumeSectionTravel() === "kitchen";
}
