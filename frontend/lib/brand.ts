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

export const latestArticles = [
  {
    id: "pasture-to-table",
    slug: "from-pasture-to-table",
    category: "مسیر غذا",
    title: "از مرتع تا سفره",
    excerpt: "مسیر روشن — از چراگاه تا آماده‌سازی و بعد به خانه.",
    image: "/brand/goosht.png",
    alt: "گوشت تازه مرد کوهستان",
    date: "۱۴۰۴/۰۵/۲۱",
  },
  {
    id: "morning-root",
    slug: "morning-at-home",
    category: "زندگی خانگی",
    title: "صبحانه‌ای که ریشه دارد",
    excerpt: "لبنیات برای هر روز خانه — مسیری که می‌توان دید.",
    image: "/brand/home-dairy.png",
    alt: "صبحانه با لبنیات مرد کوهستان",
    date: "۱۴۰۴/۰۵/۱۴",
  },
  {
    id: "green-way",
    slug: "this-way-is-green",
    category: "راه ما",
    title: "این راه سبز است",
    excerpt: "آرامش، ارتفاع، وضوح — و اعتماد روی سفره.",
    image: "/brand/mardekoohestan.png",
    alt: "هویت برند مرد کوهستان",
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
    image: "/brand/mahi.png",
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
    image: "/brand/panir.png",
    alt: "پنیر مرد کوهستان",
    date: "۱۴۰۴/۰۵/۲۵",
  },
  {
    id: "prepared-meal",
    slug: "prepared-with-care",
    category: "غذای آماده",
    title: "با حوصله درست شده",
    excerpt: "غذایی که وقت آشپزخانه را کم می‌کند، نه طعم خانه را.",
    image: "/brand/akhary.png",
    alt: "غذای آماده مرد کوهستان",
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
