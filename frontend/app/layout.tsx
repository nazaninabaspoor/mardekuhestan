import type { Metadata } from "next";
import localFont from "next/font/local";

import { ContourField } from "@/components/brand-marks";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

import "./globals.css";
const mardeKuhestan = localFont({
  src: [
    {
      path: "../fonts/MardeKoohestan-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/MardeKoohestan-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-brand",
  display: "swap",
});

export const metadata: Metadata = {
  title: "مرد کوهستان | این راه سبز است",
  description:
    "صنایع غذایی مرد کوهستان. غذا از مزرعه و مرتع می‌آید تا به خانه برسد.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className={mardeKuhestan.variable}>
      <body className={mardeKuhestan.className}>
        <a className="skip-link btn-accent" href="#hero-title">
          رفتن به محتوای اصلی
        </a>
        <div className="site-canvas">
          <ContourField className="site-contour" />
          <SiteHeader />
          {children}
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
