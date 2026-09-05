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

const CART_CACHE_KEY_PREFIX = "mk_user_cart_cache_";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, openLoginModal } = useAuth();
  const [cart, setCart] = useState<ApiCart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [bumpCart, setBumpCart] = useState(false);
  const [cartNotice, setCartNotice] = useState<{ message: string; visible: boolean }>({
    message: "",
    visible: false,
  });

  const getStorageKey = useCallback(() => {
    if (!user) return null;
    return `${CART_CACHE_KEY_PREFIX}${user.id || user.email || "guest"}`;
  }, [user]);

  // Load from local storage cache on initial user load (0ms optimistic load)
  useEffect(() => {
    const key = getStorageKey();
    if (!key) {
      setCart(null);
      return;
    }
    try {
      const cached = localStorage.getItem(key);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === "object") {
          setCart(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, [getStorageKey]);

  // Save to cache helper
  const saveCartToCache = useCallback(
    (newCart: ApiCart | null) => {
      const key = getStorageKey();
      if (!key) return;
      try {
        if (newCart) {
          localStorage.setItem(key, JSON.stringify(newCart));
        } else {
          localStorage.removeItem(key);
        }
      } catch {
        // ignore
      }
    },
    [getStorageKey],
  );

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }
    try {
      setIsLoading(true);
      const data = await fetchUserCart();
      setCart(data);
      saveCartToCache(data);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, [user, saveCartToCache]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const triggerCartBump = useCallback((msg: string) => {
    setBumpCart(true);
    setCartNotice({ message: msg, visible: true });
    setTimeout(() => setBumpCart(false), 900);
    setTimeout(() => {
      setCartNotice((prev) => ({ ...prev, visible: false }));
    }, 4000);
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
        saveCartToCache(res.cart);
        triggerCartBump(res.message || `«${input.product_name}» به سبد خرید افزوده شد.`);
        return { success: true, message: res.message };
      } catch (err: any) {
        const msg = err?.message || "خطا در افزودن به سبد خرید.";
        return { success: false, message: msg };
      }
    },
    [user, openLoginModal, triggerCartBump, saveCartToCache],
  );

  const removeFromCart = useCallback(
    async (itemId: number) => {
      if (!user) return;
      // Optimistic update
      setCart((prev) => {
        if (!prev) return null;
        const newItems = prev.items.filter((it) => it.id !== itemId);
        const newCount = newItems.reduce((acc, it) => acc + it.quantity, 0);
        const newTotal = newItems.reduce((acc, it) => acc + it.total_price_toman, 0);
        const optimistic = { ...prev, items: newItems, total_items_count: newCount, total_price_toman: newTotal };
        saveCartToCache(optimistic);
        return optimistic;
      });

      try {
        const updated = await removeItemFromCart(itemId);
        setCart(updated);
        saveCartToCache(updated);
      } catch {
        // ignore
      }
    },
    [user, saveCartToCache],
  );

  const updateQuantity = useCallback(
    async (itemId: number, quantity: number) => {
      if (!user) return;
      // Optimistic update
      setCart((prev) => {
        if (!prev) return null;
        const newItems = prev.items.map((it) => {
          if (it.id === itemId) {
            return {
              ...it,
              quantity,
              total_price_toman: it.unit_price_toman * quantity,
            };
          }
          return it;
        });
        const newCount = newItems.reduce((acc, it) => acc + it.quantity, 0);
        const newTotal = newItems.reduce((acc, it) => acc + it.total_price_toman, 0);
        const optimistic = { ...prev, items: newItems, total_items_count: newCount, total_price_toman: newTotal };
        saveCartToCache(optimistic);
        return optimistic;
      });

      try {
        const updated = await updateCartItemQuantity(itemId, quantity);
        setCart(updated);
        saveCartToCache(updated);
      } catch {
        // ignore
      }
    },
    [user, saveCartToCache],
  );

  const clearCart = useCallback(async () => {
    if (!user) return;
    setCart((prev) => {
      if (!prev) return null;
      const empty = { ...prev, items: [], total_items_count: 0, total_price_toman: 0 };
      saveCartToCache(empty);
      return empty;
    });

    try {
      const updated = await clearUserCart();
      setCart(updated);
      saveCartToCache(updated);
    } catch {
      // ignore
    }
  }, [user, saveCartToCache]);

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
