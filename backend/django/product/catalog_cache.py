"""
کش عمومی کاتالوگ — فقط کلیدهای catalog:public:*

عمداً هرگز session، JWT، rate-limit یا کش کاربر لمس نمی‌شود.
"""

from __future__ import annotations

import logging
from typing import Iterable

from django.core.cache import cache, caches

logger = logging.getLogger(__name__)

# پیشوند اجباری — هر کلید خارج از این namespace invalidate نمی‌شود
PUBLIC_CATALOG_PREFIX = "catalog:public:"


class CatalogCacheKeys:
    """سازنده کلید — selectors/API باید همین الگو را استفاده کنند."""

    @staticmethod
    def domains_index() -> str:
        return f"{PUBLIC_CATALOG_PREFIX}domains:index"

    @staticmethod
    def domain_list(domain: str, page: int, page_size: int) -> str:
        return f"{PUBLIC_CATALOG_PREFIX}domain:{domain}:list:p{page}:s{page_size}"

    @staticmethod
    def domain_list_pattern(domain: str) -> str:
        return f"{PUBLIC_CATALOG_PREFIX}domain:{domain}:list:*"

    @staticmethod
    def category_tree(domain: str | None = None) -> str:
        if domain:
            return f"{PUBLIC_CATALOG_PREFIX}navigation:domain:{domain}"
        return f"{PUBLIC_CATALOG_PREFIX}navigation:roots"

    @staticmethod
    def category_tree_pattern() -> str:
        return f"{PUBLIC_CATALOG_PREFIX}navigation:*"

    @staticmethod
    def category_products_pattern(category_slug: str) -> str:
        return f"{PUBLIC_CATALOG_PREFIX}category:{category_slug}:*"

    @staticmethod
    def product_detail_id(product_id: int) -> str:
        return f"{PUBLIC_CATALOG_PREFIX}product:id:{product_id}"

    @staticmethod
    def product_detail_slug(slug: str) -> str:
        return f"{PUBLIC_CATALOG_PREFIX}product:slug:{slug}"

    @staticmethod
    def product_variants(product_id: int) -> str:
        return f"{PUBLIC_CATALOG_PREFIX}product:id:{product_id}:variants"


def _delete_pattern(pattern: str) -> int:
    """حذف با الگو — فقط اگر redis backend و پیشوند امن باشد."""
    if not pattern.startswith(PUBLIC_CATALOG_PREFIX):
        logger.warning("Refused cache pattern outside public catalog: %s", pattern)
        return 0
    backend = caches["default"]
    if hasattr(backend, "delete_pattern"):
        try:
            return int(backend.delete_pattern(pattern))
        except Exception:
            logger.exception("delete_pattern failed: %s", pattern)
    return 0


def invalidate_product_cache(
    *,
    product_id: int,
    slug: str | None = None,
    domain: str | None = None,
    category_slugs: Iterable[str] | None = None,
) -> int:
    """باطل‌کردن کش عمومی مرتبط با یک محصول."""
    removed = 0
    keys = [
        CatalogCacheKeys.product_detail_id(product_id),
        CatalogCacheKeys.product_variants(product_id),
    ]
    if slug:
        keys.append(CatalogCacheKeys.product_detail_slug(slug))

    removed += cache.delete_many(keys)

    if domain:
        removed += _delete_pattern(CatalogCacheKeys.domain_list_pattern(domain))

    removed += _delete_pattern(CatalogCacheKeys.domains_index())

    for cat_slug in category_slugs or []:
        if cat_slug:
            removed += _delete_pattern(CatalogCacheKeys.category_products_pattern(cat_slug))

    return removed


def invalidate_category_cache(
    *,
    slug: str,
    domain: str | None = None,
) -> int:
    """باطل‌کردن کش دسته و ناوبری."""
    removed = 0
    removed += _delete_pattern(CatalogCacheKeys.category_products_pattern(slug))
    removed += _delete_pattern(CatalogCacheKeys.category_tree_pattern())
    if domain:
        cache.delete(CatalogCacheKeys.category_tree(domain))
    removed += cache.delete(CatalogCacheKeys.domains_index())
    return removed
