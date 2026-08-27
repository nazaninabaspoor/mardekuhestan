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
    description: "انتخاب‌شده با دقت، تازه و مناسب برای یک وعده سالم و مطمئن.",
    heroImage: "/brand/home-meat.png",
    cardImage: "/brand/home-meat.png",
  },
  {
    id: "seafood",
    title: "دریایی",
    eyebrow: "از دریا تا سفره",
    headline: "ماهی تازه",
    description: "تازه، سبک و خوش‌طعم؛ مناسب برای پخت روزانه و غذاهای سالم دریایی.",
    heroImage: "/brand/home-seafood.png",
    cardImage: "/brand/home-seafood.png",
  },
  {
    id: "dairy",
    title: "لبنیات",
    eyebrow: "از دامداری تا لبنیات تازه",
    headline: "لبنیات تازه",
    description: "طعم ساده و طبیعی لبنیات تازه برای سفره‌ای سالم و روزمره.",
    heroImage: "/brand/home-dairy.png",
    cardImage: "/brand/home-dairy.png",
  },
  {
    id: "ready-meal",
    title: "آماده",
    eyebrow: "آماده برای طبخی سریع‌تر",
    headline: "غذای آماده",
    description: "انتخابی سریع و خوش‌طعم برای روزهایی که کیفیت هنوز اولویت شماست.",
    heroImage: "/brand/home-ready.png",
    cardImage: "/brand/home-ready.png",
  },
  {
    id: "farm",
    title: "کشاورزی",
    eyebrow: "از مزرعه تا سفره",
    headline: "محصولات تازه",
    description: "محصولات تازه کشاورزی، انتخاب‌شده از دل طبیعت برای یک سفره رنگارنگ.",
    heroImage: "/brand/landing-farm.png",
    cardImage: "/brand/landing-farm.png",
  },
] as const;
