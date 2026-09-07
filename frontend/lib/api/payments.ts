import { apiFetch } from "@/lib/api/client";

export type PaymentGateway = "zarinpal" | "parsian";

export type PaymentStart = {
  payment_id: string;
  gateway: PaymentGateway;
  sandbox: boolean;
  amount_toman: number;
  redirect_url: string;
};

export type SandboxPayment = {
  payment_id: string;
  gateway: PaymentGateway;
  gateway_display: string;
  status: string;
  amount_toman: number;
  sandbox: boolean;
  order_number: string | null;
  redirect_url?: string;
};

export type PaymentComplete = {
  ok: boolean;
  canceled?: boolean;
  already?: boolean;
  order_number?: string | null;
};

const payInit = {
  credentials: "include" as const,
  revalidate: false as const,
  headers: { "Content-Type": "application/json" },
};

export async function startPayment(input: {
  gateway: PaymentGateway;
  receiver_name?: string;
  receiver_phone?: string;
  shipping_address?: string;
}): Promise<PaymentStart> {
  return apiFetch<PaymentStart>("/api/payments/start/", {
    ...payInit,
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function fetchSandboxPayment(paymentId: string): Promise<SandboxPayment> {
  return apiFetch<SandboxPayment>(`/api/payments/sandbox/${paymentId}/`, {
    ...payInit,
    method: "GET",
  });
}

export async function completeSandboxPayment(
  paymentId: string,
  outcome: "paid" | "canceled",
): Promise<PaymentComplete> {
  return apiFetch<PaymentComplete>(`/api/payments/sandbox/${paymentId}/complete/`, {
    ...payInit,
    method: "POST",
    body: JSON.stringify({ outcome }),
  });
}
