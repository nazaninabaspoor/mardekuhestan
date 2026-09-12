export const heroVideos = [
  {
    id: "family",
    label: "خانواده",
    ctaLabel: "سفره خانواده",
    src: "/videos/hero-family.mp4",
    poster: "/brand/perf/poster-family.jpg",
  },
  {
    id: "product",
    label: "تولید",
    ctaLabel: "فرآوری اصیل",
    src: "/videos/neurollamas-generated-video%20(3).mp4",
    poster: "/brand/perf/poster-product.jpg",
  },
  {
    id: "livestock",
    label: "دامداری",
    ctaLabel: "پرورش سالم",
    src: "/videos/hero-mountain.mp4",
    poster: "/brand/perf/poster-livestock.jpg",
  },
  {
    id: "farm",
    label: "مزرعه",
    ctaLabel: "شروع مسیر سبز",
    src: "/videos/hero-main.mp4",
    poster: "/brand/perf/poster-main.jpg",
  },
] as const;

export type HeroVideo = (typeof heroVideos)[number];
