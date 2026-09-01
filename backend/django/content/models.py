from django.conf import settings
from django.db import models
from django.utils.text import slugify
from django_ckeditor_5.fields import CKEditor5Field

from content.constants import (
    ARTICLE_SLUG_MAX_LENGTH,
    ARTICLE_TITLE_MAX_LENGTH,
    ArticleStatus,
    ContentRole,
    FOCUS_KEYWORD_MAX_LENGTH,
    SEO_DESCRIPTION_MAX_LENGTH,
    SEO_TITLE_MAX_LENGTH,
    SearchIntent,
)
from content.managers import ArticleManager
from content.services import prepare_article_for_save
from content.validators import (
    validate_geo_faq,
    validate_geo_summary_quality,
    validate_seo_description,
    validate_seo_title,
    validate_string_list,
)


def _unique_slug(model_cls, title: str, *, instance_pk=None, field: str = "slug") -> str:
    base = slugify(title, allow_unicode=True) or "item"
    slug = base
    index = 2
    qs = model_cls.objects.all()
    if instance_pk:
        qs = qs.exclude(pk=instance_pk)
    while qs.filter(**{field: slug}).exists():
        slug = f"{base}-{index}"
        index += 1
    return slug


class Category(models.Model):
    name = models.CharField("نام دسته", max_length=120)
    slug = models.SlugField("آدرس صفحه", max_length=140, unique=True, blank=True, allow_unicode=True)
    description = models.TextField("توضیحات", blank=True)
    parent = models.ForeignKey(
        "self",
        verbose_name="دسته والد",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="children",
    )
    is_active = models.BooleanField("فعال", default=True)
    created_at = models.DateTimeField("تاریخ ایجاد", auto_now_add=True)

    class Meta:
        verbose_name = "دسته‌بندی"
        verbose_name_plural = "دسته‌بندی‌ها"
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = _unique_slug(Category, self.name, instance_pk=self.pk)
        super().save(*args, **kwargs)


class Tag(models.Model):
    name = models.CharField("نام برچسب", max_length=80, unique=True)
    slug = models.SlugField("آدرس صفحه", max_length=100, unique=True, blank=True, allow_unicode=True)

    class Meta:
        verbose_name = "برچسب"
        verbose_name_plural = "برچسب‌ها"
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = _unique_slug(Tag, self.name, instance_pk=self.pk)
        super().save(*args, **kwargs)


class ContentPillar(models.Model):
    title = models.CharField("نام موضوع اصلی", max_length=180)
    slug = models.SlugField("آدرس صفحه", max_length=200, unique=True, blank=True, allow_unicode=True)
    description = models.TextField("توضیح این موضوع", blank=True)
    primary_keyword = models.CharField("کلمهٔ اصلی که مردم جستجو می‌کنند", max_length=FOCUS_KEYWORD_MAX_LENGTH, blank=True)
    is_active = models.BooleanField("فعال", default=True)
    created_at = models.DateTimeField("تاریخ ایجاد", auto_now_add=True)
    updated_at = models.DateTimeField("آخرین بروزرسانی", auto_now=True)

    class Meta:
        ordering = ["title"]
        verbose_name = "موضوع اصلی"
        verbose_name_plural = "موضوع‌های اصلی"

    def __str__(self) -> str:
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = _unique_slug(ContentPillar, self.title, instance_pk=self.pk)
        super().save(*args, **kwargs)


class TopicCluster(models.Model):
    pillar = models.ForeignKey(
        ContentPillar,
        verbose_name="موضوع اصلی",
        on_delete=models.CASCADE,
        related_name="clusters",
    )
    title = models.CharField("نام زیرموضوع", max_length=180)
    slug = models.SlugField("آدرس صفحه", max_length=200, blank=True, allow_unicode=True)
    description = models.TextField("توضیحات", blank=True)
    target_keyword = models.CharField("کلمه کلیدی هدف", max_length=FOCUS_KEYWORD_MAX_LENGTH, blank=True)
    is_active = models.BooleanField("فعال", default=True)
    created_at = models.DateTimeField("تاریخ ایجاد", auto_now_add=True)

    class Meta:
        ordering = ["pillar__title", "title"]
        unique_together = ("pillar", "slug")
        verbose_name = "خوشه موضوعی"
        verbose_name_plural = "خوشه‌های موضوعی"

    def __str__(self) -> str:
        return f"{self.pillar.title} → {self.title}"

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title, allow_unicode=True) or "cluster"
            slug = base
            index = 2
            while (
                TopicCluster.objects.filter(pillar=self.pillar, slug=slug)
                .exclude(pk=self.pk)
                .exists()
            ):
                slug = f"{base}-{index}"
                index += 1
            self.slug = slug
        super().save(*args, **kwargs)


class Article(models.Model):
    title = models.CharField("عنوان مقاله", max_length=ARTICLE_TITLE_MAX_LENGTH)
    slug = models.SlugField(
        "نامک آدرس",
        max_length=ARTICLE_SLUG_MAX_LENGTH,
        unique=True,
        blank=True,
        allow_unicode=True,
    )
    excerpt = models.TextField("خلاصه کوتاه", blank=True, help_text="برای کارت‌ها و لیست مقالات")
    body = CKEditor5Field("متن اصلی مقاله", config_name="extends")

    categories = models.ManyToManyField(Category, verbose_name="دسته‌بندی‌ها", blank=True, related_name="articles")
    tags = models.ManyToManyField(Tag, verbose_name="برچسب‌ها", blank=True, related_name="articles")
    pillar = models.ForeignKey(
        ContentPillar,
        verbose_name="موضوع اصلی",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="articles",
    )
    cluster = models.ForeignKey(
        TopicCluster,
        verbose_name="خوشه موضوعی",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="articles",
    )
    content_role = models.CharField(
        "نقش محتوا",
        max_length=20,
        choices=ContentRole.CHOICES,
        default=ContentRole.STANDALONE,
        db_index=True,
    )
    search_intent = models.CharField(
        "نیت جستجو",
        max_length=20,
        choices=SearchIntent.CHOICES,
        default=SearchIntent.INFORMATIONAL,
        db_index=True,
    )

    focus_keyword = models.CharField(
        "کلمه کلیدی اصلی",
        max_length=FOCUS_KEYWORD_MAX_LENGTH,
        blank=True,
        help_text="کلمه کلیدی اصلی که سئوکار روی آن کار می‌کند",
    )
    secondary_keywords = models.JSONField(
        "کلمات کلیدی فرعی",
        default=list,
        blank=True,
        help_text='هر تعداد کلمه که لازم دارید؛ مثال: ["عسل کوهستان", "راه سبز", "محصولات لبنی"]',
    )
    seo_title = models.CharField(
        "عنوان سئو",
        max_length=SEO_TITLE_MAX_LENGTH,
        blank=True,
        validators=[validate_seo_title],
        help_text="حداکثر حدود ۷۰ کاراکتر",
    )
    seo_description = models.CharField(
        "توضیحات سئو",
        max_length=SEO_DESCRIPTION_MAX_LENGTH,
        blank=True,
        validators=[validate_seo_description],
        help_text="حداکثر حدود ۱۶۰ کاراکتر",
    )
    canonical_url = models.URLField("آدرس کنونیکال", blank=True)
    robots_index = models.BooleanField("اجازه ایندکس", default=True)
    robots_follow = models.BooleanField("اجازه دنبال کردن لینک‌ها", default=True)
    breadcrumb_title = models.CharField("عنوان مسیر راهنما", max_length=120, blank=True)

    og_title = models.CharField("عنوان شبکه‌های اجتماعی", max_length=SEO_TITLE_MAX_LENGTH, blank=True)
    og_description = models.CharField("توضیح شبکه‌های اجتماعی", max_length=SEO_DESCRIPTION_MAX_LENGTH, blank=True)
    og_image = models.ImageField("تصویر شبکه‌های اجتماعی", upload_to="articles/og/", blank=True, null=True)

    geo_summary = models.TextField(
        "خلاصه برای موتورهای هوش مصنوعی",
        blank=True,
        help_text="خلاصه شفاف و قابل استناد برای پاسخ‌دهی هوش مصنوعی (چت‌جی‌پی‌تی، پرپلکسیتی و مشابه)",
        validators=[validate_geo_summary_quality],
    )
    geo_key_facts = models.JSONField(
        "حقایق کلیدی برای هوش مصنوعی",
        default=list,
        blank=True,
        help_text='هر تعداد حقیقت؛ مثال: ["مرد کوهستان برند صنایع غذایی است", "راه سبز زنجیره ارزش یکپارچه است"]',
    )
    geo_entities = models.JSONField(
        "موجودیت‌های برند و محصول",
        default=list,
        blank=True,
        help_text='مثال: ["مرد کوهستان", "راه سبز", "عسل کوهستان"]',
    )
    geo_faq = models.JSONField(
        "سوالات متداول برای هوش مصنوعی",
        default=list,
        blank=True,
        help_text='هر تعداد سوال؛ مثال: [{"سوال":"مرد کوهستان چیست؟","پاسخ":"..."}]',
        validators=[validate_geo_faq],
    )
    schema_json = models.JSONField("داده ساخت‌یافته برای موتورهای جستجو", default=dict, blank=True)

    word_count = models.PositiveIntegerField("تعداد کلمات", default=0, editable=False)
    reading_time_minutes = models.PositiveIntegerField("زمان مطالعه (دقیقه)", default=0, editable=False)
    internal_links = models.JSONField(
        "لینک‌های داخلی",
        default=list,
        blank=True,
        help_text='هر تعداد لینک؛ مثال: [{"عنوان":"راه سبز","آدرس":"/articles/rah-sabz/"}]',
    )

    cover_image = models.ImageField("تصویر شاخص", upload_to="articles/covers/", blank=True, null=True)
    status = models.CharField(
        "وضعیت",
        max_length=20,
        choices=ArticleStatus.CHOICES,
        default=ArticleStatus.DRAFT,
        db_index=True,
    )
    published_at = models.DateTimeField("زمان انتشار", blank=True, null=True, db_index=True)
    updated_at = models.DateTimeField("آخرین بروزرسانی", auto_now=True)
    created_at = models.DateTimeField("تاریخ ایجاد", auto_now_add=True)
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name="نویسنده",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="articles",
    )
    editor_notes = models.TextField(
        "یادداشت داخلی تیم",
        blank=True,
        help_text="فقط برای تیم محتوا/سئو؛ در سایت نمایش داده نمی‌شود",
    )

    objects = ArticleManager()

    class Meta:
        verbose_name = "مقاله"
        verbose_name_plural = "مقالات"
        ordering = ["-published_at", "-created_at"]
        indexes = [
            models.Index(fields=["status", "published_at"]),
            models.Index(fields=["slug"]),
            models.Index(fields=["content_role", "search_intent"]),
        ]

    def __str__(self) -> str:
        return self.title

    def clean(self):
        super().clean()
        validate_string_list(self.geo_key_facts, field_name="حقایق کلیدی")
        validate_string_list(self.geo_entities, field_name="موجودیت‌ها")
        validate_string_list(self.secondary_keywords, field_name="کلمات کلیدی فرعی")
        validate_geo_faq(self.geo_faq)

    def save(self, *args, **kwargs):
        prepare_article_for_save(self)
        super().save(*args, **kwargs)


class RedirectRule(models.Model):
    from_path = models.CharField("مسیر مبدأ", max_length=255, unique=True, help_text="مثال: /old-article/")
    to_path = models.CharField("مسیر مقصد", max_length=255, help_text="مثال: /articles/new-slug/")
    status_code = models.PositiveSmallIntegerField(
        "کد وضعیت",
        default=301,
        choices=((301, "۳۰۱ دائمی"), (302, "۳۰۲ موقت")),
    )
    is_active = models.BooleanField("فعال", default=True)
    note = models.CharField("یادداشت", max_length=255, blank=True)
    created_at = models.DateTimeField("تاریخ ایجاد", auto_now_add=True)

    class Meta:
        ordering = ["from_path"]
        verbose_name = "ریدایرکت"
        verbose_name_plural = "ریدایرکت‌ها"

    def __str__(self) -> str:
        return f"{self.from_path} → {self.to_path}"
