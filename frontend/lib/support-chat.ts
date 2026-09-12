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

function fastapiBase(): string {
  const raw =
    process.env.NEXT_PUBLIC_FASTAPI_BASE_URL?.trim() ||
    "http://127.0.0.1:8001";
  return raw.replace(/\/$/, "");
}

function wsBase(): string {
  const http = fastapiBase();
  if (http.startsWith("https://")) return `wss://${http.slice("https://".length)}`;
  if (http.startsWith("http://")) return `ws://${http.slice("http://".length)}`;
  return `ws://${http}`;
}

export function supportWsUrl(token: string): string {
  return `${wsBase()}/api/v1/support/ws?token=${encodeURIComponent(token)}&role=customer`;
}

/** Fresh JWT for WebSocket — cookie session alone is not enough. */
export async function ensureSupportAccessToken(): Promise<string | null> {
  try {
    const { access } = await refreshAccountSession();
    if (access) {
      setAccessToken(access);
      return access;
    }
  } catch {
    // fall through to cached token
  }
  return getAccessToken();
}

export async function fetchSupportConversation(
  accessToken?: string,
): Promise<SupportConversation> {
  const token = accessToken ?? (await ensureSupportAccessToken());
  if (!token) throw new Error("login_required");
  const res = await fetch(`${fastapiBase()}/api/v1/support/conversation`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`conversation_${res.status}`);
  return res.json();
}

export async function postSupportMessage(input: {
  body: string;
  client_message_id?: string;
  accessToken?: string;
}): Promise<SupportMessage> {
  const token = input.accessToken ?? (await ensureSupportAccessToken());
  if (!token) throw new Error("login_required");
  const res = await fetch(`${fastapiBase()}/api/v1/support/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      body: input.body,
      client_message_id: input.client_message_id,
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`message_${res.status}`);
  return res.json();
}

export async function closeSupportSession(): Promise<void> {
  const token = getAccessToken() || (await ensureSupportAccessToken());
  if (!token) return;
  try {
    await fetch(`${fastapiBase()}/api/v1/support/session/close`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: "{}",
    });
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
