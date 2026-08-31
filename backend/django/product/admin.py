"""پنل ادمین کاتالوگ محصول — django-unfold."""

from __future__ import annotations

from django import forms
from django.contrib import admin, messages
from django.core.exceptions import ValidationError
from django.db.models import Count, Prefetch, QuerySet
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from unfold.admin import ModelAdmin, TabularInline
from unfold.decorators import display
from unfold.widgets import UnfoldAdminExpandableTextareaWidget, UnfoldAdminTextareaWidget

from product import validators as product_validators
from product.constants import (
    Allergen,
    ProductImageRole,
    ProductStatus,
    ProductVisibility,
)
from product.models import Category, Product, ProductImage, ProductVariant
from product.utils import (
    domain_label_fa,
    format_rial,
    format_weight_grams,
    normalize_allergen_list,
    normalize_sku,
)


RTL_TEXTAREA = UnfoldAdminTextareaWidget(
    attrs={"rows": 3, "dir": "rtl", "style": "width:100%;max-width:100%;"}
)
ALLERGEN_JSON_WIDGET = UnfoldAdminExpandableTextareaWidget(
    attrs={"rows": 4, "dir": "ltr", "style": "width:100%;max-width:100%;"}
)

# ---------------------------------------------------------------------------
# Forms — reuse validators.py (same rules as API)
# ---------------------------------------------------------------------------


class CategoryAdminForm(forms.ModelForm):
    class Meta:
        model = Category
        fields = "__all__"

    def clean_name(self):
        value = self.cleaned_data["name"]
        product_validators.validate_category_name(value)
        return value

    def clean_slug(self):
        value = self.cleaned_data.get("slug", "")
        if value:
            product_validators.validate_category_slug(value)
        return value

    def clean_description(self):
        value = self.cleaned_data.get("description", "")
        if value:
            product_validators.validate_category_description(value)
        return value

    def clean_domain(self):
        value = self.cleaned_data.get("domain", "")
        if value:
            product_validators.validate_product_domain(value)
        return value

    def clean_kind(self):
        value = self.cleaned_data["kind"]
        product_validators.validate_category_kind(value)
        return value

    def clean_sort_order(self):
        value = self.cleaned_data["sort_order"]
        product_validators.validate_sort_order(value)
        return value

    def clean(self):
        cleaned = super().clean()
        parent = cleaned.get("parent")
        instance = self.instance

        if parent and instance.pk and parent.pk == instance.pk:
            raise ValidationError({"parent": "دسته نمی‌تواند والد خودش باشد."})

        depth = 1
        current = parent
        while current is not None:
            depth += 1
            product_validators.validate_category_depth(depth)
            current = current.parent

        return cleaned


class ProductAdminForm(forms.ModelForm):
    allergens = forms.MultipleChoiceField(
        label="آلرژن‌ها",
        choices=Allergen.CHOICES,
        required=False,
        widget=forms.CheckboxSelectMultiple,
    )

    class Meta:
        model = Product
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance.pk:
            self.initial["allergens"] = self.instance.allergens or []

    def clean_name(self):
        product_validators.validate_product_name(self.cleaned_data["name"])
        return self.cleaned_data["name"]

    def clean_slug(self):
        value = self.cleaned_data.get("slug", "")
        if value:
            product_validators.validate_product_slug(value)
        return value

    def clean_subtitle(self):
        value = self.cleaned_data.get("subtitle", "")
        if value:
            product_validators.validate_product_subtitle(value)
        return value

    def clean_short_description(self):
        value = self.cleaned_data.get("short_description", "")
        if value:
            product_validators.validate_product_short_description(value)
        return value

    def clean_domain(self):
        product_validators.validate_product_domain(self.cleaned_data["domain"])
        return self.cleaned_data["domain"]

    def clean_status(self):
        product_validators.validate_product_status(self.cleaned_data["status"])
        return self.cleaned_data["status"]

    def clean_visibility(self):
        product_validators.validate_product_visibility(self.cleaned_data["visibility"])
        return self.cleaned_data["visibility"]

    def clean_sales_channel(self):
        product_validators.validate_sales_channel(self.cleaned_data["sales_channel"])
        return self.cleaned_data["sales_channel"]

    def clean_unit_price_rial(self):
        value = self.cleaned_data.get("unit_price_rial")
        if value is not None:
            product_validators.validate_unit_price_rial(value)
        return value

    def clean_pricing_strategy(self):
        product_validators.validate_pricing_strategy(self.cleaned_data["pricing_strategy"])
        return self.cleaned_data["pricing_strategy"]

    def clean_unit_of_measure(self):
        product_validators.validate_unit_of_measure(self.cleaned_data["unit_of_measure"])
        return self.cleaned_data["unit_of_measure"]

    def clean_net_weight_grams(self):
        value = self.cleaned_data.get("net_weight_grams")
        if value is not None:
            product_validators.validate_net_weight_grams(value)
        return value

    def clean_storage_class(self):
        product_validators.validate_storage_class(self.cleaned_data["storage_class"])
        return self.cleaned_data["storage_class"]

    def clean_packaging_type(self):
        product_validators.validate_packaging_type(self.cleaned_data["packaging_type"])
        return self.cleaned_data["packaging_type"]

    def clean_halal_status(self):
        product_validators.validate_halal_status(self.cleaned_data["halal_status"])
        return self.cleaned_data["halal_status"]

    def clean_allergens(self):
        normalized = normalize_allergen_list(self.cleaned_data.get("allergens"))
        product_validators.validate_allergen_list(normalized)
        return normalized

    def clean_sort_order(self):
        product_validators.validate_sort_order(self.cleaned_data["sort_order"])
        return self.cleaned_data["sort_order"]

    def clean(self):
        cleaned = super().clean()
        product_validators.validate_pricing_unit_consistency(
            pricing_strategy=cleaned.get("pricing_strategy"),
            unit_of_measure=cleaned.get("unit_of_measure"),
        )
        product_validators.validate_storage_for_domain(
            domain=cleaned.get("domain"),
            storage_class=cleaned.get("storage_class"),
        )
        product_validators.validate_publishable_product(
            status=cleaned.get("status"),
            name=cleaned.get("name", ""),
            domain=cleaned.get("domain", ""),
            unit_price_rial=cleaned.get("unit_price_rial"),
        )
        return cleaned


class ProductVariantInlineForm(forms.ModelForm):
    class Meta:
        model = ProductVariant
        fields = "__all__"

    def clean_label(self):
        product_validators.validate_variant_label(self.cleaned_data["label"])
        return self.cleaned_data["label"]

    def clean_sku(self):
        normalized = normalize_sku(self.cleaned_data["sku"])
        product_validators.validate_sku(normalized)
        return normalized

    def clean_unit_price_rial(self):
        value = self.cleaned_data.get("unit_price_rial")
        if value is not None:
            product_validators.validate_unit_price_rial(value)
        return value

    def clean_net_weight_grams(self):
        value = self.cleaned_data.get("net_weight_grams")
        if value is not None:
            product_validators.validate_net_weight_grams(value)
        return value

    def clean_sort_order(self):
        product_validators.validate_sort_order(self.cleaned_data["sort_order"])
        return self.cleaned_data["sort_order"]


class ProductImageInlineForm(forms.ModelForm):
    class Meta:
        model = ProductImage
        fields = "__all__"

    def clean_role(self):
        product_validators.validate_product_image_role(self.cleaned_data["role"])
        return self.cleaned_data["role"]

    def clean_alt_text(self):
        value = self.cleaned_data.get("alt_text", "")
        if value:
            product_validators.validate_image_alt(value)
        return value

    def clean_sort_order(self):
        product_validators.validate_sort_order(self.cleaned_data["sort_order"])
        return self.cleaned_data["sort_order"]


# ---------------------------------------------------------------------------
# Inlines
# ---------------------------------------------------------------------------


class ProductVariantInline(TabularInline):
    model = ProductVariant
    form = ProductVariantInlineForm
    extra = 0
    fields = (
        "label",
        "sku",
        "unit_price_rial",
        "net_weight_grams",
        "is_active",
        "sort_order",
    )
    show_change_link = True
    tab = True
    hide_title = True
    verbose_name = "واریانت"
    verbose_name_plural = "واریانت‌های محصول"


class ProductImageInline(TabularInline):
    model = ProductImage
    form = ProductImageInlineForm
    extra = 1
    fields = ("role", "image", "image_preview", "alt_text", "sort_order")
    readonly_fields = ("image_preview",)
    show_change_link = True
    tab = True
    hide_title = True
    verbose_name = "تصویر"
    verbose_name_plural = "گالری تصاویر"

    @admin.display(description="پیش‌نمایش")
    def image_preview(self, obj: ProductImage) -> str:
        if obj.image:
            return format_html(
                '<img src="{}" alt="" style="max-height:52px;border-radius:6px;" />',
                obj.image.url,
            )
        return "—"


# ---------------------------------------------------------------------------
# Category
# ---------------------------------------------------------------------------


@admin.register(Category)
class CategoryAdmin(ModelAdmin):
    form = CategoryAdminForm
    list_display = (
        "name",
        "slug",
        "public_uuid",
        "domain_label",
        "kind",
        "parent",
        "sort_order",
        "is_active",
    )
    list_filter = ("is_active", "kind", "domain")
    search_fields = ("name", "slug", "description", "public_uuid")
    prepopulated_fields = {"slug": ("name",)}
    autocomplete_fields = ("parent",)
    list_editable = ("sort_order", "is_active")
    ordering = ("sort_order", "name")
    list_fullwidth = True
    compressed_fields = True
    list_filter_sheet = True
    save_on_top = True

    fieldsets = (
        (
            "دسته‌بندی",
            {
                "description": "دسته‌های ناوبری فروشگاه و مجموعه‌های مرچندایزینگ.",
                "fields": (
                    "public_uuid",
                    ("name", "slug"),
                    ("parent", "domain"),
                    ("kind", "sort_order"),
                    "description",
                    "is_active",
                ),
            },
        ),
        (
            "زمان‌بندی",
            {
                "classes": ["collapse"],
                "fields": (("created_at", "updated_at"),),
            },
        ),
    )
    readonly_fields = ("public_uuid", "created_at", "updated_at")

    @display(description="دامنه")
    def domain_label(self, obj: Category) -> str:
        if not obj.domain:
            return "—"
        return domain_label_fa(obj.domain)


# ---------------------------------------------------------------------------
# Product
# ---------------------------------------------------------------------------


@admin.register(Product)
class ProductAdmin(ModelAdmin):
    form = ProductAdminForm
    inlines = (ProductVariantInline, ProductImageInline)
    list_display = (
        "name",
        "domain_label",
        "status_badge",
        "visibility_badge",
        "price_display",
        "weight_display",
        "variant_count",
        "image_count",
        "sort_order",
        "updated_at",
    )
    list_filter = (
        "status",
        "visibility",
        "domain",
        "sales_channel",
        "storage_class",
        "pricing_strategy",
    )
    search_fields = ("name", "slug", "subtitle", "short_description", "variants__sku")
    prepopulated_fields = {"slug": ("name",)}
    autocomplete_fields = ("categories",)
    readonly_fields = (
        "created_at",
        "updated_at",
        "catalog_readiness_panel",
        "hero_preview",
    )
    actions = (
        "action_activate",
        "action_pending_review",
        "action_out_of_stock",
        "action_discontinue",
        "action_archive",
        "action_draft",
    )
    save_on_top = True
    list_fullwidth = True
    compressed_fields = True
    warn_unsaved_form = True
    list_filter_sheet = True
    list_per_page = 25
    ordering = ("sort_order", "name")

    fieldsets = (
        (
            "شناسه و معرفی",
            {
                "classes": ["tab"],
                "description": "نام و نامک محصول. اگر نامک خالی بماند خودکار ساخته می‌شود.",
                "fields": (
                    ("name", "slug"),
                    "subtitle",
                    "short_description",
                    ("domain", "sort_order"),
                    "categories",
                ),
            },
        ),
        (
            "انتشار و کانال",
            {
                "classes": ["tab"],
                "description": "وضعیت انتشار و کانال‌های فروش.",
                "fields": (
                    ("status", "visibility"),
                    "sales_channel",
                ),
            },
        ),
        (
            "قیمت و واحد",
            {
                "classes": ["tab"],
                "description": "قیمت پایه به ریال. برای قیمت وزنی، واحد باید گرم یا کیلوگرم باشد.",
                "fields": (
                    ("unit_price_rial", "pricing_strategy"),
                    ("unit_of_measure", "net_weight_grams"),
                ),
            },
        ),
        (
            "نگهداری و برچسب",
            {
                "classes": ["tab"],
                "description": "کلاس نگهداری، بسته‌بندی، حلال و آلرژن‌ها.",
                "fields": (
                    ("storage_class", "packaging_type"),
                    "halal_status",
                    "allergens",
                ),
            },
        ),
        (
            "گالری",
            {
                "classes": ["tab"],
                "description": "حداقل یک تصویر با نقش «تصویر اصلی» برای انتشار لازم است.",
                "fields": ("hero_preview",),
            },
        ),
        (
            "آمادگی کاتالوگ",
            {
                "classes": ["tab"],
                "fields": (
                    "catalog_readiness_panel",
                    ("created_at", "updated_at"),
                ),
            },
        ),
    )

    def get_queryset(self, request) -> QuerySet[Product]:
        return (
            super()
            .get_queryset(request)
            .prefetch_related(
                Prefetch("variants", queryset=ProductVariant.objects.all()),
                Prefetch("images", queryset=ProductImage.objects.all()),
            )
            .annotate(
                _variant_count=Count("variants", distinct=True),
                _image_count=Count("images", distinct=True),
            )
        )

    def formfield_for_dbfield(self, db_field, request, **kwargs):
        if db_field.name == "short_description":
            kwargs["widget"] = RTL_TEXTAREA
        return super().formfield_for_dbfield(db_field, request, **kwargs)

    def formfield_for_manytomany(self, db_field, request, **kwargs):
        if db_field.name == "categories":
            kwargs["queryset"] = Category.objects.active().catalog_order()
        return super().formfield_for_manytomany(db_field, request, **kwargs)

    @display(description="دامنه")
    def domain_label(self, obj: Product) -> str:
        return domain_label_fa(obj.domain)

    @display(description="وضعیت", label=True)
    def status_badge(self, obj: Product) -> str:
        return obj.get_status_display()

    @display(
        description="نمایش",
        label={
            "عمومی": "success",
            "مخفی": "danger",
            "فقط خرده‌فروشی": "info",
            "فقط عمده‌فروشی": "info",
        },
    )
    def visibility_badge(self, obj: Product) -> str:
        return obj.get_visibility_display()

    @display(description="قیمت")
    def price_display(self, obj: Product) -> str:
        if obj.unit_price_rial is None:
            return "—"
        return format_rial(obj.unit_price_rial)

    @display(description="وزن")
    def weight_display(self, obj: Product) -> str:
        if obj.net_weight_grams is None:
            return "—"
        return format_weight_grams(obj.net_weight_grams)

    @display(description="واریانت")
    def variant_count(self, obj: Product) -> int:
        return getattr(obj, "_variant_count", obj.variants.count())

    @display(description="تصویر")
    def image_count(self, obj: Product) -> int:
        return getattr(obj, "_image_count", obj.images.count())

    @admin.display(description="تصویر اصلی")
    def hero_preview(self, obj: Product) -> str:
        if not obj.pk:
            return "بعد از ذخیره، تصاویر را در تب «گالری تصاویر» اضافه کنید."
        hero = obj.images.filter(role=ProductImageRole.HERO).first()
        if hero is None:
            hero = obj.images.first()
        if hero and hero.image:
            return format_html(
                '<img src="{}" alt="{}" style="max-height:160px;border-radius:8px;" />',
                hero.image.url,
                hero.alt_text or obj.name,
            )
        return format_html(
            '<p style="opacity:.7;">هنوز تصویری بارگذاری نشده — حداقل یک hero لازم است.</p>'
        )

    @admin.display(description="چک‌لیست آمادگی فروشگاه")
    def catalog_readiness_panel(self, obj: Product) -> str:
        if not obj.pk:
            return format_html(
                '<p style="opacity:.7;">بعد از اولین ذخیره، چک‌لیست اینجا نمایش داده می‌شود.</p>'
            )

        checks: list[tuple[str, bool]] = []
        try:
            product_validators.validate_publishable_product(
                status=obj.status,
                name=obj.name,
                domain=obj.domain,
                unit_price_rial=obj.unit_price_rial,
            )
            publishable_ok = obj.status in ProductStatus.PUBLISHABLE
        except ValidationError:
            publishable_ok = False

        checks.append(("وضعیت قابل انتشار", publishable_ok))
        checks.append(("قیمت مشخص", obj.unit_price_rial is not None))
        checks.append(
            (
                "نمایش در کانال B2C",
                obj.visibility
                in {ProductVisibility.PUBLIC, ProductVisibility.B2C_ONLY},
            )
        )
        has_hero = obj.images.filter(role=ProductImageRole.HERO).exists()
        checks.append(("تصویر hero", has_hero))
        checks.append(("حداقل یک تصویر", obj.images.exists()))
        checks.append(("حداقل یک دسته", obj.categories.exists()))

        try:
            product_validators.validate_pricing_unit_consistency(
                pricing_strategy=obj.pricing_strategy,
                unit_of_measure=obj.unit_of_measure,
            )
            checks.append(("سازگاری قیمت/واحد", True))
        except ValidationError:
            checks.append(("سازگاری قیمت/واحد", False))

        try:
            product_validators.validate_storage_for_domain(
                domain=obj.domain,
                storage_class=obj.storage_class,
            )
            checks.append(("نگهداری متناسب دامنه", True))
        except ValidationError:
            checks.append(("نگهداری متناسب دامنه", False))

        items = []
        for label, ok in checks:
            css = "color:#2f7f3c;" if ok else "color:#b45309;"
            state = "بله" if ok else "خیر"
            items.append(
                f'<li style="display:flex;justify-content:space-between;gap:1rem;padding:.35rem 0;">'
                f"<span>{label}</span>"
                f'<strong style="{css}">{state}</strong>'
                f"</li>"
            )

        ready = all(ok for _, ok in checks)
        summary = (
            "محصول برای نمایش در فروشگاه آماده است."
            if ready
            else "چند مورد برای انتشار کامل باقی مانده است."
        )
        return format_html(
            '<ul style="list-style:none;margin:0;padding:0;">{}</ul>'
            '<p style="margin-top:.75rem;font-weight:600;">{}</p>',
            mark_safe("".join(items)),
            summary,
        )

    def save_model(self, request, obj, form, change) -> None:
        super().save_model(request, obj, form, change)
        if obj.status in ProductStatus.PUBLISHABLE:
            images = list(obj.images.all())
            try:
                product_validators.validate_product_images_have_hero(images)
            except ValidationError as exc:
                self.message_user(
                    request,
                    " ".join(exc.messages),
                    level=messages.WARNING,
                )

    @admin.action(description="فعال‌سازی در فروشگاه")
    def action_activate(self, request, queryset):
        activated = 0
        for product in queryset:
            try:
                product_validators.validate_publishable_product(
                    status=ProductStatus.ACTIVE,
                    name=product.name,
                    domain=product.domain,
                    unit_price_rial=product.unit_price_rial,
                )
                product_validators.validate_product_images_have_hero(
                    list(product.images.all())
                )
            except ValidationError as exc:
                self.message_user(
                    request,
                    f"«{product.name}»: {' '.join(exc.messages)}",
                    level=messages.ERROR,
                )
                continue
            product.status = ProductStatus.ACTIVE
            product.save(update_fields=["status", "updated_at"])
            activated += 1
        if activated:
            self.message_user(
                request,
                f"{activated} محصول فعال شد.",
                level=messages.SUCCESS,
            )

    @admin.action(description="ارسال برای بررسی")
    def action_pending_review(self, request, queryset):
        updated = queryset.exclude(status=ProductStatus.ARCHIVED).update(
            status=ProductStatus.PENDING_REVIEW
        )
        self.message_user(request, f"{updated} محصول در صف بررسی قرار گرفت.", messages.INFO)

    @admin.action(description="علامت‌گذاری: ناموجود")
    def action_out_of_stock(self, request, queryset):
        updated = queryset.update(status=ProductStatus.OUT_OF_STOCK)
        self.message_user(request, f"{updated} محصول ناموجود شد.", messages.WARNING)

    @admin.action(description="توقف تولید")
    def action_discontinue(self, request, queryset):
        updated = queryset.update(status=ProductStatus.DISCONTINUED)
        self.message_user(request, f"{updated} محصول متوقف شد.", messages.WARNING)

    @admin.action(description="بایگانی")
    def action_archive(self, request, queryset):
        updated = queryset.update(status=ProductStatus.ARCHIVED)
        self.message_user(request, f"{updated} محصول بایگانی شد.", messages.WARNING)

    @admin.action(description="بازگشت به پیش‌نویس")
    def action_draft(self, request, queryset):
        updated = queryset.update(status=ProductStatus.DRAFT)
        self.message_user(request, f"{updated} محصول به پیش‌نویس برگشت.", messages.INFO)


# ---------------------------------------------------------------------------
# Standalone variant / image (جستجوی سریع SKU و media)
# ---------------------------------------------------------------------------


@admin.register(ProductVariant)
class ProductVariantAdmin(ModelAdmin):
    form = ProductVariantInlineForm
    list_display = (
        "label",
        "sku",
        "product",
        "price_display",
        "weight_display",
        "is_active",
        "sort_order",
    )
    list_filter = ("is_active", "product__domain", "product__status")
    search_fields = ("label", "sku", "product__name", "product__slug")
    autocomplete_fields = ("product",)
    list_editable = ("is_active", "sort_order")
    ordering = ("product__name", "sort_order", "label")
    list_fullwidth = True
    compressed_fields = True
    list_filter_sheet = True

    fieldsets = (
        (
            "واریانت",
            {
                "fields": (
                    "product",
                    ("label", "sku"),
                    ("unit_price_rial", "net_weight_grams"),
                    ("is_active", "sort_order"),
                ),
            },
        ),
        (
            "زمان‌بندی",
            {
                "classes": ["collapse"],
                "fields": (("created_at", "updated_at"),),
            },
        ),
    )
    readonly_fields = ("created_at", "updated_at")

    @display(description="قیمت")
    def price_display(self, obj: ProductVariant) -> str:
        if obj.unit_price_rial is None:
            return "—"
        return format_rial(obj.unit_price_rial)

    @display(description="وزن")
    def weight_display(self, obj: ProductVariant) -> str:
        if obj.net_weight_grams is None:
            return "—"
        return format_weight_grams(obj.net_weight_grams)


@admin.register(ProductImage)
class ProductImageAdmin(ModelAdmin):
    form = ProductImageInlineForm
    list_display = (
        "image_preview",
        "product",
        "role",
        "sort_order",
        "created_at",
    )
    list_filter = ("role", "product__domain")
    search_fields = ("product__name", "alt_text")
    autocomplete_fields = ("product",)
    ordering = ("product__name", "sort_order")
    list_fullwidth = True
    compressed_fields = True

    fieldsets = (
        (
            "تصویر",
            {
                "fields": (
                    "product",
                    ("role", "sort_order"),
                    "image",
                    "image_preview_large",
                    "alt_text",
                ),
            },
        ),
        (
            "زمان‌بندی",
            {
                "classes": ["collapse"],
                "fields": ("created_at",),
            },
        ),
    )
    readonly_fields = ("created_at", "image_preview_large")

    @display(description="پیش‌نمایش")
    def image_preview(self, obj: ProductImage) -> str:
        if obj.image:
            return format_html(
                '<img src="{}" alt="" style="max-height:40px;border-radius:4px;" />',
                obj.image.url,
            )
        return "—"

    @admin.display(description="نمایش")
    def image_preview_large(self, obj: ProductImage) -> str:
        if obj.image:
            return format_html(
                '<img src="{}" alt="{}" style="max-width:320px;border-radius:8px;" />',
                obj.image.url,
                obj.alt_text,
            )
        return "—"
