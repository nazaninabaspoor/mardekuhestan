import { homeCategoryProducts, type HomeDoorId } from "@/lib/brand";

/** frontend_query_key (API) → homeCategoryProducts */
export const API_KEY_TO_BRAND_KEY: Record<string, HomeDoorId> = {
  "fresh-meat": "fresh-meat",
  seafood: "seafood",
  sausage: "sausage",
  "ready-to-cook": "cook-ready",
  ready: "ready-meal",
  dairy: "dairy",
  agriculture: "farm",
  bakery: "bakery",
};

/** homeCategoryProducts → frontend_query_key (API / v2 tabs) */
export const BRAND_KEY_TO_API_KEY: Partial<Record<HomeDoorId, string>> = {
  "fresh-meat": "fresh-meat",
  seafood: "seafood",
  sausage: "sausage",
  "cook-ready": "ready-to-cook",
  "ready-meal": "ready",
  dairy: "dairy",
  farm: "agriculture",
  bakery: "bakery",
  poultry: "fresh-meat",
  frozen: "ready",
  breakfast: "dairy",
  condiments: "bakery",
  special: "fresh-meat",
};

const DOMAIN_LABELS: Partial<Record<HomeDoorId, string>> = {
  "fresh-meat": "گوشت",
  seafood: "دریایی",
  sausage: "سوسیس",
  "cook-ready": "آماده پخت",
  "ready-meal": "غذای آماده",
  dairy: "لبنیات",
  farm: "کشاورزی",
  bakery: "نان و آشپزی",
  poultry: "مرغ",
  frozen: "منجمد",
  breakfast: "صبحانه",
  condiments: "چاشنی",
  special: "ویژه",
};

export function brandKeyForApiDomain(frontendKey: string): HomeDoorId | undefined {
  return API_KEY_TO_BRAND_KEY[frontendKey];
}

export function apiKeyForBrandKey(brandKey: HomeDoorId): string {
  return BRAND_KEY_TO_API_KEY[brandKey] ?? brandKey;
}

export function brandCategoryItems(frontendKey: string) {
  const brandKey = brandKeyForApiDomain(frontendKey);
  if (!brandKey) return [];
  return homeCategoryProducts[brandKey] ?? [];
}

export function domainLabelForBrandKey(brandKey: HomeDoorId): string {
  return DOMAIN_LABELS[brandKey] ?? brandKey;
}
