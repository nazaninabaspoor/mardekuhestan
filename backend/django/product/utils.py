"""ابزارهای کمکی دامنه محصول — نرمال‌سازی، slug، قیمت، نمایش."""

from __future__ import annotations

import re
import uuid
from decimal import Decimal, ROUND_HALF_UP
from typing import TYPE_CHECKING, Any

from django.utils.text import slugify

from product.constants import (
    DEFAULT_LIST_PAGE_SIZE,
    DOMAIN_BY_FRONTEND_KEY,
    DOMAIN_BY_SLUG,
    MAX_LIST_PAGE_SIZE,
    PRODUCT_DOMAINS,
    PRODUCT_DOMAIN_META,
    PRODUCT_SLUG_MAX_LENGTH,
    SEARCH_QUERY_MAX_LENGTH,
    SEARCH_TERM_MAX_LENGTH,
    SKU_PATTERN,
    PricingStrategy,
    ProductDomain,
    ProductVisibility,
    SalesChannel,
    UnitOfMeasure,
    is_publishable_status,
)

if TYPE_CHECKING:
    from django.db.models import Model

_PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹"
_ASCII_DIGITS = "0123456789"
_DIGIT_TRANSLATION = str.maketrans(_ASCII_DIGITS, _PERSIAN_DIGITS)

# پیشوند SKU بر اساس دامنه — برای تولید خودکار در admin/API
DOMAIN_SKU_PREFIX: dict[str, str] = {
    ProductDomain.FRESH_MEAT: "MEAT",
    ProductDomain.SEAFOOD: "SEA",
    ProductDomain.SAUSAGE_COLD_CUTS: "COLD",
    ProductDomain.READY_TO_COOK: "RTC",
    ProductDomain.READY_MEALS: "MEAL",
    ProductDomain.DAIRY: "DAIRY",
    ProductDomain.AGRICULTURE: "FARM",
    ProductDomain.BAKERY_CULINARY: "BAKE",
}

_NON_DIGITS_RE = re.compile(r"\D+")
_CONTROL_CHARS_RE = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")
_SKU_LIKE_RE = re.compile(SKU_PATTERN)
_UUID_RE = re.compile(
    r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
)


# ---------------------------------------------------------------------------
# Text & slug
# ---------------------------------------------------------------------------


def strip_text(value: str | None) -> str:
    return (value or "").strip()


def build_unique_slug(
    model_cls: type[Model],
    title: str,
    *,
    instance_pk: int | None = None,
    slug_field: str = "slug",
    fallback: str = "product",
) -> str:
    """نامک یکتا برای Product / Category — مثل content.services.build_unique_slug."""
    base = slugify(title, allow_unicode=True) or fallback
    if len(base) > PRODUCT_SLUG_MAX_LENGTH:
        base = base[:PRODUCT_SLUG_MAX_LENGTH].rstrip("-")

    slug = base
    index = 2
    qs = model_cls.objects.all()
    if instance_pk is not None:
        qs = qs.exclude(pk=instance_pk)

    while qs.filter(**{slug_field: slug}).exists():
        suffix = f"-{index}"
        trimmed = base[: PRODUCT_SLUG_MAX_LENGTH - len(suffix)].rstrip("-")
        slug = f"{trimmed}{suffix}"
        index += 1

    return slug


# ---------------------------------------------------------------------------
# Normalization (قبل از save / serializer)
# ---------------------------------------------------------------------------


def normalize_sku(value: str | None) -> str:
    return strip_text(value).upper()


def normalize_barcode(value: str | None) -> str:
    """فقط رقم — فاصله و خط تیره حذف می‌شود."""
    if not value:
        return ""
    return _NON_DIGITS_RE.sub("", strip_text(value))


def normalize_internal_code(value: str | None) -> str:
    return strip_text(value)


def normalize_allergen_list(value: Any) -> list[str]:
    """لیست یکتا و مرتب‌شده از کدهای آلرژن."""
    if not value:
        return []
    if not isinstance(value, (list, tuple)):
        return []
    seen: set[str] = set()
    result: list[str] = []
    for item in value:
        code = strip_text(str(item))
        if code and code not in seen:
            seen.add(code)
            result.append(code)
    return sorted(result)


# ---------------------------------------------------------------------------
# Domain helpers (فرانت ↔ بک‌اند)
# ---------------------------------------------------------------------------


def resolve_product_domain(key: str | None) -> str | None:
    """
    کلید ورودی را به مقدار ProductDomain تبدیل می‌کند.

    می‌پذیرد: مقدار داخلی (dairy)، slug (dairy)، کلید فرانت (fresh-meat).
    """
    raw = strip_text(key).lower()
    if not raw:
        return None
    if raw in PRODUCT_DOMAINS:
        return raw
    if raw in DOMAIN_BY_FRONTEND_KEY:
        return DOMAIN_BY_FRONTEND_KEY[raw]
    if raw in DOMAIN_BY_SLUG:
        return DOMAIN_BY_SLUG[raw]
    hyphenated = raw.replace("_", "-")
    if hyphenated in DOMAIN_BY_SLUG:
        return DOMAIN_BY_SLUG[hyphenated]
    underscored = raw.replace("-", "_")
    if underscored in PRODUCT_DOMAINS:
        return underscored
    return None


def domain_label_fa(domain: str) -> str:
    meta = PRODUCT_DOMAIN_META.get(domain)
    return meta["label_fa"] if meta else domain


def default_storage_for_domain(domain: str) -> str:
    meta = PRODUCT_DOMAIN_META.get(domain)
    return meta["default_storage"] if meta else "ambient"


def domain_frontend_key(domain: str) -> str:
    meta = PRODUCT_DOMAIN_META.get(domain)
    return meta["frontend_query_key"] if meta else domain


# ---------------------------------------------------------------------------
# SKU
# ---------------------------------------------------------------------------


def build_sku(domain: str, sequence: int, *, brand_prefix: str = "MK") -> str:
    """
    ساخت SKU پیشنهادی: MK-DAIRY-00042

    sequence: شماره ترتیبی در همان دامنه (از DB یا counter).
    """
    prefix = DOMAIN_SKU_PREFIX.get(domain, "GEN")
    return f"{brand_prefix}-{prefix}-{max(sequence, 0):05d}"


# ---------------------------------------------------------------------------
# Pricing & weight
# ---------------------------------------------------------------------------


def weight_to_grams(value: int | float, unit: str) -> int:
    """تبدیل مقدار به گرم برای موجودی یکپارچه."""
    amount = Decimal(str(value))
    if unit == UnitOfMeasure.KILOGRAM:
        amount *= Decimal("1000")
    elif unit == UnitOfMeasure.GRAM:
        pass
    elif unit in UnitOfMeasure.VOLUME_UNITS:
        # فاز اول: حجم ≈ گرم (آب/شیر) — بعداً با چگالی اصلاح می‌شود
        if unit == UnitOfMeasure.LITER:
            amount *= Decimal("1000")
    elif unit in UnitOfMeasure.COUNT_UNITS:
        return int(amount)
    else:
        return int(amount)
    return int(amount.quantize(Decimal("1"), rounding=ROUND_HALF_UP))


def calculate_line_total_rial(
    *,
    unit_price_rial: int,
    pricing_strategy: str,
    quantity: int = 1,
    net_weight_grams: int | None = None,
) -> int:
    """
    قیمت نهایی یک خط سبد (ریال، عدد صحیح).

    - fixed: قیمت × تعداد
    - per_kg: قیمت هر کیلو × وزن × تعداد
    - per_100g: قیمت هر ۱۰۰ گرم × (وزن/۱۰۰) × تعداد
    """
    qty = max(quantity, 1)
    price = Decimal(unit_price_rial)

    if pricing_strategy == PricingStrategy.FIXED:
        total = price * qty
    elif pricing_strategy == PricingStrategy.PER_KILOGRAM:
        grams = Decimal(net_weight_grams or 0)
        total = price * (grams / Decimal("1000")) * qty
    elif pricing_strategy == PricingStrategy.PER_100_GRAMS:
        grams = Decimal(net_weight_grams or 0)
        total = price * (grams / Decimal("100")) * qty
    else:
        total = price * qty

    return int(total.quantize(Decimal("1"), rounding=ROUND_HALF_UP))


# ---------------------------------------------------------------------------
# Display (فارسی / فروشگاه)
# ---------------------------------------------------------------------------


def to_persian_digits(value: int | str) -> str:
    return str(value).translate(_DIGIT_TRANSLATION)


def format_rial(amount: int, *, persian_digits: bool = True) -> str:
    """مثال: ۸۹۰٬۰۰۰ ریال"""
    formatted = f"{amount:,}"
    if persian_digits:
        formatted = to_persian_digits(formatted)
    return f"{formatted} ریال"


def format_weight_grams(grams: int, *, persian_digits: bool = True) -> str:
    """نمایش وزن برای UI — زیر ۱ کیلو به گرم، بالاتر به کیلو با یک رقم اعشار."""
    if grams >= 1000 and grams % 1000 == 0:
        kg = grams // 1000
        text = f"{kg} کیلوگرم"
    elif grams >= 1000:
        kg = Decimal(grams) / Decimal("1000")
        kg_text = str(kg.quantize(Decimal("0.1"), rounding=ROUND_HALF_UP))
        text = f"{kg_text} کیلوگرم"
    else:
        text = f"{grams} گرم"
    return to_persian_digits(text) if persian_digits else text


# ---------------------------------------------------------------------------
# Catalog visibility & API helpers
# ---------------------------------------------------------------------------

# visibility مجاز برای هر کانال فروش — منبع واحد با managers._visibility_q
CHANNEL_VISIBLE_VISIBILITIES: dict[str, frozenset[str]] = {
    SalesChannel.B2C: frozenset(
        {ProductVisibility.PUBLIC, ProductVisibility.B2C_ONLY}
    ),
    SalesChannel.B2B: frozenset(
        {ProductVisibility.PUBLIC, ProductVisibility.B2B_ONLY}
    ),
    SalesChannel.B2G: frozenset({ProductVisibility.PUBLIC}),
    SalesChannel.ALL_THREE: frozenset(
        {
            ProductVisibility.PUBLIC,
            ProductVisibility.B2C_ONLY,
            ProductVisibility.B2B_ONLY,
        }
    ),
}


def visibility_allowed_for_channel(visibility: str, channel: str) -> bool:
    allowed = CHANNEL_VISIBLE_VISIBILITIES.get(
        channel, CHANNEL_VISIBLE_VISIBILITIES[SalesChannel.B2C]
    )
    return visibility in allowed


def is_customer_visible(
    *,
    status: str,
    visibility: str,
    channel: str = SalesChannel.B2C,
) -> bool:
    """آیا محصول در فروشگاه (کانال مشخص) دیده شود؟"""
    if not is_publishable_status(status):
        return False
    if visibility == ProductVisibility.HIDDEN:
        return False
    return visibility_allowed_for_channel(visibility, channel)


def clamp_page_size(requested: int | None) -> int:
    """مقدار امن page_size برای API لیست محصول."""
    if requested is None:
        return DEFAULT_LIST_PAGE_SIZE
    return max(1, min(int(requested), MAX_LIST_PAGE_SIZE))


# ---------------------------------------------------------------------------
# Catalog search helpers
# ---------------------------------------------------------------------------


def normalize_catalog_search_query(value: str | None) -> str:
    """نرمال‌سازی امن عبارت جستجو — بدون کاراکتر کنترلی، فاصلهٔ اضافه حذف."""
    text = strip_text(value)
    text = _CONTROL_CHARS_RE.sub("", text)
    text = " ".join(text.split())
    if len(text) > SEARCH_QUERY_MAX_LENGTH:
        text = text[:SEARCH_QUERY_MAX_LENGTH].rstrip()
    return text


def tokenize_search_query(value: str) -> list[str]:
    """تقسیم عبارت جستجو به توکن‌های مجاز (برای فیلتر چندکلمه‌ای)."""
    normalized = normalize_catalog_search_query(value)
    if not normalized:
        return []
    tokens: list[str] = []
    for raw in normalized.split():
        token = raw[:SEARCH_TERM_MAX_LENGTH]
        if token and token not in tokens:
            tokens.append(token)
    return tokens


def looks_like_uuid(value: str) -> bool:
    return bool(_UUID_RE.match(strip_text(value)))


def parse_public_uuid(value: str) -> uuid.UUID | None:
    """UUID معتبر برگردان — در غیر این صورت None."""
    text = strip_text(value)
    if not text:
        return None
    try:
        return uuid.UUID(text)
    except ValueError:
        return None


def looks_like_sku(value: str) -> bool:
    """آیا رشته شبیه SKU معتبر است (پس از normalize)."""
    normalized = normalize_sku(value)
    return bool(normalized and _SKU_LIKE_RE.match(normalized))


def sort_domains(domains: list[str]) -> list[str]:
    """مرتب‌سازی دامنه‌ها طبق sort_order کاتالوگ."""
    return sorted(
        domains,
        key=lambda domain: PRODUCT_DOMAIN_META.get(domain, {}).get("sort_order", 999),
    )
