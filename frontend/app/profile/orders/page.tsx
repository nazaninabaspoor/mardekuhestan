"use client";

import React, { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { authErrorMessage, getUserAddresses } from "@/lib/api/auth";
import { fetchUserOrders, type ApiOrder } from "@/lib/api/orders";
import { startPayment, type PaymentGateway } from "@/lib/api/payments";
import { DigikalaCart } from "@/components/v2/v2-digikala-cart";
import { DigikalaOrdersList, type PastureOrderData } from "@/components/v2/v2-digikala-orders-list";
import { handleDownloadOrderPdf, resolveProductImage } from "@/app/profile/page";

const PAGE_SIZE = 15;

function isOfficialGatewayUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "sandbox.zarinpal.com") {
      const token = parsed.pathname.split("/").filter(Boolean).pop() || "";
      return parsed.pathname.includes("/pg/StartPay/") && token.length === 36 && token.startsWith("S");
    }
    if (parsed.hostname === "sandbox.pec.ir") {
      return parsed.pathname.includes("/NewIPG") && Boolean(parsed.searchParams.get("Token"));
    }
    if (parsed.hostname === "www.zarinpal.com" || parsed.hostname === "payment.zarinpal.com") {
      const token = parsed.pathname.split("/").filter(Boolean).pop() || "";
      return parsed.pathname.includes("/pg/StartPay/") && token.length === 36 && token.startsWith("A");
    }
    if (parsed.hostname === "pec.shaparak.ir") {
      return Boolean(parsed.searchParams.get("Token"));
    }
    return false;
  } catch {
    return false;
  }
}

function mapApiOrder(ord: ApiOrder): PastureOrderData {
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
    status: ord.status_display || "تایید شده",
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
}

function OrdersRouteContent() {
  const { user, isLoading, openLoginModal } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view");
  const paidParam = searchParams.get("paid");
  const payParam = searchParams.get("pay");

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
  const [ordersCount, setOrdersCount] = useState(0);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [addresses, setAddresses] = useState<
    Array<{ city: string; district: string; address_line: string }>
  >([]);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const loadOrders = useCallback(async (page: number) => {
    setOrdersLoading(true);
    try {
      const data = await fetchUserOrders(page);
      setUserOrders(data.results || []);
      setOrdersCount(data.count || 0);
      setOrdersPage(page);
    } catch {
      setUserOrders([]);
      setOrdersCount(0);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.add("is-orders-route");
    return () => document.documentElement.classList.remove("is-orders-route");
  }, []);

  useEffect(() => {
    if (viewParam === "cart" || viewParam === "invoice") {
      setDocViewMode("invoice");
    }
    if (paidParam === "1") {
      setDocViewMode("book");
    }
    if (payParam) {
      setDocViewMode("invoice");
      const messages: Record<string, string> = {
        failed: "پرداخت در درگاه تأیید نشد.",
        canceled: "پرداخت لغو شد.",
        unavailable: "درگاه موقتاً قطع بود. سایت باز است؛ کمی بعد دوباره تلاش کنید.",
        missing: "رسید پرداخت پیدا نشد.",
        mismatch: "رسید درگاه با این سفارش همخوانی نداشت.",
      };
      setPayError(messages[payParam] || "پرداخت کامل نشد.");
      setIsPayModalOpen(true);
    }
  }, [viewParam, paidParam, payParam]);

  useEffect(() => {
    if (!user) return;
    void loadOrders(1);
    getUserAddresses()
      .then((data) => {
        if (data?.length) setAddresses(data);
      })
      .catch(() => {});
  }, [user, loadOrders]);

  useEffect(() => {
    if (!user || paidParam !== "1") return;
    void refreshCart();
    void loadOrders(1);
    router.replace("/profile/orders", { scroll: false });
  }, [user, paidParam, refreshCart, loadOrders, router]);

  const ordersList = useMemo(() => userOrders.map(mapApiOrder), [userOrders]);
  const ordersTotalPages = Math.max(1, Math.ceil(ordersCount / PAGE_SIZE));

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

  const handleSelectGateway = async (gateway: PaymentGateway) => {
    if (!cart?.items?.length) {
      setPayError("سبد خرید خالی است.");
      return;
    }
    setIsPaying(true);
    setPayError(null);
    try {
      const started = await startPayment({
        gateway,
        receiver_name: buyerInfo.name,
        receiver_phone: buyerInfo.phone,
        shipping_address: buyerInfo.address,
      });
      const url = started.redirect_url || "";
      if (!isOfficialGatewayUrl(url)) {
        setPayError("آدرس برگشتی درگاه معتبر نیست.");
        setIsPaying(false);
        return;
      }
      window.location.assign(url);
    } catch (err) {
      setPayError(authErrorMessage(err));
      setIsPaying(false);
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
              className={`mk-doc-tab-btn mk-doc-tab-btn--cart${docViewMode === "invoice" ? " is-active" : ""}`}
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
              <span className="mk-neon-badge">{ordersCount}</span>
            </button>
          </div>

          {docViewMode === "book" && (
            <DigikalaOrdersList
              orders={ordersList}
              buyerInfo={buyerInfo}
              totalCount={ordersCount}
              currentPage={ordersPage}
              totalPages={ordersTotalPages}
              isLoading={ordersLoading}
              onPageChange={(page) => {
                void loadOrders(page);
              }}
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
              onCheckout={() => {
                setPayError(null);
                setIsPayModalOpen(true);
              }}
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
          <div
            className="mk-payment-modal-backdrop"
            onClick={() => !isPaying && setIsPayModalOpen(false)}
          >
            <motion.div
              className="mk-gateway-picker"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
            >
              <p className="mk-gateway-kicker">پرداخت امن راه سبز</p>
              <h3>با کدام درگاه پرداخت می‌کنید؟</h3>
              <p className="mk-gateway-amount">
                مبلغ قابل پرداخت: <strong>{payableLabel}</strong>
              </p>
              <p className="mk-gateway-note">
                با انتخاب درگاه وارد سندباکس رسمی زرین‌پال یا پارسیان می‌شوید. کارت و رمز را همان‌جا وارد می‌کنید.
              </p>
              {payError && <p className="mk-gateway-error">{payError}</p>}
              <div className="mk-gateway-choices">
                <button
                  type="button"
                  className="mk-gateway-choice mk-gateway-choice--zarinpal"
                  disabled={isPaying}
                  onClick={() => void handleSelectGateway("zarinpal")}
                >
                  <span className="mk-gateway-mark">زر</span>
                  <span className="mk-gateway-choice-text">
                    <strong>زرین‌پال</strong>
                    <small>سندباکس رسمی زرین‌پال</small>
                  </span>
                </button>
                <button
                  type="button"
                  className="mk-gateway-choice mk-gateway-choice--parsian"
                  disabled={isPaying}
                  onClick={() => void handleSelectGateway("parsian")}
                >
                  <span className="mk-gateway-mark">پا</span>
                  <span className="mk-gateway-choice-text">
                    <strong>بانک پارسیان</strong>
                    <small>سندباکس رسمی پارسیان</small>
                  </span>
                </button>
              </div>
              <button
                type="button"
                className="mk-gateway-cancel"
                disabled={isPaying}
                onClick={() => setIsPayModalOpen(false)}
              >
                انصراف
              </button>
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
