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
    title: "از مرتع تا سفره: گوشتی که می‌شود فهمید از کجا آمده",
    excerpt: "مسیر کوتاه نیست، اما روشن است — از چراگاه تا آماده‌سازی و بعد به خانه.",
    image: "/brand/landing-pasture.png",
    alt: "دام در مرتع کوهستان",
    position: "center 50%",
    date: "۱۴۰۴/۰۵/۲۱",
  },
  {
    id: "morning-root",
    slug: "morning-at-home",
    category: "زندگی خانگی",
    title: "صبحانه‌ای که ریشه دارد",
    excerpt: "لبنیات برای هر روز خانه — نه فقط طعم، بلکه مسیری که می‌توان دید.",
    image: "/brand/home-dairy.png",
    alt: "صبحانه با لبنیات مرد کوهستان",
    position: "center 52%",
    date: "۱۴۰۴/۰۵/۱۴",
  },
  {
    id: "green-way",
    slug: "this-way-is-green",
    category: "راه ما",
    title: "این راه سبز است؛ یعنی چه؟",
    excerpt: "آرامش، ارتفاع، وضوح — و غذایی که اعتماد را روی سفره می‌گذارد.",
    image: "/brand/landing-way.png",
    alt: "مسیر سبز مرد کوهستان",
    position: "center 45%",
    date: "۱۴۰۴/۰۵/۰۷",
  },
] as const;
