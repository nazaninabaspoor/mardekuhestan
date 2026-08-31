"""Serializers for product catalog — storefront read + staff write."""

from __future__ import annotations

from typing import Any

from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from product import validators as product_validators
from product.constants import (
    MAX_CATEGORY_DEPTH,
    PRODUCT_DOMAIN_META,
    Allergen,
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
from product.models import Category, Product, ProductImage, ProductVariant
from product.utils import (
    build_unique_slug,
    domain_frontend_key,
    domain_label_fa,
    format_rial,
    format_weight_grams,
    is_customer_visible,
    normalize_allergen_list,
    normalize_sku,
    resolve_product_domain,
)


# ---------------------------------------------------------------------------
# Validation bridge (Django validators → DRF)
# ---------------------------------------------------------------------------


def _raise_drf_validation(exc: DjangoValidationError) -> None:
    if hasattr(exc, "message_dict") and exc.message_dict:
        raise ValidationError(exc.message_dict) from exc
    raise ValidationError(list(exc.messages)) from exc


def _run_validator(validator, value: Any) -> Any:
    try:
        validator(value)
    except DjangoValidationError as exc:
        _raise_drf_validation(exc)
    return value


def _run_validator_kwargs(validator, /, **kwargs: Any) -> None:
    try:
        validator(**kwargs)
    except DjangoValidationError as exc:
        _raise_drf_validation(exc)


# ---------------------------------------------------------------------------
# Mixins
# ---------------------------------------------------------------------------


class TimestampSerializerMixin(serializers.Serializer):
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)


class DomainDisplaySerializerMixin(serializers.Serializer):
    domain_label_fa = serializers.SerializerMethodField()
    domain_slug = serializers.SerializerMethodField()
    domain_frontend_key = serializers.SerializerMethodField()

    def get_domain_label_fa(self, obj: Product | Category) -> str:
        return domain_label_fa(obj.domain)

    def get_domain_slug(self, obj: Product | Category) -> str:
        meta = PRODUCT_DOMAIN_META.get(obj.domain, {})
        return meta.get("slug", obj.domain)

    def get_domain_frontend_key(self, obj: Product | Category) -> str:
        return domain_frontend_key(obj.domain)


class PriceDisplaySerializerMixin(serializers.Serializer):
    unit_price_display = serializers.SerializerMethodField()

    def get_unit_price_display(self, obj: Product | ProductVariant) -> str | None:
        if obj.unit_price_rial is None:
            return None
        return format_rial(obj.unit_price_rial)


class WeightDisplaySerializerMixin(serializers.Serializer):
    net_weight_display = serializers.SerializerMethodField()

    def get_net_weight_display(self, obj: Product | ProductVariant) -> str | None:
        grams = obj.net_weight_grams
        if grams is None:
            return None
        return format_weight_grams(grams)


class ChoiceLabelsSerializerMixin:
    """Add *_label_fa read-only fields for choice-backed model fields."""

    CHOICE_LABEL_FIELDS: tuple[str, ...] = ()

    _CHOICE_MAP: dict[str, tuple[tuple[str, str], ...]] = {
        "status": ProductStatus.CHOICES,
        "visibility": ProductVisibility.CHOICES,
        "sales_channel": SalesChannel.CHOICES,
        "unit_of_measure": UnitOfMeasure.CHOICES,
        "pricing_strategy": PricingStrategy.CHOICES,
        "storage_class": StorageClass.CHOICES,
        "packaging_type": PackagingType.CHOICES,
        "halal_status": HalalStatus.CHOICES,
        "kind": CategoryKind.CHOICES,
        "role": ProductImageRole.CHOICES,
        "domain": ProductDomain.CHOICES,
    }

    def get_fields(self):
        fields = super().get_fields()
        for field_name in self.CHOICE_LABEL_FIELDS:
            label_key = f"{field_name}_label_fa"
            if label_key in fields:
                continue
            labels = dict(self._CHOICE_MAP.get(field_name, ()))

            def _make_getter(fname: str = field_name, label_dict: dict[str, str] = labels):
                def getter(instance: Any) -> str:
                    value = getattr(instance, fname, None)
                    return label_dict.get(value, value)

                return getter

            fields[label_key] = serializers.SerializerMethodField()
            method_name = f"get_{label_key}"
            if not hasattr(self.__class__, method_name):
                setattr(self, method_name, _make_getter())
        return fields


class AbsoluteMediaUrlMixin:
    def _absolute_uri(self, relative_url: str) -> str:
        request = self.context.get("request")
        if request is not None:
            return request.build_absolute_uri(relative_url)
        return relative_url


# ---------------------------------------------------------------------------
# Domain index (constants → API)
# ---------------------------------------------------------------------------


class DomainIndexSerializer(serializers.Serializer):
    key = serializers.CharField(source="domain")
    slug = serializers.CharField()
    label_fa = serializers.CharField()
    frontend_query_key = serializers.CharField()
    sort_order = serializers.IntegerField()
    default_storage = serializers.CharField()
    requires_cold_chain = serializers.BooleanField()


# ---------------------------------------------------------------------------
# Category
# ---------------------------------------------------------------------------


class CategoryBaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = (
            "id",
            "public_uuid",
            "name",
            "slug",
            "description",
            "domain",
            "kind",
            "sort_order",
            "is_active",
        )
        read_only_fields = ("id", "public_uuid")


class CategoryListSerializer(
    ChoiceLabelsSerializerMixin,
    DomainDisplaySerializerMixin,
    CategoryBaseSerializer,
):
    CHOICE_LABEL_FIELDS = ("kind",)

    class Meta(CategoryBaseSerializer.Meta):
        fields = CategoryBaseSerializer.Meta.fields + (
            "domain_label_fa",
            "domain_slug",
            "domain_frontend_key",
        )


class CategoryDetailSerializer(CategoryListSerializer, TimestampSerializerMixin):
    parent_slug = serializers.SlugRelatedField(
        source="parent",
        slug_field="slug",
        read_only=True,
    )

    class Meta(CategoryListSerializer.Meta):
        fields = CategoryListSerializer.Meta.fields + (
            "parent_slug",
            "created_at",
            "updated_at",
        )


class CategoryTreeSerializer(CategoryListSerializer):
    children = serializers.SerializerMethodField()

    class Meta(CategoryListSerializer.Meta):
        fields = CategoryListSerializer.Meta.fields + ("children",)

    def get_children(self, obj: Category) -> list[dict[str, Any]]:
        depth = int(self.context.get("tree_depth", 0))
        max_depth = int(self.context.get("max_tree_depth", MAX_CATEGORY_DEPTH))
        if depth >= max_depth:
            return []

        child_context = {**self.context, "tree_depth": depth + 1}
        children = obj.children.filter(is_active=True).catalog_order()
        return CategoryTreeSerializer(children, many=True, context=child_context).data


class CategoryWriteSerializer(CategoryBaseSerializer):
    parent = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        allow_null=True,
        required=False,
    )

    class Meta(CategoryBaseSerializer.Meta):
        fields = CategoryBaseSerializer.Meta.fields + ("parent",)
        read_only_fields = ("id",)

    def validate_name(self, value: str) -> str:
        return _run_validator(product_validators.validate_category_name, value)

    def validate_slug(self, value: str) -> str:
        if value:
            return _run_validator(product_validators.validate_category_slug, value)
        return value

    def validate_description(self, value: str) -> str:
        if value:
            _run_validator(product_validators.validate_category_description, value)
        return value

    def validate_domain(self, value: str) -> str:
        if value:
            return _run_validator(product_validators.validate_product_domain, value)
        return value

    def validate_kind(self, value: str) -> str:
        return _run_validator(product_validators.validate_category_kind, value)

    def validate_sort_order(self, value: int) -> int:
        return _run_validator(product_validators.validate_sort_order, value)

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        parent = attrs.get("parent", getattr(self.instance, "parent", None))
        instance = self.instance

        if parent and instance and parent.pk == instance.pk:
            raise ValidationError({"parent": "دسته نمی‌تواند والد خودش باشد."})

        depth = 1
        current = parent
        while current is not None:
            depth += 1
            if depth > MAX_CATEGORY_DEPTH:
                raise ValidationError(
                    {"parent": f"عمق دسته‌بندی حداکثر {MAX_CATEGORY_DEPTH} سطح است."}
                )
            current = current.parent

        return attrs

    def create(self, validated_data: dict[str, Any]) -> Category:
        if not validated_data.get("slug"):
            validated_data["slug"] = build_unique_slug(
                Category, validated_data["name"]
            )
        return super().create(validated_data)

    def update(self, instance: Category, validated_data: dict[str, Any]) -> Category:
        if "name" in validated_data and "slug" not in validated_data and not instance.slug:
            validated_data["slug"] = build_unique_slug(
                Category, validated_data["name"], instance_pk=instance.pk
            )
        return super().update(instance, validated_data)


# ---------------------------------------------------------------------------
# Product image
# ---------------------------------------------------------------------------


class ProductImageBaseSerializer(AbsoluteMediaUrlMixin, serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ("id", "public_uuid", "role", "url", "alt_text", "sort_order")
        read_only_fields = ("id", "public_uuid")

    def get_url(self, obj: ProductImage) -> str | None:
        if not obj.image:
            return None
        return self._absolute_uri(obj.image.url)


class ProductImageSerializer(ChoiceLabelsSerializerMixin, ProductImageBaseSerializer):
    CHOICE_LABEL_FIELDS = ("role",)

    class Meta(ProductImageBaseSerializer.Meta):
        fields = ProductImageBaseSerializer.Meta.fields


class ProductImageWriteSerializer(ProductImageBaseSerializer):
    image = serializers.ImageField()

    class Meta(ProductImageBaseSerializer.Meta):
        fields = ("id", "role", "image", "alt_text", "sort_order")

    def validate_role(self, value: str) -> str:
        return _run_validator(product_validators.validate_product_image_role, value)

    def validate_alt_text(self, value: str) -> str:
        if value:
            _run_validator(product_validators.validate_image_alt, value)
        return value

    def validate_sort_order(self, value: int) -> int:
        return _run_validator(product_validators.validate_sort_order, value)

    def validate_image(self, value):
        from django.core.exceptions import ValidationError as DjangoValidationError

        from sec import validators as sec_validators

        try:
            return sec_validators.validate_uploaded_image(value)
        except DjangoValidationError as exc:
            _raise_drf_validation(exc)


# ---------------------------------------------------------------------------
# Product variant
# ---------------------------------------------------------------------------


class ProductVariantBaseSerializer(serializers.ModelSerializer):
    product_public_uuid = serializers.UUIDField(
        source="product.public_uuid",
        read_only=True,
    )

    class Meta:
        model = ProductVariant
        fields = (
            "id",
            "public_uuid",
            "product_public_uuid",
            "label",
            "sku",
            "unit_price_rial",
            "net_weight_grams",
            "is_active",
            "sort_order",
        )
        read_only_fields = ("id", "public_uuid", "product_public_uuid")


class ProductVariantListSerializer(
    PriceDisplaySerializerMixin,
    WeightDisplaySerializerMixin,
    ProductVariantBaseSerializer,
):
    class Meta(ProductVariantBaseSerializer.Meta):
        fields = ProductVariantBaseSerializer.Meta.fields + (
            "unit_price_display",
            "net_weight_display",
        )


class ProductVariantDetailSerializer(
    ProductVariantListSerializer,
    TimestampSerializerMixin,
):
    class Meta(ProductVariantListSerializer.Meta):
        fields = ProductVariantListSerializer.Meta.fields + (
            "created_at",
            "updated_at",
        )


class ProductVariantWriteSerializer(ProductVariantBaseSerializer):
    class Meta(ProductVariantBaseSerializer.Meta):
        fields = ProductVariantBaseSerializer.Meta.fields

    def validate_label(self, value: str) -> str:
        return _run_validator(product_validators.validate_variant_label, value)

    def validate_sku(self, value: str) -> str:
        normalized = normalize_sku(value)
        return _run_validator(product_validators.validate_sku, normalized)

    def validate_unit_price_rial(self, value: int | None) -> int | None:
        if value is not None:
            return _run_validator(product_validators.validate_unit_price_rial, value)
        return value

    def validate_net_weight_grams(self, value: int | None) -> int | None:
        if value is not None:
            return _run_validator(product_validators.validate_net_weight_grams, value)
        return value

    def validate_sort_order(self, value: int) -> int:
        return _run_validator(product_validators.validate_sort_order, value)


# ---------------------------------------------------------------------------
# Product — shared helpers
# ---------------------------------------------------------------------------


def _pick_hero_image(product: Product) -> ProductImage | None:
    images = product.images.all()
    for image in images:
        if image.role == ProductImageRole.HERO:
            return image
    return images[0] if images else None


def _active_variants(product: Product) -> list[ProductVariant]:
    return [variant for variant in product.variants.all() if variant.is_active]


class ProductBaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = (
            "id",
            "public_uuid",
            "name",
            "slug",
            "subtitle",
            "short_description",
            "domain",
        )
        read_only_fields = ("id", "public_uuid")


# ---------------------------------------------------------------------------
# Product — storefront (public)
# ---------------------------------------------------------------------------


class ProductListSerializer(
    ChoiceLabelsSerializerMixin,
    DomainDisplaySerializerMixin,
    PriceDisplaySerializerMixin,
    WeightDisplaySerializerMixin,
    ProductBaseSerializer,
):
    CHOICE_LABEL_FIELDS = ("unit_of_measure", "pricing_strategy")

    hero_image = serializers.SerializerMethodField()
    category_slugs = serializers.SerializerMethodField()
    is_available = serializers.SerializerMethodField()

    class Meta(ProductBaseSerializer.Meta):
        fields = ProductBaseSerializer.Meta.fields + (
            "unit_price_rial",
            "unit_price_display",
            "pricing_strategy",
            "unit_of_measure",
            "net_weight_grams",
            "net_weight_display",
            "domain_label_fa",
            "domain_slug",
            "domain_frontend_key",
            "hero_image",
            "category_slugs",
            "is_available",
            "sort_order",
        )

    def get_hero_image(self, obj: Product) -> dict[str, Any] | None:
        image = _pick_hero_image(obj)
        if image is None:
            return None
        return ProductImageSerializer(image, context=self.context).data

    def get_category_slugs(self, obj: Product) -> list[str]:
        return [category.slug for category in obj.categories.all()]

    def get_is_available(self, obj: Product) -> bool:
        return obj.status == ProductStatus.ACTIVE


class ProductDetailSerializer(ProductListSerializer):
    CHOICE_LABEL_FIELDS = ProductListSerializer.CHOICE_LABEL_FIELDS + (
        "storage_class",
        "packaging_type",
        "halal_status",
    )

    images = ProductImageSerializer(many=True, read_only=True)
    variants = serializers.SerializerMethodField()
    categories = CategoryListSerializer(many=True, read_only=True)
    allergens_detail = serializers.SerializerMethodField()

    class Meta(ProductListSerializer.Meta):
        fields = ProductListSerializer.Meta.fields + (
            "images",
            "variants",
            "categories",
            "allergens",
            "allergens_detail",
            "storage_class",
            "packaging_type",
            "halal_status",
            "updated_at",
        )

    def get_variants(self, obj: Product) -> list[dict[str, Any]]:
        variants = _active_variants(obj)
        return ProductVariantListSerializer(
            variants, many=True, context=self.context
        ).data

    def get_allergens_detail(self, obj: Product) -> list[dict[str, str]]:
        labels = dict(Allergen.CHOICES)
        return [
            {"code": code, "label_fa": labels.get(code, code)}
            for code in obj.allergens or []
        ]


# ---------------------------------------------------------------------------
# Product — admin / staff
# ---------------------------------------------------------------------------


class ProductAdminListSerializer(
    ChoiceLabelsSerializerMixin,
    DomainDisplaySerializerMixin,
    PriceDisplaySerializerMixin,
    TimestampSerializerMixin,
    ProductBaseSerializer,
):
    CHOICE_LABEL_FIELDS = ("status", "visibility", "sales_channel")

    category_count = serializers.IntegerField(read_only=True)
    is_customer_visible = serializers.SerializerMethodField()

    class Meta(ProductBaseSerializer.Meta):
        fields = ProductBaseSerializer.Meta.fields + (
            "status",
            "visibility",
            "sales_channel",
            "domain_label_fa",
            "unit_price_rial",
            "unit_price_display",
            "category_count",
            "is_customer_visible",
            "sort_order",
            "created_at",
            "updated_at",
        )

    def get_is_customer_visible(self, obj: Product) -> bool:
        channel = self.context.get("sales_channel", SalesChannel.B2C)
        return is_customer_visible(
            status=obj.status,
            visibility=obj.visibility,
            channel=channel,
        )


class ProductAdminDetailSerializer(
    ChoiceLabelsSerializerMixin,
    DomainDisplaySerializerMixin,
    PriceDisplaySerializerMixin,
    WeightDisplaySerializerMixin,
    TimestampSerializerMixin,
    ProductBaseSerializer,
):
    CHOICE_LABEL_FIELDS = (
        "status",
        "visibility",
        "sales_channel",
        "unit_of_measure",
        "pricing_strategy",
        "storage_class",
        "packaging_type",
        "halal_status",
    )

    categories = CategoryListSerializer(many=True, read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantDetailSerializer(many=True, read_only=True)
    category_ids = serializers.PrimaryKeyRelatedField(
        source="categories",
        many=True,
        queryset=Category.objects.all(),
        write_only=True,
        required=False,
    )
    is_customer_visible = serializers.SerializerMethodField()

    class Meta(ProductBaseSerializer.Meta):
        fields = ProductBaseSerializer.Meta.fields + (
            "status",
            "visibility",
            "sales_channel",
            "unit_price_rial",
            "unit_price_display",
            "pricing_strategy",
            "unit_of_measure",
            "net_weight_grams",
            "net_weight_display",
            "storage_class",
            "packaging_type",
            "halal_status",
            "allergens",
            "sort_order",
            "domain_label_fa",
            "domain_slug",
            "domain_frontend_key",
            "categories",
            "category_ids",
            "images",
            "variants",
            "is_customer_visible",
            "created_at",
            "updated_at",
        )

    def get_is_customer_visible(self, obj: Product) -> bool:
        channel = self.context.get("sales_channel", obj.sales_channel)
        return is_customer_visible(
            status=obj.status,
            visibility=obj.visibility,
            channel=channel,
        )


class ProductWriteSerializer(serializers.ModelSerializer):
    """Create/update product core fields — variants/images via nested admin endpoints."""

    categories = serializers.SlugRelatedField(
        many=True,
        slug_field="slug",
        queryset=Category.objects.all(),
        required=False,
    )

    class Meta:
        model = Product
        fields = (
            "name",
            "slug",
            "subtitle",
            "short_description",
            "domain",
            "status",
            "visibility",
            "sales_channel",
            "unit_price_rial",
            "pricing_strategy",
            "unit_of_measure",
            "net_weight_grams",
            "storage_class",
            "packaging_type",
            "halal_status",
            "allergens",
            "categories",
            "sort_order",
        )

    def _instance_value(self, attrs: dict[str, Any], field: str, default: Any = None) -> Any:
        if field in attrs:
            return attrs[field]
        if self.instance is not None:
            return getattr(self.instance, field)
        return default

    def validate_name(self, value: str) -> str:
        return _run_validator(product_validators.validate_product_name, value)

    def validate_slug(self, value: str) -> str:
        if value:
            return _run_validator(product_validators.validate_product_slug, value)
        return value

    def validate_subtitle(self, value: str) -> str:
        if value:
            _run_validator(product_validators.validate_product_subtitle, value)
        return value

    def validate_short_description(self, value: str) -> str:
        if value:
            _run_validator(product_validators.validate_product_short_description, value)
        return value

    def validate_domain(self, value: str) -> str:
        resolved = resolve_product_domain(value) or value
        return _run_validator(product_validators.validate_product_domain, resolved)

    def validate_status(self, value: str) -> str:
        return _run_validator(product_validators.validate_product_status, value)

    def validate_visibility(self, value: str) -> str:
        return _run_validator(product_validators.validate_product_visibility, value)

    def validate_sales_channel(self, value: str) -> str:
        return _run_validator(product_validators.validate_sales_channel, value)

    def validate_unit_price_rial(self, value: int | None) -> int | None:
        if value is not None:
            return _run_validator(product_validators.validate_unit_price_rial, value)
        return value

    def validate_pricing_strategy(self, value: str) -> str:
        return _run_validator(product_validators.validate_pricing_strategy, value)

    def validate_unit_of_measure(self, value: str) -> str:
        return _run_validator(product_validators.validate_unit_of_measure, value)

    def validate_net_weight_grams(self, value: int | None) -> int | None:
        if value is not None:
            return _run_validator(product_validators.validate_net_weight_grams, value)
        return value

    def validate_storage_class(self, value: str) -> str:
        return _run_validator(product_validators.validate_storage_class, value)

    def validate_packaging_type(self, value: str) -> str:
        return _run_validator(product_validators.validate_packaging_type, value)

    def validate_halal_status(self, value: str) -> str:
        return _run_validator(product_validators.validate_halal_status, value)

    def validate_allergens(self, value: list[str]) -> list[str]:
        normalized = normalize_allergen_list(value)
        _run_validator(product_validators.validate_allergen_list, normalized)
        return normalized

    def validate_sort_order(self, value: int) -> int:
        return _run_validator(product_validators.validate_sort_order, value)

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        pricing_strategy = self._instance_value(attrs, "pricing_strategy", PricingStrategy.FIXED)
        unit_of_measure = self._instance_value(attrs, "unit_of_measure", UnitOfMeasure.PIECE)
        domain = self._instance_value(attrs, "domain", "")
        storage_class = self._instance_value(attrs, "storage_class", StorageClass.CHILLED)
        status = self._instance_value(attrs, "status", ProductStatus.DRAFT)
        name = self._instance_value(attrs, "name", "")
        unit_price_rial = self._instance_value(attrs, "unit_price_rial")

        _run_validator_kwargs(
            product_validators.validate_pricing_unit_consistency,
            pricing_strategy=pricing_strategy,
            unit_of_measure=unit_of_measure,
        )
        if domain:
            _run_validator_kwargs(
                product_validators.validate_storage_for_domain,
                domain=domain,
                storage_class=storage_class,
            )
        _run_validator_kwargs(
            product_validators.validate_publishable_product,
            status=status,
            name=name,
            domain=domain,
            unit_price_rial=unit_price_rial,
        )
        return attrs

    def create(self, validated_data: dict[str, Any]) -> Product:
        categories = validated_data.pop("categories", [])
        if not validated_data.get("slug"):
            validated_data["slug"] = build_unique_slug(
                Product, validated_data["name"]
            )
        product = Product.objects.create(**validated_data)
        if categories:
            product.categories.set(categories)
        return product

    def update(self, instance: Product, validated_data: dict[str, Any]) -> Product:
        categories = validated_data.pop("categories", None)
        if "name" in validated_data and not validated_data.get("slug") and not instance.slug:
            validated_data["slug"] = build_unique_slug(
                Product, validated_data["name"], instance_pk=instance.pk
            )
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if categories is not None:
            instance.categories.set(categories)
        return instance


class CatalogSearchQuerySerializer(serializers.Serializer):
    """اعتبارسنجی ?q= برای جستجوی فروشگاه."""

    q = serializers.CharField(required=True, trim_whitespace=True)

    def validate_q(self, value: str) -> str:
        return product_validators.validate_catalog_search_query(value)
