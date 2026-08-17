export const brand = {
  name: "مرد کوهستان",
  eyebrow: "صنایع غذایی مرد کوهستان",
  tagline: "این راه سبز است",
  promise: "این راه سبز است",
} as const;

export const topLinks = [
  { href: "/stores", label: "فروشگاه‌ها" },
  { href: "/way", label: "راه ما" },
  { href: "/contact", label: "تماس" },
] as const;

export const navItems = [
  { href: "/", label: "خانه" },
  { href: "/products", label: "محصولات", flag: "جدید" },
  { href: "/chain", label: "مسیر غذا", flag: "از مرتع" },
  { href: "/way", label: "راه ما" },
  { href: "/contact", label: "تماس" },
] as const;

export const trustSignals = [
  "از مزرعه می‌آید",
  "تازه به خانه می‌رسد",
  "می‌شود فهمید از کجا آمده",
  "با حوصله درست می‌شود",
] as const;

export const valueChain = [
  { id: "farm", label: "مزرعه" },
  { id: "process", label: "کشتارگاه" },
  { id: "make", label: "فرآوری" },
  { id: "move", label: "حمل" },
  { id: "market", label: "فروشگاه" },
] as const;

export const productShortcuts = [
  { href: "/products?cat=fresh-meat", label: "گوشت تازه" },
  { href: "/products?cat=dairy", label: "لبنیات" },
  { href: "/products?cat=seafood", label: "ماهی و میگو" },
  { href: "/products?cat=ready", label: "غذای آماده" },
] as const;
