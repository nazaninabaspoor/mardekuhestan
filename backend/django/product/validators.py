"""اعتبارسنجی فیلدهای دامنه محصول — قوانین از product.constants."""

from __future__ import annotations

import re
from collections.abc import Iterable, Sequence
from typing import Any

from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator

from product.utils import normalize_barcode, normalize_sku

from product.constants import (
    BARCODE_MAX_LENGTH,
    BARCODE_PATTERN,
    CATEGORY_DESCRIPTION_MAX_LENGTH,
    CATEGORY_NAME_MAX_LENGTH,
    CATEGORY_SLUG_MAX_LENGTH,
    CERTIFICATION_LABEL_MAX_LENGTH,
    IMAGE_ALT_MAX_LENGTH,
    IMAGE_CAPTION_MAX_LENGTH,
    INTERNAL_CODE_MAX_LENGTH,
    INTERNAL_CODE_PATTERN,
    MAX_LIST_PAGE_SIZE,
    MAX_NET_WEIGHT_GRAMS,
    MAX_PRODUCT_IMAGES,
    MAX_SHELF_LIFE_DAYS,
    MAX_UNIT_PRICE_RIAL,
    MAX_VARIANTS_PER_PRODUCT,
    MIN_CATEGORY_DEPTH,
    MAX_CATEGORY_DEPTH,
    MIN_NET_WEIGHT_GRAMS,
    MIN_SHELF_LIFE_DAYS,
    MIN_UNIT_PRICE_RIAL,
    PRODUCT_DOMAINS,
    PRODUCT_FOCUS_KEYWORD_MAX_LENGTH,
    PRODUCT_META_DESCRIPTION_MAX_LENGTH,
    PRODUCT_META_TITLE_MAX_LENGTH,
    PRODUCT_NAME_MAX_LENGTH,
    PRODUCT_SHORT_DESCRIPTION_MAX_LENGTH,
    PRODUCT_SLUG_MAX_LENGTH,
    PRODUCT_SUBTITLE_MAX_LENGTH,
    SKU_MAX_LENGTH,
    SKU_PATTERN,
    SORT_ORDER_MAX,
    SORT_ORDER_MIN,
    VARIANT_LABEL_MAX_LENGTH,
    Allergen,
    PackagingType,
    PricingStrategy,
    ProductDomain,
    ProductImageRole,
    ProductStatus,
    ProductVisibility,
    SalesChannel,
    StorageClass,
    UnitOfMeasure,
    CategoryKind,
    HalalStatus,
    domain_requires_cold_chain,
)

# ---------------------------------------------------------------------------
# Regex validators — for ModelField(validators=[...])
# ---------------------------------------------------------------------------

validate_sku_format = RegexValidator(
    regex=SKU_PATTERN,
    message="کد SKU باید ۳ تا ۶۴ کاراکتر، فقط حروف بزرگ انگلیسی، عدد، نقطه، خط تیره و زیرخط باشد.",
)

validate_barcode_format = RegexValidator(
    regex=BARCODE_PATTERN,
    message=f"بارکد باید فقط عدد و بین ۸ تا {BARCODE_MAX_LENGTH} رقم باشد.",
)

validate_internal_code_format = RegexValidator(
    regex=INTERNAL_CODE_PATTERN,
    message="کد داخلی باید ۲ تا ۳۲ کاراکتر و فقط حروف انگلیسی، عدد، نقطه، خط تیره و زیرخط باشد.",
)

# slug: فارسی/لاتین، خط تیره، بدون فاصله
validate_product_slug_format = RegexValidator(
    regex=r"^[-\w\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]+$",
    message="نامک فقط می‌تواند شامل حروف، اعداد و خط تیره باشد (بدون فاصله).",
)

# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

_CHOICE_VALUES: dict[str, tuple[tuple[str, str], ...]] = {
    "domain": ProductDomain.CHOICES,
    "status": ProductStatus.CHOICES,
    "visibility": ProductVisibility.CHOICES,
    "sales_channel": SalesChannel.CHOICES,
    "unit": UnitOfMeasure.CHOICES,
    "pricing": PricingStrategy.CHOICES,
    "storage": StorageClass.CHOICES,
    "packaging": PackagingType.CHOICES,
    "halal": HalalStatus.CHOICES,
    "category_kind": CategoryKind.CHOICES,
    "image_role": ProductImageRole.CHOICES,
}

_VALID_ALLERGENS = frozenset(value for value, _ in Allergen.CHOICES)


def _strip(value: str | None) -> str:
    return (value or "").strip()


def _validate_max_length(
    value: str | None,
    *,
    max_length: int,
    field_label: str,
    required: bool = False,
) -> None:
    text = _strip(value)
    if required and not text:
        raise ValidationError(f"{field_label} نمی‌تواند خالی باشد.")
    if text and len(text) > max_length:
        raise ValidationError(
            f"{field_label} حداکثر باید {max_length} کاراکتر باشد."
        )


def _validate_choice(
    value: str | None,
    *,
    choices_key: str,
    field_label: str,
    required: bool = True,
) -> None:
    text = _strip(value)
    if not text:
        if required:
            raise ValidationError(f"{field_label} باید انتخاب شود.")
        return
    allowed = frozenset(item[0] for item in _CHOICE_VALUES[choices_key])
    if text not in allowed:
        raise ValidationError(f"{field_label} معتبر نیست.")


def _validate_int_range(
    value: int | None,
    *,
    minimum: int,
    maximum: int,
    field_label: str,
    required: bool = False,
) -> None:
    if value is None:
        if required:
            raise ValidationError(f"{field_label} باید وارد شود.")
        return
    if not isinstance(value, int) or isinstance(value, bool):
        raise ValidationError(f"{field_label} باید عدد صحیح باشد.")
    if value < minimum or value > maximum:
        raise ValidationError(
            f"{field_label} باید بین {minimum:,} و {maximum:,} باشد."
        )


def _ean_check_digit(digits: str) -> bool:
    """اعتبارسنجی رقم کنترل EAN-8 / EAN-13."""
    length = len(digits)
    if length not in (8, 13):
        return True
    body, check = digits[:-1], int(digits[-1])
    if not body.isdigit():
        return False
    total = 0
    for index, char in enumerate(reversed(body)):
        weight = 3 if index % 2 == 0 else 1
        total += int(char) * weight
    return (10 - (total % 10)) % 10 == check


# ---------------------------------------------------------------------------
# Text fields
# ---------------------------------------------------------------------------


def validate_product_name(value: str) -> None:
    _validate_max_length(
        value,
        max_length=PRODUCT_NAME_MAX_LENGTH,
        field_label="نام محصول",
        required=True,
    )


def validate_product_subtitle(value: str) -> None:
    _validate_max_length(
        value,
        max_length=PRODUCT_SUBTITLE_MAX_LENGTH,
        field_label="زیرعنوان محصول",
    )


def validate_product_short_description(value: str) -> None:
    _validate_max_length(
        value,
        max_length=PRODUCT_SHORT_DESCRIPTION_MAX_LENGTH,
        field_label="توضیح کوتاه",
    )


def validate_product_slug(value: str) -> None:
    text = _strip(value)
    if not text:
        raise ValidationError("نامک محصول نمی‌تواند خالی باشد.")
    if len(text) > PRODUCT_SLUG_MAX_LENGTH:
        raise ValidationError(
            f"نامک محصول حداکثر باید {PRODUCT_SLUG_MAX_LENGTH} کاراکتر باشد."
        )
    validate_product_slug_format(text)


def validate_product_meta_title(value: str) -> None:
    _validate_max_length(
        value,
        max_length=PRODUCT_META_TITLE_MAX_LENGTH,
        field_label="عنوان سئو",
    )


def validate_product_meta_description(value: str) -> None:
    _validate_max_length(
        value,
        max_length=PRODUCT_META_DESCRIPTION_MAX_LENGTH,
        field_label="توضیحات سئو",
    )


def validate_product_focus_keyword(value: str) -> None:
    _validate_max_length(
        value,
        max_length=PRODUCT_FOCUS_KEYWORD_MAX_LENGTH,
        field_label="کلمه کلیدی",
    )


def validate_category_name(value: str) -> None:
    _validate_max_length(
        value,
        max_length=CATEGORY_NAME_MAX_LENGTH,
        field_label="نام دسته",
        required=True,
    )


def validate_category_slug(value: str) -> None:
    text = _strip(value)
    if not text:
        raise ValidationError("نامک دسته نمی‌تواند خالی باشد.")
    if len(text) > CATEGORY_SLUG_MAX_LENGTH:
        raise ValidationError(
            f"نامک دسته حداکثر باید {CATEGORY_SLUG_MAX_LENGTH} کاراکتر باشد."
        )
    validate_product_slug_format(text)


def validate_category_description(value: str) -> None:
    _validate_max_length(
        value,
        max_length=CATEGORY_DESCRIPTION_MAX_LENGTH,
        field_label="توضیحات دسته",
    )


def validate_variant_label(value: str) -> None:
    _validate_max_length(
        value,
        max_length=VARIANT_LABEL_MAX_LENGTH,
        field_label="برچسب واریانت",
        required=True,
    )


def validate_image_alt(value: str) -> None:
    _validate_max_length(
        value,
        max_length=IMAGE_ALT_MAX_LENGTH,
        field_label="متن جایگزین تصویر",
    )


def validate_image_caption(value: str) -> None:
    _validate_max_length(
        value,
        max_length=IMAGE_CAPTION_MAX_LENGTH,
        field_label="زیرنویس تصویر",
    )


def validate_certification_label(value: str) -> None:
    _validate_max_length(
        value,
        max_length=CERTIFICATION_LABEL_MAX_LENGTH,
        field_label="برچسب گواهی",
    )


# ---------------------------------------------------------------------------
# Codes & identifiers
# ---------------------------------------------------------------------------


def validate_sku(value: str) -> None:
    text = normalize_sku(value)
    if not text:
        raise ValidationError("کد SKU نمی‌تواند خالی باشد.")
    if len(text) > SKU_MAX_LENGTH:
        raise ValidationError(f"کد SKU حداکثر باید {SKU_MAX_LENGTH} کاراکتر باشد.")
    validate_sku_format(text)


def validate_barcode(value: str) -> None:
    text = normalize_barcode(value)
    if not text:
        return
    validate_barcode_format(text)
    if len(text) not in (8, 12, 13, 14):
        raise ValidationError("طول بارکد باید ۸، ۱۲، ۱۳ یا ۱۴ رقم باشد.")
    if len(text) in (8, 13) and not _ean_check_digit(text):
        raise ValidationError("رقم کنترل بارکد (EAN) معتبر نیست.")


def validate_internal_code(value: str) -> None:
    text = _strip(value)
    if not text:
        return
    if len(text) > INTERNAL_CODE_MAX_LENGTH:
        raise ValidationError(
            f"کد داخلی حداکثر باید {INTERNAL_CODE_MAX_LENGTH} کاراکتر باشد."
        )
    validate_internal_code_format(text)


# ---------------------------------------------------------------------------
# Numeric business rules
# ---------------------------------------------------------------------------


def validate_unit_price_rial(value: int) -> None:
    _validate_int_range(
        value,
        minimum=MIN_UNIT_PRICE_RIAL,
        maximum=MAX_UNIT_PRICE_RIAL,
        field_label="قیمت (ریال)",
        required=True,
    )


def validate_net_weight_grams(value: int) -> None:
    _validate_int_range(
        value,
        minimum=MIN_NET_WEIGHT_GRAMS,
        maximum=MAX_NET_WEIGHT_GRAMS,
        field_label="وزن خالص (گرم)",
    )


def validate_shelf_life_days(value: int) -> None:
    _validate_int_range(
        value,
        minimum=MIN_SHELF_LIFE_DAYS,
        maximum=MAX_SHELF_LIFE_DAYS,
        field_label="ماندگاری (روز)",
    )


def validate_sort_order(value: int) -> None:
    _validate_int_range(
        value,
        minimum=SORT_ORDER_MIN,
        maximum=SORT_ORDER_MAX,
        field_label="ترتیب نمایش",
        required=True,
    )


def validate_list_page_size(value: int) -> None:
    _validate_int_range(
        value,
        minimum=1,
        maximum=MAX_LIST_PAGE_SIZE,
        field_label="اندازه صفحه",
        required=True,
    )


def validate_category_depth(depth: int) -> None:
    _validate_int_range(
        depth,
        minimum=MIN_CATEGORY_DEPTH,
        maximum=MAX_CATEGORY_DEPTH,
        field_label="عمق دسته‌بندی",
        required=True,
    )


def validate_product_image_count(count: int) -> None:
    _validate_int_range(
        count,
        minimum=0,
        maximum=MAX_PRODUCT_IMAGES,
        field_label="تعداد تصاویر محصول",
        required=True,
    )


def validate_variant_count(count: int) -> None:
    _validate_int_range(
        count,
        minimum=0,
        maximum=MAX_VARIANTS_PER_PRODUCT,
        field_label="تعداد واریانت",
        required=True,
    )


# ---------------------------------------------------------------------------
# Choice enums
# ---------------------------------------------------------------------------


def validate_product_domain(value: str) -> None:
    _validate_choice(value, choices_key="domain", field_label="دامنه محصول")
    if _strip(value) not in PRODUCT_DOMAINS:
        raise ValidationError("دامنه محصول در کاتالوگ تعریف نشده است.")


def validate_product_status(value: str) -> None:
    _validate_choice(value, choices_key="status", field_label="وضعیت محصول")


def validate_product_visibility(value: str) -> None:
    _validate_choice(value, choices_key="visibility", field_label="نمایش محصول")


def validate_sales_channel(value: str) -> None:
    _validate_choice(value, choices_key="sales_channel", field_label="کانال فروش")


def validate_unit_of_measure(value: str) -> None:
    _validate_choice(value, choices_key="unit", field_label="واحد اندازه‌گیری")


def validate_pricing_strategy(value: str) -> None:
    _validate_choice(value, choices_key="pricing", field_label="استراتژی قیمت")


def validate_storage_class(value: str) -> None:
    _validate_choice(value, choices_key="storage", field_label="کلاس نگهداری")


def validate_packaging_type(value: str) -> None:
    _validate_choice(value, choices_key="packaging", field_label="نوع بسته‌بندی")


def validate_halal_status(value: str) -> None:
    _validate_choice(value, choices_key="halal", field_label="وضعیت حلال")


def validate_category_kind(value: str) -> None:
    _validate_choice(value, choices_key="category_kind", field_label="نوع دسته")


def validate_product_image_role(value: str) -> None:
    _validate_choice(value, choices_key="image_role", field_label="نقش تصویر")


# ---------------------------------------------------------------------------
# Lists & cross-field rules
# ---------------------------------------------------------------------------


def validate_allergen_list(value: Sequence[str] | None) -> None:
    if value in (None, []):
        return
    if not isinstance(value, (list, tuple)):
        raise ValidationError("لیست آلرژن باید آرایه‌ای از مقادیر معتبر باشد.")
    seen: set[str] = set()
    for index, item in enumerate(value):
        if not isinstance(item, str) or not item.strip():
            raise ValidationError(f"آلرژن شماره {index + 1} معتبر نیست.")
        code = item.strip()
        if code not in _VALID_ALLERGENS:
            raise ValidationError(f"آلرژن «{code}» در سیستم تعریف نشده است.")
        if code in seen:
            raise ValidationError(f"آلرژن «{code}» تکراری است.")
        seen.add(code)


def validate_pricing_unit_consistency(
    *,
    pricing_strategy: str,
    unit_of_measure: str,
) -> None:
    """قیمت وزنی فقط با واحدهای وزنی سازگار است."""
    if pricing_strategy == PricingStrategy.FIXED:
        return
    if unit_of_measure not in UnitOfMeasure.WEIGHT_UNITS:
        raise ValidationError(
            "برای قیمت‌گذاری وزنی، واحد فروش باید گرم یا کیلوگرم باشد."
        )


def validate_storage_for_domain(
    *,
    domain: str,
    storage_class: str,
) -> None:
    """دامنه‌های سرد زنجیره‌ای نباید دمای محیط داشته باشند."""
    if not domain_requires_cold_chain(domain):
        return
    if storage_class == StorageClass.AMBIENT:
        raise ValidationError(
            "این دامنه محصول به زنجیره سرد نیاز دارد؛ نگهداری دمای محیط مجاز نیست."
        )


def validate_publishable_product(
    *,
    status: str,
    name: str,
    domain: str,
    unit_price_rial: int | None,
) -> None:
    """قوانین حداقلی قبل از انتشار در فروشگاه."""
    errors: dict[str, list[str]] = {}

    if status in ProductStatus.PUBLISHABLE:
        try:
            validate_product_name(name)
        except ValidationError as exc:
            errors.setdefault("name", []).extend(exc.messages)

        try:
            validate_product_domain(domain)
        except ValidationError as exc:
            errors.setdefault("domain", []).extend(exc.messages)

        if unit_price_rial is None:
            errors.setdefault("unit_price_rial", []).append(
                "برای انتشار محصول، قیمت باید مشخص شود."
            )
        else:
            try:
                validate_unit_price_rial(unit_price_rial)
            except ValidationError as exc:
                errors.setdefault("unit_price_rial", []).extend(exc.messages)

    if errors:
        raise ValidationError(errors)


def validate_product_images_have_hero(
    images: Iterable[Any],
) -> None:
    """حداقل یک تصویر با نقش hero برای محصول منتشرشده."""
    roles = [
        getattr(image, "role", None) or (image.get("role") if isinstance(image, dict) else None)
        for image in images
    ]
    if ProductImageRole.HERO not in roles:
        raise ValidationError(
            "حداقل یک تصویر باید نقش «تصویر اصلی» (hero) داشته باشد."
        )
