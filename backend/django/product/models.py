"""مدل‌های کاتالوگ محصول — مرد کوهستان."""

from __future__ import annotations

import uuid

from django.core.exceptions import ValidationError
from django.db import models

from product.constants import (
    DEFAULT_SORT_ORDER,
    PRODUCT_NAME_MAX_LENGTH,
    PRODUCT_SHORT_DESCRIPTION_MAX_LENGTH,
    PRODUCT_SLUG_MAX_LENGTH,
    PRODUCT_SUBTITLE_MAX_LENGTH,
    SKU_MAX_LENGTH,
    VARIANT_LABEL_MAX_LENGTH,
    CATEGORY_DESCRIPTION_MAX_LENGTH,
    CATEGORY_NAME_MAX_LENGTH,
    CATEGORY_SLUG_MAX_LENGTH,
    CategoryKind,
    HalalStatus,
    PackagingType,
    PricingStrategy,
    ProductDomain,
    ProductImageRole,
    ProductStatus,
    ProductVisibility,
    SalesChannel,
    StorageClass,
    UnitOfMeasure,
)
from product.managers import CategoryManager, ProductManager, ProductVariantManager
from product.utils import build_unique_slug, normalize_sku
from product import validators as product_validators
from product.validators import validate_sku_format


class PublicUUIDMixin(models.Model):
    """شناسه عمومی غیرقابل حدس — برای API و جستجو (جایگزین pk در لایه عمومی)."""

    public_uuid = models.UUIDField(
        "شناسه",
        default=uuid.uuid4,
        editable=False,
        unique=True,
        db_index=True,
    )

    class Meta:
        abstract = True


class Category(PublicUUIDMixin, models.Model):
    name = models.CharField("نام دسته", max_length=CATEGORY_NAME_MAX_LENGTH)
    slug = models.SlugField("آدرس صفحه", max_length=CATEGORY_SLUG_MAX_LENGTH, unique=True, allow_unicode=True)
    description = models.TextField("توضیحات", max_length=CATEGORY_DESCRIPTION_MAX_LENGTH, blank=True)
    parent = models.ForeignKey(
        "self",
        verbose_name="دسته والد",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="children",
    )
    domain = models.CharField(
        "گروه محصول",
        max_length=32,
        choices=ProductDomain.CHOICES,
        blank=True,
    )
    kind = models.CharField(
        "نوع",
        max_length=20,
        choices=CategoryKind.CHOICES,
        default=CategoryKind.NAVIGATION,
    )
    sort_order = models.PositiveIntegerField("ترتیب", default=DEFAULT_SORT_ORDER)
    is_active = models.BooleanField("فعال", default=True)
    created_at = models.DateTimeField("ایجاد", auto_now_add=True)
    updated_at = models.DateTimeField("بروزرسانی", auto_now=True)

    objects = CategoryManager()

    class Meta:
        verbose_name = "دسته محصول"
        verbose_name_plural = "دسته‌های محصول"
        ordering = ["sort_order", "name"]
        indexes = [
            models.Index(fields=["name"]),
            models.Index(fields=["is_active", "kind"]),
        ]

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = build_unique_slug(Category, self.name, instance_pk=self.pk)
        super().save(*args, **kwargs)


class Product(models.Model):
    public_uuid = models.UUIDField(
        "شناسه محصول",
        default=uuid.uuid4,
        editable=False,
        unique=True,
        db_index=True,
        help_text="شناسه محصول روی سایت و در جستجو.",
    )

    name = models.CharField("نام", max_length=PRODUCT_NAME_MAX_LENGTH, db_index=True)
    slug = models.SlugField("آدرس صفحه", max_length=PRODUCT_SLUG_MAX_LENGTH, unique=True, allow_unicode=True)
    subtitle = models.CharField("زیرعنوان", max_length=PRODUCT_SUBTITLE_MAX_LENGTH, blank=True)
    short_description = models.CharField(
        "توضیح کوتاه",
        max_length=PRODUCT_SHORT_DESCRIPTION_MAX_LENGTH,
        blank=True,
    )
    domain = models.CharField("گروه محصول", max_length=32, choices=ProductDomain.CHOICES)
    status = models.CharField(
        "وضعیت",
        max_length=20,
        choices=ProductStatus.CHOICES,
        default=ProductStatus.DRAFT,
    )
    visibility = models.CharField(
        "نمایش",
        max_length=16,
        choices=ProductVisibility.CHOICES,
        default=ProductVisibility.PUBLIC,
    )
    sales_channel = models.CharField(
        "محل فروش",
        max_length=16,
        choices=SalesChannel.CHOICES,
        default=SalesChannel.B2C,
    )
    unit_price_rial = models.PositiveBigIntegerField("قیمت (ریال)", null=True, blank=True)
    pricing_strategy = models.CharField(
        "قیمت‌گذاری",
        max_length=12,
        choices=PricingStrategy.CHOICES,
        default=PricingStrategy.FIXED,
    )
    unit_of_measure = models.CharField(
        "واحد",
        max_length=12,
        choices=UnitOfMeasure.CHOICES,
        default=UnitOfMeasure.PIECE,
    )
    net_weight_grams = models.PositiveIntegerField("وزن خالص (گرم)", null=True, blank=True)
    storage_class = models.CharField(
        "نگهداری",
        max_length=10,
        choices=StorageClass.CHOICES,
        default=StorageClass.CHILLED,
    )
    packaging_type = models.CharField(
        "بسته‌بندی",
        max_length=12,
        choices=PackagingType.CHOICES,
        default=PackagingType.OTHER,
        blank=True,
    )
    halal_status = models.CharField(
        "حلال",
        max_length=16,
        choices=HalalStatus.CHOICES,
        default=HalalStatus.NOT_APPLICABLE,
    )
    allergens = models.JSONField("مواد حساسیت‌زا", default=list, blank=True)
    categories = models.ManyToManyField(Category, verbose_name="دسته‌ها", blank=True, related_name="products")
    sort_order = models.PositiveIntegerField("ترتیب", default=DEFAULT_SORT_ORDER)
    created_at = models.DateTimeField("ایجاد", auto_now_add=True)
    updated_at = models.DateTimeField("بروزرسانی", auto_now=True)

    objects = ProductManager()

    class Meta:
        verbose_name = "محصول"
        verbose_name_plural = "محصولات"
        ordering = ["sort_order", "name"]
        indexes = [
            models.Index(fields=["status", "domain"]),
            models.Index(fields=["sort_order", "name"]),
        ]

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = build_unique_slug(Product, self.name, instance_pk=self.pk)
        super().save(*args, **kwargs)

    def category_slugs(self) -> list[str]:
        if not self.pk:
            return []
        return list(self.categories.values_list("slug", flat=True))


class ProductVariant(models.Model):
    public_uuid = models.UUIDField(
        "شناسه این نوع",
        default=uuid.uuid4,
        editable=False,
        unique=True,
        db_index=True,
        help_text="شناسه همین نوع/اندازه؛ به محصول اصلی وصل است.",
    )

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="variants", verbose_name="محصول")
    label = models.CharField("برچسب", max_length=VARIANT_LABEL_MAX_LENGTH)
    sku = models.CharField(
        "کد کالا",
        max_length=SKU_MAX_LENGTH,
        unique=True,
        db_index=True,
        validators=[validate_sku_format],
    )
    unit_price_rial = models.PositiveBigIntegerField("قیمت (ریال)", null=True, blank=True)
    net_weight_grams = models.PositiveIntegerField("وزن (گرم)", null=True, blank=True)
    is_active = models.BooleanField("فعال", default=True)
    sort_order = models.PositiveIntegerField("ترتیب", default=DEFAULT_SORT_ORDER)
    created_at = models.DateTimeField("ایجاد", auto_now_add=True)
    updated_at = models.DateTimeField("بروزرسانی", auto_now=True)

    objects = ProductVariantManager()

    class Meta:
        verbose_name = "نوع و اندازه"
        verbose_name_plural = "نوع و اندازه‌ها"
        ordering = ["sort_order", "label"]
        indexes = [
            models.Index(fields=["product", "is_active"]),
        ]

    def __str__(self) -> str:
        return f"{self.product.name} — {self.label}"

    def clean(self) -> None:
        super().clean()
        errors: dict[str, list[str]] = {}
        try:
            product_validators.validate_sku(self.sku)
        except ValidationError as exc:
            errors.setdefault("sku", []).extend(exc.messages)
        if self.unit_price_rial is not None:
            try:
                product_validators.validate_unit_price_rial(self.unit_price_rial)
            except ValidationError as exc:
                errors.setdefault("unit_price_rial", []).extend(exc.messages)
        if self.net_weight_grams is not None:
            try:
                product_validators.validate_net_weight_grams(self.net_weight_grams)
            except ValidationError as exc:
                errors.setdefault("net_weight_grams", []).extend(exc.messages)
        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        self.sku = normalize_sku(self.sku)
        super().save(*args, **kwargs)


class ProductImage(PublicUUIDMixin, models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="images", verbose_name="محصول")
    role = models.CharField("نقش", max_length=20, choices=ProductImageRole.CHOICES, default=ProductImageRole.PACKSHOT)
    image = models.ImageField("تصویر", upload_to="products/%Y/%m/")
    alt_text = models.CharField("متن جایگزین", max_length=220, blank=True)
    sort_order = models.PositiveIntegerField("ترتیب", default=DEFAULT_SORT_ORDER)
    created_at = models.DateTimeField("ایجاد", auto_now_add=True)

    class Meta:
        verbose_name = "تصویر محصول"
        verbose_name_plural = "تصاویر محصول"
        ordering = ["sort_order", "id"]

    def __str__(self) -> str:
        return f"{self.product.name} [{self.role}]"
