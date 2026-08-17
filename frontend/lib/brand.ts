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
  {
    href: "/products?cat=fresh-meat",
    label: "گوشت تازه",
    line: "برای سفرهٔ جمعه",
    image: "/brand/home-meat.png",
    alt: "گوشت تازه مرد کوهستان",
  },
  {
    href: "/products?cat=dairy",
    label: "لبنیات",
    line: "برای هر روز خانه",
    image: "/brand/home-dairy.png",
    alt: "لبنیات مرد کوهستان",
  },
  {
    href: "/products?cat=seafood",
    label: "ماهی و میگو",
    line: "از آب، تازه",
    image: "/brand/home-seafood.png",
    alt: "ماهی و میگوی مرد کوهستان",
  },
  {
    href: "/products?cat=ready",
    label: "غذای آماده",
    line: "وقتی وقت کم است، طعم خانه بماند",
    image: "/brand/home-ready.png",
    alt: "غذای آماده مرد کوهستان",
  },
] as const;
