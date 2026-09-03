import type { Metadata } from "next";
import localFont from "next/font/local";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { BrandTeaser } from "@/components/brand-teaser";
import { AuthProvider } from "@/lib/auth-context";

import "./globals.css";
import "./v2/v2.css";
import "./profile/workspace.css";

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
    <html
      lang="fa"
      dir="rtl"
      className={`${mardeKuhestan.variable} is-home-v2`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preload" as="image" href="/brand/orginal-clear.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var h=document.documentElement;h.classList.add("is-home-v2","is-logo-intro-done");if("scrollRestoration" in history)history.scrollRestoration="manual";}catch(e){}})();`,
          }}
        />
      </head>
      <body className={mardeKuhestan.className}>
        <AuthProvider>
          <BrandTeaser />
          <a className="skip-link btn-accent" href="#hero-title">
            رفتن به محتوای اصلی
          </a>
          <div className="site-canvas">
            <SiteHeader />
            {children}
            <SiteFooter />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
