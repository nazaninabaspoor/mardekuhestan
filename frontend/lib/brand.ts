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
  { href: "/rahyaar", label: "راهیار", flag: "بزودی", emoji: "🧭" },
  { href: "/products", label: "محصولات", emoji: "🍃" },
  { href: "/chain", label: "مسیر غذا", flag: "از مرتع", emoji: "🌄" },
  { href: "/way", label: "راه ما", emoji: "⛰️" },
  { href: "/contact", label: "تماس", emoji: "✉️" },
] as const;

export const headerTools = [
  { href: "/wishlist", label: "علاقه‌مندی", emoji: "🤍", quiet: true },
  { href: "/account", label: "ورود", emoji: "🗝️", quiet: false },
  { href: "/cart", label: "سفره من", emoji: "🍽️", quiet: false },
] as const;

export const ourWay = {
  kicker: "از مرتع تا سفره",
  title: "راه ما",
  lead: "راه ما از کوه و مرتع شروع می‌شود و آرام به خانه می‌رسد؛ همان مسیری که طعم واقعی را حفظ می‌کند.",
  note: "هر روز با همان حوصله کار می‌کنیم تا غذایی سالم، قابل‌اعتماد و نزدیک به طبیعت، روی سفرهٔ خانواده باشد.",
  moreHref: "/way",
  moreLabel: "ادامه راه",
  steps: [
    {
      id: "origin",
      title: "از کوهستان",
      body: "آغاز راه، هوای پاک.",
      story:
        "راه از بلندی و هوای تازه شروع می‌شود؛ جایی که خاک و نور هنوز طعم واقعی را می‌سازند.",
      scene: "/brand/our-way-01-climb.png?v=2",
      sceneAlt: "صبح آرام مرتع کوهستانی مرد کوهستان",
      side: "east",
      pose: "climb",
    },
    {
      id: "nature",
      title: "کنار مرتع",
      body: "دام سالم، زمین سبز.",
      story:
        "در مرتع، دام و طبیعت کنار هم‌اند. مراقبت آرام یعنی عجله نیست و سلامت حفظ می‌شود.",
      scene: "/brand/our-way-02-nature.png?v=3",
      sceneAlt: "مرد کوهستان کنار مرتع سبز و دام سالم",
      side: "west",
      pose: "pasture",
    },
    {
      id: "quality",
      title: "با دقت",
      body: "انتخاب درست، دست حوصله‌دار.",
      story:
        "کیفیت در انتخاب و زمان درست است؛ کاری با حوصله تا طعم واقعی تا سفره بماند.",
      scene: "/brand/our-way-03-quality.png?v=4",
      sceneAlt: "آماده‌سازی با دقت در فضای گرم و طبیعی",
      side: "east",
      pose: "craft",
    },
    {
      id: "balance",
      title: "سفرهٔ خانه",
      body: "گرم، ساده، دور هم.",
      story:
        "پایان راه، سفرهٔ خانواده است؛ غذایی گرم و ساده که جمع می‌کند و اعتماد می‌سازد.",
      scene: "/brand/our-way-04-balance.png?v=2",
      sceneAlt: "سفرهٔ خانوادگی گرم با محصولات مرد کوهستان",
      side: "west",
      pose: "tend",
    },
    {
      id: "ahead",
      title: "یک قدم بعد",
      body: "راه سبز ادامه دارد.",
      story:
        "هر روز یک قدم جلوتر؛ مسیر را کمی مطمئن‌تر می‌کنیم تا رسیدن به خانه ساده‌تر بماند.",
      scene: "/brand/our-way-05-ahead.png?v=2",
      sceneAlt: "مسیر آرام به سوی خانه‌ای روشن در دره",
      side: "east",
      pose: "descend",
    },
  ],
} as const;

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

export const homeDoors = [
  {
    id: "fresh-meat",
    href: "/products?cat=fresh-meat",
    label: "گوشت تازه",
    line: "برای سفرهٔ جمعه",
    story:
      "از مرتع می‌آید و با همان دقتی که سفرهٔ جمعه می‌خواهد آماده می‌شود. مسیرش روشن است و برای خانه انتخاب می‌شود.",
    image: "/brand/goosht.png",
    alt: "سفرهٔ جمعه با گوشت تازه مرد کوهستان",
    position: "center 62%",
  },
  {
    id: "dairy",
    href: "/products?cat=dairy",
    label: "لبنیات",
    line: "برای هر روز خانه",
    story:
      "برای صبحانه و هر روز خانه. شیر و پنیر و ماست از مسیری می‌آید که می‌شود فهمید از کجا آمده.",
    image: "/brand/panir.png",
    alt: "صبحانه خانه با لبنیات مرد کوهستان",
    position: "center 52%",
  },
  {
    id: "seafood",
    href: "/products?cat=seafood",
    label: "ماهی و میگو",
    line: "از آب، تازه",
    story:
      "از آب تا آشپزخانه، با همان تازگی که روی سفره دیده می‌شود. برای وقتی که طعم دریا را می‌خواهید، نه بستهٔ ناشناس.",
    image: "/brand/mahi.png",
    alt: "ماهی و میگوی تازه برای خانه",
    position: "center 50%",
  },
  {
    id: "ready",
    href: "/products?cat=ready",
    label: "غذای آماده",
    line: "طعم خانه می‌ماند",
    story:
      "وقتی وقت کم است، همان طعم خانه بماند. غذایی که با حوصله درست شده و فقط گرم کردن می‌خواهد.",
    image: "/brand/akhary.png",
    alt: "غذای آماده خانگی مرد کوهستان",
    position: "center 58%",
  },
] as const;

export const homeCategoryProducts = {
  "fresh-meat": [
    {
      id: "meat-loin",
      name: "ران گوسفند",
      note: "برش تازه",
      href: "/products?cat=fresh-meat",
      image: "/brand/goosht.png",
      alt: "ران گوسفند تازه",
    },
    {
      id: "meat-shoulder",
      name: "گردن بره",
      note: "مناسب خانه",
      href: "/products?cat=fresh-meat",
      image: "/brand/home-meat.png",
      alt: "گردن بره",
    },
    {
      id: "meat-kebab",
      name: "کباب‌پز",
      note: "آماده پخت",
      href: "/products?cat=fresh-meat",
      image: "/brand/goosht.png",
      alt: "گوشت کباب‌پز",
    },
  ],
  dairy: [
    {
      id: "dairy-cheese",
      name: "پنیر سنتی",
      note: "صبحانه",
      href: "/products?cat=dairy",
      image: "/brand/panir.png",
      alt: "پنیر سنتی",
    },
    {
      id: "dairy-yogurt",
      name: "ماست چکیده",
      note: "هر روز",
      href: "/products?cat=dairy",
      image: "/brand/home-dairy.png",
      alt: "ماست چکیده",
    },
    {
      id: "dairy-milk",
      name: "شیر تازه",
      note: "خانواده",
      href: "/products?cat=dairy",
      image: "/brand/panir.png",
      alt: "شیر تازه",
    },
  ],
  seafood: [
    {
      id: "sea-fish",
      name: "ماهی تازه",
      note: "از دریا",
      href: "/products?cat=seafood",
      image: "/brand/mahi.png",
      alt: "ماهی تازه",
    },
    {
      id: "sea-shrimp",
      name: "میگو",
      note: "انتخاب روز",
      href: "/products?cat=seafood",
      image: "/brand/home-seafood.png",
      alt: "میگوی تازه",
    },
    {
      id: "sea-mix",
      name: "ماهی جنوب",
      note: "تازه",
      href: "/products?cat=seafood",
      image: "/brand/mahi.png",
      alt: "ماهی جنوب",
    },
  ],
  ready: [
    {
      id: "ready-stew",
      name: "خورشت آماده",
      note: "فقط گرم کن",
      href: "/products?cat=ready",
      image: "/brand/akhary.png",
      alt: "خورشت آماده",
    },
    {
      id: "ready-rice",
      name: "غذای کامل",
      note: "طعم خانه",
      href: "/products?cat=ready",
      image: "/brand/home-ready.png",
      alt: "غذای کامل آماده",
    },
    {
      id: "ready-soup",
      name: "آش آماده",
      note: "سریع",
      href: "/products?cat=ready",
      image: "/brand/akhary.png",
      alt: "آش آماده",
    },
  ],
} as const;

export type HomeDoorId = keyof typeof homeCategoryProducts;

/** دو محصول در راه — تیزر «به‌زودی» بین راه ما و مجله */
export const upcomingDrops = {
  kicker: "به‌زودی",
  title: "در راه سفره",
  lead: "دو محصول تازه از همان مسیر سبز؛ هنوز نرسیده‌اند، اما طعم‌شان روشن است.",
  ctaLabel: "خبرم کن",
  ctaHref: "/contact",
  items: [
    {
      id: "drop-meadow-butter",
      name: "کرهٔ مرتع",
      note: "از شیر تازهٔ صبح؛ برای نان گرم خانه",
      eta: "به‌زودی",
      image: "/brand/home-dairy.png",
      alt: "کرهٔ مرتع مرد کوهستان — به‌زودی",
    },
    {
      id: "drop-green-stew",
      name: "خوراک راه سبز",
      note: "بشقاب میگو؛ تازه از آب تا سفره",
      eta: "به‌زودی",
      image: "/brand/home-seafood.png",
      alt: "بشقاب میگوی خوراک راه سبز — به‌زودی",
    },
  ],
} as const;

/** ویژه‌ها و تازه‌رسیده‌ها — زیر «چه به خانه می‌رسد» */
export const featuredPicks = {
  title: "برای سفرهٔ امروز",
  moreHref: "/products",
  moreLabel: "مشاهده همه",
  items: [
    {
      id: "feat-meat-loin",
      name: "ران گوسفند",
      note: "برش تازه از مرتع",
      badge: "ویژه",
      href: "/products?cat=fresh-meat",
      image: "/brand/goosht.png",
      alt: "ران گوسفند تازه مرد کوهستان",
    },
    {
      id: "feat-dairy-cheese",
      name: "پنیر سنتی",
      note: "برای صبحانهٔ خانه",
      badge: "تازه",
      href: "/products?cat=dairy",
      image: "/brand/panir.png",
      alt: "پنیر سنتی مرد کوهستان",
    },
    {
      id: "feat-sea-shrimp",
      name: "میگوی روز",
      note: "از آب، همان‌روز",
      badge: "جدید",
      href: "/products?cat=seafood",
      image: "/brand/home-seafood.png",
      alt: "میگوی تازه مرد کوهستان",
    },
    {
      id: "feat-ready-stew",
      name: "خورشت آماده",
      note: "طعم خانه، فقط گرم کن",
      badge: "ویژه",
      href: "/products?cat=ready",
      image: "/brand/akhary.png",
      alt: "خورشت آماده مرد کوهستان",
    },
  ],
} as const;

export const contactInfo = {
  company: "صنایع غذایی مرد کوهستان",
  blurb:
    "مرد کوهستان تولیدکننده فرآورده‌های پروتئینی سالم و باکیفیت است؛ محصولاتی که با تکیه بر فرآیندهای دقیق، استانداردهای تخصصی و احترام به طبیعت شکل می‌گیرند.",
  address: "رباط کریم، روستای نوده، خیابان نوده دوم، پلاک ۰",
  phones: [
    { label: "۰۲۱-۵۶۴۴۳۳۹۴", href: "tel:02156443394" },
    { label: "۰۲۱-۵۶۴۴۳۳۹۵", href: "tel:02156443395" },
  ],
  email: "info@mardekuhestan.com",
  pages: [
    { href: "/", label: "صفحه اصلی" },
    { href: "/chain", label: "زنجیره" },
    { href: "/way", label: "راه‌ها" },
    { href: "/contact", label: "ارتباط با ما" },
  ],
} as const;

export const latestArticles = [
  {
    id: "pasture-to-table",
    slug: "from-pasture-to-table",
    category: "مسیر غذا",
    title: "از مرتع تا سفره",
    excerpt: "مسیر روشن — از چراگاه تا آماده‌سازی و بعد به خانه.",
    image: "/brand/our-way-02-nature.png",
    alt: "مرتع و مسیر غذای مرد کوهستان",
    date: "۱۴۰۴/۰۵/۲۱",
  },
  {
    id: "morning-root",
    slug: "morning-at-home",
    category: "زندگی خانگی",
    title: "صبحانه‌ای که ریشه دارد",
    excerpt: "لبنیات برای هر روز خانه — مسیری که می‌توان دید.",
    image: "/brand/our-way-04-balance.png",
    alt: "سفرهٔ خانگی مرد کوهستان",
    date: "۱۴۰۴/۰۵/۱۴",
  },
  {
    id: "green-way",
    slug: "this-way-is-green",
    category: "راه ما",
    title: "این راه سبز است",
    excerpt: "آرامش، ارتفاع، وضوح — و اعتماد روی سفره.",
    image: "/brand/our-way-01-climb.png",
    alt: "آغاز راه سبز مرد کوهستان",
    date: "۱۴۰۴/۰۵/۰۷",
  },
  {
    id: "friday-table",
    slug: "friday-at-home",
    category: "زندگی خانگی",
    title: "سفرهٔ جمعه در خانه",
    excerpt: "گوشتی که با دقت انتخاب شده و مسیرش روشن است.",
    image: "/brand/home-meat.png",
    alt: "گوشت برای سفرهٔ جمعه",
    date: "۱۴۰۴/۰۵/۱۸",
  },
  {
    id: "from-sea",
    slug: "fresh-from-sea",
    category: "مسیر غذا",
    title: "از آب تا آشپزخانه",
    excerpt: "ماهی و میگو با همان تازگی که روی سفره دیده می‌شود.",
    image: "/brand/home-seafood.png",
    alt: "ماهی و میگوی تازه",
    date: "۱۴۰۴/۰۵/۱۱",
  },
  {
    id: "ready-when-late",
    slug: "ready-when-late",
    category: "زندگی خانگی",
    title: "وقتی وقت کم است",
    excerpt: "غذای آماده با طعم خانه — فقط گرم کردن می‌خواهد.",
    image: "/brand/home-ready.png",
    alt: "غذای آماده خانگی",
    date: "۱۴۰۴/۰۵/۰۴",
  },
  {
    id: "cheese-morning",
    slug: "cheese-at-breakfast",
    category: "محبوب",
    title: "پنیر برای هر صبح",
    excerpt: "از شیر تا پنیر — مسیر کوتاه و قابل فهم.",
    image: "/brand/home-dairy.png",
    alt: "صبحانه با لبنیات مرد کوهستان",
    date: "۱۴۰۴/۰۵/۲۵",
  },
  {
    id: "prepared-meal",
    slug: "prepared-with-care",
    category: "غذای آماده",
    title: "با حوصله درست شده",
    excerpt: "غذایی که وقت آشپزخانه را کم می‌کند، نه طعم خانه را.",
    image: "/brand/our-way-03-quality.png",
    alt: "آماده‌سازی با دقت مرد کوهستان",
    date: "۱۴۰۴/۰۴/۲۸",
  },
] as const;

export const articleGroups = [
  {
    id: "popular",
    label: "محبوب‌ترین",
    line: "بیشتر خوانده شده",
    icon: "popular",
    articleIds: ["cheese-morning", "pasture-to-table", "morning-root", "from-sea"],
  },
  {
    id: "essential",
    label: "مهم‌ترین",
    line: "برای آشنایی با ما",
    icon: "essential",
    articleIds: ["green-way", "pasture-to-table", "friday-table"],
  },
  {
    id: "latest",
    label: "جدیدترین",
    line: "تازه در مجله",
    icon: "latest",
    articleIds: ["cheese-morning", "friday-table", "from-sea", "ready-when-late"],
  },
  {
    id: "food-path",
    label: "مسیر غذا",
    line: "از مرتع تا سفره",
    icon: "path",
    articleIds: ["pasture-to-table", "from-sea", "friday-table"],
  },
  {
    id: "home-life",
    label: "زندگی خانگی",
    line: "برای هر روز خانه",
    icon: "home",
    articleIds: ["morning-root", "ready-when-late", "cheese-morning", "prepared-meal"],
  },
] as const;

export function getArticlesByIds(ids: readonly string[]) {
  return ids
    .map((id) => latestArticles.find((article) => article.id === id))
    .filter((article): article is (typeof latestArticles)[number] => Boolean(article));
}

export const catalogItems = [
  {
    id: "cat-meat",
    href: "/products?cat=fresh-meat",
    category: "کاتالوگ",
    title: "گوشت تازه",
    meta: "PDF · ۱۴۰۴",
    image: "/brand/goosht.png",
    alt: "کاتالوگ گوشت تازه",
  },
  {
    id: "cat-dairy",
    href: "/products?cat=dairy",
    category: "کاتالوگ",
    title: "لبنیات",
    meta: "PDF · ۱۴۰۴",
    image: "/brand/panir.png",
    alt: "کاتالوگ لبنیات",
  },
  {
    id: "cat-seafood",
    href: "/products?cat=seafood",
    category: "کاتالوگ",
    title: "ماهی و میگو",
    meta: "PDF · ۱۴۰۴",
    image: "/brand/mahi.png",
    alt: "کاتالوگ ماهی و میگو",
  },
  {
    id: "cat-ready",
    href: "/products?cat=ready",
    category: "کاتالوگ",
    title: "غذای آماده",
    meta: "PDF · ۱۴۰۴",
    image: "/brand/akhary.png",
    alt: "کاتالوگ غذای آماده",
  },
  {
    id: "gal-home",
    href: "/way",
    category: "گالری",
    title: "خانه و سفره",
    meta: "عکس · ۱۴۰۴",
    image: "/brand/landing-home.png",
    alt: "گالری خانه و سفره",
  },
  {
    id: "gal-pasture",
    href: "/chain",
    category: "گالری",
    title: "مرتع و مزرعه",
    meta: "عکس · ۱۴۰۴",
    image: "/brand/landing-pasture.png",
    alt: "گالری مرتع",
  },
  {
    id: "gal-way",
    href: "/way",
    category: "گالری",
    title: "مسیر سبز",
    meta: "عکس · ۱۴۰۴",
    image: "/brand/landing-way.png",
    alt: "گالری مسیر سبز",
  },
  {
    id: "gal-table",
    href: "/products",
    category: "گالری",
    title: "سفرهٔ خانگی",
    meta: "عکس · ۱۴۰۴",
    image: "/brand/home-dairy.png",
    alt: "گالری سفرهٔ خانگی",
  },
  {
    id: "pack-meat",
    href: "/products?cat=fresh-meat",
    category: "بسته‌بندی",
    title: "بسته گوشت",
    meta: "نمای نزدیک",
    image: "/brand/home-meat.png",
    alt: "بسته‌بندی گوشت",
  },
  {
    id: "pack-seafood",
    href: "/products?cat=seafood",
    category: "بسته‌بندی",
    title: "بسته دریایی",
    meta: "نمای نزدیک",
    image: "/brand/home-seafood.png",
    alt: "بسته‌بندی ماهی",
  },
  {
    id: "pack-ready",
    href: "/products?cat=ready",
    category: "بسته‌بندی",
    title: "غذای آماده",
    meta: "نمای نزدیک",
    image: "/brand/home-ready.png",
    alt: "بسته‌بندی غذای آماده",
  },
  {
    id: "brand-mark",
    href: "/way",
    category: "هویت برند",
    title: "مُهر دایره‌ای",
    meta: "Brandmark",
    image: "/brand/orginal-clear.png",
    alt: "مُهر برند مرد کوهستان",
  },
  {
    id: "brand-type",
    href: "/way",
    category: "هویت برند",
    title: "لوگوتایپ",
    meta: "Logotype",
    image: "/brand/mardekoohestan.png",
    alt: "لوگوتایپ مرد کوهستان",
  },
  {
    id: "brand-green",
    href: "/way",
    category: "هویت برند",
    title: "این راه سبز است",
    meta: "پیام برند",
    image: "/brand/orginal.png",
    alt: "هویت بصری مرد کوهستان",
  },
] as const;

export const catalogGroups = [
  {
    id: "catalog",
    label: "کاتالوگ",
    line: "برگه‌های محصول برای خانه و فروشگاه",
    icon: "catalog",
    itemIds: ["cat-meat", "cat-dairy", "cat-seafood", "cat-ready"],
  },
  {
    id: "gallery",
    label: "گالری",
    line: "عکس‌های واقعی برند و محصول",
    icon: "gallery",
    itemIds: ["gal-home", "gal-pasture", "gal-way", "gal-table"],
  },
  {
    id: "packaging",
    label: "بسته‌بندی",
    line: "بسته، برچسب، و جزئیات محصول",
    icon: "packaging",
    itemIds: ["pack-meat", "pack-seafood", "pack-ready", "cat-dairy"],
  },
  {
    id: "brand",
    label: "هویت برند",
    line: "لوگو، مُهر، و زبان بصری",
    icon: "brand",
    itemIds: ["brand-mark", "brand-type", "brand-green", "gal-way"],
  },
] as const;

export function getCatalogByIds(ids: readonly string[]) {
  return ids
    .map((id) => catalogItems.find((item) => item.id === id))
    .filter((item): item is (typeof catalogItems)[number] => Boolean(item));
}
