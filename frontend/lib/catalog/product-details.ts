export type ProductDetailData = {
  id: string;
  name: string;
  categoryTitle: string;
  categoryId: string;
  headline: string;
  story: string;
  image: string;
  price: number;
  unit: string;
  origin: {
    pastureName: string;
    altitude: string;
    region: string;
    diet: string;
    coldChainTemp: string;
    ecoPack: string;
  };
  nutrition: {
    protein: string;
    calories: string;
    fat: string;
    ironOrOmega: string;
  };
  chefTip: {
    cookingStyle: string;
    spices: string;
    restTime: string;
    description: string;
  };
  video: {
    poster: string;
    videoUrl?: string;
    duration: string;
    title: string;
  };
  portionOptions: string[];
  cutOptions: string[];
};

export const PRODUCT_DETAILS_DATABASE: Record<string, Partial<ProductDetailData>> = {
  // گوشت و مرتع
  "fresh-meat": {
    categoryTitle: "گوشت و مرتع",
    headline: "برش‌های ممتاز گوشت مرتعی، بدون آنتی‌بیوتیک و هورمون",
    story:
      "دام‌های مرد کوهستان در مراتع ییلاقی رشته‌کوه البرز و دامنه‌های پاک کوهستانی به صورت طبیعی و آزادانه چرا می‌کنند. تغذیه از گیاهان معطر کوهی همچون آویشن، گون و پونه وحشی، بافتی فوق‌العاده لطیف و طعمی اصیل و بی‌نظیر به گوشت می‌بخشد.",
    origin: {
      pastureName: "مراتع ییلاقی کلاردشت و سبلان",
      altitude: "۲,۴۰۰ متر از سطح دریا",
      region: "البرز مرکزی و سبلان",
      diet: "۱۰۰٪ گیاهان معطر مرتعی و علوفه طبیعی",
      coldChainTemp: "۱.۵ تا ۳ درجه سانتی‌گراد (کنترل مداوم)",
      ecoPack: "اتمسفر اصلاح‌شده (MAP) تجزیه‌پذیر و بهداشتی",
    },
    nutrition: {
      protein: "۲۲ گرم در ۱۰۰ گرم",
      calories: "۱۶۵ کیلوکالری",
      fat: "۶ گرم (چربی تک‌غیراشباع طبیعی)",
      ironOrOmega: "آهن هِم طبیعی: ۳.۲ میلی‌گرم",
    },
    chefTip: {
      cookingStyle: "تفت سریع در تابه چدنی داغ یا کباب ذغالی آرام",
      spices: "روغن زیتون فرابکر، رزماری کوهی، فلفل سیاه نیم‌کوب و نمک دریا",
      restTime: "۳ تا ۵ دقیقه قبل از برش برای بازگشت آب بافت",
      description:
        "گوشت مرتعی به دلیل بافت جوان و طبیعی، نیاز به پخت بیش از حد یا ادویه‌های تند و سنگین ندارد. اجازه دهید طعم طبیعی مرتع خودنمایی کند.",
    },
    video: {
      poster: "/brand/home-meat.png",
      videoUrl: "",
      duration: "۰۱:۴۵",
      title: "مستند مسیر سبز: از مراتع کوهستان تا برش‌های تازه",
    },
    portionOptions: ["۵۰۰ گرم", "۱ کیلوگرم", "۲ کیلوگرم"],
    cutOptions: ["برش استیکی", "برش خورشتی درشت", "راسته ورقی", "چرخ‌کرده ممتاز"],
  },

  // دریایی
  seafood: {
    categoryTitle: "ماهی و دریایی تازه",
    headline: "قزل‌آلای آب سرد و ماهیان تازه چشمه‌های کوهپایه",
    story:
      "پرورش‌یافته در جریان خنک، زلال و پر از اکسیژن چشمه‌های طبیعی کوهستانی. ماهی‌های مرد کوهستان با بافتی منسجم، گوشت صورتی و بدون هرگونه بوی نامطبوع، سرشار از امگا ۳ طبیعی و اسیدهای آمینه ضروری برای سلامت قلب و مغز هستند.",
    origin: {
      pastureName: "چشمه‌های جاری کوهپایه دوهزار و هراز",
      altitude: "۱,۸۰۰ متر از سطح دریا",
      region: "رودخانه‌های زلال البرز شمالی",
      diet: "خوراک طبیعی و مکمل‌های ارگانیک بر پایه جلبک دریایی",
      coldChainTemp: "۰ تا ۲ درجه سانتی‌گراد روی یخ طبیعی",
      ecoPack: "ظروف عایق حرارتی با ماندگاری ۴۸ ساعته سرما",
    },
    nutrition: {
      protein: "۲۴ گرم در ۱۰۰ گرم",
      calories: "۱۴۰ کیلوکالری",
      fat: "۴.۵ گرم (امگا ۳ فعال EPA و DHA)",
      ironOrOmega: "امگا ۳: ۱,۸۵۰ میلی‌گرم",
    },
    chefTip: {
      cookingStyle: "گریل در فر ۲۰۰ درجه یا تنوری در فویل",
      spices: "سیر تازه، لیمو ترش شیرازی، جعفری و کره سنتی",
      restTime: "۲ دقیقه پس از پخت",
      description:
        "پوست ماهی را خشک کنید و با کمی کره محلی چرب نمایید تا پوست ترد و طلایی و گوشت داخل آن کاملاً آبدار بماند.",
    },
    video: {
      poster: "/brand/home-seafood.png",
      videoUrl: "",
      duration: "۰۲:۱۰",
      title: "مستند آب‌های زلال: زندگی در جریان رودهای خنک کوهستان",
    },
    portionOptions: ["۱ عدد کامل (حدود ۸۰۰ گرم)", "۲ عدد فیله پاک‌شده (۶۰۰ گرم)", "۱.۵ کیلوگرم پاک‌شده"],
    cutOptions: ["فیله بدون استخوان", "شکم‌خالی کامل با سر", "استیک ماهی قطعه‌شده"],
  },

  // لبنیات
  dairy: {
    categoryTitle: "لبنیات سنتی کوهپایه",
    headline: "شیر تازه دوشیده‌شده در مرتع، کره سنتی و پنیرهای کهنه",
    story:
      "لبنیات مرد کوهستان حاصل دوشش روزانه شیر گاو و میش در هوای خنک صبحگاهی مراتع است. بدون هیچ‌گونه ماده نگه‌دارنده، پایدارکننده شیمیایی یا روغن‌های پالم، طعم واقعی و اصیل شیر و سرشیر کوهستان را به سفره بازمی‌گردانیم.",
    origin: {
      pastureName: "ییلاقات هزارجریب و مازیچال",
      altitude: "۲,۱۰۰ متر از سطح دریا",
      region: "مراتع کوهستانی شمال",
      diet: "علوفه سبز تازه و شبدر وحشی",
      coldChainTemp: "۲ تا ۴ درجه سانتی‌گراد",
      ecoPack: "شیشه‌های قابل بازیافت و ظروف سفالی سنتی",
    },
    nutrition: {
      protein: "۸.۵ گرم در هر سهم",
      calories: "۱۸۰ کیلوکالری",
      fat: "چربی طبیعی مرتع (حاوی CLA)",
      ironOrOmega: "کلسیم طبیعی: ۳۲۰ میلی‌گرم",
    },
    chefTip: {
      cookingStyle: "سرو در دمای خنک همراه با عسل کوهی یا نان تنوری",
      spices: "پونه کوهی، گردوی تازه، زیره سبز",
      restTime: "بلافاصله پس از باز کردن مصرف شود",
      description:
        "کره و پنیر محلی به دلیل وجود باکتری‌های پروبیوتیک طبیعی و آنزیم‌های زنده، هضم بسیار آسانی دارند و انرژی روزانه را چند برابر می‌کنند.",
    },
    video: {
      poster: "/brand/home-dairy.png",
      videoUrl: "",
      duration: "۰۱:۳۰",
      title: "مستند بامداد مرتع: از دوشش خنک صبحگاهی تا کارگاه سنتی",
    },
    portionOptions: ["۵۰۰ گرم", "۱ کیلوگرم", "بسته خانواده (۲ کیلو)"],
    cutOptions: ["بسته‌بندی شیشه‌ای", "قالب سنتی", "کوزه سفالی"],
  },

  // کشاورزی
  farm: {
    categoryTitle: "کشاورزی و سبزیجات ارگانیک",
    headline: "محصولات خاک غنی، سبزیجات ریشه‌ای و حبوبات بومی",
    story:
      "محصولات زراعی مرد کوهستان در خاکی حاصلخیز و آبیاری‌شده با آب برف‌های جاری قله‌ها پرورش می‌یابند. این محصولات بدون سموم شیمیایی آفت‌کش و با کودهای کاملاً زیستی به دست می‌آیند تا عطر و رنگ طبیعت در هر وعده احساس شود.",
    origin: {
      pastureName: "دشت‌های زراعی کوهپایه دماوند و الموت",
      altitude: "۱,۶۰۰ متر از سطح دریا",
      region: "باغات و مزارع ارگانیک",
      diet: "خاک آتشفشانی غنی و آب معدنی سرچشمه",
      coldChainTemp: "۴ تا ۶ درجه سانتی‌گراد",
      ecoPack: "کیسه‌های کنفی و کرافت سازگار با محیط زیست",
    },
    nutrition: {
      protein: "۵ گرم در ۱۰۰ گرم",
      calories: "۷۵ کیلوکالری",
      fat: "کمتر از ۱ گرم",
      ironOrOmega: "فیبر طبیعی و ویتامین‌های C و K",
    },
    chefTip: {
      cookingStyle: "بخارپز ملایم یا تنوری با روغن زیتون بکر",
      spices: "آویشن شیرازی، سیر کوهی، نمک صورتی",
      restTime: "آماده سرو فوری",
      description:
        "پخت ملایم سبزیجات باعث حفظ ویتامین‌های حساس به حرارت و طعم شیرین طبیعی خاک کوهستان می‌شود.",
    },
    video: {
      poster: "/brand/landing-farm.png",
      videoUrl: "",
      duration: "۰۱:۵۰",
      title: "مستند خاک پاک: چرخه کشاورزی زیستی در کوهپایه‌ها",
    },
    portionOptions: ["۱ کیلوگرم", "۲ کیلوگرم", "سبد هفتگی فصل (۵ کیلو)"],
    cutOptions: ["دست‌چین کامل", "شسته‌شده و خردشده", "بسته‌بندی وکیوم"],
  },
};

export function getProductDetail(
  id: string,
  categoryId?: string,
  fallbackName?: string,
  fallbackImage?: string,
): ProductDetailData {
  const catKey = categoryId || "fresh-meat";
  const preset = PRODUCT_DETAILS_DATABASE[catKey] || PRODUCT_DETAILS_DATABASE["fresh-meat"];

  const name = fallbackName || (catKey === "seafood" ? "ماهی قزل‌آلای تازه آب سرد" : catKey === "dairy" ? "کره سنتی و لبنیات خالص مرتع" : catKey === "farm" ? "سبزیجات و محصولات تازه مزرعه" : "راسته گوسفندی مرتعی ممتاز");
  const image = fallbackImage || preset.video?.poster || "/brand/home-meat.png";

  return {
    id,
    name,
    categoryTitle: preset.categoryTitle || "محصولات مرتع و مزرعه",
    categoryId: catKey,
    headline: preset.headline || "محصول تازه و طبیعی از مسیر سبز مرد کوهستان",
    story: preset.story || "غذای سالم و مطمئن که با حوصله از طبیعت به سفره خانه شما می‌رسد.",
    image,
    price: catKey === "fresh-meat" ? 485000 : catKey === "seafood" ? 340000 : catKey === "dairy" ? 180000 : 120000,
    unit: "تومان / هر کیلوگرم",
    origin: preset.origin || {
      pastureName: "مراتع ییلاقی رشته‌کوه البرز",
      altitude: "۲,۲۰۰ متر",
      region: "کوهستان‌های شمال",
      diet: "علوفه و گیاهان طبیعی",
      coldChainTemp: "۲ تا ۴ درجه سانتی‌گراد",
      ecoPack: "بسته‌بندی دوستدار محیط زیست",
    },
    nutrition: preset.nutrition || {
      protein: "۲۰ گرم",
      calories: "۱۵۰ کیلوکالری",
      fat: "۵ گرم",
      ironOrOmega: "سرشار از مواد معدنی طبیعی",
    },
    chefTip: preset.chefTip || {
      cookingStyle: "پخت ملایم با حرارت یکنواخت",
      spices: "نمک دریا، فلفل تازه و روغن زیتون",
      restTime: "۳ دقیقه",
      description: "برای حفظ حداکثر طعم و ارزش غذایی، از پخت طولانی با حرارت بسیار بالا خودداری کنید.",
    },
    video: {
      poster: image,
      videoUrl: preset.video?.videoUrl || "",
      duration: preset.video?.duration || "۰۲:۰۰",
      title: preset.video?.title || `مستند اصالت و مسیر تولید ${name}`,
    },
    portionOptions: preset.portionOptions || ["۵۰۰ گرم", "۱ کیلوگرم", "۲ کیلوگرم"],
    cutOptions: preset.cutOptions || ["برش استاندارد", "برش سفارشی"],
  };
}
