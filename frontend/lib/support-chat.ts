import { getAccessToken, setAccessToken } from "@/lib/api/access-token";
import { refreshAccountSession } from "@/lib/api/auth";

export type SupportMessage = {
  id: string;
  conversation_id: string;
  sender_role: "customer" | "staff" | "system";
  sender_user_id: number | null;
  body: string;
  client_message_id?: string | null;
  created_at: string;
};

export type SupportConversation = {
  id: string;
  status: string;
  customer_id: number;
  last_message_at: string | null;
  messages: SupportMessage[];
};

function siteOrigin(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin.replace(/\/$/, "");
  }
  return (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
}

function wsBase(): string {
  const http = siteOrigin();
  if (http.startsWith("https://")) return `wss://${http.slice("https://".length)}`;
  if (http.startsWith("http://")) return `ws://${http.slice("http://".length)}`;
  return "";
}

export function supportWsUrl(token: string): string {
  const base = wsBase();
  if (!base) return "";
  return `${base}/api/v1/support/ws?token=${encodeURIComponent(token)}&role=customer`;
}

export async function ensureSupportAccessToken(): Promise<string | null> {
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

async function supportFetch<T>(path: string, init: RequestInit = {}, retried = false): Promise<T> {
  const token = getAccessToken();
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const res = await fetch(`${siteOrigin()}${path}`, {
    ...init,
    headers,
    credentials: "include",
    cache: "no-store",
  });
  if (res.status === 401 && !retried) {
    const fresh = await ensureSupportAccessToken();
    if (fresh) {
      headers.set("Authorization", `Bearer ${fresh}`);
      return supportFetch<T>(path, { ...init, headers }, true);
    }
  }
  if (!res.ok) {
    throw new Error(`support_${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchSupportConversation(): Promise<SupportConversation> {
  return supportFetch<SupportConversation>("/api/support/conversation/");
}

export async function postSupportMessage(input: {
  body: string;
  client_message_id?: string;
}): Promise<SupportMessage> {
  return supportFetch<SupportMessage>("/api/support/messages/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      body: input.body,
      client_message_id: input.client_message_id,
    }),
  });
}

export async function closeSupportSession(): Promise<void> {
  try {
    await supportFetch("/api/auth/me/support-chats/", { method: "DELETE" });
  } catch {
    // logout must not fail because of chat
  }
}

export function makeClientMessageId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `m-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
