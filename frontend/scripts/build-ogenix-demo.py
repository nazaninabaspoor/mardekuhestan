# -*- coding: utf-8 -*-
from pathlib import Path
import re
import urllib.request

base = Path(r"c:\Users\kamyar\Desktop\MardeKoohestan\frontend\public\demo-ogenix")
base.mkdir(parents=True, exist_ok=True)

src_url = "https://pixydrops.com/ogenix/main-html/index-dark.html"
cdn = "https://pixydrops.com/ogenix/main-html/assets/"

print("Downloading...")
html = urllib.request.urlopen(src_url, timeout=60).read().decode("utf-8", errors="replace")

# Absolute asset paths FIRST
html = re.sub(r'(href|src)=(["\'])assets/', rf'\1=\2{cdn}', html)
html = re.sub(r'url\(\s*assets/', f'url({cdn}', html)
html = re.sub(r"url\(\s*'assets/", f"url('{cdn}", html)
html = re.sub(r'url\(\s*"assets/', f'url("{cdn}', html)

# Logos (after CDN rewrite)
html = html.replace(
    f"{cdn}images/resources/logo-1.png",
    "/brand/logo-white.svg",
)
html = html.replace(
    f"{cdn}images/resources/logo-2.png",
    "/brand/logo-white.svg",
)

html = html.replace('<html lang="en">', '<html lang="fa">')
html = html.replace(
    "<title> Home Dark || ogenix || ogenix HTML 5 Template </title>",
    "<title>مرد کوهستان | دمو دقیق تم Ogenix</title>",
)

# Protect CDN URLs from brand text replace
placeholder = "___OGENIX_CDN___"
html = html.replace(cdn, placeholder)
html = html.replace("https://pixydrops.com/ogenix/", "___OGENIX_SITE___")

replacements = [
    ("Welcome to our Organic Store Ogenix!", "به مرد کوهستان خوش آمدید — این راه سبز است"),
    ("Select only Organic Products", "فقط مسیر سبز را انتخاب کنید"),
    ("Choose the <br> healthy food.", "غذای سالم را<br>آگاهانه انتخاب کنید."),
    ("Learn more", "راه ما"),
    ("Shop now", "فروشگاه"),
    ("Return Policy", "ضمانت اصالت"),
    ("Money back guarantee", "قابل ردیابی از مرتع تا سفره"),
    ("Free shipping", "ارسال تازه"),
    ("On all orders over $60.00", "حفظ زنجیره سرد تا خانه"),
    ("Store locator", "فروشگاه‌ها"),
    ("Find your nearest store", "نزدیک‌ترین نقطهٔ خرید"),
    ("Secure payment", "پرداخت امن"),
    ("Your money is 100% secure", "مسیر خرید ساده و مطمئن"),
    ("30Years of experience", "از مرتع"),
    ("Farming with Love", "با حوصله از زمین"),
    ("Organic & healthy fresh food provider", "ارائه‌دهندهٔ غذای تازه و قابل‌اعتماد"),
    ("The natural products", "محصولات نزدیک به طبیعت"),
    ("Everyday fresh food", "تازگی هر روز برای خانه"),
    ("Our Categories", "دسته‌ها"),
    ("What we’re offering to<br> customers", "چه چیزی به<br>خانه می‌آوریم"),
    ("What we're offering to<br> customers", "چه چیزی به<br>خانه می‌آوریم"),
    ("Vegetables", "گوشت تازه"),
    ("Fresh fruits", "لبنیات"),
    ("Spices", "ماهی و میگو"),
    ("Dried products", "غذای آماده"),
    ("100% Organic", "مسیر سبز"),
    ("Quality organic<br> food store", "فروشگاه<br>کیفیت‌محور"),
    ("Healthy products<br> everyday", "محصولات تازه<br>هر روز"),
    ("Checkout New Products", "تازه‌ها"),
    ("Today’s new hotest products<br> available now", "محصولات منتخب امروز<br>برای سفرهٔ خانه"),
    ("Today's new hotest products<br> available now", "محصولات منتخب امروز<br>برای سفرهٔ خانه"),
    ("Why Choose Ogenix", "چرا مرد کوهستان"),
    ("Few reasons for people<br> choosing ogenix", "چند دلیل برای<br>انتخاب این راه"),
    ("Organic products", "زنجیره یکپارچه"),
    ("Organic fruit", "طعم واقعی"),
    ("Daily fresh", "تازگی حفظ‌شده"),
    ("Natural items", "اعتماد خانواده"),
    ("Meet the Farmers", "راه ما"),
    ("Awesome farmers team<br> here to help you", "مسیر از مرتع تا سفره<br>با تیم مرد کوهستان"),
    ("Our Feedbacks", "صدای خانواده"),
    ("What they’re talking<br> about our company?", "از سفرهٔ خانه<br>چه می‌گویند؟"),
    ("What they're talking<br> about our company?", "از سفرهٔ خانه<br>چه می‌گویند؟"),
    ("From the Blog Posts", "مجله"),
    ("Latest news updates<br> & articles", "تازه‌ترین نوشته‌ها<br>و مقالات"),
    ("Subscribe to newsletter", "همراه مسیر سبز"),
    ("Add to cart", "افزودن به سفره"),
    ("Discover more", "ادامه راه"),
    ("View all testimonials", "مشاهده همه"),
    ("Read More", "ادامه"),
    ("Bananas", "گوشت گوساله"),
    ("Potatos", "پنیر صبحانه"),
    ("Apples", "میگو"),
    ("Lettus", "غذای آماده"),
    ("Brown Bread", "بسته خانواده"),
    ("Senior Farmer", "مسیر سبز"),
    (".CEO Ogenix", "خانواده مرد کوهستان"),
    ("Healthy food", "غذای سالم"),
    ("Vegan, Organic", "از مرتع تا سفره"),
    ("We’re Providing Everyday Fresh<br> and Quality Products.", "هر روز تازه و باکیفیت<br>برای خانه"),
    ("We're Providing Everyday Fresh<br> and Quality Products.", "هر روز تازه و باکیفیت<br>برای خانه"),
    ("Explore", "کاوش"),
    ("About Company", "راه ما"),
    ("Our Services", "مسیر غذا"),
    ("Become a Seller", "فروشگاه‌ها"),
    ("New Products", "محصولات"),
    ("needhelp@ogenix.com", "info@mardekuhestan.com"),
    ("needhelp@company.com", "info@mardekuhestan.com"),
    ("+ 92 ( 307 ) 68 - 06860", "مارکت‌های منتخب"),
    ("666 888 0000", "تماس با ما"),
    ("Organic Store", "مرد کوهستان"),
]

for old, new in replacements:
    html = html.replace(old, new)

# Only replace brand name in visible text contexts — not in remaining paths
# Safe visible replacements for Ogenix / ogenix outside URLs (already protected)
html = re.sub(r"(?<![/\w-])Ogenix(?![/\w-])", "مرد کوهستان", html)
html = re.sub(r"(?<![/\w-])ogenix(?![/\w-])", "مرد کوهستان", html)

# Restore CDN
html = html.replace(placeholder, cdn)
html = html.replace("___OGENIX_SITE___", "https://pixydrops.com/ogenix/")

override = '<link rel="stylesheet" href="/demo-ogenix/brand-overrides.css" />\n'
html = html.replace("</head>", override + "</head>")

banner = (
    '<div class="mk-demo-banner"><div class="mk-demo-banner__inner">'
    "<span>دمو دقیق تم Ogenix با هویت مرد کوهستان — برای تست</span>"
    '<a href="/">بازگشت به سایت اصلی</a></div></div>\n'
)
html = re.sub(r"<body([^>]*)>", r"<body\1>\n" + banner, html, count=1)

out = base / "index.html"
out.write_text(html, encoding="utf-8")

bad = "pixydrops.com/مرد" in html or "مرد کوهستان.css" in html or "مرد کوهستان-dark" in html
css_ok = f"{cdn}css/ogenix-dark.css" in html
print(f"written chars={len(html)} css_ok={css_ok} bad_fa_in_url={bad}")
print("sample css:", "ogenix-dark.css" if css_ok else "MISSING")
