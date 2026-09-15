import type { Metadata } from "next";

import { LegalPageShell } from "@/components/legal-page-shell";
import { contactInfo } from "@/lib/brand";

export const metadata: Metadata = {
  title: "بازگشت کالا | مرد کوهستان",
};

export default function ReturnsPage() {
  return (
    <LegalPageShell title="رویه بازگشت و تعویض کالا">
      <p>
        کالاهای پروتئینی و فاسدشدنی به دلیل ماهیت محصول، پس از تحویل سالم و رعایت زنجیرهٔ سرد
        معمولاً قابل بازگشت نیستند مگر مغایرت با سفارش یا نقص کیفی تأییدشده.
      </p>
      <h2>مغایرت یا نقص</h2>
      <p>
        حداکثر تا ۲۴ ساعت پس از تحویل، با ذکر شماره سفارش و عکس بسته‌بندی با پشتیبانی تماس
        بگیرید. پس از بررسی، تعویض یا استرداد طبق قوانین مصرف‌کننده انجام می‌شود.
      </p>
      <h2>لغو قبل از ارسال</h2>
      <p>
        اگر سفارش هنوز خارج نشده، از طریق حساب کاربری یا تماس با {contactInfo.phones[0]?.label}{" "}
        درخواست لغو ثبت کنید.
      </p>
      <h2>تماس</h2>
      <p>
        <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>
      </p>
    </LegalPageShell>
  );
}
