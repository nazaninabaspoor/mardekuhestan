export const heroVideos = [
  {
    id: "main",
    label: "طبیعت",
    src: "/videos/hero-main.mp4",
    poster: "/brand/landing-way.png",
  },
  {
    id: "mountain",
    label: "کوهستان",
    src: "/videos/hero-mountain.mp4",
    poster: "/brand/landing-pasture.png",
  },
  {
    id: "farm",
    label: "مزرعه",
    src: "/videos/hero-farm.mp4",
    poster: "/brand/landing-farm.png",
  },
  {
    id: "product",
    label: "تولید محصول",
    src: "/videos/hero-product.mp4",
    poster: "/brand/landing-table.png",
  },
  {
    id: "family",
    label: "سفره خانواده",
    src: "/videos/hero-family.mp4",
    poster: "/brand/landing-home.png",
  },
] as const;

export type HeroVideo = (typeof heroVideos)[number];
