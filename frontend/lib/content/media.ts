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

/**
 * CKEditor stores uploads as `/media/...` (Django). Rewrite those to the API host
 * so images work when the magazine runs on :3000.
 */
export function rewriteArticleHtmlMedia(html: string): string {
  if (!html) return "";
  const api = getApiBaseUrl().replace(/\/$/, "");
  let out = html;

  // Unescape accidental double-encoded HTML from pasting source into visual mode.
  if (
    /&lt;(?:p|h[1-6]|ul|ol|li|figure|img|div|strong|em)\b/i.test(out) &&
    !/<(?:p|h[1-6])\b/i.test(out)
  ) {
    out = out
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, "&");
  }

  out = out.replace(
    /\b(src|href|poster)=(["'])(\/media\/[^"']+)\2/gi,
    (_full, attr: string, quote: string, path: string) =>
      `${attr}=${quote}${api}${path}${quote}`,
  );
  out = out.replace(
    /\b(src|href|poster)=(["'])(media\/[^"']+)\2/gi,
    (_full, attr: string, quote: string, path: string) =>
      `${attr}=${quote}${api}/${path}${quote}`,
  );

  return out;
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

export function faqPairs(
  raw: Array<Record<string, string>> | undefined,
): Array<{ q: string; a: string }> {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      const q = item["سوال"] || item.question || item.q || "";
      const a = item["پاسخ"] || item.answer || item.a || "";
      return { q: String(q).trim(), a: String(a).trim() };
    })
    .filter((item) => item.q && item.a);
}
