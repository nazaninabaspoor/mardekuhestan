export const TRAVEL_KITCHEN_KEY = "mk_travel_kitchen";

const TRAVEL_EVENT = "mk-travel-kitchen";
const REDUCED = "(prefers-reduced-motion: reduce)";
let travelLock = false;

function prefersReducedMotion() {
  return window.matchMedia(REDUCED).matches;
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function kitchenSection() {
  return document.getElementById("for-home-kitchen");
}

function headerHeight() {
  const header = document.querySelector<HTMLElement>(".site-header--v2");
  if (header) return Math.round(header.getBoundingClientRect().height);
  const token = getComputedStyle(document.documentElement).getPropertyValue("--v2-header-h");
  return Number.parseFloat(token) || 88;
}

function placeKitchen() {
  const section = kitchenSection();
  if (!section) return;
  const top = window.scrollY + section.getBoundingClientRect().top - headerHeight();
  window.scrollTo({ top: Math.max(0, Math.round(top)), behavior: "auto" });
}

function mountOverlay() {
  const existing = document.querySelector(".mk-kitchen-travel");
  existing?.remove();

  const overlay = document.createElement("div");
  overlay.className = "mk-kitchen-travel";
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML = `
    <div class="mk-kitchen-travel-mist"></div>
    <div class="mk-kitchen-travel-peak"></div>
    <div class="mk-kitchen-travel-word">
      <span>این راه سبز است</span>
      <i></i>
    </div>
  `;
  document.body.appendChild(overlay);
  // force layout so the enter class animates
  overlay.getBoundingClientRect();
  return overlay;
}

export function beginKitchenCover() {
  if (prefersReducedMotion()) return;
  const root = document.documentElement;
  root.classList.add("is-kitchen-travel");
  document.body.style.overflow = "hidden";
  const overlay = document.querySelector(".mk-kitchen-travel") ?? mountOverlay();
  overlay.classList.add("is-in");
}

async function playKitchenTravel() {
  const root = document.documentElement;
  const section = kitchenSection();
  if (!section) return;

  if (prefersReducedMotion()) {
    placeKitchen();
    return;
  }

  if (travelLock) return;
  travelLock = true;

  const alreadyCovered = document.querySelector<HTMLElement>(".mk-kitchen-travel.is-in");

  root.classList.add("is-kitchen-travel");
  const prevOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";

  const overlay = alreadyCovered ?? mountOverlay();
  if (!alreadyCovered) {
    overlay.classList.add("is-in");
    await wait(520);
  } else {
    await wait(160);
  }

  placeKitchen();
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

/** Play the cinematic drop into the products section. Home page only. */
export function travelToKitchenSection() {
  if (kitchenSection()) {
    void playKitchenTravel();
    return true;
  }
  return false;
}

/** Other pages: remember intent, then go home. */
export function markKitchenTravel() {
  try {
    sessionStorage.setItem(TRAVEL_KITCHEN_KEY, "1");
  } catch {
    // ignore
  }
  window.dispatchEvent(new CustomEvent(TRAVEL_EVENT));
}

export function consumeKitchenTravel() {
  try {
    if (sessionStorage.getItem(TRAVEL_KITCHEN_KEY) !== "1") return false;
    sessionStorage.removeItem(TRAVEL_KITCHEN_KEY);
    return true;
  } catch {
    return false;
  }
}
