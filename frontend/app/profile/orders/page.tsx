"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { getUserAddresses } from "@/lib/api/auth";
import { checkoutUserCart, fetchUserOrders, type ApiOrder } from "@/lib/api/orders";
import { DigikalaCart } from "@/components/v2/v2-digikala-cart";
import { DigikalaOrdersList } from "@/components/v2/v2-digikala-orders-list";
import {
  handleDownloadOrderPdf,
  PASTURE_ORDERS_DATABASE,
  resolveProductImage,
} from "@/app/profile/page";

function OrdersRouteContent() {
  const { user, isLoading, openLoginModal } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view");

  const {
    cart,
    itemsCount: cartItemsCount,
    totalPriceToman: cartTotalPriceToman,
    removeFromCart,
    updateQuantity,
    clearCart,
    refreshCart,
  } = useCart();

  const [docViewMode, setDocViewMode] = useState<"book" | "invoice">(
    viewParam === "cart" || viewParam === "invoice" ? "invoice" : "book",
  );
  const [userOrders, setUserOrders] = useState<ApiOrder[]>([]);
  const [addresses, setAddresses] = useState<
    Array<{ city: string; district: string; address_line: string }>
  >([]);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("is-orders-route");
    return () => document.documentElement.classList.remove("is-orders-route");
  }, []);

  useEffect(() => {
    if (viewParam === "cart" || viewParam === "invoice") {
      setDocViewMode("invoice");
    }
  }, [viewParam]);

  useEffect(() => {
    if (!user) return;
    fetchUserOrders()
      .then(setUserOrders)
      .catch(() => setUserOrders([]));
    getUserAddresses()
      .then((data) => {
        if (data?.length) setAddresses(data);
      })
      .catch(() => {});
  }, [user]);

  const ordersList = useMemo(() => {
    if (userOrders.length > 0) {
      return userOrders.map((ord) => {
        const primaryItemName = ord.items[0]?.product_name
          ? ord.items[0].product_name.split(" (")[0]
          : "بسته سفارش مرتع";
        return {
          id: ord.order_number,
          title: ord.items.length > 1 ? `${primaryItemName} و اقلام ییلاقی مرتع` : primaryItemName,
          date: ord.pack_date,
          pastureName: ord.pasture_name,
          altitude: ord.altitude,
          grazing: ord.grazing_info,
          vetCode: ord.vet_code,
          packDate: ord.pack_date,
          tempLog: ord.temperature_log,
          status: ord.status_display || "تحویل‌شده با زنجیره سرد",
          items: ord.items.map((it) => ({
            name: it.product_name,
            image: resolveProductImage(it.product_name, it.product_image),
            cut: it.cut_type || it.portion || "بسته‌بندی استریل مرتع",
            price: `${it.total_price_toman.toLocaleString("fa-IR")} تومان`,
          })),
          totalAmount: `${ord.total_amount_toman.toLocaleString("fa-IR")} تومان`,
          discount: `${ord.discount_amount_toman.toLocaleString("fa-IR")} تومان`,
          finalPrice: `${ord.final_amount_toman.toLocaleString("fa-IR")} تومان`,
        };
      });
    }
    return PASTURE_ORDERS_DATABASE.map((ord) => ({
      ...ord,
      items: ord.items.map((it) => ({
        ...it,
        image: resolveProductImage(it.name, it.image),
      })),
    }));
  }, [userOrders]);

  const buyerInfo = {
    name: user?.name || "کامیار جعفریان",
    nationalCode: "۰۰۱۸۴۹۲۷۵۱",
    phone: user?.phone || "۰۹۳۷۹۱۴۶۱۳۰",
    address: addresses[0]
      ? `${addresses[0].city}، ${addresses[0].district}، ${addresses[0].address_line}`
      : "تهران، زعفرانیه، خیابان آصف، پلاک ۱۲",
  };

  const payableLabel = `${(
    cartTotalPriceToman >= 500000 || cartTotalPriceToman === 0
      ? cartTotalPriceToman
      : cartTotalPriceToman + 40000
  ).toLocaleString("fa-IR")} تومان`;

  const switchView = (mode: "book" | "invoice") => {
    setDocViewMode(mode);
    router.replace(mode === "invoice" ? "/profile/orders?view=cart" : "/profile/orders", {
      scroll: false,
    });
  };

  const handleSimulatePayment = async () => {
    setIsPaying(true);
    try {
      if (cart?.items?.length) {
        await checkoutUserCart({
          receiver_name: buyerInfo.name,
          receiver_phone: buyerInfo.phone,
          shipping_address: buyerInfo.address,
        });
        await refreshCart();
        const updated = await fetchUserOrders();
        setUserOrders(updated);
      }
    } catch {
      /* keep success UI for demo */
    } finally {
      setIsPaying(false);
      setPaySuccess(true);
      setTimeout(() => {
        setIsPayModalOpen(false);
        setPaySuccess(false);
        switchView("book");
      }, 1800);
    }
  };

  if (isLoading) {
    return (
      <div className="mk-orders-route">
        <div className="mk-orders-route-pattern" aria-hidden="true" />
        <div className="mk-orders-route-inner">
          <p className="mk-orders-route-loading">در حال بارگذاری سبد خرید…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mk-orders-route">
        <div className="mk-orders-route-pattern" aria-hidden="true" />
        <div className="mk-orders-route-inner">
          <div className="mk-empty-cart-view">
            <div className="mk-empty-cart-ico">🛒</div>
            <h2>برای دیدن سبد خرید وارد شوید</h2>
            <p>سفارش‌ها و سبد جاری فقط برای حساب کاربری مرد کوهستان در دسترس است.</p>
            <button type="button" className="mk-explore-products-btn" onClick={() => openLoginModal()}>
              ورود به حساب
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mk-orders-route">
      <div className="mk-orders-route-pattern" aria-hidden="true" />
      <div className="mk-orders-route-inner">
        <header className="mk-orders-topbar">
          <div className="mk-orders-brand">
            <Image
              src="/brand/orginal-clear.png"
              alt="مرد کوهستان"
              width={44}
              height={44}
              className="mk-orders-logo"
            />
            <div className="mk-orders-titles">
              <strong>سفارش‌ها و سبد خرید</strong>
              <span>سبد تازه کوهستان</span>
            </div>
          </div>
          <div className="mk-orders-topbar-meta">
            <span className="mk-orders-cold-live">
              <span className="mk-orders-live-dot" />
              ارسال با ماشین یخچال‌دار (۲.۴°C)
            </span>
            <button
              type="button"
              className="mk-orders-back-btn"
              onClick={() => {
                if (window.opener) window.close();
                else router.push("/profile");
              }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.4" fill="none">
                <polyline points="9 18 15 12 9 6" />
              </svg>
              <span>بستن این تب</span>
            </button>
          </div>
        </header>

        <div className="mk-orders-main-desk">
          <div className="mk-doc-segmented-bar">
            <button
              type="button"
              className={`mk-doc-tab-btn${docViewMode === "invoice" ? " is-active" : ""}`}
              onClick={() => switchView("invoice")}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.2" fill="none">
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              <span>سبد خرید جاری و سفارش جدید</span>
              {cartItemsCount > 0 && <span className="mk-neon-badge">{cartItemsCount}</span>}
            </button>
            <button
              type="button"
              className={`mk-doc-tab-btn${docViewMode === "book" ? " is-active" : ""}`}
              onClick={() => switchView("book")}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.2" fill="none">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <span>سفارش‌های قبلی من</span>
              <span className="mk-neon-badge">{ordersList.length}</span>
            </button>
          </div>

          {docViewMode === "book" && (
            <DigikalaOrdersList
              orders={ordersList}
              buyerInfo={buyerInfo}
              onDownloadPdf={(order) => handleDownloadOrderPdf("book", order, buyerInfo)}
              onReorder={() => switchView("invoice")}
            />
          )}

          {docViewMode === "invoice" && (
            <DigikalaCart
              items={cart?.items || []}
              cartTotalPriceToman={cartTotalPriceToman}
              buyerInfo={buyerInfo}
              onUpdateQuantity={(itemId, qty) => updateQuantity(itemId, qty)}
              onRemoveFromCart={(itemId) => removeFromCart(itemId)}
              onClearCart={() => clearCart()}
              onCheckout={() => setIsPayModalOpen(true)}
              onDownloadPdf={() => {
                handleDownloadOrderPdf(
                  "invoice",
                  {
                    invoiceNumber: `MK-INV-${Math.floor(10000 + Math.random() * 90000)}`,
                    date: "امروز",
                    payableAmount: payableLabel,
                    items: (cart?.items || []).map((it, idx) => ({
                      row: idx + 1,
                      name: it.product_name,
                      code: `MK-${it.id}`,
                      weight: it.portion,
                      total: `${it.total_price_toman.toLocaleString("fa-IR")} تومان`,
                    })),
                  },
                  buyerInfo,
                );
              }}
              onExploreProducts={() => router.push("/#for-home-kitchen")}
            />
          )}
        </div>
      </div>

      <AnimatePresence>
        {isPayModalOpen && (
          <div className="mk-payment-modal-backdrop" onClick={() => !isPaying && setIsPayModalOpen(false)}>
            <motion.div
              className="mk-payment-card"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
            >
              {!paySuccess ? (
                <>
                  <h3>پرداخت امن کوهستان</h3>
                  <p>مبلغ قابل پرداخت: <strong>{payableLabel}</strong></p>
                  <button
                    type="button"
                    className="mk-primary-checkout-btn"
                    disabled={isPaying}
                    onClick={handleSimulatePayment}
                  >
                    {isPaying ? "در حال پردازش…" : "تأیید و پرداخت"}
                  </button>
                </>
              ) : (
                <p>پرداخت با موفقیت انجام شد.</p>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="mk-orders-route"><p className="mk-orders-route-loading">در حال بارگذاری…</p></div>}>
      <OrdersRouteContent />
    </Suspense>
  );
}
