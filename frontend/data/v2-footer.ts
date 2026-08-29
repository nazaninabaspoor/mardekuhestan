/** /v2 footer — dense horizontal bar, brand voice (not generic AI copy). */

export const v2Footer = {
  company: "صنایع غذایی مرد کوهستان",
  blurb:
    "از مرتع و مزرعه تا سفرهٔ خانه؛ گوشت، لبنیات و آماده‌پخت با مسیری که می‌شود دید.",
  tagline: "این راه سبز است",
  productsTitle: "دسته‌ها",
  products: [
    { href: "/products?cat=fresh-meat", label: "گوشت تازه" },
    { href: "/products?cat=dairy", label: "لبنیات" },
    { href: "/products?cat=seafood", label: "ماهی و میگو" },
    { href: "/products?cat=ready", label: "غذای آماده" },
  ],
  pagesTitle: "صفحات",
  pages: [
    { href: "/v2", label: "صفحه اصلی" },
    { href: "/chain", label: "مسیر غذا" },
    { href: "/way", label: "راه ما" },
    { href: "/stores", label: "فروشگاه‌ها" },
  ],
  contactTitle: "تماس",
  address: "رباط کریم، روستای نوده، خیابان نوده دوم، پلاک ۰",
  phones: [
    { label: "۰۲۱-۵۶۴۴۳۳۹۴", href: "tel:02156443394" },
    { label: "۰۲۱-۵۶۴۴۳۳۹۵", href: "tel:02156443395" },
  ],
  email: "info@mardekuhestan.com",
  actions: [
    { href: "/stores", label: "نزدیک‌ترین فروشگاه" },
    { href: "/products", label: "مشاهده محصولات" },
    { href: "/contact", label: "ارتباط با ما" },
  ],
  hours: "شنبه تا پنج‌شنبه · ۸ تا ۱۷",
  copyright:
    "کلیه حقوق این سایت متعلق به صنایع غذایی مرد کوهستان می‌باشد | All Rights Reserved to Mard-e-Kuhestan",
} as const;
