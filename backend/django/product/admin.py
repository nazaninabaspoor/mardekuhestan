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
    CategoryKind,
    ProductImageRole,
    ProductStatus,
    ProductVisibility,
)
from product.models import Category, Product, ProductImage, ProductInsightEvent, ProductOpinion, ProductVariant
from product.utils import (
    domain_label_fa,
    format_rial,
    format_weight_grams,
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
    """فرم ساده افزودن محصول — فقط نام و گروه الزامی است."""

    class Meta:
        model = Product
        fields = (
            "name",
            "domain",
            "unit_price_rial",
            "short_description",
            "status",
            "visibility",
            "subtitle",
            "categories",
            "sort_order",
            "sales_channel",
            "pricing_strategy",
            "unit_of_measure",
            "net_weight_grams",
            "storage_class",
            "packaging_type",
            "halal_status",
        )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Always optional in UI — filled automatically on save.
        for name in (
            "short_description",
            "subtitle",
            "unit_price_rial",
            "net_weight_grams",
            "categories",
            "sort_order",
        ):
            if name in self.fields:
                self.fields[name].required = False

        self.fields["name"].help_text = "مثلاً: فیله، عسل کوهستان، نان تازه"
        self.fields["domain"].help_text = "کدام قفسه صفحه اصلی؟ (گوشت، لبنیات، …)"
        self.fields["unit_price_rial"].help_text = "اختیاری — اگر خالی بماند قیمت پیش‌فرض گذاشته می‌شود"
        self.fields["short_description"].help_text = "اختیاری"

        if not self.instance.pk:
            self.fields["status"].initial = ProductStatus.ACTIVE
            self.initial["status"] = ProductStatus.ACTIVE
            self.fields["visibility"].initial = ProductVisibility.PUBLIC
            self.initial["visibility"] = ProductVisibility.PUBLIC
            self.fields["unit_price_rial"].initial = 450_000
            self.initial["unit_price_rial"] = 450_000
            self.fields["sort_order"].initial = 10
            self.initial["sort_order"] = 10
            self.fields["net_weight_grams"].initial = 900
            self.initial["net_weight_grams"] = 900

    def clean_name(self):
        product_validators.validate_product_name(self.cleaned_data["name"])
        return self.cleaned_data["name"]

    def clean_domain(self):
        product_validators.validate_product_domain(self.cleaned_data["domain"])
        return self.cleaned_data["domain"]

    def clean_unit_price_rial(self):
        value = self.cleaned_data.get("unit_price_rial")
        if value is not None:
            product_validators.validate_unit_price_rial(value)
        return value

    def clean_short_description(self):
        value = self.cleaned_data.get("short_description", "")
        if value:
            product_validators.validate_product_short_description(value)
        return value

    def clean(self):
        cleaned = super().clean()
        # Sensible defaults so staff don't fight validators.
        if not cleaned.get("status"):
            cleaned["status"] = ProductStatus.ACTIVE
        if not cleaned.get("visibility"):
            cleaned["visibility"] = ProductVisibility.PUBLIC
        if cleaned.get("unit_price_rial") is None and cleaned.get("status") in ProductStatus.PUBLISHABLE:
            cleaned["unit_price_rial"] = 450_000
        if not cleaned.get("storage_class") and cleaned.get("domain"):
            from product.utils import default_storage_for_domain

            cleaned["storage_class"] = default_storage_for_domain(cleaned["domain"])
        if not cleaned.get("pricing_strategy"):
            cleaned["pricing_strategy"] = "fixed"
        if not cleaned.get("unit_of_measure"):
            cleaned["unit_of_measure"] = "piece"
        if not cleaned.get("sales_channel"):
            cleaned["sales_channel"] = "b2c"
        if not cleaned.get("halal_status"):
            cleaned["halal_status"] = "not_applicable"
        if not cleaned.get("packaging_type"):
            cleaned["packaging_type"] = "other"
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
        fields = ("image", "alt_text", "role", "sort_order")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if "role" in self.fields:
            self.fields["role"].initial = ProductImageRole.HERO
            self.initial["role"] = ProductImageRole.HERO
            self.fields["role"].widget = forms.HiddenInput()
        if "sort_order" in self.fields:
            self.fields["sort_order"].widget = forms.HiddenInput()
            self.fields["sort_order"].initial = 10
        if "alt_text" in self.fields:
            self.fields["alt_text"].required = False
            self.fields["alt_text"].help_text = "اختیاری"

    def clean_role(self):
        return self.cleaned_data.get("role") or ProductImageRole.HERO

    def clean_alt_text(self):
        value = self.cleaned_data.get("alt_text", "")
        if value:
            product_validators.validate_image_alt(value)
        return value

    def clean_sort_order(self):
        value = self.cleaned_data.get("sort_order")
        return 10 if value is None else value


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
    verbose_name = "نوع و اندازه"
    verbose_name_plural = "نوع و اندازه‌های این محصول"
    classes = ["collapse"]


class ProductImageInline(TabularInline):
    model = ProductImage
    form = ProductImageInlineForm
    extra = 1
    min_num = 0
    fields = ("image", "alt_text", "role", "sort_order", "image_preview")
    readonly_fields = ("image_preview",)
    show_change_link = False
    verbose_name = "عکس"
    verbose_name_plural = "عکس محصول (یک فایل انتخاب کنید)"

    @admin.display(description="پیش‌نمایش")
    def image_preview(self, obj: ProductImage) -> str:
        if obj and getattr(obj, "image", None):
            return format_html(
                '<img src="{}" alt="" style="max-height:72px;border-radius:6px;" />',
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
                "description": "دسته‌هایی که در منوی فروشگاه یا مجموعه‌های ویژه می‌آیند.",
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
            "زمان ساخت",
            {
                "classes": ["collapse"],
                "fields": (("created_at", "updated_at"),),
            },
        ),
    )
    readonly_fields = ("public_uuid", "created_at", "updated_at")

    @display(description="گروه محصول")
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
    inlines = (ProductImageInline, ProductVariantInline)
    list_display = (
        "name",
        "domain_label",
        "status_badge",
        "price_display",
        "image_count",
        "updated_at",
    )
    list_filter = (
        "status",
        "domain",
    )
    search_fields = (
        "name",
        "slug",
        "subtitle",
        "short_description",
        "public_uuid",
    )
    autocomplete_fields = ("categories",)
    readonly_fields = (
        "public_uuid",
        "created_at",
        "updated_at",
        "hero_preview",
    )
    actions = (
        "action_activate",
        "action_draft",
        "action_archive",
    )
    save_on_top = True
    list_fullwidth = True
    compressed_fields = True
    warn_unsaved_form = True
    list_filter_sheet = True
    list_per_page = 25
    ordering = ("-updated_at", "name")

    fieldsets = (
        (
            "محصول جدید — فقط این‌ها لازم است",
            {
                "description": (
                    "۱) نام  ۲) گروه  ۳) عکس پایین صفحه. "
                    "قیمت و بقیه در صورت خالی بودن خودکار پر می‌شوند."
                ),
                "fields": (
                    "name",
                    "domain",
                    "unit_price_rial",
                    "short_description",
                ),
            },
        ),
        (
            "تنظیمات بیشتر (اختیاری)",
            {
                "classes": ["collapse"],
                "fields": (
                    "status",
                    "visibility",
                    "subtitle",
                    "categories",
                    "sort_order",
                    "sales_channel",
                    ("pricing_strategy", "unit_of_measure", "net_weight_grams"),
                    ("storage_class", "packaging_type", "halal_status"),
                    "hero_preview",
                    "public_uuid",
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

    @display(description="گروه محصول")
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

    @display(description="نوع و اندازه")
    def variant_count(self, obj: Product) -> int:
        return getattr(obj, "_variant_count", obj.variants.count())

    @display(description="تصویر")
    def image_count(self, obj: Product) -> int:
        return getattr(obj, "_image_count", obj.images.count())

    @admin.display(description="تصویر اصلی")
    def hero_preview(self, obj: Product) -> str:
        if not obj.pk:
            return "بعد از ذخیره، عکس‌ها را در تب گالری بگذارید."
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
            '<p class="mk-empty-hint">هنوز عکسی نگذاشته‌اید — حداقل یک تصویر اصلی لازم است.</p>'
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

        checks.append(("وضعیت برای نمایش روی سایت", publishable_ok))
        checks.append(("قیمت مشخص است", obj.unit_price_rial is not None))
        checks.append(
            (
                "برای خرید خانگی دیده می‌شود",
                obj.visibility
                in {ProductVisibility.PUBLIC, ProductVisibility.B2C_ONLY},
            )
        )
        has_hero = obj.images.filter(role=ProductImageRole.HERO).exists()
        checks.append(("عکس اصلی دارد", has_hero))
        checks.append(("حداقل یک عکس", obj.images.exists()))
        checks.append(("حداقل یک دسته", obj.categories.exists()))

        try:
            product_validators.validate_pricing_unit_consistency(
                pricing_strategy=obj.pricing_strategy,
                unit_of_measure=obj.unit_of_measure,
            )
            checks.append(("قیمت و واحد با هم جورند", True))
        except ValidationError:
            checks.append(("قیمت و واحد با هم جورند", False))

        try:
            product_validators.validate_storage_for_domain(
                domain=obj.domain,
                storage_class=obj.storage_class,
            )
            checks.append(("نگهداری مناسب این گروه محصول", True))
        except ValidationError:
            checks.append(("نگهداری مناسب این گروه محصول", False))

        items = []
        for label, ok in checks:
            css = "mk-checklist__value--yes" if ok else "mk-checklist__value--no"
            state = "بله" if ok else "خیر"
            items.append(
                f'<li class="mk-checklist__item">'
                f'<span class="mk-checklist__label">{label}</span>'
                f'<span class="mk-checklist__value {css}">{state}</span>'
                f"</li>"
            )

        ready = all(ok for _, ok in checks)
        summary = (
            "این محصول برای نمایش در فروشگاه آماده است."
            if ready
            else "چند مورد مانده تا محصول روی سایت درست دیده شود."
        )
        summary_class = "is-ready" if ready else "is-pending"
        return format_html(
            '<ul class="mk-checklist">{}</ul>'
            '<div class="mk-checklist__summary {}">{}</div>',
            mark_safe("".join(items)),
            summary_class,
            summary,
        )

    def save_model(self, request, obj, form, change) -> None:
        from product.utils import build_unique_slug, default_storage_for_domain

        if not (obj.slug or "").strip():
            obj.slug = build_unique_slug(Product, obj.name, instance_pk=obj.pk)
        if not obj.status:
            obj.status = ProductStatus.ACTIVE
        if not obj.visibility:
            obj.visibility = ProductVisibility.PUBLIC
        if obj.unit_price_rial is None:
            obj.unit_price_rial = 450_000
        if not obj.net_weight_grams:
            obj.net_weight_grams = 900
        if obj.domain:
            obj.storage_class = default_storage_for_domain(obj.domain) or obj.storage_class

        super().save_model(request, obj, form, change)

        # Ensure a sellable size/variant exists for cart/checkout.
        if not obj.variants.exists():
            ProductVariant.objects.create(
                product=obj,
                sku=normalize_sku(f"MK-{obj.pk:05d}-01") or f"MK-{obj.pk:05d}-01",
                label="استاندارد",
                unit_price_rial=obj.unit_price_rial,
                net_weight_grams=obj.net_weight_grams,
                is_active=True,
                sort_order=10,
            )

        # Attach matching navigation category from domain.
        if obj.domain and not obj.categories.exists():
            match = (
                Category.objects.active()
                .filter(domain=obj.domain, kind=CategoryKind.NAVIGATION)
                .order_by("sort_order", "name")
                .first()
            )
            if match is None:
                match = (
                    Category.objects.active()
                    .filter(domain=obj.domain)
                    .order_by("sort_order", "name")
                    .first()
                )
            if match is not None:
                obj.categories.add(match)

        if obj.images.exists():
            self.message_user(
                request,
                f"«{obj.name}» ذخیره شد و روی صفحه اصلی (بعد از رفرش) دیده می‌شود.",
                level=messages.SUCCESS,
            )
        else:
            self.message_user(
                request,
                f"«{obj.name}» ذخیره شد. برای دیده شدن کامل روی سایت، یک عکس در پایین همین صفحه بگذارید.",
                level=messages.WARNING,
            )

    def save_formset(self, request, form, formset, change) -> None:
        instances = formset.save(commit=False)
        for obj in instances:
            if isinstance(obj, ProductImage):
                if not obj.role:
                    obj.role = ProductImageRole.HERO
                if not obj.alt_text and form.instance:
                    obj.alt_text = form.instance.name
            obj.save()
        formset.save_m2m()
        for obj in formset.deleted_objects:
            obj.delete()

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
        "public_uuid",
        "product",
        "mother_uuid",
        "price_display",
        "weight_display",
        "is_active",
        "sort_order",
    )
    list_filter = ("is_active", "product__domain", "product__status")
    search_fields = (
        "label",
        "sku",
        "public_uuid",
        "product__name",
        "product__slug",
        "product__public_uuid",
    )
    autocomplete_fields = ("product",)
    list_editable = ("is_active", "sort_order")
    ordering = ("product__name", "sort_order", "label")
    list_fullwidth = True
    compressed_fields = True
    list_filter_sheet = True

    fieldsets = (
        (
            "نوع و اندازه",
            {
                "fields": (
                    "product",
                    "public_uuid",
                    "mother_uuid",
                    ("label", "sku"),
                    ("unit_price_rial", "net_weight_grams"),
                    ("is_active", "sort_order"),
                ),
            },
        ),
        (
            "زمان ساخت",
            {
                "classes": ["collapse"],
                "fields": (("created_at", "updated_at"),),
            },
        ),
    )
    readonly_fields = ("public_uuid", "mother_uuid", "created_at", "updated_at")

    @display(description="شناسه محصول")
    def mother_uuid(self, obj: ProductVariant) -> str:
        return str(obj.product.public_uuid)

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
    search_fields = ("product__name", "alt_text", "public_uuid", "product__public_uuid")
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
                    "public_uuid",
                    ("role", "sort_order"),
                    "image",
                    "image_preview_large",
                    "alt_text",
                ),
            },
        ),
        (
            "زمان ساخت",
            {
                "classes": ["collapse"],
                "fields": ("created_at",),
            },
        ),
    )
    readonly_fields = ("public_uuid", "created_at", "image_preview_large")

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


@admin.register(ProductInsightEvent)
class ProductInsightEventAdmin(ModelAdmin):
    list_display = (
        "created_at",
        "event_type",
        "product_name",
        "category_key",
        "user",
        "visitor_id",
    )
    list_filter = ("event_type", "category_key", "created_at")
    search_fields = ("product_name", "product_key", "visitor_id", "user__username", "user__email")
    readonly_fields = (
        "user",
        "visitor_id",
        "event_type",
        "product_key",
        "product_name",
        "category_key",
        "payload",
        "created_at",
    )
    date_hierarchy = "created_at"
    list_fullwidth = True
    ordering = ("-created_at",)

    def has_add_permission(self, request) -> bool:
        return False

    def has_change_permission(self, request, obj=None) -> bool:
        return False


@admin.register(ProductOpinion)
class ProductOpinionAdmin(ModelAdmin):
    list_display = (
        "created_at",
        "product_name",
        "rating",
        "meal",
        "user",
        "comment_preview",
    )
    list_filter = ("rating", "meal", "category_key", "created_at")
    search_fields = ("product_name", "product_key", "comment", "visitor_id", "user__username", "user__email")
    readonly_fields = (
        "user",
        "visitor_id",
        "product_key",
        "product_name",
        "category_key",
        "rating",
        "meal",
        "comment",
        "created_at",
    )
    date_hierarchy = "created_at"
    list_fullwidth = True
    ordering = ("-created_at",)

    def has_add_permission(self, request) -> bool:
        return False

    def has_change_permission(self, request, obj=None) -> bool:
        return False

    @admin.display(description="نظر")
    def comment_preview(self, obj: ProductOpinion) -> str:
        text = (obj.comment or "").strip()
        if not text:
            return "—"
        return text[:72] + ("…" if len(text) > 72 else "")
