export const heroVideos = [
  {
    id: "family",
    label: "خانواده",
    ctaLabel: "سفره خانواده",
    src: "/videos/hero-family.mp4",
    poster: "/brand/landing-home.png",
  },
  {
    id: "product",
    label: "تولید",
    ctaLabel: "فرآوری اصیل",
    src: "/videos/hero-product.mp4",
    poster: "/brand/landing-table.png",
  },
  {
    id: "livestock",
    label: "دامداری",
    ctaLabel: "پرورش سالم",
    src: "/videos/hero-mountain.mp4",
    poster: "/brand/landing-pasture.png",
  },
  {
    id: "farm",
    label: "مزرعه",
    ctaLabel: "شروع مسیر سبز",
    src: "/videos/hero-farm.mp4",
    poster: "/brand/landing-farm.png",
  },
] as const;

export type HeroVideo = (typeof heroVideos)[number];
