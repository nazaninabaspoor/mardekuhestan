export type CatalogLayout =
  | "hero-right"
  | "hero-left"
  | "landscape"
  | "editorial-collage";

export type CatalogTheme = {
  background: string;
  accent: string;
  text: string;
  ambient: string;
  label?: string;
};

export type CatalogItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  tabLabel: string;
  year: string;
  pageCount: number;
  format: string;
  cover: string;
  image: string;
  images: readonly string[];
  pdf: string;
  layout: CatalogLayout;
  theme: CatalogTheme;
  metaLabel: string;
};

/**
 * Storytelling order is editable here.
 * Preferred brand arc: nature → craft → product → table.
 * Current employer spreads follow dairy → meat → farm → products.
 */
export const catalogs: readonly CatalogItem[] = [
  {
    id: "dairy",
    title: "لبنیات مرد کوهستان",
    description: "از شیر تازه تا محصولی که هر روز روی سفره خانواده می‌رسد.",
    category: "لبنیات",
    tabLabel: "لبنیات",
    year: "۱۴۰۵",
    pageCount: 24,
    format: "PDF",
    cover: "/brand/panir.png",
    image: "/brand/home-dairy.png",
    images: ["/brand/home-dairy.png", "/brand/panir.png", "/brand/landing-table.png"],
    pdf: "/brand/panir.png",
    layout: "hero-right",
    metaLabel: "کاتالوگ",
    theme: {
      background: "#FAF7F1",
      accent: "#005B48",
      text: "#173F36",
      ambient: "#F4F0E8",
      label: "#005B48",
    },
  },
  {
    id: "meat",
    title: "گوشت تازه",
    description: "از انتخاب و آماده‌سازی تا رسیدن محصول تازه به سفره.",
    category: "گوشت تازه",
    tabLabel: "گوشت تازه",
    year: "۱۴۰۵",
    pageCount: 18,
    format: "PDF",
    cover: "/brand/goosht.png",
    image: "/brand/home-meat.png",
    images: ["/brand/home-meat.png", "/brand/goosht.png", "/brand/landing-home.png"],
    pdf: "/brand/goosht.png",
    layout: "hero-left",
    metaLabel: "کاتالوگ",
    theme: {
      background: "#F7F0EA",
      accent: "#903828",
      text: "#3A241C",
      ambient: "#F3E8E0",
      label: "#903828",
    },
  },
  {
    id: "farm",
    title: "از مزرعه تا سفره",
    description: "روایت مسیر محصول؛ از طبیعت تا خانه.",
    category: "داستان برند",
    tabLabel: "داستان برند",
    year: "۱۴۰۵",
    pageCount: 32,
    format: "PDF",
    cover: "/brand/landing-pasture.png",
    image: "/brand/our-way-02-nature.png",
    images: [
      "/brand/landing-pasture.png",
      "/brand/our-way-02-nature.png",
      "/brand/landing-farm.png",
    ],
    pdf: "/brand/landing-pasture.png",
    layout: "landscape",
    metaLabel: "داستان محصول",
    theme: {
      background: "#005B48",
      accent: "#F4F0E8",
      text: "#F4F0E8",
      ambient: "#E8F0EA",
      label: "#F4F0E8",
    },
  },
  {
    id: "products",
    title: "محصولات مرد کوهستان",
    description: "مجموعه‌ای از آنچه برای خانه و سفره آماده کرده‌ایم.",
    category: "محصولات",
    tabLabel: "محصولات",
    year: "۱۴۰۵",
    pageCount: 40,
    format: "PDF",
    cover: "/brand/landing-market.png",
    image: "/brand/landing-market.png",
    images: [
      "/brand/landing-market.png",
      "/brand/home-ready.png",
      "/brand/akhary.png",
      "/brand/home-seafood.png",
    ],
    pdf: "/brand/landing-market.png",
    layout: "editorial-collage",
    metaLabel: "کاتالوگ",
    theme: {
      background: "#F7F4EE",
      accent: "#005B48",
      text: "#1D1D1B",
      ambient: "#F4F0E8",
      label: "#005B48",
    },
  },
] as const;

export const catalogBookCopy = {
  sectionTitle: "کاتالوگ‌های مرد کوهستان",
  sectionSubtitle: "هر محصول، بخشی از یک داستان است. ورق بزنید.",
  coverTitle: "کاتالوگ‌های مرد کوهستان",
  coverSubtitle: "داستان محصولات ما را ورق بزنید",
  coverHint: "برای باز کردن کلیک کنید",
  cta: "مشاهده کاتالوگ",
} as const;
