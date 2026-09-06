export type TravelTarget = "kitchen" | "catalogs";

export const TRAVEL_SECTION_KEY = "mk_travel_section";
export const TRAVEL_KITCHEN_KEY = "mk_travel_kitchen";

const TARGETS: Record<TravelTarget, { id: string; word: string }> = {
  kitchen: { id: "for-home-kitchen", word: "این راه سبز است" },
  catalogs: { id: "v2-catalogs", word: "کاتالوگ مرد کوهستان" },
};

const REDUCED = "(prefers-reduced-motion: reduce)";
let travelLock = false;

function prefersReducedMotion() {
  return window.matchMedia(REDUCED).matches;
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function headerHeight() {
  const header = document.querySelector<HTMLElement>(".site-header--v2");
  if (header) return Math.round(header.getBoundingClientRect().height);
  const token = getComputedStyle(document.documentElement).getPropertyValue("--v2-header-h");
  return Number.parseFloat(token) || 88;
}

function placeSection(id: string) {
  const section = document.getElementById(id);
  if (!section) return;
  const top = window.scrollY + section.getBoundingClientRect().top - headerHeight();
  window.scrollTo({ top: Math.max(0, Math.round(top)), behavior: "auto" });
}

function mountOverlay(word: string) {
  const existing = document.querySelector(".mk-kitchen-travel");
  existing?.remove();

  const overlay = document.createElement("div");
  overlay.className = "mk-kitchen-travel";
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML = `
    <div class="mk-kitchen-travel-mist"></div>
    <div class="mk-kitchen-travel-peak"></div>
    <div class="mk-kitchen-travel-word">
      <span>${word}</span>
      <i></i>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.getBoundingClientRect();
  return overlay;
}

export function beginSectionCover(target: TravelTarget) {
  if (prefersReducedMotion()) return;
  const root = document.documentElement;
  root.classList.add("is-kitchen-travel");
  document.body.style.overflow = "hidden";
  const overlay = document.querySelector(".mk-kitchen-travel") ?? mountOverlay(TARGETS[target].word);
  overlay.classList.add("is-in");
}

async function playSectionTravel(target: TravelTarget) {
  const dest = TARGETS[target];
  const root = document.documentElement;
  const section = document.getElementById(dest.id);
  if (!section) return;

  if (prefersReducedMotion()) {
    placeSection(dest.id);
    return;
  }

  if (travelLock) return;
  travelLock = true;

  const alreadyCovered = document.querySelector<HTMLElement>(".mk-kitchen-travel.is-in");

  root.classList.add("is-kitchen-travel");
  const prevOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";

  const overlay = alreadyCovered ?? mountOverlay(dest.word);
  if (!alreadyCovered) {
    overlay.classList.add("is-in");
    await wait(520);
  } else {
    await wait(160);
  }

  placeSection(dest.id);
  section.classList.add("is-kitchen-arrived");

  await wait(140);
  overlay.classList.remove("is-in");
  overlay.classList.add("is-out");

  await wait(720);
  overlay.remove();
  document.body.style.overflow = prevOverflow;
  root.classList.remove("is-kitchen-travel");

  await wait(900);
  section.classList.remove("is-kitchen-arrived");
  travelLock = false;
}

export function travelToSection(target: TravelTarget) {
  if (document.getElementById(TARGETS[target].id)) {
    void playSectionTravel(target);
    return true;
  }
  return false;
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

export function beginKitchenCover() {
  beginSectionCover("kitchen");
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
