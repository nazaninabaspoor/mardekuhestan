"""دادهٔ موقت کاتالوگ — هم‌نام با frontend/lib/brand.ts (homeCategoryProducts)."""

from __future__ import annotations

from typing import TypedDict


class DemoProduct(TypedDict):
    id: str
    name: str
    note: str
    story: str
    image: str
    alt: str


# کلید = ProductDomain (backend)
DEMO_CATALOG: dict[str, list[DemoProduct]] = {
    "fresh_meat": [
        {
            "id": "meat-loin",
            "name": "ماهیچه",
            "note": "برش تازه",
            "story": "ماهیچه از مسیری می‌آید که می‌شود فهمید از کجا آمده. برش تازه، مناسب پخت آرام خانه و جمعهٔ خانوادگی.",
            "image": "/brand/v2/products/prod-03.png",
            "alt": "سینی گوشت تازه — ماهیچه",
        },
        {
            "id": "meat-shoulder",
            "name": "شانه",
            "note": "مناسب خانه",
            "story": "شانه برای وقتی است که وقت دارید با حوصله بپزید. طعم عمیق می‌گیرد و خانه را پر از عطر می‌کند.",
            "image": "/brand/v2/products/prod-14.png",
            "alt": "سینی گوشت تازه — شانه",
        },
        {
            "id": "meat-kebab",
            "name": "شیشلیک",
            "note": "آماده پخت",
            "story": "شیشلیک طوری آماده شده که فقط حرارت درست می‌خواهد. طعم مرتع را تا سفره نگه می‌دارد.",
            "image": "/brand/v2/products/prod-12.png",
            "alt": "سینی گوشت تازه — شیشلیک",
        },
        {
            "id": "meat-mix",
            "name": "گوشت خورشتی",
            "note": "انتخاب هفته",
            "story": "گوشت خورشتی برای خانواده‌ای است که می‌خواهد یک خرید، چند پخت داشته باشد؛ تازه و قابل اعتماد.",
            "image": "/brand/v2/products/prod-20.png",
            "alt": "سینی گوشت تازه — گوشت خورشتی",
        },
        {
            "id": "meat-ribs",
            "name": "استیک",
            "note": "برای جمعه",
            "story": "استیک برای وقتی که خانه بوی کباب می‌گیرد و همه دور میز جمع می‌شوند.",
            "image": "/brand/v2/products/prod-17.png",
            "alt": "سینی گوشت تازه — استیک",
        },
        {
            "id": "meat-mince",
            "name": "گوشت چرخ‌کرده",
            "note": "روزانه",
            "story": "گوشت چرخ‌کرده تازه برای پخت‌های هرروز؛ ساده، روشن و نزدیک به سفره.",
            "image": "/brand/v2/products/prod-22.png",
            "alt": "سینی گوشت تازه — گوشت چرخ‌کرده",
        },
        {
            "id": "meat-fillet",
            "name": "فیله",
            "note": "لطیف",
            "story": "فیله برای وقتی که بافت نرم و پخت دقیق می‌خواهید؛ روشن و نزدیک به سفره.",
            "image": "/brand/v2/products/prod-08.png",
            "alt": "سینی گوشت تازه — فیله",
        },
        {
            "id": "meat-steak",
            "name": "استیک ممتاز",
            "note": "رتبه A+",
            "story": "استیک ممتاز با بافتی که روی حرارت زنده می‌شود؛ انتخابی برای سفرهٔ خاص هفته.",
            "image": "/brand/v2/products/prod-25.png",
            "alt": "سینی گوشت تازه — استیک ممتاز",
        },
        {
            "id": "meat-cubes",
            "name": "گوشت قیمه‌ای",
            "note": "خرده‌برش",
            "story": "گوشت قیمه‌ای با برش یکدست؛ برای خورشت‌هایی که باید طعم عمیق بگیرند.",
            "image": "/brand/v2/products/prod-18.png",
            "alt": "سینی گوشت تازه — گوشت قیمه‌ای",
        },
    ],
    "seafood": [
        {
            "id": "sea-fish",
            "name": "ماهی تازه",
            "note": "از دریا",
            "story": "ماهی تازه از منابع دریایی و آبزی‌پروری؛ با مسیری که تازگی را تا آشپزخانه حفظ می‌کند.",
            "image": "/brand/home-seafood.png",
            "alt": "بشقاب دریایی — ماهی تازه",
        },
        {
            "id": "sea-shrimp",
            "name": "میگو",
            "note": "انتخاب روز",
            "story": "میگوی روز برای وقتی که می‌خواهید طعم دریا را ساده و تمیز روی میز بگذارید.",
            "image": "/brand/home-seafood.png",
            "alt": "بشقاب دریایی — میگو",
        },
        {
            "id": "sea-mix",
            "name": "ماهی جنوب",
            "note": "تازه",
            "story": "ماهی جنوب با تازگی پایدار؛ انتخابی برای کسانی که طعم دریا را جدی می‌گیرند.",
            "image": "/brand/home-seafood.png",
            "alt": "بشقاب دریایی — ماهی جنوب",
        },
        {
            "id": "sea-salmon",
            "name": "ماهی سالمون",
            "note": "انتخاب ویژه",
            "story": "سالمون با بافتی درخشان و طعمی که روی سفره می‌درخشد؛ از مسیری که تازگی را جدی می‌گیرد.",
            "image": "/brand/home-seafood.png",
            "alt": "بشقاب دریایی — ماهی سالمون",
        },
        {
            "id": "sea-calamar",
            "name": "کالاماری",
            "note": "سبک",
            "story": "کالاماری برای وقتی که می‌خواهید دریا را ساده و خوش‌طعم روی میز بگذارید.",
            "image": "/brand/home-seafood.png",
            "alt": "بشقاب دریایی — کالاماری",
        },
    ],
    "sausage_cold_cuts": [
        {
            "id": "sausage-ferment",
            "name": "سوسیس تخمیری",
            "note": "طعم عمیق",
            "story": "سوسیس تخمیری با طعمی عمیق و بافتی که به خانه می‌آید، نه به ویترین سرد.",
            "image": "/brand/home-ready.png",
            "alt": "بشقاب — سوسیس تخمیری",
        },
        {
            "id": "sausage-bologna",
            "name": "کالباس بلونیا",
            "note": "کلاسیک",
            "story": "کالباس بلونیا برای سفره‌هایی که طعم آشنا می‌خواهند؛ با دقت مرد کوهستان.",
            "image": "/brand/home-ready.png",
            "alt": "بشقاب — کالباس بلونیا",
        },
        {
            "id": "sausage-grill",
            "name": "سوسیس کبابی",
            "note": "روی حرارت",
            "story": "سوسیس کبابی وقتی که حیاط یا اجاق روشن است و همه دور هم جمع‌اند.",
            "image": "/brand/home-ready.png",
            "alt": "بشقاب — سوسیس کبابی",
        },
    ],
    "ready_to_cook": [
        {
            "id": "cook-nugget",
            "name": "ناگت",
            "note": "سریع",
            "story": "ناگت برای روزهای شلوغ؛ آماده پخت، با کیفیتی که به خانه می‌رسد.",
            "image": "/brand/v2/products/prod-19.png",
            "alt": "سینی آماده‌پخت — ناگت",
        },
        {
            "id": "cook-burger",
            "name": "همبرگر گوشت",
            "note": "خانه",
            "story": "همبرگر آماده‌پخت برای وقتی که دلتان برگر می‌خواهد، اما مسیر غذا برایتان مهم است.",
            "image": "/brand/v2/products/prod-02.png",
            "alt": "سینی آماده‌پخت — همبرگر گوشت",
        },
        {
            "id": "cook-schnitzel",
            "name": "شنیتسل",
            "note": "سوخاری",
            "story": "شنیتسل آماده‌پخت با پوشش ترد؛ برای شب‌هایی که دور هم می‌نشینید.",
            "image": "/brand/v2/products/prod-24.png",
            "alt": "سینی آماده‌پخت — شنیتسل",
        },
        {
            "id": "cook-burger-chicken",
            "name": "همبرگر مرغ",
            "note": "سبک‌تر",
            "story": "همبرگر مرغ برای وعده‌های سبک‌تر؛ همان سرعت، با طعمی که به خانه می‌رسد.",
            "image": "/brand/v2/products/prod-01.png",
            "alt": "سینی آماده‌پخت — همبرگر مرغ",
        },
        {
            "id": "cook-schnitzel-flat",
            "name": "فیله سوخاری",
            "note": "تخت",
            "story": "فیله سوخاری تخت برای وقتی که می‌خواهید سریع، ترد و مطمئن بپزید.",
            "image": "/brand/v2/products/prod-28.png",
            "alt": "سینی آماده‌پخت — فیله سوخاری",
        },
    ],
    "ready_meals": [
        {
            "id": "meal-fesenjan",
            "name": "فسنجان",
            "note": "ایرانی",
            "story": "فسنجان آماده برای وقتی که دلتان خورشت ایرانی می‌خواهد و وقت پخت از صفر نیست.",
            "image": "/brand/home-ready.png",
            "alt": "بشقاب — فسنجان",
        },
        {
            "id": "meal-pasta",
            "name": "پاستا",
            "note": "کامل",
            "story": "پاستای آماده با طعمی متعادل؛ برای روزهایی که سفره باید ساده و گرم باشد.",
            "image": "/brand/home-ready.png",
            "alt": "بشقاب — پاستا",
        },
        {
            "id": "meal-panini",
            "name": "پنینی",
            "note": "سریع",
            "story": "پنینی برای وقتی که زمان کم است اما طعم باید درست باشد.",
            "image": "/brand/home-ready.png",
            "alt": "بشقاب — پنینی",
        },
    ],
    "dairy": [
        {
            "id": "dairy-cheese",
            "name": "پنیر سنتی",
            "note": "صبحانه",
            "story": "پنیر سنتی بر پایهٔ طعم طبیعی؛ مناسب صبحانه و سفره‌ای که ساده و اصیل می‌خواهد.",
            "image": "/brand/home-dairy.png",
            "alt": "بشقاب لبنیات — پنیر سنتی",
        },
        {
            "id": "dairy-yogurt",
            "name": "ماست چکیده",
            "note": "هر روز",
            "story": "ماست چکیده برای سفرهٔ هر روز؛ طعمی که به خانه نزدیک است.",
            "image": "/brand/home-dairy.png",
            "alt": "بشقاب لبنیات — ماست چکیده",
        },
        {
            "id": "dairy-milk",
            "name": "شیر تازه",
            "note": "خانواده",
            "story": "شیر تازه از مسیری که می‌شود به آن اعتماد کرد؛ برای خانه و کودکان.",
            "image": "/brand/home-dairy.png",
            "alt": "بشقاب لبنیات — شیر تازه",
        },
    ],
    "agriculture": [
        {
            "id": "farm-honey",
            "name": "عسل کوهستان",
            "note": "از ارتفاع",
            "story": "عسل کوهستان از همان مسیری می‌آید که برند از آن حرف می‌زند؛ طبیعت، ارتفاع، آرامش.",
            "image": "/brand/home-dairy.png",
            "alt": "بشقاب — عسل کوهستان",
        },
        {
            "id": "farm-rice",
            "name": "برنج",
            "note": "سفره",
            "story": "برنج برای وعده‌هایی که خانه را جمع می‌کند؛ ساده و ضروری.",
            "image": "/brand/home-dairy.png",
            "alt": "بشقاب — برنج",
        },
        {
            "id": "farm-olive",
            "name": "زیتون",
            "note": "روشن",
            "story": "زیتون برای سفره‌هایی که رنگ و طعم طبیعی می‌خواهند.",
            "image": "/brand/home-dairy.png",
            "alt": "بشقاب — زیتون",
        },
    ],
    "bakery_culinary": [
        {
            "id": "bakery-bread",
            "name": "نان تازه",
            "note": "کنار سفره",
            "story": "نان برای وقتی که سفره باید کامل باشد؛ ساده و ضروری.",
            "image": "/brand/home-ready.png",
            "alt": "بشقاب — نان تازه",
        },
        {
            "id": "bakery-dough",
            "name": "خمیر پیتزا",
            "note": "آماده",
            "story": "خمیر پیتزا برای شب‌های آشپزی مشترک؛ بدون دردسر آماده کردن از صفر.",
            "image": "/brand/home-ready.png",
            "alt": "بشقاب — خمیر پیتزا",
        },
        {
            "id": "bakery-dip",
            "name": "دیپ و درسینگ",
            "note": "چاشنی",
            "story": "دیپ و درسینگ برای وقتی که سفره به یک لمس آخر نیاز دارد.",
            "image": "/brand/home-ready.png",
            "alt": "بشقاب — دیپ و درسینگ",
        },
    ],
}

DEMO_CATEGORY_BY_DOMAIN: dict[str, tuple[str, str]] = {
    "fresh_meat": ("گوشت تازه", "demo-gosht"),
    "seafood": ("محصولات دریایی", "demo-daryayi"),
    "sausage_cold_cuts": ("سوسیس و کالباس", "demo-sosis"),
    "ready_to_cook": ("آماده پخت", "demo-amade-pokht"),
    "ready_meals": ("غذای آماده", "demo-ghaza-amade"),
    "dairy": ("لبنیات", "demo-labaniat"),
    "agriculture": ("کشاورزی", "demo-keshavarzi"),
    "bakery_culinary": ("نان و آشپزی", "demo-nan"),
}

SKU_DOMAIN_CODE: dict[str, str] = {
    "fresh_meat": "MEAT",
    "seafood": "SEA",
    "sausage_cold_cuts": "SAUS",
    "ready_to_cook": "COOK",
    "ready_meals": "MEAL",
    "dairy": "DAIRY",
    "agriculture": "FARM",
    "bakery_culinary": "BAKE",
}
