/** /v2 magazine + catalog interiors. Does not touch the live `/` catalog or magazine. */

export const v2MagazineIssue = {
  kicker: "این راه سبز است",
  title: "مجله مرد کوهستان",
  lead: "داستان‌هایی که در ارتفاع خوانده می‌شوند.",
  cover: "/brand/v2/book/mag-cover-morning.png",
  coverTitle: "مجله مرد کوهستان",
  coverSubtitle: "از مرتع تا سفره · بهار ۱۴۰۵",
  running: "مرد کوهستان · مجله",
  season: "بهار ۱۴۰۵",
  footHint: "ادامهٔ داستان‌ها",
  stories: [
    {
      id: "pasture",
      folio: "۰۴",
      kicker: "مرتع",
      title: "صبحی که هنوز عجله ندارد",
      excerpt:
        "راه از بلندی شروع می‌شود؛ جایی که نور آرام است و زمین هنوز بوی شب را نگه داشته.",
      body: "خانواده کنار مرتع می‌ایستد، نه برای شعار. برای دیدن همان مسیری که غذا از آن می‌آید.",
      image: "/brand/v2/book/mag-pasture.png",
      alt: "خانواده در مه صبحگاهی مرتع کوهستانی مرد کوهستان",
      caption: "مرتع، پیش از حرکت روز",
    },
    {
      id: "table",
      folio: "۰۶",
      kicker: "سفره",
      title: "نوری که روی میز می‌نشیند",
      excerpt:
        "کیفیت را نمی‌گوییم؛ روی میز دیده می‌شود. نان، پنیر، شیشهٔ سبز، دست‌هایی که جمع می‌شوند.",
      body: "سفرهٔ مرد کوهستان شلوغ نیست. ساده است، گرم است، و قابل اعتماد.",
      image: "/brand/v2/book/mag-table.png",
      alt: "سفرهٔ شب با پنیر، نان و شیشه در نور کم",
      caption: "سفره، وقتی خانه آرام می‌شود",
    },
    {
      id: "flock",
      folio: "۰۸",
      kicker: "گله",
      title: "مه، ارتفاع، سکوت",
      excerpt:
        "گوسفند در مه صبح یعنی عجله‌ای در کار نیست. سلامت از همین حوصله می‌آید.",
      body: "ارتفاع هوا را صاف می‌کند و طعم را واقعی نگه می‌دارد؛ بدون هیاهو، با دقت.",
      image: "/brand/v2/book/mag-flock.png",
      alt: "گله در مه سبز کوهستان",
      caption: "گله در ارتفاع",
    },
    {
      id: "path",
      folio: "۱۰",
      kicker: "راه",
      title: "این راه سبز است",
      excerpt:
        "مسیر کوهستان در شب هم سبز می‌ماند؛ نه به‌خاطر شعار، به‌خاطر همان زمینی که از آن آمده‌ایم.",
      body: "هر ورق این مجله یک قدم از همان راه است. از سنگ تا سفره.",
      image: "/brand/v2/book/mag-path.png",
      alt: "مسیر سنگی شبانه در مه جنگلی سبز",
      caption: "راه، وقتی شب روی کوه می‌نشیند",
    },
  ],
} as const;

export type V2CatalogSpread = {
  id: string;
  tabLabel: string;
  category: string;
  title: string;
  description: string;
  year: string;
  pageCount: number;
  image: string;
  alt: string;
  caption: string;
  theme: {
    background: string;
    accent: string;
    text: string;
  };
};

export const v2CatalogCopy = {
  sectionTitle: "کاتالوگ مرد کوهستان",
  sectionLead: "آنچه در مرتع ساخته می‌شود، ورق‌به‌ورق.",
  coverTitle: "کاتالوگ مرد کوهستان",
  coverSubtitle: "کار در ارتفاع · بهار ۱۴۰۵",
  cover: "/brand/v2/book/cat-cover-team.png",
  running: "مرد کوهستان · کاتالوگ",
} as const;

export const v2Catalogs: readonly V2CatalogSpread[] = [
  {
    id: "dairy",
    tabLabel: "لبنیات",
    category: "لبنیات",
    title: "شیر همان صبح",
    description:
      "لبنیات را در دفتر نمی‌سازیم. در مه صبح، کنار مشک و قالب پنیر، با همان حوصله‌ای که مرتع می‌طلبد.",
    year: "۱۴۰۵",
    pageCount: 24,
    image: "/brand/v2/book/cat-work-dairy.png",
    alt: "مرد کوهستان و همکار کنار مشک شیر و پنیر در مرتع صبحگاهی",
    caption: "لبنیات در ارتفاع",
    theme: {
      background: "#0a5540",
      accent: "#86C2EB",
      text: "#F4F0E8",
    },
  },
  {
    id: "meat",
    tabLabel: "گوشت تازه",
    category: "گوشت",
    title: "با حوصله، نه با شتاب",
    description:
      "گوشت تازه از گله‌ای می‌آید که در ارتفاع نفس می‌کشد. چوپان و مرد کوهستان کنار هم‌اند؛ عجله در کار نیست.",
    year: "۱۴۰۵",
    pageCount: 18,
    image: "/brand/v2/book/cat-work-flock.png",
    alt: "مرد کوهستان و چوپان میان گله در مه کوهستان",
    caption: "گله در مرتع",
    theme: {
      background: "#903828",
      accent: "#F4F0E8",
      text: "#F4F0E8",
    },
  },
  {
    id: "farm",
    tabLabel: "مزرعه",
    category: "راه ما",
    title: "جلسه روی نیمکت",
    description:
      "تصمیم‌های این راه در اتاق شیشه‌ای گرفته نمی‌شود. صبح، روی چوب، با دفترچه، رو به کوه.",
    year: "۱۴۰۵",
    pageCount: 32,
    image: "/brand/v2/book/cat-work-meeting.png",
    alt: "جلسه کاری مرد کوهستان با همکاران روی نیمکت چوبی در مزرعه کوهستانی",
    caption: "مزرعه، پیش از روز",
    theme: {
      background: "#204078",
      accent: "#86C2EB",
      text: "#F4F0E8",
    },
  },
  {
    id: "products",
    tabLabel: "سفره",
    category: "محصولات",
    title: "آنچه در خانه می‌ماند",
    description:
      "عسل، روغن، غله. محصول را در مرتع ثبت می‌کنیم تا وقتی به سفره رسید، همان راه پشتش باشد.",
    year: "۱۴۰۵",
    pageCount: 40,
    image: "/brand/v2/book/cat-work-photo.png",
    alt: "مرد کوهستان و همکار در حال عکاسی از محصولات روی سنگ مرتع",
    caption: "ثبت محصول در ارتفاع",
    theme: {
      background: "#0a5540",
      accent: "#50AF47",
      text: "#F4F0E8",
    },
  },
];
