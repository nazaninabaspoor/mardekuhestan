from pathlib import Path

p = Path(r"c:/Users/kamyar/Desktop/MardeKoohestan/frontend/lib/brand.ts")
t = p.read_text(encoding="utf-8")
start = t.find("export const latestArticles")
end = t.find("export const articleGroups")
head, mid, tail = t[:start], t[start:end], t[end:]

pairs = [
    (
        'title: "از مرتع تا سفره",\n    excerpt: "مسیر روشن — از چراگاه تا آماده‌سازی و بعد به خانه.",\n    image: "/brand/goosht.png",\n    alt: "گوشت تازه مرد کوهستان"',
        'title: "از مرتع تا سفره",\n    excerpt: "مسیر روشن — از چراگاه تا آماده‌سازی و بعد به خانه.",\n    image: "/brand/our-way-02-nature.png",\n    alt: "مرتع و مسیر غذای مرد کوهستان"',
    ),
    (
        'title: "صبحانه‌ای که ریشه دارد",\n    excerpt: "لبنیات برای هر روز خانه — مسیری که می‌توان دید.",\n    image: "/brand/home-dairy.png",\n    alt: "صبحانه با لبنیات مرد کوهستان"',
        'title: "صبحانه‌ای که ریشه دارد",\n    excerpt: "لبنیات برای هر روز خانه — مسیری که می‌توان دید.",\n    image: "/brand/our-way-04-balance.png",\n    alt: "سفرهٔ خانگی مرد کوهستان"',
    ),
    (
        'title: "این راه سبز است",\n    excerpt: "آرامش، ارتفاع، وضوح — و اعتماد روی سفره.",\n    image: "/brand/mardekoohestan.png",\n    alt: "هویت برند مرد کوهستان"',
        'title: "این راه سبز است",\n    excerpt: "آرامش، ارتفاع، وضوح — و اعتماد روی سفره.",\n    image: "/brand/our-way-01-climb.png",\n    alt: "آغاز راه سبز مرد کوهستان"',
    ),
    (
        'title: "از آب تا آشپزخانه",\n    excerpt: "ماهی و میگو با همان تازگی که روی سفره دیده می‌شود.",\n    image: "/brand/mahi.png",\n    alt: "ماهی و میگوی تازه"',
        'title: "از آب تا آشپزخانه",\n    excerpt: "ماهی و میگو با همان تازگی که روی سفره دیده می‌شود.",\n    image: "/brand/home-seafood.png",\n    alt: "ماهی و میگوی تازه"',
    ),
    (
        'title: "پنیر برای هر صبح",\n    excerpt: "از شیر تا پنیر — مسیر کوتاه و قابل فهم.",\n    image: "/brand/panir.png",\n    alt: "پنیر مرد کوهستان"',
        'title: "پنیر برای هر صبح",\n    excerpt: "از شیر تا پنیر — مسیر کوتاه و قابل فهم.",\n    image: "/brand/home-dairy.png",\n    alt: "صبحانه با لبنیات مرد کوهستان"',
    ),
    (
        'title: "با حوصله درست شده",\n    excerpt: "غذایی که وقت آشپزخانه را کم می‌کند، نه طعم خانه را.",\n    image: "/brand/akhary.png",\n    alt: "غذای آماده مرد کوهستان"',
        'title: "با حوصله درست شده",\n    excerpt: "غذایی که وقت آشپزخانه را کم می‌کند، نه طعم خانه را.",\n    image: "/brand/our-way-03-quality.png",\n    alt: "آماده‌سازی با دقت مرد کوهستان"',
    ),
]

for a, b in pairs:
    if a not in mid:
        raise SystemExit("missing block: " + a[10:40])
    mid = mid.replace(a, b, 1)
    print("ok")

p.write_text(head + mid + tail, encoding="utf-8")
print("done")
