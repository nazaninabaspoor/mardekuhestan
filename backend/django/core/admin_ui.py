"""تم و متن سادهٔ پنل‌های مدیریت مرد کوهستان."""

from __future__ import annotations

from django.urls import reverse


def staff_ok(request) -> bool:
    user = request.user
    return bool(getattr(user, "is_authenticated", False) and user.is_staff)


def content_panel_ok(request) -> bool:
    user = request.user
    if not staff_ok(request):
        return False
    if user.is_superuser:
        return True
    from content.constants import CONTENT_PANEL_GROUPS

    return user.groups.filter(name__in=CONTENT_PANEL_GROUPS).exists()


def environment_callback(request):
    return ["این راه سبز است", "success"]


def _count(qs) -> int:
    try:
        return qs.count()
    except Exception:
        return 0


def admin_dashboard_callback(request, context):
    from product.models import Category, Product, ProductImage, ProductVariant

    product_n = _count(Product.objects.all())
    category_n = _count(Category.objects.all())
    variant_n = _count(ProductVariant.objects.all())
    image_n = _count(ProductImage.objects.all())

    context.update(
        {
            "mk_welcome_title": "خانه مدیریت",
            "mk_welcome_lead": (
                "از اینجا فروشگاه را جمع‌وجور نگه دارید: محصول بگذارید، دسته بچینید، "
                "عکس بگذارید و ببینید چه چیزی برای نمایش روی سایت آماده است."
            ),
            "mk_quick_links": [
                {
                    "url": reverse("admin:product_product_changelist"),
                    "title": "محصول‌ها",
                    "hint": f"{product_n} محصول در فهرست",
                },
                {
                    "url": reverse("admin:product_category_changelist"),
                    "title": "دسته‌ها",
                    "hint": f"{category_n} دسته",
                },
                {
                    "url": reverse("admin:product_productvariant_changelist"),
                    "title": "نوع و اندازه",
                    "hint": f"{variant_n} ردیف",
                },
                {
                    "url": reverse("admin:product_productimage_changelist"),
                    "title": "عکس محصول",
                    "hint": f"{image_n} عکس",
                },
                {
                    "url": "/studio/",
                    "title": "مجله و نوشته‌ها",
                    "hint": "مقاله بنویسید و منتشر کنید",
                },
                {
                    "url": "/",
                    "title": "خود سایت",
                    "hint": "ببینید مشتری چه می‌بیند",
                },
            ],
        }
    )
    return context


def studio_dashboard_callback(request, context):
    from content.models import Article, Category, ContentPillar, RedirectRule, Tag, TopicCluster

    context.update(
        {
            "mk_welcome_title": "میز کار نوشته‌ها",
            "mk_welcome_lead": (
                "اینجا مجله مرد کوهستان را می‌نویسید. مقاله بگذارید، موضوع‌ها را مرتب کنید "
                "و اگر آدرس صفحه‌ای عوض شد، بازدیدکننده را به جای درست بفرستید."
            ),
            "mk_quick_links": [
                {
                    "url": reverse("content_studio:content_article_changelist"),
                    "title": "مقاله‌ها",
                    "hint": f"{_count(Article.objects.all())} نوشته",
                },
                {
                    "url": reverse("content_studio:content_contentpillar_changelist"),
                    "title": "موضوع‌های اصلی",
                    "hint": f"{_count(ContentPillar.objects.all())} موضوع",
                },
                {
                    "url": reverse("content_studio:content_topiccluster_changelist"),
                    "title": "زیرموضوع‌ها",
                    "hint": f"{_count(TopicCluster.objects.all())} زیرموضوع",
                },
                {
                    "url": reverse("content_studio:content_category_changelist"),
                    "title": "دسته‌بندی مجله",
                    "hint": f"{_count(Category.objects.all())} دسته",
                },
                {
                    "url": reverse("content_studio:content_tag_changelist"),
                    "title": "برچسب‌ها",
                    "hint": f"{_count(Tag.objects.all())} برچسب",
                },
                {
                    "url": reverse("content_studio:content_redirectrule_changelist"),
                    "title": "آدرس‌های قدیمی",
                    "hint": f"{_count(RedirectRule.objects.all())} هدایت",
                },
            ],
        }
    )
    return context
