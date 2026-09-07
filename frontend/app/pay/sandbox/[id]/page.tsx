"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { authErrorMessage } from "@/lib/api/auth";
import {
  completeSandboxPayment,
  fetchSandboxPayment,
  type SandboxPayment,
} from "@/lib/api/payments";

export default function SandboxPayPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoading, openLoginModal } = useAuth();
  const paymentId = params?.id || "";
  const gatewayHint = searchParams.get("gateway");

  const [payment, setPayment] = useState<SandboxPayment | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("is-pay-sandbox");
    return () => document.documentElement.classList.remove("is-pay-sandbox");
  }, []);

  useEffect(() => {
    if (!user || !paymentId) return;
    fetchSandboxPayment(paymentId)
      .then((data) => {
        setPayment(data);
        if (data.status === "paid") {
          setDone(true);
          router.replace("/profile/orders?paid=1");
        }
      })
      .catch((err) => setLoadError(authErrorMessage(err)));
  }, [user, paymentId, router]);

  const gatewayName =
    payment?.gateway_display ||
    (gatewayHint === "parsian" ? "پارسیان" : gatewayHint === "zarinpal" ? "زرین‌پال" : "درگاه آزمایشی");

  const finish = async (outcome: "paid" | "canceled") => {
    if (!paymentId || busy) return;
    setBusy(true);
    setLoadError(null);
    try {
      const result = await completeSandboxPayment(paymentId, outcome);
      if (result.canceled) {
        router.replace("/profile/orders?view=cart");
        return;
      }
      setDone(true);
      router.replace("/profile/orders?paid=1");
    } catch (err) {
      setLoadError(authErrorMessage(err));
      setBusy(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mk-sandbox-page">
        <p className="mk-sandbox-status">در حال آماده‌سازی درگاه…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mk-sandbox-page">
        <div className="mk-sandbox-card">
          <h1>ورود برای ادامه پرداخت</h1>
          <p>برای تکمیل پرداخت آزمایشی باید وارد حساب مرد کوهستان شوید.</p>
          <button type="button" className="mk-sandbox-pay-btn" onClick={() => openLoginModal()}>
            ورود به حساب
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`mk-sandbox-page${payment?.gateway === "parsian" ? " is-parsian" : " is-zarinpal"}`}>
      <div className="mk-sandbox-card">
        <p className="mk-sandbox-kicker">سندباکس مرد کوهستان</p>
        <h1>درگاه آزمایشی {gatewayName}</h1>
        <p className="mk-sandbox-lead">
          Merchant ID هنوز ثبت نشده؛ این صفحه همان محیط آزمایشی زرین‌پال و پارسیان است تا بعداً به درگاه واقعی وصل شود.
        </p>
        {payment && (
          <div className="mk-sandbox-amount">
            <span>مبلغ قابل پرداخت</span>
            <strong>{payment.amount_toman.toLocaleString("fa-IR")} تومان</strong>
          </div>
        )}
        {loadError && <p className="mk-gateway-error">{loadError}</p>}
        {done ? (
          <p className="mk-sandbox-status">پرداخت ثبت شد. در حال بازگشت به سفارش‌ها…</p>
        ) : (
          <div className="mk-sandbox-actions">
            <button
              type="button"
              className="mk-sandbox-pay-btn"
              disabled={busy || !payment}
              onClick={() => void finish("paid")}
            >
              {busy ? "در حال ثبت پرداخت…" : "پرداخت آزمایشی موفق"}
            </button>
            <button
              type="button"
              className="mk-sandbox-cancel-btn"
              disabled={busy}
              onClick={() => void finish("canceled")}
            >
              انصراف و بازگشت به سبد
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
