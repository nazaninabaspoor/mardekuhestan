"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { fetchSandboxPayment } from "@/lib/api/payments";

function zarinpalAuthorityFromUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "sandbox.zarinpal.com" && parsed.hostname !== "www.zarinpal.com") {
      return "";
    }
    const token = parsed.pathname.split("/").filter(Boolean).pop() || "";
    if (token.length === 36 && (token.startsWith("S") || token.startsWith("A"))) return token;
    return "";
  } catch {
    return "";
  }
}

export default function SandboxPayPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [target, setTarget] = useState<string | null>(null);
  const [statusText, setStatusText] = useState("در حال ورود به درگاه رسمی زرین‌پال…");

  useEffect(() => {
    document.documentElement.classList.add("is-pay-sandbox");
    return () => document.documentElement.classList.remove("is-pay-sandbox");
  }, []);

  useEffect(() => {
    if (isLoading || !user || !params?.id) return;
    fetchSandboxPayment(params.id)
      .then((payment) => {
        const url = payment.redirect_url || "";
        const authority = zarinpalAuthorityFromUrl(url);
        if (authority.startsWith("S")) {
          const official = `https://sandbox.zarinpal.com/pg/StartPay/${authority}/`;
          setStatusText("در حال ورود به درگاه رسمی زرین‌پال…");
          setTarget(official);
          window.location.replace(official);
          return;
        }
        if (authority.startsWith("A")) {
          const official = `https://www.zarinpal.com/pg/StartPay/${authority}/`;
          setStatusText("در حال ورود به درگاه رسمی زرین‌پال…");
          setTarget(official);
          window.location.replace(official);
          return;
        }
        setError("کد پیگیری زرین‌پال ناقص است. از سبد دوباره پرداخت را شروع کنید.");
      })
      .catch(() => {
        router.replace("/profile/orders?view=cart");
      });
  }, [user, isLoading, params?.id, router]);

  return (
    <div className="mk-psp">
      <p className="mk-psp-status">{error || statusText}</p>
      {target && !error && (
        <p className="mk-psp-status" style={{ fontSize: 13, wordBreak: "break-all", opacity: 0.75 }}>
          {target}
        </p>
      )}
    </div>
  );
}
