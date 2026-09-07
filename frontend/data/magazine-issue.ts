export type MagazineBoard = {
  slug: string;
  name: string;
  description: string;
  image: string;
};

export type MagazinePin = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  categorySlug: string;
  categoryName: string;
  image: string;
  author: string;
  minutes: number;
  date: string;
  height: "tall" | "mid" | "wide";
};

export const magazineBoards: MagazineBoard[] = [
  {
    slug: "rah-ma",
    name: "راه ما",
    description: "ارتفاع، آرامش، و همان مسیری که از کوه می‌آید.",
    image: "/magazine/hero-pasture.png",
  },
  {
    slug: "masir-ghaza",
    name: "مسیر غذا",
    description: "از مرتع و آب تا سفرهٔ خانه.",
    image: "/magazine/pin-flock.png",
  },
  {
    slug: "zendegi-khane",
    name: "زندگی خانگی",
    description: "صبحانه، جمعه، و غذا وقتی وقت کم است.",
    image: "/magazine/pin-breakfast.png",
  },
  {
    slug: "mazraeh",
    name: "مزرعه و مرتع",
    description: "نور، مه، و زمینی که عجله ندارد.",
    image: "/magazine/path-walker.png",
  },
];

export const magazinePins: MagazinePin[] = [
  {
    slug: "this-way-is-green",
    title: "این راه سبز است",
    excerpt: "آرامش، ارتفاع، وضوح — و اعتماد روی سفره.",
    body: "<p>راه مرد کوهستان از شعار شروع نمی‌شود. از مه صبح، از سنگی که خیس است، و از خانواده‌ای که مسیر غذا را می‌بیند.</p><p>سبز اینجا رنگ ویترین نیست. رنگ ارتفاع است؛ جایی که هوا صاف می‌ماند و طعم واقعی می‌ماند.</p>",
    categorySlug: "rah-ma",
    categoryName: "راه ما",
    image: "/magazine/pin-trail.png",
    author: "تحریریه مرد کوهستان",
    minutes: 6,
    date: "۱۴۰۴/۰۵/۰۷",
    height: "tall",
  },
  {
    slug: "from-pasture-to-table",
    title: "از مرتع تا سفره",
    excerpt: "مسیر روشن — از چراگاه تا آماده‌سازی و بعد به خانه.",
    body: "<p>مرتع اول دیده می‌شود، بعد غذا. این ترتیب را عوض نمی‌کنیم.</p><p>هر بسته که به خانه می‌رسد باید همان راه را در خودش داشته باشد: ارتفاع، حوصله، و دقت.</p>",
    categorySlug: "masir-ghaza",
    categoryName: "مسیر غذا",
    image: "/brand/our-way-02-nature.png",
    author: "تحریریه مرد کوهستان",
    minutes: 5,
    date: "۱۴۰۴/۰۵/۲۱",
    height: "mid",
  },
  {
    slug: "morning-at-home",
    title: "صبحانه‌ای که ریشه دارد",
    excerpt: "لبنیات برای هر روز خانه — مسیری که می‌توان دید.",
    body: "<p>صبح خانه باید ساده باشد. نان، پنیر، نوری که از پنجره می‌آید.</p><p>ریشه یعنی بدانیم شیر از کجا آمده و چرا طعمش آرام است.</p>",
    categorySlug: "zendegi-khane",
    categoryName: "زندگی خانگی",
    image: "/magazine/pin-breakfast.png",
    author: "تحریریه مرد کوهستان",
    minutes: 4,
    date: "۱۴۰۴/۰۵/۱۴",
    height: "tall",
  },
  {
    slug: "friday-at-home",
    title: "سفرهٔ جمعه در خانه",
    excerpt: "گوشتی که با دقت انتخاب شده و مسیرش روشن است.",
    body: "<p>جمعه شلوغ نیست؛ جمع است. گوشت سفره باید همان آرامش مرتع را داشته باشد.</p>",
    categorySlug: "zendegi-khane",
    categoryName: "زندگی خانگی",
    image: "/brand/home-meat.png",
    author: "تحریریه مرد کوهستان",
    minutes: 5,
    date: "۱۴۰۴/۰۵/۱۸",
    height: "mid",
  },
  {
    slug: "fresh-from-sea",
    title: "از آب تا آشپزخانه",
    excerpt: "ماهی و میگو با همان تازگی که روی سفره دیده می‌شود.",
    body: "<p>تازگی را نمی‌نویسیم روی جعبه. باید در آشپزخانه معلوم باشد.</p>",
    categorySlug: "masir-ghaza",
    categoryName: "مسیر غذا",
    image: "/brand/home-seafood.png",
    author: "تحریریه مرد کوهستان",
    minutes: 4,
    date: "۱۴۰۴/۰۵/۱۱",
    height: "wide",
  },
  {
    slug: "cheese-at-breakfast",
    title: "پنیر برای هر صبح",
    excerpt: "از شیر تا پنیر — مسیر کوتاه و قابل فهم.",
    body: "<p>پنیر صبح، غذای نمایشی نیست. غذای هر روز است؛ اگر مسیرش روشن باشد.</p>",
    categorySlug: "zendegi-khane",
    categoryName: "زندگی خانگی",
    image: "/brand/home-dairy.png",
    author: "تحریریه مرد کوهستان",
    minutes: 3,
    date: "۱۴۰۴/۰۵/۲۵",
    height: "mid",
  },
  {
    slug: "honey-of-altitude",
    title: "عسل ارتفاع",
    excerpt: "شیرینی که از عجله نیامده؛ از گل و هوا آمده.",
    body: "<p>عسل کوهستان را نباید با شربت قاطی کرد. طعمش باید بوی همان ارتفاع را بدهد.</p>",
    categorySlug: "mazraeh",
    categoryName: "مزرعه و مرتع",
    image: "/magazine/pin-honey.png",
    author: "تحریریه مرد کوهستان",
    minutes: 4,
    date: "۱۴۰۴/۰۶/۰۲",
    height: "tall",
  },
  {
    slug: "flock-in-the-mist",
    title: "گله در مه",
    excerpt: "سلامت از حوصله می‌آید؛ از عجله نمی‌آید.",
    body: "<p>مه صبح یعنی هنوز کسی عجله ندارد. گله در ارتفاع، همان تصویر آرامش است.</p>",
    categorySlug: "mazraeh",
    categoryName: "مزرعه و مرتع",
    image: "/magazine/pin-flock.png",
    author: "تحریریه مرد کوهستان",
    minutes: 5,
    date: "۱۴۰۴/۰۶/۰۴",
    height: "tall",
  },
  {
    slug: "ready-when-late",
    title: "وقتی وقت کم است",
    excerpt: "غذای آماده با طعم خانه — فقط گرم کردن می‌خواهد.",
    body: "<p>وقت کم، دلیل غذای بی‌ریشه نیست. آمادهٔ مرد کوهستان باید طعم خانه را نگه دارد.</p>",
    categorySlug: "zendegi-khane",
    categoryName: "زندگی خانگی",
    image: "/brand/home-ready.png",
    author: "تحریریه مرد کوهستان",
    minutes: 3,
    date: "۱۴۰۴/۰۵/۰۴",
    height: "mid",
  },
  {
    slug: "prepared-with-care",
    title: "با حوصله درست شده",
    excerpt: "غذایی که وقت آشپزخانه را کم می‌کند، نه طعم خانه را.",
    body: "<p>حوصله در کارخانه یعنی دقت در مواد، نه شعار روی بسته.</p>",
    categorySlug: "masir-ghaza",
    categoryName: "مسیر غذا",
    image: "/brand/our-way-03-quality.png",
    author: "تحریریه مرد کوهستان",
    minutes: 4,
    date: "۱۴۰۴/۰۴/۲۸",
    height: "wide",
  },
  {
    slug: "walker-on-the-path",
    title: "کسی که راه می‌رود",
    excerpt: "مسیر را باید رفت؛ نمی‌شود فقط درباره‌اش نوشت.",
    body: "<p>مرد کوهستان نام یک آدم روی پوستر نیست. نام راهی است که باید پیموده شود.</p>",
    categorySlug: "rah-ma",
    categoryName: "راه ما",
    image: "/magazine/path-walker.png",
    author: "تحریریه مرد کوهستان",
    minutes: 5,
    date: "۱۴۰۴/۰۶/۰۸",
    height: "tall",
  },
  {
    slug: "table-light",
    title: "نوری که روی میز می‌نشیند",
    excerpt: "سفره شلوغ نیست. ساده است، گرم است، قابل اعتماد.",
    body: "<p>کیفیت را روی میز می‌شود دید: نان، عسل، دست‌هایی که جمع می‌شوند.</p>",
    categorySlug: "zendegi-khane",
    categoryName: "زندگی خانگی",
    image: "/magazine/still-table.png",
    author: "تحریریه مرد کوهستان",
    minutes: 4,
    date: "۱۴۰۴/۰۶/۱۰",
    height: "mid",
  },
  {
    slug: "morning-cover",
    title: "جلد صبح",
    excerpt: "نور اول روز روی کاغذ و روی نان.",
    body: "<p>مجله از صبح شروع می‌شود؛ وقتی هنوز کسی عجله ندارد و میز خالی از سروصداست.</p>",
    categorySlug: "rah-ma",
    categoryName: "راه ما",
    image: "/brand/v2/book/mag-cover-morning.png",
    author: "تحریریه مرد کوهستان",
    minutes: 3,
    date: "۱۴۰۴/۰۶/۱۲",
    height: "tall",
  },
  {
    slug: "pasture-light",
    title: "نور مرتع",
    excerpt: "سبز اینجا رنگ ویترین نیست؛ رنگ هواست.",
    body: "<p>مرتع را باید در نور واقعی دید. آن وقت معلوم می‌شود غذا از کجا آمده.</p>",
    categorySlug: "mazraeh",
    categoryName: "مزرعه و مرتع",
    image: "/brand/v2/book/mag-pasture.png",
    author: "تحریریه مرد کوهستان",
    minutes: 4,
    date: "۱۴۰۴/۰۶/۱۴",
    height: "wide",
  },
  {
    slug: "path-of-the-flock",
    title: "مسیر گله",
    excerpt: "راه کوتاه نیست؛ درست است.",
    body: "<p>گله در ارتفاع یعنی زمان طبیعی. ما همان زمان را روی سفره نگه می‌داریم.</p>",
    categorySlug: "mazraeh",
    categoryName: "مزرعه و مرتع",
    image: "/brand/v2/book/mag-flock.png",
    author: "تحریریه مرد کوهستان",
    minutes: 4,
    date: "۱۴۰۴/۰۶/۱۶",
    height: "mid",
  },
  {
    slug: "table-gathering",
    title: "جمع شدن دور میز",
    excerpt: "غذا وقتی معنا دارد که کسی منتظر باشد.",
    body: "<p>میز خانواده جای شعار نیست. جای نان گرم و طعمی است که ریشه دارد.</p>",
    categorySlug: "zendegi-khane",
    categoryName: "زندگی خانگی",
    image: "/brand/v2/book/mag-table.png",
    author: "تحریریه مرد کوهستان",
    minutes: 3,
    date: "۱۴۰۴/۰۶/۱۸",
    height: "mid",
  },
  {
    slug: "green-path-page",
    title: "صفحهٔ راه سبز",
    excerpt: "از سنگ و مه تا خانه.",
    body: "<p>هر مسیر سبز یک صفحه دارد. این صفحه را باید ورق زد، نه فقط نگاه کرد.</p>",
    categorySlug: "rah-ma",
    categoryName: "راه ما",
    image: "/brand/v2/book/mag-path.png",
    author: "تحریریه مرد کوهستان",
    minutes: 5,
    date: "۱۴۰۴/۰۶/۲۰",
    height: "tall",
  },
  {
    slug: "climb-in-the-morning",
    title: "صبح از ارتفاع",
    excerpt: "آغاز راه، هوای پاک.",
    body: "<p>راه از بلندی شروع می‌شود؛ جایی که خاک و نور هنوز طعم واقعی را می‌سازند.</p>",
    categorySlug: "rah-ma",
    categoryName: "راه ما",
    image: "/brand/our-way-01-climb.png",
    author: "تحریریه مرد کوهستان",
    minutes: 4,
    date: "۱۴۰۴/۰۵/۰۱",
    height: "tall",
  },
  {
    slug: "home-balance",
    title: "تعادل سفره",
    excerpt: "گرم، ساده، دور هم.",
    body: "<p>پایان راه، سفرهٔ خانواده است؛ غذایی گرم که جمع می‌کند و اعتماد می‌سازد.</p>",
    categorySlug: "zendegi-khane",
    categoryName: "زندگی خانگی",
    image: "/brand/our-way-04-balance.png",
    author: "تحریریه مرد کوهستان",
    minutes: 4,
    date: "۱۴۰۴/۰۵/۰۹",
    height: "wide",
  },
  {
    slug: "the-way-ahead",
    title: "راه پیش رو",
    excerpt: "هنوز باید رفت.",
    body: "<p>راه سبز تمام نمی‌شود. هر فصل، یک قدم تازه روی همان مسیر است.</p>",
    categorySlug: "rah-ma",
    categoryName: "راه ما",
    image: "/brand/our-way-05-ahead.png",
    author: "تحریریه مرد کوهستان",
    minutes: 3,
    date: "۱۴۰۴/۰۶/۲۲",
    height: "mid",
  },
];

export function pinsByCategory(slug: string) {
  return magazinePins.filter((pin) => pin.categorySlug === slug);
}

export function pinBySlug(slug: string) {
  return magazinePins.find((pin) => pin.slug === slug) || null;
}

export function boardBySlug(slug: string) {
  return magazineBoards.find((board) => board.slug === slug) || null;
}

export function searchPins(query: string) {
  const q = query.trim();
  if (!q) return magazinePins;
  return magazinePins.filter(
    (pin) =>
      pin.title.includes(q) ||
      pin.excerpt.includes(q) ||
      pin.categoryName.includes(q) ||
      pin.slug.includes(q),
  );
}

export function relatedPins(slug: string, categorySlug: string, limit = 6) {
  return magazinePins.filter((pin) => pin.slug !== slug && pin.categorySlug === categorySlug).slice(0, limit);
}
