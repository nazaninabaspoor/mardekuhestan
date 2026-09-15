import { apiFetch } from "@/lib/api/client";
import { getAccessToken, setAccessToken } from "@/lib/api/access-token";
import { refreshAccountSession } from "@/lib/api/auth";

export type AiQuota = {
  free_remaining: number;
  free_limit: number;
  paid_remaining: number;
  paid_pack_questions: number;
  pack_price_toman: number;
  can_ask: boolean;
  needs_payment: boolean;
  pricing_note?: string;
};

function fastapiBase(): string {
  const raw = process.env.NEXT_PUBLIC_FASTAPI_BASE_URL?.trim() || "http://127.0.0.1:8001";
  return raw.replace(/\/$/, "");
}

function wsBase(): string {
  const http = fastapiBase();
  if (http.startsWith("https://")) return `wss://${http.slice("https://".length)}`;
  if (http.startsWith("http://")) return `ws://${http.slice("http://".length)}`;
  return `ws://${http}`;
}

export function assistantWsUrl(token: string): string {
  return `${wsBase()}/api/v1/assistant/ws?token=${encodeURIComponent(token)}`;
}

export async function ensureAssistantAccessToken(): Promise<string | null> {
  try {
    const { access } = await refreshAccountSession();
    if (access) {
      setAccessToken(access);
      return access;
    }
  } catch {
    /* cached */
  }
  return getAccessToken();
}

export async function fetchAiQuota(): Promise<AiQuota> {
  return apiFetch<AiQuota>("/api/notifications/ai/quota/", {
    credentials: "include",
    revalidate: false,
  });
}

export async function registerWaitlist(input: {
  product_key: string;
  product_name: string;
  source?: string;
}): Promise<{ ok: boolean; created: boolean; message: string }> {
  return apiFetch("/api/notifications/waitlist/", {
    method: "POST",
    credentials: "include",
    revalidate: false,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      product_key: input.product_key,
      product_name: input.product_name,
      source: input.source || "product-unveil",
    }),
  });
}

export async function startAiCoachPayment(input?: {
  receiver_name?: string;
  receiver_phone?: string;
}): Promise<{
  payment_id: string;
  redirect_url: string;
  amount_toman: number;
  gateway: string;
}> {
  return apiFetch("/api/payments/start/", {
    method: "POST",
    credentials: "include",
    revalidate: false,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      gateway: "zarinpal",
      purpose: "ai_coach",
      receiver_name: input?.receiver_name || "",
      receiver_phone: input?.receiver_phone || "",
      shipping_address: "",
    }),
  });
}
