"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

/** پرداخت دیگر روی صفحهٔ داخلی نیست؛ کاربر باید به سندباکس رسمی درگاه برود. */
export default function SandboxPayPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/profile/orders?view=cart");
  }, [router]);
  return (
    <div className="mk-psp">
      <p className="mk-psp-status">بازگشت به سبد خرید…</p>
    </div>
  );
}
