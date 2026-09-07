"use client";

import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { authErrorMessage } from "@/lib/api/auth";
import {
  completeSandboxPayment,
  fetchSandboxPayment,
  type PaymentGateway,
  type SandboxPayment,
} from "@/lib/api/payments";

const SANDBOX_OTP = "12345";

function onlyDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (d) => "0123456789"["۰۱۲۳۴۵۶۷۸۹".indexOf(d)])
    .replace(/\D/g, "");
}

function formatCard(value: string) {
  return onlyDigits(value).slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 - ");
}

type PayStep = "card" | "otp" | "success";

export default function SandboxPayPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoading, openLoginModal } = useAuth();
  const paymentId = params?.id || "";
  const gatewayHint = (searchParams.get("gateway") || "") as PaymentGateway | "";

  const [payment, setPayment] = useState<SandboxPayment | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState<PayStep>("card");
  const [card, setCard] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [otp, setOtp] = useState("");

  useEffect(() => {
    document.documentElement.classList.add("is-pay-sandbox");
    return () => document.documentElement.classList.remove("is-pay-sandbox");
  }, []);

  useEffect(() => {
    if (!user || !paymentId) return;
    let cancelled = false;
    fetchSandboxPayment(paymentId)
      .then((data) => {
        if (cancelled) return;
        setPayment(data);
        if (data.status === "paid") setStep("success");
      })
      .catch((err) => {
        if (!cancelled) setLoadError(authErrorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [user, paymentId]);

  useEffect(() => {
    if (step !== "success") return;
    const timer = window.setTimeout(() => {
      router.replace("/profile/orders?paid=1");
    }, 1600);
    return () => window.clearTimeout(timer);
  }, [step, router]);

  const gateway: PaymentGateway =
    payment?.gateway || (gatewayHint === "parsian" ? "parsian" : "zarinpal");
  const isParsian = gateway === "parsian";
  const gatewayName = payment?.gateway_display || (isParsian ? "پارسیان" : "زرین‌پال");

  const amountLabel = useMemo(() => {
    const amount = payment?.amount_toman || 0;
    return `${amount.toLocaleString("fa-IR")} تومان`;
  }, [payment]);

  const requestOtp = (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    if (onlyDigits(card).length !== 16) {
      setFormError("شماره کارت باید ۱۶ رقم باشد.");
      return;
    }
    if (!month || !year) {
      setFormError("تاریخ انقضای کارت را کامل کنید.");
      return;
    }
    if (onlyDigits(cvv).length < 3) {
      setFormError("CVV2 را وارد کنید.");
      return;
    }
    setOtp("");
    setStep("otp");
  };

  const confirmPay = async (event: FormEvent) => {
    event.preventDefault();
    if (!paymentId || busy) return;
    if (onlyDigits(otp) !== SANDBOX_OTP) {
      setFormError("رمز پویا نادرست است. در سندباکس از ۱۲۳۴۵ استفاده کنید.");
      return;
    }
    setBusy(true);
    setFormError(null);
    try {
      const result = await completeSandboxPayment(paymentId, "paid");
      if (result.canceled) {
        router.replace("/profile/orders?view=cart");
        return;
      }
      setStep("success");
    } catch (err) {
      setFormError(authErrorMessage(err));
      setBusy(false);
    }
  };

  const cancelPay = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (paymentId) await completeSandboxPayment(paymentId, "canceled");
    } catch {
      /* return to cart even if cancel API fails */
    }
    router.replace("/profile/orders?view=cart");
  };

  if (isLoading) {
    return (
      <div className={`mk-psp mk-psp--${gateway}`}>
        <p className="mk-psp-status">در حال اتصال به درگاه…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`mk-psp mk-psp--${gateway}`}>
        <div className="mk-psp-shell">
          <h1>ورود برای ادامه پرداخت</h1>
          <p>برای ورود به درگاه باید وارد حساب مرد کوهستان شوید.</p>
          <button type="button" className="mk-psp-primary" onClick={() => openLoginModal()}>
            ورود به حساب
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`mk-psp mk-psp--${gateway}`}>
      <div className="mk-psp-shell">
        <header className="mk-psp-top">
          <div>
            <p className="mk-psp-brand">{isParsian ? "PEP" : "ZarinPal"}</p>
            <h1>درگاه {gatewayName}</h1>
          </div>
          <span className="mk-psp-sandbox-tag">Sandbox</span>
        </header>

        <p className="mk-psp-merchant">پذیرنده: صنایع غذایی مرد کوهستان</p>
        <div className="mk-psp-amount">
          <span>مبلغ قابل پرداخت</span>
          <strong>{amountLabel}</strong>
        </div>
        <p className="mk-psp-hint">
          این صفحه سندباکس است و پول واقعی کسر نمی‌شود. بعد از گرفتن Merchant، همین مسیر به درگاه اصلی وصل می‌شود.
        </p>

        {loadError && <p className="mk-psp-error">{loadError}</p>}
        {formError && <p className="mk-psp-error">{formError}</p>}

        {step === "card" && (
          <form className="mk-psp-form" onSubmit={requestOtp}>
            <label>
              شماره کارت
              <input
                inputMode="numeric"
                autoComplete="cc-number"
                placeholder="6037 - 9975 - 4821 - 3014"
                value={card}
                onChange={(e) => setCard(formatCard(e.target.value))}
              />
            </label>
            <div className="mk-psp-row">
              <label>
                ماه
                <select value={month} onChange={(e) => setMonth(e.target.value)}>
                  <option value="">ماه</option>
                  {Array.from({ length: 12 }, (_, i) => {
                    const value = String(i + 1).padStart(2, "0");
                    return (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    );
                  })}
                </select>
              </label>
              <label>
                سال
                <select value={year} onChange={(e) => setYear(e.target.value)}>
                  <option value="">سال</option>
                  {["04", "05", "06", "07", "08"].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                CVV2
                <input
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  maxLength={4}
                  value={cvv}
                  onChange={(e) => setCvv(onlyDigits(e.target.value).slice(0, 4))}
                />
              </label>
            </div>
            <button type="submit" className="mk-psp-primary" disabled={!payment || busy}>
              ادامه و دریافت رمز پویا
            </button>
            <button type="button" className="mk-psp-ghost" onClick={() => void cancelPay()}>
              انصراف و بازگشت به فروشگاه
            </button>
          </form>
        )}

        {step === "otp" && (
          <form className="mk-psp-form" onSubmit={(e) => void confirmPay(e)}>
            <p className="mk-psp-otp-note">
              رمز پویا برای کارت {card || "شما"} ارسال شد.
              <strong> کد سندباکس: ۱۲۳۴۵</strong>
            </p>
            <label>
              رمز پویا
              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(onlyDigits(e.target.value).slice(0, 6))}
              />
            </label>
            <button type="submit" className="mk-psp-primary" disabled={busy}>
              {busy ? "در حال اتصال به بانک…" : "پرداخت"}
            </button>
            <button type="button" className="mk-psp-ghost" onClick={() => setStep("card")}>
              اصلاح کارت
            </button>
          </form>
        )}

        {step === "success" && (
          <div className="mk-psp-done">
            <p>پرداخت با موفقیت انجام شد.</p>
            <small>در حال بازگشت به سفارش‌های مرد کوهستان…</small>
          </div>
        )}
      </div>
    </div>
  );
}
