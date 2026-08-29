export type ProductCategoryId =
  | "fresh-meat"
  | "seafood"
  | "dairy"
  | "ready-meal"
  | "farm";

export type ProductCategory = {
  id: ProductCategoryId;
  title: string;
  eyebrow: string;
  headline: string;
  description: string;
  heroImage: string;
  cardImage: string;
  video?: string;
};

export const productCategories: ReadonlyArray<ProductCategory> = [
  {
    id: "fresh-meat",
    title: "گوشت",
    eyebrow: "از دامداری تا سفره",
    headline: "گوشت تازه",
    description: "برش‌های تازه و مطمئن؛ آماده‌ی یک وعده سالم.",
    heroImage: "/brand/home-meat.png",
    cardImage: "/brand/home-meat.png",
    video: "/brand/teaser.mp4",
  },
  {
    id: "seafood",
    title: "دریایی",
    eyebrow: "از دریا تا سفره",
    headline: "ماهی تازه",
    description: "تازه و سبک؛ برای یک سفره سالم دریایی.",
    heroImage: "/brand/home-seafood.png",
    cardImage: "/brand/home-seafood.png",
    video: "/brand/teaser.mp4",
  },
  {
    id: "dairy",
    title: "لبنیات",
    eyebrow: "از دامداری تا لبنیات تازه",
    headline: "لبنیات تازه",
    description: "طبیعی و روزانه؛ برای طعم سالم زندگی.",
    heroImage: "/brand/home-dairy.png",
    cardImage: "/brand/home-dairy.png",
    video: "/brand/teaser.mp4",
  },
  {
    id: "ready-meal",
    title: "آماده",
    eyebrow: "آماده برای طبخی سریع‌تر",
    headline: "غذای آماده",
    description: "سریع و باکیفیت؛ برای روزهای پرمشغله.",
    heroImage: "/brand/home-ready.png",
    cardImage: "/brand/home-ready.png",
    video: "/brand/teaser.mp4",
  },
  {
    id: "farm",
    title: "کشاورزی",
    eyebrow: "از مزرعه تا سفره",
    headline: "محصولات تازه",
    description: "تازه از مزرعه؛ رنگ و طعم طبیعت روی سفره.",
    heroImage: "/brand/landing-farm.png",
    cardImage: "/brand/landing-farm.png",
    video: "/brand/teaser.mp4",
  },
] as const;
