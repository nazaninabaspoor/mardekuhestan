import { apiFetch } from "@/lib/api/client";
import { getVisitorId } from "@/lib/insights/visitor";

const init = {
  credentials: "include" as const,
  revalidate: false as const,
  headers: { "Content-Type": "application/json" },
};

export type InsightEventType =
  | "add_to_cart"
  | "companion_open"
  | "related_click"
  | "related_add"
  | "companion_close"
  | "opinion_submit"
  | "product_focus";

export async function trackProductInsight(input: {
  event_type: InsightEventType;
  product_key: string;
  product_name: string;
  category_key?: string;
  payload?: Record<string, string>;
}): Promise<void> {
  try {
    await apiFetch("/api/products/insights/events/", {
      ...init,
      method: "POST",
      body: JSON.stringify({
        visitor_id: getVisitorId(),
        event_type: input.event_type,
        product_key: input.product_key,
        product_name: input.product_name,
        category_key: input.category_key || "",
        payload: input.payload || {},
      }),
    });
  } catch {
    // فروشگاه نباید برای ثبت تحلیل بایستد
  }
}

export async function submitProductOpinion(input: {
  product_key: string;
  product_name: string;
  category_key?: string;
  rating: number;
  meal?: string;
  comment?: string;
}): Promise<boolean> {
  try {
    await apiFetch("/api/products/insights/opinions/", {
      ...init,
      method: "POST",
      body: JSON.stringify({
        visitor_id: getVisitorId(),
        product_key: input.product_key,
        product_name: input.product_name,
        category_key: input.category_key || "",
        rating: input.rating,
        meal: input.meal || "",
        comment: input.comment || "",
      }),
    });
    return true;
  } catch {
    return false;
  }
}
