const DEFAULT_API_BASE = "http://127.0.0.1:8000";

/** Django REST base — server-side fetch (no CORS). */
export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  return (raw || DEFAULT_API_BASE).replace(/\/$/, "");
}

export const DEFAULT_SALES_CHANNEL =
  process.env.NEXT_PUBLIC_SALES_CHANNEL?.trim() || "b2c";

export const CATALOG_REVALIDATE_SECONDS = 60;
