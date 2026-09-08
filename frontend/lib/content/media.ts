import { getApiBaseUrl } from "@/lib/api/config";

const FALLBACKS = [
  "/magazine/png/png-way-green.png",
  "/magazine/png/png-bread.png",
  "/magazine/png/png-honeycomb.png",
] as const;

export function resolveMediaUrl(path: string | null | undefined): string {
  const raw = (path || "").trim();
  if (!raw) return FALLBACKS[0];
  if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("/")) {
    if (raw.startsWith("/media/")) return `${getApiBaseUrl()}${raw}`;
    return raw;
  }
  return `${getApiBaseUrl()}/media/${raw.replace(/^\/+/, "")}`;
}

export function fallbackCover(seed = 0): string {
  return FALLBACKS[Math.abs(seed) % FALLBACKS.length];
}

export function articleCover(cover: string | null | undefined, seed = 0): string {
  if (cover) return resolveMediaUrl(cover);
  return fallbackCover(seed);
}

export function formatFaDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function faqPairs(raw: Array<Record<string, string>> | undefined): Array<{ q: string; a: string }> {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      const q = item["سوال"] || item.question || item.q || "";
      const a = item["پاسخ"] || item.answer || item.a || "";
      return { q: String(q).trim(), a: String(a).trim() };
    })
    .filter((item) => item.q && item.a);
}
