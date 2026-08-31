"""ثابت‌های دامنه محصول، کاتالوگ و قوانین کسب‌وکار مرد کوهستان.

این ماژول منبع واحد (single source of truth) برای:
- محدودیت طول فیلدها
- دامنه‌های کسب‌وکار (گوشت، لبنیات، …)
- وضعیت انتشار و نمایش
- واحدها و قیمت‌گذاری غذایی
- الزامات نگهداری و زنجیره سرد
- رویدادهای دامنه (برای signals / consumers / Kafka)

مدل‌ها، validators، serializers و admin باید از همین ثابت‌ها import کنند.
"""

from __future__ import annotations

from typing import Final, TypedDict

# ---------------------------------------------------------------------------
# Field length limits
# ---------------------------------------------------------------------------

PRODUCT_NAME_MAX_LENGTH: Final[int] = 180
PRODUCT_SLUG_MAX_LENGTH: Final[int] = 220
PRODUCT_SUBTITLE_MAX_LENGTH: Final[int] = 240
PRODUCT_SHORT_DESCRIPTION_MAX_LENGTH: Final[int] = 320
PRODUCT_META_TITLE_MAX_LENGTH: Final[int] = 70
PRODUCT_META_DESCRIPTION_MAX_LENGTH: Final[int] = 160
PRODUCT_FOCUS_KEYWORD_MAX_LENGTH: Final[int] = 80

SKU_MAX_LENGTH: Final[int] = 64
BARCODE_MAX_LENGTH: Final[int] = 14  # EAN-13 (+ guard digit)
INTERNAL_CODE_MAX_LENGTH: Final[int] = 32

CATEGORY_NAME_MAX_LENGTH: Final[int] = 120
CATEGORY_SLUG_MAX_LENGTH: Final[int] = 140
CATEGORY_DESCRIPTION_MAX_LENGTH: Final[int] = 500

BRAND_LINE_MAX_LENGTH: Final[int] = 80
ORIGIN_LABEL_MAX_LENGTH: Final[int] = 120
CERTIFICATION_LABEL_MAX_LENGTH: Final[int] = 160

ATTRIBUTE_NAME_MAX_LENGTH: Final[int] = 64
ATTRIBUTE_VALUE_MAX_LENGTH: Final[int] = 180
VARIANT_LABEL_MAX_LENGTH: Final[int] = 120

IMAGE_ALT_MAX_LENGTH: Final[int] = 220
IMAGE_CAPTION_MAX_LENGTH: Final[int] = 280

# ---------------------------------------------------------------------------
# Business rules & numeric bounds
# ---------------------------------------------------------------------------

MIN_CATEGORY_DEPTH: Final[int] = 1
MAX_CATEGORY_DEPTH: Final[int] = 4

MIN_PRODUCT_IMAGES: Final[int] = 0
MAX_PRODUCT_IMAGES: Final[int] = 12
MAX_VARIANTS_PER_PRODUCT: Final[int] = 48

# قیمت پایه به ریال (IRR) — قبل از تخفیف
MIN_UNIT_PRICE_RIAL: Final[int] = 1_000
MAX_UNIT_PRICE_RIAL: Final[int] = 500_000_000

# وزن پایه برای موجودی و قیمت وزنی — گرم
MIN_NET_WEIGHT_GRAMS: Final[int] = 1
MAX_NET_WEIGHT_GRAMS: Final[int] = 100_000  # 100 kg

MIN_SHELF_LIFE_DAYS: Final[int] = 1
MAX_SHELF_LIFE_DAYS: Final[int] = 1_825  # ~۵ سال

DEFAULT_LIST_PAGE_SIZE: Final[int] = 24
MAX_LIST_PAGE_SIZE: Final[int] = 100

# جستجوی کاربر در فروشگاه
SEARCH_QUERY_MIN_LENGTH: Final[int] = 1
SEARCH_QUERY_MAX_LENGTH: Final[int] = 120
SEARCH_MAX_TERMS: Final[int] = 8
SEARCH_TERM_MAX_LENGTH: Final[int] = 48

DEFAULT_SORT_ORDER: Final[int] = 100
SORT_ORDER_MIN: Final[int] = 0
SORT_ORDER_MAX: Final[int] = 9_999

# ---------------------------------------------------------------------------
# Admin / API permission groups (هم‌نام با accounts در فاز بعد)
# ---------------------------------------------------------------------------

PRODUCT_MANAGER_GROUP: Final[str] = "مدیران محصول"
PRODUCT_EDITOR_GROUP: Final[str] = "ویرایشگران کاتالوگ"
PRODUCT_PANEL_GROUPS: Final[tuple[str, ...]] = (
    PRODUCT_MANAGER_GROUP,
    PRODUCT_EDITOR_GROUP,
)

# ---------------------------------------------------------------------------
# Product domains — verticals aligned with brand catalog & /products routes
# ---------------------------------------------------------------------------


class ProductDomain:
    """دامنه اصلی کسب‌وکار؛ هر محصول دقیقاً به یک دامنه تعلق دارد."""

    FRESH_MEAT = "fresh_meat"
    SEAFOOD = "seafood"
    SAUSAGE_COLD_CUTS = "sausage_cold_cuts"
    READY_TO_COOK = "ready_to_cook"
    READY_MEALS = "ready_meals"
    DAIRY = "dairy"
    AGRICULTURE = "agriculture"
    BAKERY_CULINARY = "bakery_culinary"

    CHOICES = (
        (FRESH_MEAT, "گوشت تازه"),
        (SEAFOOD, "محصولات دریایی"),
        (SAUSAGE_COLD_CUTS, "سوسیس و کالباس"),
        (READY_TO_COOK, "آماده پخت"),
        (READY_MEALS, "غذای آماده"),
        (DAIRY, "لبنیات"),
        (AGRICULTURE, "کشاورزی و مزرعه"),
        (BAKERY_CULINARY, "نان و آشپزی"),
    )


# Backward-compatible tuple used in early scaffolding / tests.
PRODUCT_DOMAINS: Final[tuple[str, ...]] = tuple(value for value, _ in ProductDomain.CHOICES)


class ProductDomainMeta(TypedDict):
    slug: str
    label_fa: str
    sort_order: int
    default_storage: str
    requires_cold_chain: bool
    frontend_query_key: str


PRODUCT_DOMAIN_META: Final[dict[str, ProductDomainMeta]] = {
    ProductDomain.FRESH_MEAT: {
        "slug": "fresh-meat",
        "label_fa": "گوشت تازه",
        "sort_order": 10,
        "default_storage": "chilled",
        "requires_cold_chain": True,
        "frontend_query_key": "fresh-meat",
    },
    ProductDomain.SEAFOOD: {
        "slug": "seafood",
        "label_fa": "محصولات دریایی",
        "sort_order": 20,
        "default_storage": "chilled",
        "requires_cold_chain": True,
        "frontend_query_key": "seafood",
    },
    ProductDomain.SAUSAGE_COLD_CUTS: {
        "slug": "sausage-cold-cuts",
        "label_fa": "سوسیس و کالباس",
        "sort_order": 30,
        "default_storage": "chilled",
        "requires_cold_chain": True,
        "frontend_query_key": "sausage",
    },
    ProductDomain.READY_TO_COOK: {
        "slug": "ready-to-cook",
        "label_fa": "آماده پخت",
        "sort_order": 40,
        "default_storage": "chilled",
        "requires_cold_chain": True,
        "frontend_query_key": "ready-to-cook",
    },
    ProductDomain.READY_MEALS: {
        "slug": "ready-meals",
        "label_fa": "غذای آماده",
        "sort_order": 50,
        "default_storage": "chilled",
        "requires_cold_chain": True,
        "frontend_query_key": "ready",
    },
    ProductDomain.DAIRY: {
        "slug": "dairy",
        "label_fa": "لبنیات",
        "sort_order": 60,
        "default_storage": "chilled",
        "requires_cold_chain": True,
        "frontend_query_key": "dairy",
    },
    ProductDomain.AGRICULTURE: {
        "slug": "agriculture",
        "label_fa": "کشاورزی و مزرعه",
        "sort_order": 70,
        "default_storage": "ambient",
        "requires_cold_chain": False,
        "frontend_query_key": "agriculture",
    },
    ProductDomain.BAKERY_CULINARY: {
        "slug": "bakery-culinary",
        "label_fa": "نان و آشپزی",
        "sort_order": 80,
        "default_storage": "ambient",
        "requires_cold_chain": False,
        "frontend_query_key": "bakery",
    },
}

# ---------------------------------------------------------------------------
# Lifecycle & visibility
# ---------------------------------------------------------------------------


class ProductStatus:
    """وضعیت چرخه عمر محصول در کاتالوگ."""

    DRAFT = "draft"
    PENDING_REVIEW = "pending_review"
    ACTIVE = "active"
    OUT_OF_STOCK = "out_of_stock"
    DISCONTINUED = "discontinued"
    ARCHIVED = "archived"

    CHOICES = (
        (DRAFT, "پیش‌نویس"),
        (PENDING_REVIEW, "در انتظار تأیید"),
        (ACTIVE, "فعال"),
        (OUT_OF_STOCK, "ناموجود"),
        (DISCONTINUED, "توقف تولید"),
        (ARCHIVED, "بایگانی"),
    )

    PUBLISHABLE = frozenset({ACTIVE, OUT_OF_STOCK})
    EDITABLE_IN_CATALOG = frozenset({DRAFT, PENDING_REVIEW, ACTIVE, OUT_OF_STOCK})


class ProductVisibility:
    """کنترل نمایش در کانال‌های فروش."""

    PUBLIC = "public"
    HIDDEN = "hidden"
    B2C_ONLY = "b2c_only"
    B2B_ONLY = "b2b_only"

    CHOICES = (
        (PUBLIC, "عمومی"),
        (HIDDEN, "مخفی"),
        (B2C_ONLY, "فقط خرده‌فروشی"),
        (B2B_ONLY, "فقط عمده‌فروشی"),
    )


class SalesChannel:
    """کانال فروش — برای قیمت و موجودی جداگانه در فاز B2B."""

    B2C = "b2c"
    B2B = "b2b"
    B2G = "b2g"
    ALL_THREE = "all_three"

    CHOICES = (
        (B2C, "خرده‌فروشی"),
        (B2B, "عمده‌فروشی"),
        (B2G, "فروش سازمانی و بین‌المللی"),
        (ALL_THREE, "هر سه"),
    )


# ---------------------------------------------------------------------------
# Units, pricing & packaging (food-specific)
# ---------------------------------------------------------------------------


class UnitOfMeasure:
    """واحد فروش/موجودی — پایه محاسبات موجودی بر گرم است."""

    PIECE = "piece"
    PACK = "pack"
    TRAY = "tray"
    DOZEN = "dozen"
    GRAM = "gram"
    KILOGRAM = "kilogram"
    MILLILITER = "milliliter"
    LITER = "liter"

    CHOICES = (
        (PIECE, "عدد"),
        (PACK, "بسته"),
        (TRAY, "سینی"),
        (DOZEN, "شل"),
        (GRAM, "گرم"),
        (KILOGRAM, "کیلوگرم"),
        (MILLILITER, "میلی‌لیتر"),
        (LITER, "لیتر"),
    )

    WEIGHT_UNITS = frozenset({GRAM, KILOGRAM})
    VOLUME_UNITS = frozenset({MILLILITER, LITER})
    COUNT_UNITS = frozenset({PIECE, PACK, TRAY, DOZEN})


class PricingStrategy:
    """نحوه محاسبه قیمت نهایی سبد."""

    FIXED = "fixed"
    PER_KILOGRAM = "per_kg"
    PER_100_GRAMS = "per_100g"

    CHOICES = (
        (FIXED, "قیمت ثابت"),
        (PER_KILOGRAM, "قیمت هر کیلوگرم"),
        (PER_100_GRAMS, "قیمت هر ۱۰۰ گرم"),
    )


class StorageClass:
    """کلاس نگهداری انبار و حمل — برای لجستیک و انقضا."""

    AMBIENT = "ambient"
    CHILLED = "chilled"
    FROZEN = "frozen"

    CHOICES = (
        (AMBIENT, "دمای محیط"),
        (CHILLED, "سرد (۲ تا ۸ درجه)"),
        (FROZEN, "منجمد (زیر ۱۸- درجه)"),
    )

    REQUIRES_COLD_CHAIN = frozenset({CHILLED, FROZEN})


class PackagingType:
    """نوع بسته‌بندی — برای نمایش و انبار."""

    VACUUM = "vacuum"
    TRAY_FILM = "tray_film"
    BOTTLE = "bottle"
    JAR = "jar"
    CARTON = "carton"
    BULK = "bulk"
    OTHER = "other"

    CHOICES = (
        (VACUUM, "وکیوم"),
        (TRAY_FILM, "سینی و نایلون"),
        (BOTTLE, "بطری"),
        (JAR, "شیشه"),
        (CARTON, "کارتن"),
        (BULK, "فله"),
        (OTHER, "سایر"),
    )


# ---------------------------------------------------------------------------
# Compliance & product claims (Iran food industry)
# ---------------------------------------------------------------------------


class HalalStatus:
    """وضعیت حلال — برای گوشت و فرآورده."""

    CERTIFIED = "certified"
    NOT_APPLICABLE = "not_applicable"
    PENDING = "pending"

    CHOICES = (
        (CERTIFIED, "دارای گواهی حلال"),
        (NOT_APPLICABLE, "غیرمرتبط"),
        (PENDING, "در انتظار تأیید"),
    )


class Allergen:
    """آلرژن‌های استاندارد — برای برچسب و فیلتر."""

    MILK = "milk"
    EGGS = "eggs"
    FISH = "fish"
    CRUSTACEANS = "crustaceans"
    TREE_NUTS = "tree_nuts"
    PEANUTS = "peanuts"
    WHEAT = "wheat"
    SOY = "soy"
    SESAME = "sesame"
    SULFITES = "sulfites"
    CELERY = "celery"
    MUSTARD = "mustard"
    LUPIN = "lupin"
    MOLLUSCS = "molluscs"

    CHOICES = (
        (MILK, "شیر"),
        (EGGS, "تخم‌مرغ"),
        (FISH, "ماهی"),
        (CRUSTACEANS, "سخت‌پوستان"),
        (TREE_NUTS, "آجیل درختی"),
        (PEANUTS, "بادام‌زمینی"),
        (WHEAT, "گندم (گلوتن)"),
        (SOY, "سویا"),
        (SESAME, "کنجد"),
        (SULFITES, "سولفیت"),
        (CELERY, "کرفس"),
        (MUSTARD, "خردل"),
        (LUPIN, "لوبین"),
        (MOLLUSCS, "نرم‌تنان"),
    )


# ---------------------------------------------------------------------------
# Category tree semantics (navigation vs merchandising)
# ---------------------------------------------------------------------------


class CategoryKind:
    """نوع دسته — منوی سایت یا مجموعهٔ مرچندایزینگ."""

    NAVIGATION = "navigation"
    COLLECTION = "collection"
    SEASONAL = "seasonal"
    PROMOTION = "promotion"

    CHOICES = (
        (NAVIGATION, "ناوبری فروشگاه"),
        (COLLECTION, "مجموعه"),
        (SEASONAL, "فصلی"),
        (PROMOTION, "پروموشن"),
    )


# ---------------------------------------------------------------------------
# Media roles (MinIO object metadata)
# ---------------------------------------------------------------------------


class ProductImageRole:
    """نقش تصویر در گالری محصول."""

    HERO = "hero"
    PACKSHOT = "packshot"
    LIFESTYLE = "lifestyle"
    INGREDIENT = "ingredient"
    NUTRITION_LABEL = "nutrition_label"
    CERTIFICATE = "certificate"

    CHOICES = (
        (HERO, "تصویر اصلی"),
        (PACKSHOT, "بسته‌بندی"),
        (LIFESTYLE, "زندگی / سفره"),
        (INGREDIENT, "مواد اولیه"),
        (NUTRITION_LABEL, "جدول ارزش غذایی"),
        (CERTIFICATE, "گواهی‌نامه"),
    )


# ---------------------------------------------------------------------------
# Domain events (signals → consumers → Kafka)
# ---------------------------------------------------------------------------


class ProductEvent:
    """نام رویدادهای دامنه — قرارداد: product.<entity>.<action>."""

    PRODUCT_CREATED = "product.product.created"
    PRODUCT_UPDATED = "product.product.updated"
    PRODUCT_PUBLISHED = "product.product.published"
    PRODUCT_ARCHIVED = "product.product.archived"

    VARIANT_CREATED = "product.variant.created"
    VARIANT_UPDATED = "product.variant.updated"

    CATEGORY_CREATED = "product.category.created"
    CATEGORY_UPDATED = "product.category.updated"
    CATEGORY_REORDERED = "product.category.reordered"

    PRICE_CHANGED = "product.price.changed"
    AVAILABILITY_CHANGED = "product.availability.changed"


PRODUCT_KAFKA_TOPIC: Final[str] = "mardekuhestan.product.events"

# ---------------------------------------------------------------------------
# Slug / SKU patterns (used by validators.py)
# ---------------------------------------------------------------------------

SKU_PATTERN: Final[str] = r"^[A-Z0-9][A-Z0-9._-]{2,63}$"
BARCODE_PATTERN: Final[str] = r"^\d{8,14}$"
INTERNAL_CODE_PATTERN: Final[str] = r"^[A-Za-z0-9][A-Za-z0-9._-]{1,31}$"

# UUID عمومی — v4 برای شناسه‌های غیرقابل حدس (API / جستجو)
PUBLIC_UUID_VERSION: Final[int] = 4

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

DOMAIN_BY_FRONTEND_KEY: Final[dict[str, str]] = {
    meta["frontend_query_key"]: domain
    for domain, meta in PRODUCT_DOMAIN_META.items()
}

DOMAIN_BY_SLUG: Final[dict[str, str]] = {
    meta["slug"]: domain for domain, meta in PRODUCT_DOMAIN_META.items()
}


def is_publishable_status(status: str) -> bool:
    return status in ProductStatus.PUBLISHABLE


def domain_requires_cold_chain(domain: str) -> bool:
    meta = PRODUCT_DOMAIN_META.get(domain)
    return bool(meta and meta["requires_cold_chain"])
