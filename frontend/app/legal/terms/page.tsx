import type { Metadata } from "next";

import { LegalPageShell } from "@/components/legal-page-shell";
import { contactInfo } from "@/lib/brand";

export const metadata: Metadata = {
  title: "قوانین و مقررات | مرد کوهستان",
};

export default function TermsPage() {
  return (
    <LegalPageShell title="قوانین و مقررات فروش">
      <p>
        خرید از فروشگاه آنلاین {contactInfo.company} به معنای پذیرش شرایط زیر است. قیمت‌ها به
        تومان و شامل مالیات بر ارزش افزوده (در صورت شمول) است مگر خلاف آن اعلام شود.
      </p>
      <h2>ثبت سفارش</h2>
      <p>
        پس از پرداخت موفق، سفارش ثبت می‌شود و کد پیگیری در حساب کاربری شما نمایش داده می‌شود.
        در صورت قطعی بودن موجودی، همکاران ما برای هماهنگی ارسال با شما تماس می‌گیرند.
      </p>
      <h2>ارسال</h2>
      <p>
        ارسال در تهران و شهرهای تحت پوشش طبق زمان‌بندی اعلام‌شده در سبد خرید انجام می‌شود.
        کالاهای فاسدشدنی با رعایت زنجیرهٔ سرد ارسال می‌گردند.
      </p>
      <h2>پرداخت</h2>
      <p>
        پرداخت اینترنتی از درگاه امن زرین‌پال انجام می‌شود. تا تکمیل پرداخت، سفارش نهایی
        محسوب نمی‌شود.
      </p>
      <h2>تماس</h2>
      <p>
        {contactInfo.address} —{" "}
        {contactInfo.phones.map((p) => p.label).join(" / ")} — {contactInfo.email}
      </p>
    </LegalPageShell>
  );
}
