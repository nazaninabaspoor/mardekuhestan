import type { Metadata } from "next";
import Link from "next/link";

import { contactInfo } from "@/lib/brand";
import { publicSiteUrl } from "@/lib/site-env";

export const metadata: Metadata = {
  title: "تماس با ما | مرد کوهستان",
  description: "راه‌های تماس با صنایع غذایی مرد کوهستان — آدرس، تلفن و ایمیل.",
};

export default function ContactPage() {
  return (
    <main className="mk-legal-page">
      <div className="shell mk-legal-inner">
        <p className="mk-legal-kicker">این راه سبز است</p>
        <h1>تماس با ما</h1>
        <div className="mk-legal-body">
          <p>
            برای پیگیری سفارش، همکاری یا سوالات فروشگاه آنلاین با ما در ارتباط باشید. پاسخ‌گویی:
            شنبه تا پنج‌شنبه، ۸ تا ۱۷.
          </p>
          <h2>نشانی</h2>
          <p>{contactInfo.address}</p>
          <h2>تلفن</h2>
          <ul>
            {contactInfo.phones.map((phone) => (
              <li key={phone.href}>
                <a href={phone.href} dir="ltr">
                  {phone.label}
                </a>
              </li>
            ))}
          </ul>
          <h2>ایمیل</h2>
          <p>
            <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>
          </p>
          <h2>وب‌سایت</h2>
          <p>
            <a href={publicSiteUrl}>{publicSiteUrl.replace(/^https?:\/\//, "")}</a>
          </p>
          <p>
            <Link href="/legal/terms">قوانین و مقررات</Link>
            {" · "}
            <Link href="/legal/privacy">حریم خصوصی</Link>
            {" · "}
            <Link href="/legal/returns">بازگشت کالا</Link>
          </p>
        </div>
        <p className="mk-legal-back">
          <Link href="/">بازگشت به صفحهٔ اصلی</Link>
        </p>
      </div>
    </main>
  );
}
