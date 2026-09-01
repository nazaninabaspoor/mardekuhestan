from django.contrib import admin, messages
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.utils.html import format_html, mark_safe
from unfold.admin import ModelAdmin, TabularInline
from unfold.decorators import display
from unfold.widgets import UnfoldAdminExpandableTextareaWidget, UnfoldAdminTextareaWidget

from content.models import (
    Article,
    Category,
    ContentPillar,
    RedirectRule,
    Tag,
    TopicCluster,
)
from content.services import publish_article, seo_readiness_checklist, unpublish_article
from content.studio import content_studio
from content.widgets import StudioSplitDateTimeWidget


JSON_TEXTAREA = UnfoldAdminExpandableTextareaWidget(
    attrs={
        "rows": 5,
        "dir": "rtl",
        "style": "width:100%;max-width:100%;",
    }
)


class TopicClusterInline(TabularInline):
    model = TopicCluster
    extra = 0
    fields = ("title", "slug", "target_keyword", "is_active")
    prepopulated_fields = {"slug": ("title",)}
    show_change_link = True
    tab = True
    hide_title = True
    verbose_name = "زیرموضوع"
    verbose_name_plural = "زیرموضوع‌های این موضوع"


@admin.register(Category, site=content_studio)
class CategoryAdmin(ModelAdmin):
    list_display = ("name", "slug", "parent", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name", "slug", "description")
    prepopulated_fields = {"slug": ("name",)}
    autocomplete_fields = ("parent",)
    list_fullwidth = True
    compressed_fields = True
    list_filter_sheet = True
    fieldsets = (
        (
            "اطلاعات دسته",
            {
                "fields": ("name", "slug", "parent", "description", "is_active"),
                "description": "دسته‌ها کمک می‌کنند مقاله در مجله پیدا شود.",
            },
        ),
    )


@admin.register(Tag, site=content_studio)
class TagAdmin(ModelAdmin):
    list_display = ("name", "slug")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    list_fullwidth = True
    compressed_fields = True
    fieldsets = (
        (
            "برچسب",
            {
                "fields": ("name", "slug"),
                "description": "برچسب یعنی موضوع کوچک روی مقاله، مثل «عسل» یا «راه سبز».",
            },
        ),
    )


@admin.register(ContentPillar, site=content_studio)
class ContentPillarAdmin(ModelAdmin):
    list_display = ("title", "primary_keyword", "is_active", "updated_at")
    list_filter = ("is_active",)
    search_fields = ("title", "slug", "primary_keyword", "description")
    prepopulated_fields = {"slug": ("title",)}
    inlines = [TopicClusterInline]
    list_fullwidth = True
    compressed_fields = True
    warn_unsaved_form = True
    list_filter_sheet = True
    fieldsets = (
        (
            "موضوع اصلی",
            {
                "fields": (
                    "title",
                    "slug",
                    "primary_keyword",
                    "description",
                    "is_active",
                ),
                "description": "موضوع بزرگ مجله را اینجا می‌گذارید. زیرموضوع‌ها را زیر همین موضوع بسازید.",
            },
        ),
    )


@admin.register(TopicCluster, site=content_studio)
class TopicClusterAdmin(ModelAdmin):
    list_display = ("title", "pillar", "target_keyword", "is_active")
    list_filter = ("is_active", "pillar")
    search_fields = ("title", "slug", "target_keyword", "pillar__title")
    prepopulated_fields = {"slug": ("title",)}
    autocomplete_fields = ("pillar",)
    list_fullwidth = True
    compressed_fields = True
    list_filter_sheet = True
    fieldsets = (
        (
            "زیرموضوع",
            {
                "fields": (
                    "pillar",
                    "title",
                    "slug",
                    "target_keyword",
                    "description",
                    "is_active",
                ),
                "description": "زیرموضوع زیر یک موضوع اصلی می‌نشیند و مقاله‌ها را مرتب می‌کند.",
            },
        ),
    )


@admin.register(RedirectRule, site=content_studio)
class RedirectRuleAdmin(ModelAdmin):
    list_display = ("from_path", "to_path", "status_code", "is_active", "created_at")
    list_filter = ("is_active", "status_code")
    search_fields = ("from_path", "to_path", "note")
    list_fullwidth = True
    compressed_fields = True
    list_filter_sheet = True
    fieldsets = (
        (
            "آدرس قدیمی",
            {
                "fields": (
                    "from_path",
                    "to_path",
                    "status_code",
                    "is_active",
                    "note",
                ),
                "description": "اگر آدرس مقاله عوض شد، بازدیدکننده را از آدرس قدیمی به آدرس جدید بفرستید. «برای همیشه» معمولاً انتخاب درست است.",
            },
        ),
    )


@admin.register(Article, site=content_studio)
class ArticleAdmin(ModelAdmin):
    list_display = (
        "title",
        "status_badge",
        "content_role",
        "focus_keyword",
        "word_count",
        "readiness_badge",
        "published_at",
    )
    list_filter = ("status", "content_role", "search_intent", "robots_index", "pillar")
    search_fields = (
        "title",
        "slug",
        "focus_keyword",
        "seo_title",
        "excerpt",
        "editor_notes",
    )
    prepopulated_fields = {"slug": ("title",)}
    autocomplete_fields = ("pillar", "cluster", "categories", "tags")
    readonly_fields = (
        "schema_json",
        "word_count",
        "reading_time_minutes",
        "created_at",
        "updated_at",
        "readiness_panel",
    )
    date_hierarchy = "published_at"
    actions = ("action_publish", "action_unpublish", "action_mark_in_review")
    save_on_top = True
    list_fullwidth = True
    compressed_fields = True
    warn_unsaved_form = True
    list_filter_sheet = True
    list_per_page = 25
    ordering = ("-updated_at",)

    def get_form(self, request, obj=None, change=False, **kwargs):
        form = super().get_form(request, obj=obj, change=change, **kwargs)
        if "published_at" in form.base_fields:
            form.base_fields["published_at"].widget = StudioSplitDateTimeWidget()
        return form

    fieldsets = (
        (
            "نوشته",
            {
                "classes": ["tab"],
                "description": "عنوان و متن را بنویسید. اگر آدرس صفحه خالی بماند، خودش ساخته می‌شود.",
                "fields": (
                    ("title", "slug"),
                    "excerpt",
                    "body",
                    ("cover_image", "author"),
                    ("status", "published_at"),
                    "editor_notes",
                ),
            },
        ),
        (
            "مرتب‌سازی",
            {
                "classes": ["tab"],
                "description": "دسته و برچسب را بگذارید و اگر این نوشته زیر یک موضوع اصلی است، همان را وصل کنید.",
                "fields": (
                    "categories",
                    "tags",
                    ("content_role", "search_intent"),
                    ("pillar", "cluster"),
                ),
            },
        ),
        (
            "گوگل و جستجو",
            {
                "classes": ["tab"],
                "description": "کلمهٔ جستجو و عنوان و توضیح گوگل را پر کنید تا مقاله راحت‌تر پیدا شود.",
                "fields": (
                    "focus_keyword",
                    "secondary_keywords",
                    "seo_title",
                    "seo_description",
                    ("breadcrumb_title", "canonical_url"),
                    ("robots_index", "robots_follow"),
                ),
            },
        ),
        (
            "شبکه اجتماعی",
            {
                "classes": ["tab"],
                "description": "اگر خالی بماند، از عنوان و توضیح گوگل استفاده می‌شود.",
                "fields": ("og_title", "og_description", "og_image"),
            },
        ),
        (
            "هوش مصنوعی",
            {
                "classes": ["tab"],
                "description": "برای GEO: خلاصه قابل استناد، حقایق، موجودیت‌ها و سوالات متداول را با کلیدهای فارسی بنویسید.",
                "fields": (
                    "geo_summary",
                    "geo_key_facts",
                    "geo_entities",
                    "geo_faq",
                    "internal_links",
                    "schema_json",
                ),
            },
        ),
        (
            "آمادگی",
            {
                "classes": ["tab"],
                "description": "قبل از انتشار این چک‌لیست را مرور کنید. تعداد کلمات آزاد است.",
                "fields": (
                    ("word_count", "reading_time_minutes"),
                    "readiness_panel",
                    ("created_at", "updated_at"),
                ),
            },
        ),
    )

    def formfield_for_dbfield(self, db_field, request, **kwargs):
        text_areas = {
            "geo_summary": UnfoldAdminTextareaWidget(
                attrs={"rows": 4, "dir": "rtl", "style": "width:100%;max-width:100%;"}
            ),
            "excerpt": UnfoldAdminTextareaWidget(
                attrs={"rows": 3, "dir": "rtl", "style": "width:100%;max-width:100%;"}
            ),
            "editor_notes": UnfoldAdminTextareaWidget(
                attrs={"rows": 3, "dir": "rtl", "style": "width:100%;max-width:100%;"}
            ),
            "secondary_keywords": JSON_TEXTAREA,
            "geo_key_facts": JSON_TEXTAREA,
            "geo_entities": JSON_TEXTAREA,
            "geo_faq": JSON_TEXTAREA,
            "internal_links": JSON_TEXTAREA,
        }
        if db_field.name in text_areas:
            kwargs["widget"] = text_areas[db_field.name]
        return super().formfield_for_dbfield(db_field, request, **kwargs)

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "author":
            user_model = get_user_model()
            kwargs["queryset"] = user_model.objects.filter(is_staff=True).order_by(
                "username"
            )
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

    @display(description="وضعیت", label=True)
    def status_badge(self, obj: Article):
        return obj.get_status_display()

    @display(
        description="آمادگی",
        label={
            "آماده": "success",
            "نیاز به تکمیل": "warning",
        },
    )
    def readiness_badge(self, obj: Article):
        checks = seo_readiness_checklist(obj)
        return "آماده" if checks["آماده برای انتشار"] else "نیاز به تکمیل"

    @admin.display(description="چک‌لیست سئو و هوش مصنوعی")
    def readiness_panel(self, obj: Article):
        if not obj.pk:
            return format_html(
                '<p class="mk-empty-hint">بعد از اولین ذخیره، چک‌لیست آمادگی اینجا نمایش داده می‌شود.</p>'
            )

        checks = seo_readiness_checklist(obj)
        ready = bool(checks.get("آماده برای انتشار"))
        items = []
        for key, value in checks.items():
            if key == "آماده برای انتشار":
                continue
            css = "mk-checklist__value--yes" if value else "mk-checklist__value--no"
            label = "بله" if value else "خیر"
            items.append(
                f'<li class="mk-checklist__item">'
                f'<span class="mk-checklist__label">{key}</span>'
                f'<span class="mk-checklist__value {css}">{label}</span>'
                f"</li>"
            )

        summary_class = "is-ready" if ready else "is-pending"
        summary_text = (
            "همه‌چیز برای انتشار آماده است."
            if ready
            else "هنوز چند مورد برای تکمیل مانده است؛ موارد نارنجی را کامل کنید."
        )
        return format_html(
            '<ul class="mk-checklist">{}</ul>'
            '<div class="mk-checklist__summary {}">{}</div>',
            mark_safe("".join(items)),
            summary_class,
            summary_text,
        )

    @admin.action(description="انتشار مقالات انتخاب‌شده")
    def action_publish(self, request, queryset):
        count = 0
        for article in queryset:
            publish_article(article, when=timezone.now())
            count += 1
        self.message_user(request, f"{count} مقاله منتشر شد.", messages.SUCCESS)

    @admin.action(description="بازگشت به پیش‌نویس")
    def action_unpublish(self, request, queryset):
        count = 0
        for article in queryset:
            unpublish_article(article)
            count += 1
        self.message_user(request, f"{count} مقاله به پیش‌نویس برگشت.", messages.WARNING)

    @admin.action(description="علامت‌گذاری: در حال بررسی")
    def action_mark_in_review(self, request, queryset):
        updated = queryset.update(status="in_review")
        self.message_user(
            request, f"{updated} مقاله در حال بررسی قرار گرفت.", messages.INFO
        )
