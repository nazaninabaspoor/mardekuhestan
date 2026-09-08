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
  goods: string[];
  stack?: string;
  aspect: string;
  author: string;
  minutes: number;
  date: string;
  height: "tall" | "mid" | "wide";
};

const PNG = {
  way: "/magazine/png/png-way-green.png",
  lamb: "/magazine/png/png-lamb-chops.png",
  bread: "/magazine/png/png-bread.png",
  sheep: "/magazine/png/png-sheep.png",
  honey: "/magazine/png/png-honeycomb.png",
  boots: "/magazine/png/png-boots.png",
  stew: "/magazine/png/png-stew.png",
  wool: "/magazine/png/png-wool.png",
  spring: "/magazine/png/png-spring.png",
  staff: "/magazine/png/png-staff.png",
  cheese: "/magazine/png/png-cheese.png",
  flowers: "/magazine/png/png-flowers.png",
  yogurt: "/magazine/png/png-yogurt.png",
  stone: "/magazine/png/png-stone.png",
  lamp: "/magazine/png/png-lamp.png",
  fish: "/magazine/png/png-fish.png",
  pomegranate: "/magazine/png/png-pomegranate.png",
  olives: "/magazine/png/png-olives.png",
  tea: "/magazine/png/png-tea.png",
  walnuts: "/magazine/png/png-walnuts.png",
} as const;

export const magazineBoards: MagazineBoard[] = [
  {
    slug: "rah-ma",
    name: "راه ما",
    description: "ارتفاع، آرامش، و همان مسیری که از کوه می‌آید.",
    image: PNG.way,
  },
  {
    slug: "masir-ghaza",
    name: "مسیر غذا",
    description: "از مرتع و آب تا سفرهٔ خانه.",
    image: PNG.lamb,
  },
  {
    slug: "zendegi-khane",
    name: "زندگی خانگی",
    description: "صبحانه، جمعه، و نوری که روی میز می‌نشیند.",
    image: PNG.bread,
  },
  {
    slug: "mazraeh",
    name: "مزرعه و مرتع",
    description: "مه، پشم، و زمینی که عجله ندارد.",
    image: PNG.sheep,
  },
];

export const magazineToday = [
  "/magazine/shots/shot-valley-wide.png",
  "/magazine/shots/shot-ridge-mist.png",
  "/magazine/shots/shot-flock-dew.png",
  "/magazine/shots/shot-honey-comb.png",
  "/magazine/shots/shot-bread-morning.png",
];

export const magazinePins: MagazinePin[] = [
  {
    slug: "this-way-is-green",
    title: "این راه سبز است",
    excerpt: "آرامش، ارتفاع، وضوح — و اعتماد روی سفره.",
    body: "<p>راه مرد کوهستان از شعار شروع نمی‌شود. از مه صبح، از سنگی که خیس است، و از خانواده‌ای که مسیر غذا را می‌بیند.</p><p>سبز اینجا رنگ ویترین نیست. رنگ ارتفاع است؛ جایی که هوا صاف می‌ماند و طعم واقعی می‌ماند.</p>",
    categorySlug: "rah-ma",
    categoryName: "راه ما",
    image: PNG.way,
    goods: [PNG.way],
    aspect: "9 / 16",
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
    image: PNG.lamb,
    goods: [PNG.lamb],
    aspect: "16 / 9",
    author: "تحریریه مرد کوهستان",
    minutes: 5,
    date: "۱۴۰۴/۰۵/۲۱",
    height: "wide",
  },
  {
    slug: "morning-at-home",
    title: "صبحانه‌ای که ریشه دارد",
    excerpt: "نان، ماست، عسل — مسیری که می‌توان دید.",
    body: "<p>صبح خانه باید ساده باشد. نان، پنیر، نوری که از پنجره می‌آید.</p><p>ریشه یعنی بدانیم شیر از کجا آمده و چرا طعمش آرام است.</p>",
    categorySlug: "zendegi-khane",
    categoryName: "زندگی خانگی",
    image: PNG.bread,
    goods: [PNG.bread],
    aspect: "4 / 3",
    author: "تحریریه مرد کوهستان",
    minutes: 4,
    date: "۱۴۰۴/۰۵/۱۴",
    height: "wide",
  },
  {
    slug: "flock-in-the-mist",
    title: "گله در مه",
    excerpt: "سلامت از حوصله می‌آید؛ از عجله نمی‌آید.",
    body: "<p>مه صبح یعنی هنوز کسی عجله ندارد. گله در ارتفاع، همان تصویر آرامش است.</p>",
    categorySlug: "mazraeh",
    categoryName: "مزرعه و مرتع",
    image: PNG.sheep,
    goods: [PNG.sheep],
    aspect: "3 / 4",
    author: "تحریریه مرد کوهستان",
    minutes: 5,
    date: "۱۴۰۴/۰۶/۰۴",
    height: "tall",
  },
  {
    slug: "honey-of-altitude",
    title: "عسل ارتفاع",
    excerpt: "شیرینی که از عجله نیامده؛ از گل و هوا آمده.",
    body: "<p>عسل کوهستان را نباید با شربت قاطی کرد. طعمش باید بوی همان ارتفاع را بدهد.</p>",
    categorySlug: "mazraeh",
    categoryName: "مزرعه و مرتع",
    image: PNG.honey,
    goods: [PNG.honey],
    aspect: "3 / 4",
    author: "تحریریه مرد کوهستان",
    minutes: 4,
    date: "۱۴۰۴/۰۶/۰۲",
    height: "tall",
  },
  {
    slug: "walker-on-the-path",
    title: "کسی که راه می‌رود",
    excerpt: "مسیر را باید رفت؛ نمی‌شود فقط درباره‌اش نوشت.",
    body: "<p>مرد کوهستان نام یک آدم روی پوستر نیست. نام راهی است که باید پیموده شود.</p>",
    categorySlug: "rah-ma",
    categoryName: "راه ما",
    image: PNG.boots,
    goods: [PNG.boots],
    aspect: "3 / 4",
    author: "تحریریه مرد کوهستان",
    minutes: 5,
    date: "۱۴۰۴/۰۶/۰۸",
    height: "tall",
  },
  {
    slug: "prepared-with-care",
    title: "با حوصله درست شده",
    excerpt: "غذایی که وقت آشپزخانه را کم می‌کند، نه طعم خانه را.",
    body: "<p>حوصله در کارخانه یعنی دقت در مواد، نه شعار روی بسته.</p>",
    categorySlug: "masir-ghaza",
    categoryName: "مسیر غذا",
    image: PNG.stew,
    goods: [PNG.stew],
    aspect: "3 / 4",
    author: "تحریریه مرد کوهستان",
    minutes: 4,
    date: "۱۴۰۴/۰۴/۲۸",
    height: "tall",
  },
  {
    slug: "wool-and-weather",
    title: "پشم و هوا",
    excerpt: "لمس زمین، قبل از اینکه غذا به خانه برسد.",
    body: "<p>پشم خیس، علف، دست کار. کیفیت را اول در لمس می‌شود شناخت.</p>",
    categorySlug: "mazraeh",
    categoryName: "مزرعه و مرتع",
    image: PNG.wool,
    goods: [PNG.wool],
    aspect: "1 / 1",
    author: "تحریریه مرد کوهستان",
    minutes: 3,
    date: "۱۴۰۴/۰۶/۱۱",
    height: "mid",
  },
  {
    slug: "spring-in-the-moss",
    title: "چشمه در خزه‌",
    excerpt: "آب سرد، سایهٔ جنگل، و راهی که عجله ندارد.",
    body: "<p>چشمه را نمی‌شود بسته‌بندی کرد. فقط می‌شود کنارش ایستاد و فهمید غذا از کجا می‌آید.</p>",
    categorySlug: "mazraeh",
    categoryName: "مزرعه و مرتع",
    image: PNG.spring,
    goods: [PNG.spring],
    aspect: "9 / 16",
    author: "تحریریه مرد کوهستان",
    minutes: 4,
    date: "۱۴۰۴/۰۶/۱۳",
    height: "tall",
  },
  {
    slug: "shepherd-at-dusk",
    title: "چوپان در غروب",
    excerpt: "نگاه به دره، وقتی روز تمام می‌شود.",
    body: "<p>غروب مرتع یعنی کار تمام نشده؛ یعنی حوصله هنوز هست.</p>",
    categorySlug: "rah-ma",
    categoryName: "راه ما",
    image: PNG.staff,
    goods: [PNG.staff],
    aspect: "3 / 4",
    author: "تحریریه مرد کوهستان",
    minutes: 4,
    date: "۱۴۰۴/۰۶/۱۵",
    height: "tall",
  },
  {
    slug: "cheese-at-breakfast",
    title: "پنیر برای هر صبح",
    excerpt: "از شیر تا پنیر — مسیر کوتاه و قابل فهم.",
    body: "<p>پنیر صبح، غذای نمایشی نیست. غذای هر روز است؛ اگر مسیرش روشن باشد.</p>",
    categorySlug: "zendegi-khane",
    categoryName: "زندگی خانگی",
    image: PNG.cheese,
    goods: [PNG.cheese],
    aspect: "4 / 3",
    author: "تحریریه مرد کوهستان",
    minutes: 3,
    date: "۱۴۰۴/۰۵/۲۵",
    height: "wide",
  },
  {
    slug: "meadow-after-rain",
    title: "مرتع بعد از باران",
    excerpt: "قطره‌ها روی علف؛ همان سبزی که در شعار نیست.",
    body: "<p>باران را روی علف می‌شود دید. بعد روی سفره باید همان تازگی بماند.</p>",
    categorySlug: "mazraeh",
    categoryName: "مزرعه و مرتع",
    image: PNG.flowers,
    goods: [PNG.flowers],
    aspect: "3 / 4",
    author: "تحریریه مرد کوهستان",
    minutes: 3,
    date: "۱۴۰۴/۰۶/۱۷",
    height: "tall",
  },
  {
    slug: "yogurt-and-honey",
    title: "ماست و عسل",
    excerpt: "ساده، خانگی، بدون ویترین.",
    body: "<p>یک کاسه کافی است. اگر طعمش از ارتفاع آمده باشد.</p>",
    categorySlug: "zendegi-khane",
    categoryName: "زندگی خانگی",
    image: PNG.yogurt,
    goods: [PNG.yogurt],
    aspect: "1 / 1",
    author: "تحریریه مرد کوهستان",
    minutes: 3,
    date: "۱۴۰۴/۰۶/۱۹",
    height: "mid",
  },
  {
    slug: "valley-after-rain",
    title: "دره بعد از باران",
    excerpt: "لایه‌های کوه، وقتی هوا تازه شده.",
    body: "<p>دره را باید وسیع دید. عجله در این مقیاس معنی ندارد.</p>",
    categorySlug: "rah-ma",
    categoryName: "راه ما",
    image: PNG.stone,
    goods: [PNG.stone],
    aspect: "16 / 9",
    author: "تحریریه مرد کوهستان",
    minutes: 4,
    date: "۱۴۰۴/۰۶/۲۱",
    height: "wide",
  },
  {
    slug: "table-light",
    title: "نوری که روی میز می‌نشیند",
    excerpt: "چراغ کوچک، نان، و پنجره‌ای به غروب.",
    body: "<p>کیفیت را روی میز می‌شود دید: نان، چای، دست‌هایی که جمع می‌شوند.</p>",
    categorySlug: "zendegi-khane",
    categoryName: "زندگی خانگی",
    image: PNG.lamp,
    goods: [PNG.lamp],
    aspect: "3 / 4",
    author: "تحریریه مرد کوهستان",
    minutes: 4,
    date: "۱۴۰۴/۰۶/۱۰",
    height: "tall",
  },
  {
    slug: "fresh-from-sea",
    title: "از آب تا آشپزخانه",
    excerpt: "تازگی را نمی‌نویسیم روی جعبه. باید در سنگ و آب معلوم باشد.",
    body: "<p>تازگی را نمی‌نویسیم روی جعبه. باید در آشپزخانه معلوم باشد.</p>",
    categorySlug: "masir-ghaza",
    categoryName: "مسیر غذا",
    image: PNG.fish,
    goods: [PNG.fish],
    aspect: "3 / 4",
    author: "تحریریه مرد کوهستان",
    minutes: 4,
    date: "۱۴۰۴/۰۵/۱۱",
    height: "tall",
  },
  {
    slug: "autumn-pomegranate",
    title: "انار پاییز",
    excerpt: "دانه‌های سرخ؛ طعمی که از باغ دامنه می‌آید.",
    body: "<p>انار را وقتی باز می‌کنی، مسیر باغ معلوم می‌شود. سرخی‌اش از عجله نیست؛ از فصل است.</p>",
    categorySlug: "mazraeh",
    categoryName: "مزرعه و مرتع",
    image: PNG.pomegranate,
    goods: [PNG.pomegranate],
    aspect: "1 / 1",
    author: "تحریریه مرد کوهستان",
    minutes: 3,
    date: "۱۴۰۴/۰۶/۲۵",
    height: "mid",
  },
  {
    slug: "olives-of-the-slope",
    title: "زیتون دامنه",
    excerpt: "تلخ و آرام؛ از درخت تا سفره.",
    body: "<p>زیتون دامنه را نباید با زیتون ویترین یکی دانست. طعمش کمی تلخ است و همین صداقت است.</p>",
    categorySlug: "masir-ghaza",
    categoryName: "مسیر غذا",
    image: PNG.olives,
    goods: [PNG.olives],
    aspect: "1 / 1",
    author: "تحریریه مرد کوهستان",
    minutes: 3,
    date: "۱۴۰۴/۰۶/۲۶",
    height: "mid",
  },
  {
    slug: "evening-tea",
    title: "چای عصر",
    excerpt: "استکان باریک، و نوری که روی میز می‌ماند.",
    body: "<p>چای عصر شلوغ نیست. یک استکان، یک نعلبکی، و وقتی که هنوز کسی عجله ندارد.</p>",
    categorySlug: "zendegi-khane",
    categoryName: "زندگی خانگی",
    image: PNG.tea,
    goods: [PNG.tea],
    aspect: "1 / 1",
    author: "تحریریه مرد کوهستان",
    minutes: 3,
    date: "۱۴۰۴/۰۶/۲۷",
    height: "mid",
  },
  {
    slug: "forest-walnuts",
    title: "گردوی جنگل",
    excerpt: "مغز سخت؛ طعمی که با حوصله باز می‌شود.",
    body: "<p>گردو را باید شکست. این کار عجله برنمی‌دارد؛ مثل خود راه سبز.</p>",
    categorySlug: "mazraeh",
    categoryName: "مزرعه و مرتع",
    image: PNG.walnuts,
    goods: [PNG.walnuts],
    aspect: "1 / 1",
    author: "تحریریه مرد کوهستان",
    minutes: 3,
    date: "۱۴۰۴/۰۶/۲۸",
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

export function relatedPins(slug: string, categorySlug: string, limit = 8) {
  const same = magazinePins.filter((pin) => pin.slug !== slug && pin.categorySlug === categorySlug);
  const rest = magazinePins.filter((pin) => pin.slug !== slug && pin.categorySlug !== categorySlug);
  return [...same, ...rest].slice(0, limit);
}
