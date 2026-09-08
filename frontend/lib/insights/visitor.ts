const STORAGE_KEY = "mk_visitor_id";

export function getVisitorId(): string {
  if (typeof window === "undefined") return "ssr-visitor";
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing && existing.length >= 8) return existing.slice(0, 64);
    const created =
      window.crypto?.randomUUID?.() ||
      `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    window.localStorage.setItem(STORAGE_KEY, created);
    return created;
  } catch {
    return `v-${Date.now().toString(36)}`;
  }
}
