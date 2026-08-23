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

/** دسته‌های «چه به خانه می‌رسد» — فقط بشقاب‌های برند تا عکس محصول واقعی برسد */
const PLATE = {
  meat: "/brand/home-meat.png",
  dairy: "/brand/home-dairy.png",
  seafood: "/brand/home-seafood.png",
  ready: "/brand/home-ready.png",
} as const;

export const homeDoors = [
  {
    id: "fresh-meat",
    href: "/products?cat=fresh-meat",
    label: "گوشت تازه",
    line: "از مرتع",
    emoji: "🥩",
    tint: "#903828",
    story:
      "از مرتع می‌آید و با همان دقتی که سفرهٔ جمعه می‌خواهد آماده می‌شود. مسیرش روشن است و برای خانه انتخاب می‌شود.",
    image: PLATE.meat,
    alt: "بشقاب گوشت تازه مرد کوهستان",
  },
  {
    id: "seafood",
    href: "/products?cat=seafood",
    label: "محصولات دریایی",
    line: "از آب",
    emoji: "🐟",
    tint: "#204078",
    story:
      "از آب تا آشپزخانه، با همان تازگی که روی سفره دیده می‌شود. برای وقتی که طعم دریا را می‌خواهید.",
    image: PLATE.seafood,
    alt: "بشقاب محصولات دریایی مرد کوهستان",
  },
  {
    id: "sausage",
    href: "/products?cat=ready",
    label: "سوسیس و کالباس",
    line: "طعم عمیق",
    emoji: "🌭",
    tint: "#BE6516",
    story:
      "سوسیس‌های تخمیری و کالباس با طعمی عمیق؛ دور از حس صنعتی و نزدیک به سفرهٔ خانه.",
    image: PLATE.ready,
    alt: "بشقاب سوسیس و کالباس مرد کوهستان",
  },
  {
    id: "cook-ready",
    href: "/products?cat=ready",
    label: "آماده‌پخت",
    line: "سریع و درست",
    emoji: "🍳",
    tint: "#861309",
    story:
      "ناگت، برگر و پیتزا؛ وقتی سرعت مهم است اما طعم نباید قربانی شود.",
    image: PLATE.ready,
    alt: "بشقاب غذای آماده‌پخت مرد کوهستان",
  },
  {
    id: "ready-meal",
    href: "/products?cat=ready",
    label: "غذای آماده",
    line: "طعم خانه",
    emoji: "🍲",
    tint: "#005B48",
    story:
      "از فسنجان تا پاستا؛ غذایی آماده برای وقتی که دلتان یک وعدهٔ کامل خانگی می‌خواهد.",
    image: PLATE.ready,
    alt: "بشقاب غذای آماده مرد کوهستان",
  },
  {
    id: "dairy",
    href: "/products?cat=dairy",
    label: "لبنیات",
    line: "هر روز خانه",
    emoji: "🧀",
    tint: "#86C2EB",
    story:
      "پنیر و لبنیات طبیعی؛ طعمی غنی برای صبحانه و سفرهٔ هر روز.",
    image: PLATE.dairy,
    alt: "بشقاب لبنیات مرد کوهستان",
  },
  {
    id: "farm",
    href: "/products",
    label: "کشاورزی",
    line: "از زمین",
    emoji: "🌿",
    tint: "#50AF47",
    story:
      "عسل کوهستان، برنج، زیتون و ادویه؛ سبدی از طعم‌های زمین.",
    image: PLATE.dairy,
    alt: "بشقاب محصولات کشاورزی مرد کوهستان",
  },
  {
    id: "bakery",
    href: "/products",
    label: "نان و آشپزی",
    line: "کنار سفره",
    emoji: "🥖",
    tint: "#BE6516",
    story:
      "از نان و خمیر تا دیپ و درسینگ؛ ابزارهایی برای آشپزی راحت و خوش‌طعم.",
    image: PLATE.ready,
    alt: "بشقاب نان و راهکار آشپزی مرد کوهستان",
  },
  {
    id: "poultry",
    href: "/products?cat=fresh-meat",
    label: "مرغ و طیور",
    line: "سبک و تازه",
    emoji: "🍗",
    tint: "#903828",
    story:
      "مرغ و طیور تازه برای وعده‌های سبک؛ از مسیری که می‌شود به آن اعتماد کرد.",
    image: PLATE.meat,
    alt: "بشقاب مرغ و طیور مرد کوهستان",
  },
  {
    id: "frozen",
    href: "/products?cat=ready",
    label: "منجمد",
    line: "تازگی نگه‌داشته",
    emoji: "❄️",
    tint: "#86C2EB",
    story:
      "منجمد با استاندارد نگهداری درست؛ تازگی تا لحظهٔ پخت حفظ می‌شود.",
    image: PLATE.ready,
    alt: "بشقاب محصولات منجمد مرد کوهستان",
  },
  {
    id: "breakfast",
    href: "/products?cat=dairy",
    label: "صبحانه",
    line: "شروع روز",
    emoji: "☀️",
    tint: "#BE6516",
    story:
      "پنیر، ماست و کره؛ صبحانه‌ای آرام که ریشه در مرتع دارد.",
    image: PLATE.dairy,
    alt: "بشقاب صبحانه مرد کوهستان",
  },
  {
    id: "condiments",
    href: "/products",
    label: "چاشنی",
    line: "لمس آخر",
    emoji: "🧂",
    tint: "#5D686E",
    story:
      "ادویه، سس و چاشنی؛ آن لمس آخر که طعم را کامل می‌کند.",
    image: PLATE.ready,
    alt: "بشقاب چاشنی مرد کوهستان",
  },
  {
    id: "special",
    href: "/products",
    label: "ویژه کوهستان",
    line: "انتخاب ما",
    emoji: "⛰️",
    tint: "#005B48",
    story:
      "محصولات ویژه‌ای که با دقت بیشتر انتخاب شده‌اند؛ برای سفره‌ای که فرق می‌کند.",
    image: PLATE.meat,
    alt: "بشقاب ویژه مرد کوهستان",
  },
] as const;

export const homeCategoryProducts = {
  "fresh-meat": [
    {
      id: "meat-loin",
      name: "ران گوسفند",
      note: "برش تازه",
      teaser: "برشی از مرتع؛ برای سفره‌ای که باید واقعی باشد.",
      story:
        "ران گوسفند از مسیری می‌آید که می‌شود فهمید از کجا آمده. برش تازه، مناسب پخت آرام خانه و جمعهٔ خانوادگی.",
      href: "/products?cat=fresh-meat",
      image: PLATE.meat,
      alt: "بشقاب گوشت تازه — ران گوسفند",
    },
    {
      id: "meat-shoulder",
      name: "گردن بره",
      note: "مناسب خانه",
      teaser: "نرم و پرطعم؛ برای خورشت و پخت‌های خانگی.",
      story:
        "گردن بره برای وقتی است که وقت دارید با حوصله بپزید. طعم عمیق می‌گیرد و خانه را پر از عطر می‌کند.",
      href: "/products?cat=fresh-meat",
      image: PLATE.meat,
      alt: "بشقاب گوشت تازه — گردن بره",
    },
    {
      id: "meat-kebab",
      name: "کباب‌پز",
      note: "آماده پخت",
      teaser: "آماده برای آتش و سیخ؛ بدون عجلهٔ بی‌کیفیت.",
      story:
        "گوشت کباب‌پز طوری آماده شده که فقط حرارت درست می‌خواهد. طعم مرتع را تا سفره نگه می‌دارد.",
      href: "/products?cat=fresh-meat",
      image: PLATE.meat,
      alt: "بشقاب گوشت تازه — کباب‌پز",
    },
    {
      id: "meat-mix",
      name: "مخلوط خانه",
      note: "انتخاب هفته",
      teaser: "ترکیبی کامل برای چند وعدهٔ هفته.",
      story:
        "مخلوط خانه برای خانواده‌ای است که می‌خواهد یک خرید، چند پخت داشته باشد؛ تازه و قابل اعتماد.",
      href: "/products?cat=fresh-meat",
      image: PLATE.meat,
      alt: "بشقاب گوشت تازه — مخلوط خانه",
    },
    {
      id: "meat-ribs",
      name: "دنده بره",
      note: "برای جمعه",
      teaser: "برای آتش آرام و سفرهٔ جمعه.",
      story:
        "دنده بره برای وقتی که خانه بوی کباب می‌گیرد و همه دور میز جمع می‌شوند.",
      href: "/products?cat=fresh-meat",
      image: PLATE.meat,
      alt: "بشقاب گوشت تازه — دنده بره",
    },
    {
      id: "meat-mince",
      name: "گوشت چرخ‌کرده",
      note: "روزانه",
      teaser: "برای کوفته، کباب و خورشت خانه.",
      story:
        "گوشت چرخ‌کرده تازه برای پخت‌های هرروز؛ ساده، روشن و نزدیک به سفره.",
      href: "/products?cat=fresh-meat",
      image: PLATE.meat,
      alt: "بشقاب گوشت تازه — گوشت چرخ‌کرده",
    },
  ],
  seafood: [
    {
      id: "sea-fish",
      name: "ماهی تازه",
      note: "از دریا",
      teaser: "تازگی دریا، همان‌روز روی سفره.",
      story:
        "ماهی تازه از منابع دریایی و آبزی‌پروری؛ با مسیری که تازگی را تا آشپزخانه حفظ می‌کند.",
      href: "/products?cat=seafood",
      image: PLATE.seafood,
      alt: "بشقاب دریایی — ماهی تازه",
    },
    {
      id: "sea-shrimp",
      name: "میگو",
      note: "انتخاب روز",
      teaser: "سبک، روشن و آماده برای پخت سریع.",
      story:
        "میگوی روز برای وقتی که می‌خواهید طعم دریا را ساده و تمیز روی میز بگذارید.",
      href: "/products?cat=seafood",
      image: PLATE.seafood,
      alt: "بشقاب دریایی — میگو",
    },
    {
      id: "sea-mix",
      name: "ماهی جنوب",
      note: "تازه",
      teaser: "طعم جنوب؛ برای سفرهٔ متفاوت هفته.",
      story:
        "ماهی جنوب با تازگی پایدار؛ انتخابی برای کسانی که طعم دریا را جدی می‌گیرند.",
      href: "/products?cat=seafood",
      image: PLATE.seafood,
      alt: "بشقاب دریایی — ماهی جنوب",
    },
    {
      id: "sea-salmon",
      name: "ماهی سالمون",
      note: "انتخاب ویژه",
      teaser: "روشن و غنی؛ برای پخت‌های خاص هفته.",
      story:
        "سالمون با بافتی درخشان و طعمی که روی سفره می‌درخشد؛ از مسیری که تازگی را جدی می‌گیرد.",
      href: "/products?cat=seafood",
      image: PLATE.seafood,
      alt: "بشقاب دریایی — ماهی سالمون",
    },
    {
      id: "sea-calamar",
      name: "کالاماری",
      note: "سبک",
      teaser: "پخت سریع، طعم تمیز دریا.",
      story:
        "کالاماری برای وقتی که می‌خواهید دریا را ساده و خوش‌طعم روی میز بگذارید.",
      href: "/products?cat=seafood",
      image: PLATE.seafood,
      alt: "بشقاب دریایی — کالاماری",
    },
  ],
  sausage: [
    {
      id: "sausage-ferment",
      name: "سوسیس تخمیری",
      note: "طعم عمیق",
      teaser: "دور از حس صنعتی؛ نزدیک به سفره.",
      story:
        "سوسیس تخمیری با طعمی عمیق و بافتی که به خانه می‌آید، نه به ویترین سرد.",
      href: "/products?cat=ready",
      image: PLATE.ready,
      alt: "بشقاب — سوسیس تخمیری",
    },
    {
      id: "sausage-bologna",
      name: "کالباس بلونیا",
      note: "کلاسیک",
      teaser: "ساده، آشنا، برای صبحانه و میان‌وعده.",
      story:
        "کالباس بلونیا برای سفره‌هایی که طعم آشنا می‌خواهند؛ با دقت مرد کوهستان.",
      href: "/products?cat=ready",
      image: PLATE.ready,
      alt: "بشقاب — کالباس بلونیا",
    },
    {
      id: "sausage-grill",
      name: "سوسیس کبابی",
      note: "روی حرارت",
      teaser: "برای آتش ملایم و جمع خانوادگی.",
      story:
        "سوسیس کبابی وقتی که حیاط یا اجاق روشن است و همه دور هم جمع‌اند.",
      href: "/products?cat=ready",
      image: PLATE.ready,
      alt: "بشقاب — سوسیس کبابی",
    },
  ],
  "cook-ready": [
    {
      id: "cook-nugget",
      name: "ناگت",
      note: "سریع",
      teaser: "سرعت، بدون قربانی کردن طعم.",
      story:
        "ناگت برای روزهای شلوغ؛ آماده پخت، با کیفیتی که به خانه می‌رسد.",
      href: "/products?cat=ready",
      image: PLATE.ready,
      alt: "بشقاب — ناگت",
    },
    {
      id: "cook-burger",
      name: "برگر",
      note: "خانه",
      teaser: "برگری که طعم خانه را حفظ می‌کند.",
      story:
        "برگر آماده‌پخت برای وقتی که دلتان برگر می‌خواهد، اما مسیر غذا برایتان مهم است.",
      href: "/products?cat=ready",
      image: PLATE.ready,
      alt: "بشقاب — برگر",
    },
    {
      id: "cook-pizza",
      name: "پیتزا",
      note: "آماده پخت",
      teaser: "خمیر و رویه؛ فقط فر می‌خواهد.",
      story:
        "پیتزای آماده‌پخت با مواد انتخاب‌شده؛ برای شب‌هایی که دور هم می‌نشینید.",
      href: "/products?cat=ready",
      image: PLATE.ready,
      alt: "بشقاب — پیتزا",
    },
  ],
  "ready-meal": [
    {
      id: "meal-fesenjan",
      name: "فسنجان",
      note: "ایرانی",
      teaser: "طعم خانه؛ فقط گرم کنید.",
      story:
        "فسنجان آماده برای وقتی که دلتان خورشت ایرانی می‌خواهد و وقت پخت از صفر نیست.",
      href: "/products?cat=ready",
      image: PLATE.ready,
      alt: "بشقاب — فسنجان",
    },
    {
      id: "meal-pasta",
      name: "پاستا",
      note: "کامل",
      teaser: "یک وعدهٔ کامل، بدون شلوغی آشپزخانه.",
      story:
        "پاستای آماده با طعمی متعادل؛ برای روزهایی که سفره باید ساده و گرم باشد.",
      href: "/products?cat=ready",
      image: PLATE.ready,
      alt: "بشقاب — پاستا",
    },
    {
      id: "meal-panini",
      name: "پنینی",
      note: "سریع",
      teaser: "میان‌وعده یا ناهار سبک؛ آماده در چند دقیقه.",
      story:
        "پنینی برای وقتی که زمان کم است اما طعم باید درست باشد.",
      href: "/products?cat=ready",
      image: PLATE.ready,
      alt: "بشقاب — پنینی",
    },
  ],
  dairy: [
    {
      id: "dairy-cheese",
      name: "پنیر سنتی",
      note: "صبحانه",
      teaser: "برای نان گرم و صبح آرام خانه.",
      story:
        "پنیر سنتی بر پایهٔ طعم طبیعی؛ مناسب صبحانه و سفره‌ای که ساده و اصیل می‌خواهد.",
      href: "/products?cat=dairy",
      image: PLATE.dairy,
      alt: "بشقاب لبنیات — پنیر سنتی",
    },
    {
      id: "dairy-yogurt",
      name: "ماست چکیده",
      note: "هر روز",
      teaser: "غنی و آشنا؛ کنار هر وعده.",
      story:
        "ماست چکیده برای سفرهٔ هر روز؛ طعمی که به خانه نزدیک است.",
      href: "/products?cat=dairy",
      image: PLATE.dairy,
      alt: "بشقاب لبنیات — ماست چکیده",
    },
    {
      id: "dairy-milk",
      name: "شیر تازه",
      note: "خانواده",
      teaser: "تازگی شیر؛ برای خانواده.",
      story:
        "شیر تازه از مسیری که می‌شود به آن اعتماد کرد؛ برای خانه و کودکان.",
      href: "/products?cat=dairy",
      image: PLATE.dairy,
      alt: "بشقاب لبنیات — شیر تازه",
    },
  ],
  farm: [
    {
      id: "farm-honey",
      name: "عسل کوهستان",
      note: "از ارتفاع",
      teaser: "شیرینی کوه؛ برای صبحانه و چای.",
      story:
        "عسل کوهستان از همان مسیری می‌آید که برند از آن حرف می‌زند؛ طبیعت، ارتفاع، آرامش.",
      href: "/products",
      image: PLATE.dairy,
      alt: "بشقاب — عسل کوهستان",
    },
    {
      id: "farm-rice",
      name: "برنج",
      note: "سفره",
      teaser: "پایهٔ سفرهٔ ایرانی؛ انتخاب با حوصله.",
      story:
        "برنج برای وعده‌هایی که خانه را جمع می‌کند؛ ساده و ضروری.",
      href: "/products",
      image: PLATE.dairy,
      alt: "بشقاب — برنج",
    },
    {
      id: "farm-olive",
      name: "زیتون",
      note: "روشن",
      teaser: "طعم زمین؛ کنار پنیر و نان.",
      story:
        "زیتون برای سفره‌هایی که رنگ و طعم طبیعی می‌خواهند.",
      href: "/products",
      image: PLATE.dairy,
      alt: "بشقاب — زیتون",
    },
  ],
  bakery: [
    {
      id: "bakery-bread",
      name: "نان تازه",
      note: "کنار سفره",
      teaser: "نان گرم؛ شروع هر وعده.",
      story:
        "نان برای وقتی که سفره باید کامل باشد؛ ساده و ضروری.",
      href: "/products",
      image: PLATE.ready,
      alt: "بشقاب — نان تازه",
    },
    {
      id: "bakery-dough",
      name: "خمیر پیتزا",
      note: "آماده",
      teaser: "خمیر آماده؛ شما فقط رویه را تمام کنید.",
      story:
        "خمیر پیتزا برای شب‌های آشپزی مشترک؛ بدون دردسر آماده کردن از صفر.",
      href: "/products",
      image: PLATE.ready,
      alt: "بشقاب — خمیر پیتزا",
    },
    {
      id: "bakery-dip",
      name: "دیپ و درسینگ",
      note: "چاشنی",
      teaser: "چاشنی‌هایی که طعم را کامل می‌کنند.",
      story:
        "دیپ و درسینگ برای وقتی که سفره به یک لمس آخر نیاز دارد.",
      href: "/products",
      image: PLATE.ready,
      alt: "بشقاب — دیپ و درسینگ",
    },
  ],
  poultry: [
    {
      id: "poultry-breast",
      name: "سینه مرغ",
      note: "تازه",
      teaser: "سبک و سالم؛ پایهٔ وعده‌های روزمره.",
      story:
        "سینه مرغ تازه برای پخت‌های ساده و سالم؛ از مسیری که می‌شود به آن اعتماد کرد.",
      href: "/products?cat=fresh-meat",
      image: PLATE.meat,
      alt: "بشقاب — سینه مرغ",
    },
    {
      id: "poultry-thigh",
      name: "ران مرغ",
      note: "پرطعم",
      teaser: "آبدار و آشنا؛ برای خانه و جمع.",
      story:
        "ران مرغ با طعمی که همه می‌شناسند؛ مناسب پخت‌های خانگی و دورهم‌نشینی.",
      href: "/products?cat=fresh-meat",
      image: PLATE.meat,
      alt: "بشقاب — ران مرغ",
    },
    {
      id: "poultry-whole",
      name: "مرغ کامل",
      note: "برش‌خورده",
      teaser: "یک خرید، چند وعده؛ تازه و آماده.",
      story:
        "مرغ کامل برش‌خورده برای خانواده‌ای که می‌خواهد یک خرید، چند پخت داشته باشد.",
      href: "/products?cat=fresh-meat",
      image: PLATE.meat,
      alt: "بشقاب — مرغ کامل",
    },
    {
      id: "poultry-wing",
      name: "بال مرغ",
      note: "کبابی",
      teaser: "برای آتش ملایم و طعم ترد.",
      story:
        "بال مرغ برای جمع‌های کوچک و پخت روی حرارت؛ طعمی که همه دوست دارند.",
      href: "/products?cat=fresh-meat",
      image: PLATE.meat,
      alt: "بشقاب — بال مرغ",
    },
  ],
  frozen: [
    {
      id: "frozen-veg",
      name: "سبزیجات منجمد",
      note: "تازه نگه‌داشته",
      teaser: "رنگ و تازگی؛ تا لحظهٔ پخت.",
      story:
        "سبزیجات منجمد با زنجیرهٔ سرد درست؛ برای وقتی که وقت کم است اما کیفیت مهم است.",
      href: "/products?cat=ready",
      image: PLATE.ready,
      alt: "بشقاب — سبزیجات منجمد",
    },
    {
      id: "frozen-meat",
      name: "گوشت منجمد",
      note: "برش‌دار",
      teaser: "آماده برای یخچال و پخت هفته.",
      story:
        "گوشت منجمد با استاندارد نگهداری؛ تازگی تا سفره حفظ می‌شود.",
      href: "/products?cat=fresh-meat",
      image: PLATE.meat,
      alt: "بشقاب — گوشت منجمد",
    },
    {
      id: "frozen-fish",
      name: "ماهی منجمد",
      note: "دریا",
      teaser: "طعم دریا؛ هر زمان که بخواهید.",
      story:
        "ماهی منجمد برای روزهایی که دلتان دریا می‌خواهد اما وقت خرید تازه نیست.",
      href: "/products?cat=seafood",
      image: PLATE.seafood,
      alt: "بشقاب — ماهی منجمد",
    },
    {
      id: "frozen-ready",
      name: "غذای منجمد",
      note: "آماده",
      teaser: "گرم کنید؛ طعم خانه نزدیک است.",
      story:
        "غذای منجمد آماده برای شب‌های شلوغ؛ بدون قربانی کردن طعم.",
      href: "/products?cat=ready",
      image: PLATE.ready,
      alt: "بشقاب — غذای منجمد",
    },
  ],
  breakfast: [
    {
      id: "breakfast-cheese",
      name: "پنیر صبحانه",
      note: "تازه",
      teaser: "کنار نان گرم؛ شروع آرام روز.",
      story:
        "پنیر صبحانه برای لحظه‌ای که همه دور میز جمع می‌شوند و روز با آرامش شروع می‌شود.",
      href: "/products?cat=dairy",
      image: PLATE.dairy,
      alt: "بشقاب — پنیر صبحانه",
    },
    {
      id: "breakfast-butter",
      name: "کره مرتع",
      note: "غنی",
      teaser: "روی نان تازه؛ طعم واقعی.",
      story:
        "کره مرتع با غنایی که روی نان گرم حس می‌شود؛ ساده و اصیل.",
      href: "/products?cat=dairy",
      image: PLATE.dairy,
      alt: "بشقاب — کره مرتع",
    },
    {
      id: "breakfast-yogurt",
      name: "ماست صبحانه",
      note: "سبک",
      teaser: "تازه و آشنا؛ برای هر صبح.",
      story:
        "ماست صبحانه برای شروع روز با طعمی که به خانه نزدیک است.",
      href: "/products?cat=dairy",
      image: PLATE.dairy,
      alt: "بشقاب — ماست صبحانه",
    },
    {
      id: "breakfast-cream",
      name: "خامه",
      note: "نرم",
      teaser: "لمس نرم روی نان و عسل.",
      story:
        "خامه برای صبحانه‌ای که کمی لوکس‌تر است اما هنوز ساده و خانگی.",
      href: "/products?cat=dairy",
      image: PLATE.dairy,
      alt: "بشقاب — خامه",
    },
  ],
  condiments: [
    {
      id: "condiment-sauce",
      name: "سس خانگی",
      note: "چاشنی",
      teaser: "لمس آخر که طعم را کامل می‌کند.",
      story:
        "سس خانگی برای وقتی که غذا خوب است اما یک لمس آخر می‌خواهد.",
      href: "/products",
      image: PLATE.ready,
      alt: "بشقاب — سس خانگی",
    },
    {
      id: "condiment-spice",
      name: "ادویه کوهستان",
      note: "گرم",
      teaser: "عطر کوه؛ روی هر پخت.",
      story:
        "ادویهٔ انتخاب‌شده با عطری که یادآور ارتفاع و طبیعت است.",
      href: "/products",
      image: PLATE.ready,
      alt: "بشقاب — ادویه کوهستان",
    },
    {
      id: "condiment-pickle",
      name: "ترشی خانگی",
      note: "کنار غذا",
      teaser: "ترشی که سفره را زنده می‌کند.",
      story:
        "ترشی خانگی برای کنار غذاهای سنگین و جمع‌های دورهم.",
      href: "/products",
      image: PLATE.ready,
      alt: "بشقاب — ترشی خانگی",
    },
    {
      id: "condiment-oil",
      name: "روغن زیتون",
      note: "روشن",
      teaser: "روی سالاد و نان؛ طعم زمین.",
      story:
        "روغن زیتون برای سالاد و پخت‌های سبک؛ طعمی که زمین می‌دهد.",
      href: "/products",
      image: PLATE.dairy,
      alt: "بشقاب — روغن زیتون",
    },
  ],
  special: [
    {
      id: "special-premium",
      name: "برش ویژه",
      note: "انتخاب سرآشپز",
      teaser: "برشی که فرق می‌کند؛ برای سفرهٔ خاص.",
      story:
        "برش ویژه با دقتی بیشتر انتخاب شده؛ برای وقتی که می‌خواهید سفره فرق کند.",
      href: "/products?cat=fresh-meat",
      image: PLATE.meat,
      alt: "بشقاب — برش ویژه",
    },
    {
      id: "special-gift",
      name: "بسته هدیه",
      note: "کوهستان",
      teaser: "هدیه‌ای از مسیر سبز؛ برای کسی که دوست دارید.",
      story:
        "بسته هدیه ترکیبی از بهترین‌های مرد کوهستان؛ برای مناسبت‌هایی که طعم مهم است.",
      href: "/products",
      image: PLATE.meat,
      alt: "بشقاب — بسته هدیه",
    },
    {
      id: "special-season",
      name: "فصل کوهستان",
      note: "محدود",
      teaser: "هر فصل چیزی تازه؛ فقط برای مدتی.",
      story:
        "محصول فصلی که با فصل می‌آید و با فصل می‌رود؛ تازگی واقعی، نه همیشگی.",
      href: "/products",
      image: PLATE.seafood,
      alt: "بشقاب — فصل کوهستان",
    },
    {
      id: "special-family",
      name: "سبد خانواده",
      note: "کامل",
      teaser: "یک سبد، چند وعده؛ خرید هوشمند هفته.",
      story:
        "سبد خانواده ترکیبی از گوشت، لبنیات و آماده؛ برای خانواده‌ای که وقتشان ارزشمند است.",
      href: "/products",
      image: PLATE.ready,
      alt: "بشقاب — سبد خانواده",
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
