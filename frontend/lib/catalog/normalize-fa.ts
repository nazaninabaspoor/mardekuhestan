/** نرمال‌سازی فارسی/عربی برای جستجوی یکسان */
export function normalizeFa(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[\u200c\u200f\u202a-\u202e]/g, "")
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/ة/g, "ه")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ");
}

export function searchTokens(query: string): string[] {
  const normalized = normalizeFa(query);
  if (!normalized) return [];
  return normalized.split(" ").filter((token) => token.length > 0);
}

/** فقط نام‌هایی که با عبارت جستجو شروع می‌شوند (نه حرف دوم به بعد) */
export function matchesCatalogPrefix(name: string, query: string): boolean {
  const needle = normalizeFa(query);
  if (!needle) return false;
  return normalizeFa(name).startsWith(needle);
}
