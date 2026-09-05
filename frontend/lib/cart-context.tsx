"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "@/lib/auth-context";
import {
  addItemToCart,
  ApiCart,
  clearUserCart,
  fetchUserCart,
  removeItemFromCart,
  updateCartItemQuantity,
} from "@/lib/api/orders";

interface CartContextType {
  cart: ApiCart | null;
  itemsCount: number;
  totalPriceToman: number;
  isLoading: boolean;
  bumpCart: boolean;
  cartNotice: { message: string; visible: boolean };
  addToCart: (input: {
    product_id?: string;
    product_name: string;
    product_image?: string;
    portion?: string;
    cut_type?: string;
    unit_price_toman: number;
    quantity?: number;
  }) => Promise<{ success: boolean; message: string }>;
  removeFromCart: (itemId: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  dismissCartNotice: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, openLoginModal } = useAuth();
  const [cart, setCart] = useState<ApiCart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [bumpCart, setBumpCart] = useState(false);
  const [cartNotice, setCartNotice] = useState<{ message: string; visible: boolean }>({
    message: "",
    visible: false,
  });

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }
    try {
      setIsLoading(true);
      const data = await fetchUserCart();
      setCart(data);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const triggerCartBump = useCallback((msg: string) => {
    setBumpCart(true);
    setCartNotice({ message: msg, visible: true });
    setTimeout(() => setBumpCart(false), 900);
    setTimeout(() => {
      setCartNotice((prev) => ({ ...prev, visible: false }));
    }, 3800);
  }, []);

  const addToCart = useCallback(
    async (input: {
      product_id?: string;
      product_name: string;
      product_image?: string;
      portion?: string;
      cut_type?: string;
      unit_price_toman: number;
      quantity?: number;
    }) => {
      if (!user) {
        openLoginModal();
        return { success: false, message: "لطفاً ابتدا وارد حساب کاربری خود شوید." };
      }

      try {
        const res = await addItemToCart(input);
        setCart(res.cart);
        triggerCartBump(res.message || `«${input.product_name}» به سبد خرید افزوده شد.`);
        return { success: true, message: res.message };
      } catch (err: any) {
        const msg = err?.message || "خطا در افزودن به سبد خرید.";
        return { success: false, message: msg };
      }
    },
    [user, openLoginModal, triggerCartBump],
  );

  const removeFromCart = useCallback(
    async (itemId: number) => {
      if (!user) return;
      try {
        const updated = await removeItemFromCart(itemId);
        setCart(updated);
      } catch {
        // ignore
      }
    },
    [user],
  );

  const updateQuantity = useCallback(
    async (itemId: number, quantity: number) => {
      if (!user) return;
      try {
        const updated = await updateCartItemQuantity(itemId, quantity);
        setCart(updated);
      } catch {
        // ignore
      }
    },
    [user],
  );

  const clearCart = useCallback(async () => {
    if (!user) return;
    try {
      const updated = await clearUserCart();
      setCart(updated);
    } catch {
      // ignore
    }
  }, [user]);

  const dismissCartNotice = useCallback(() => {
    setCartNotice({ message: "", visible: false });
  }, []);

  const itemsCount = cart?.total_items_count || (cart?.items ? cart.items.reduce((s, it) => s + it.quantity, 0) : 0);
  const totalPriceToman = cart?.total_price_toman || (cart?.items ? cart.items.reduce((s, it) => s + it.total_price_toman, 0) : 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        itemsCount,
        totalPriceToman,
        isLoading,
        bumpCart,
        cartNotice,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCart,
        dismissCartNotice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
