"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { fetchSandboxPayment } from "@/lib/api/payments";

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
    return false;
  } catch {
    return false;
  }
}

export default function SandboxPayPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.add("is-pay-sandbox");
    return () => document.documentElement.classList.remove("is-pay-sandbox");
  }, []);

  useEffect(() => {
    if (isLoading || !user || !params?.id) return;
    fetchSandboxPayment(params.id)
      .then((payment) => {
        const url = payment.redirect_url || "";
        if (isOfficialGatewayUrl(url)) {
          window.location.replace(url);
          return;
        }
        setError("کد پیگیری درگاه ناقص است. از سبد دوباره زرین‌پال را انتخاب کنید.");
      })
      .catch(() => {
        router.replace("/profile/orders?view=cart");
      });
  }, [user, isLoading, params?.id, router]);

  return (
    <div className="mk-psp">
      <p className="mk-psp-status">{error || "در حال ورود به درگاه رسمی…"}</p>
    </div>
  );
}
