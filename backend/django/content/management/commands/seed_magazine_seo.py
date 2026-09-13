from django.core.management.base import BaseCommand

from content.models import Category, MagazinePageSettings

# نام‌های SEOمحور برای بیزنس صنایع غذایی مرد کوهستان — اسلاگ ثابت می‌ماند
SEED_CATEGORIES = [
    {
        "slug": "rah-ma",
        "name": "راه سبز",
        "seo_title": "راه سبز مرد کوهستان | مجله",
        "description": "هویت برند، ارتفاع و آرامش؛ همان مسیری که شعار «این راه سبز است» از آن می‌آید.",
        "sort_order": 10,
        "magazine_image_path": "/magazine/png/png-way-green.png",
    },
    {
        "slug": "masir-ghaza",
        "name": "از مرتع تا سفره",
        "seo_title": "از مرتع تا سفره | مسیر غذای مرد کوهستان",
        "description": "زنجیره ارزش غذا از چراگاه و آب تا آماده‌سازی و سفره خانه.",
        "sort_order": 20,
        "magazine_image_path": "/magazine/png/png-lamb-chops.png",
    },
    {
        "slug": "zendegi-khane",
        "name": "سفره خانواده",
        "seo_title": "سفره خانواده | زندگی خانگی با کیفیت",
        "description": "صبحانه، جمعه و عادت‌های سفره برای خانواده کیفیت‌محور.",
        "sort_order": 30,
        "magazine_image_path": "/magazine/png/png-bread.png",
    },
    {
        "slug": "mazraeh",
        "name": "مرتع و ارتفاع",
        "seo_title": "مرتع و ارتفاع | مزرعه مرد کوهستان",
        "description": "مه، پشم، دام و زمینی که عجله ندارد؛ مبدأ طعم واقعی.",
        "sort_order": 40,
        "magazine_image_path": "/magazine/png/png-sheep.png",
    },
]


class Command(BaseCommand):
    help = "ساخت/به‌روزرسانی دسته‌های SEO مجله و تنظیمات صفحه /magazine"

    def handle(self, *args, **options):
        MagazinePageSettings.load()
        self.stdout.write(self.style.SUCCESS("تنظیمات صفحه مجله آماده است."))

        for item in SEED_CATEGORIES:
            obj, created = Category.objects.update_or_create(
                slug=item["slug"],
                defaults={
                    "name": item["name"],
                    "seo_title": item["seo_title"],
                    "description": item["description"],
                    "sort_order": item["sort_order"],
                    "magazine_image_path": item["magazine_image_path"],
                    "show_on_magazine": True,
                    "is_active": True,
                },
            )
            verb = "ساخته شد" if created else "به‌روز شد"
            self.stdout.write(self.style.SUCCESS(f"{obj.slug}: {obj.name} — {verb}"))

        self.stdout.write(
            self.style.WARNING(
                "SEO می‌تواند از استودیو نام/عکس/ترتیب دسته و عنوان صفحه مجله را عوض کند."
            )
        )
