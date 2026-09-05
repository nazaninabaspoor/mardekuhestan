import { apiFetch } from "@/lib/api/client";

export type ApiCartItem = {
  id: number;
  product_id: string;
  product_name: string;
  product_image: string;
  portion: string;
  cut_type: string;
  unit_price_toman: number;
  quantity: number;
  total_price_toman: number;
  created_at: string;
};

export type ApiCart = {
  id: number;
  items: ApiCartItem[];
  total_items_count: number;
  total_price_toman: number;
  updated_at: string;
};

export type ApiOrderItem = {
  id: number;
  product_name: string;
  product_image: string;
  cut_type: string;
  portion: string;
  unit_price_toman: number;
  quantity: number;
  total_price_toman: number;
};

export type ApiOrder = {
  id: number;
  order_number: string;
  status: string;
  status_display: string;
  pasture_name: string;
  altitude: string;
  grazing_info: string;
  vet_code: string;
  pack_date: string;
  temperature_log: string;
  receiver_name: string;
  receiver_phone: string;
  shipping_address: string;
  delivery_notice: string;
  total_amount_toman: number;
  discount_amount_toman: number;
  final_amount_toman: number;
  created_at: string;
  items: ApiOrderItem[];
};

const ordersInit = {
  credentials: "include" as const,
  revalidate: false as const,
  headers: { "Content-Type": "application/json" },
};

export async function fetchUserCart(): Promise<ApiCart> {
  return apiFetch<ApiCart>("/api/orders/cart/", {
    ...ordersInit,
    method: "GET",
  });
}

export async function addItemToCart(input: {
  product_id?: string;
  product_name: string;
  product_image?: string;
  portion?: string;
  cut_type?: string;
  unit_price_toman: number;
  quantity?: number;
}): Promise<{ message: string; cart: ApiCart }> {
  return apiFetch<{ message: string; cart: ApiCart }>("/api/orders/cart/add/", {
    ...ordersInit,
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function removeItemFromCart(itemId: number): Promise<ApiCart> {
  return apiFetch<ApiCart>(`/api/orders/cart/items/${itemId}/`, {
    ...ordersInit,
    method: "DELETE",
  });
}

export async function updateCartItemQuantity(
  itemId: number,
  quantity: number,
): Promise<ApiCart> {
  return apiFetch<ApiCart>(`/api/orders/cart/items/${itemId}/`, {
    ...ordersInit,
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });
}

export async function clearUserCart(): Promise<ApiCart> {
  return apiFetch<ApiCart>("/api/orders/cart/", {
    ...ordersInit,
    method: "DELETE",
  });
}

export async function fetchUserOrders(): Promise<ApiOrder[]> {
  return apiFetch<ApiOrder[]>("/api/orders/", {
    ...ordersInit,
    method: "GET",
  });
}

export async function checkoutUserCart(input?: {
  receiver_name?: string;
  receiver_phone?: string;
  shipping_address?: string;
}): Promise<{ message: string; order: ApiOrder }> {
  return apiFetch<{ message: string; order: ApiOrder }>("/api/orders/checkout/", {
    ...ordersInit,
    method: "POST",
    body: JSON.stringify(input || {}),
  });
}
