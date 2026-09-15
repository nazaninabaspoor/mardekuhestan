import type { Metadata } from "next";

import { LegalPageShell } from "@/components/legal-page-shell";
import { contactInfo } from "@/lib/brand";

export const metadata: Metadata = {
  title: "حریم خصوصی | مرد کوهستان",
};

export default function PrivacyPage() {
  return (
    <LegalPageShell title="حریم خصوصی">
      <p>
        {contactInfo.company} اطلاعات شخصی شما (نام، تماس، نشانی تحویل و سوابق سفارش) را فقط
        برای پردازش سفارش، پشتیبانی و بهبود خدمات نگه می‌دارد.
      </p>
      <h2>چه داده‌هایی جمع می‌شود</h2>
      <ul>
        <li>اطلاعات حساب کاربری (ایمیل / موبایل)</li>
        <li>نشانی و نام تحویل‌گیرنده</li>
        <li>جزئیات سفارش و پرداخت (بدون نگهداری رمز کارت — پرداخت در درگاه بانکی انجام می‌شود)</li>
      </ul>
      <h2>اشتراک‌گذاری</h2>
      <p>
        داده‌ها به جز الزام قانونی یا ارائه‌دهندگان پرداخت و ارسال، در اختیار اشخاص ثالث
        بازاریابی قرار نمی‌گیرد.
      </p>
      <h2>حق شما</h2>
      <p>
        برای درخواست اصلاح یا حذف اطلاعات با {contactInfo.email} تماس بگیرید.
      </p>
    </LegalPageShell>
  );
}
