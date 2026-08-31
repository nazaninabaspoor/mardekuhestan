"""QuerySet و Managerهای کاتالوگ محصول."""

from __future__ import annotations

from django.db import models
from django.db.models import Q

from product.constants import (
    CategoryKind,
    ProductStatus,
    SalesChannel,
)
from product.utils import (
    CHANNEL_VISIBLE_VISIBILITIES,
    resolve_product_domain,
)


def visibility_q_for_channel(
    channel: str = SalesChannel.B2C,
    *,
    prefix: str = "",
) -> Q:
    """فیلتر visibility سازگار با کانال — همان منطق utils.is_customer_visible."""
    allowed = CHANNEL_VISIBLE_VISIBILITIES.get(
        channel, CHANNEL_VISIBLE_VISIBILITIES[SalesChannel.B2C]
    )
    field = f"{prefix}visibility" if prefix else "visibility"
    return Q(**{f"{field}__in": allowed})


class CategoryQuerySet(models.QuerySet):
    def active(self) -> CategoryQuerySet:
        return self.filter(is_active=True)

    def of_kind(self, kind: str) -> CategoryQuerySet:
        return self.filter(kind=kind)

    def navigation(self) -> CategoryQuerySet:
        return self.of_kind(CategoryKind.NAVIGATION)

    def roots(self) -> CategoryQuerySet:
        return self.filter(parent__isnull=True)

    def for_domain(self, domain: str | None) -> CategoryQuerySet:
        if not domain:
            return self
        resolved = resolve_product_domain(domain) or domain
        return self.filter(domain=resolved)

    def catalog_order(self) -> CategoryQuerySet:
        return self.order_by("sort_order", "name")


class CategoryManager(models.Manager.from_queryset(CategoryQuerySet)):
    pass


class ProductQuerySet(models.QuerySet):
    def publishable(self) -> ProductQuerySet:
        return self.filter(status__in=ProductStatus.PUBLISHABLE)

    def not_archived(self) -> ProductQuerySet:
        return self.exclude(status=ProductStatus.ARCHIVED)

    def editable(self) -> ProductQuerySet:
        return self.filter(status__in=ProductStatus.EDITABLE_IN_CATALOG)

    def visible_in_store(self, channel: str = SalesChannel.B2C) -> ProductQuerySet:
        """محصولات قابل نمایش در فروشگاه (وضعیت + visibility کانال)."""
        return self.publishable().filter(visibility_q_for_channel(channel))

    def for_domain(self, domain: str | None) -> ProductQuerySet:
        if not domain:
            return self
        resolved = resolve_product_domain(domain) or domain
        return self.filter(domain=resolved)

    def for_category(self, category_id: int) -> ProductQuerySet:
        return self.filter(categories__id=category_id)

    def for_category_slug(self, slug: str) -> ProductQuerySet:
        return self.filter(categories__slug=slug, categories__is_active=True)

    def for_sales_channel(self, channel: str) -> ProductQuerySet:
        """فیلتر محصولاتی که برای کانال فروش مشخص فعال‌اند."""
        return self.filter(
            Q(sales_channel=channel) | Q(sales_channel=SalesChannel.ALL_THREE)
        )

    def catalog_order(self) -> ProductQuerySet:
        return self.order_by("sort_order", "name")

    def with_catalog_related(self) -> ProductQuerySet:
        """prefetch برای API — نام relationها با models.py هماهنگ است."""
        return self.prefetch_related("categories", "images", "variants")


class ProductManager(models.Manager.from_queryset(ProductQuerySet)):
    pass


class ProductVariantQuerySet(models.QuerySet):
    def active(self) -> ProductVariantQuerySet:
        return self.filter(is_active=True)

    def for_product(self, product_id: int) -> ProductVariantQuerySet:
        return self.filter(product_id=product_id)

    def visible_in_store(self, channel: str = SalesChannel.B2C) -> ProductVariantQuerySet:
        return (
            self.active()
            .filter(product__status__in=ProductStatus.PUBLISHABLE)
            .filter(visibility_q_for_channel(channel, prefix="product__"))
        )

    def catalog_order(self) -> ProductVariantQuerySet:
        return self.order_by("sort_order", "label")


class ProductVariantManager(models.Manager.from_queryset(ProductVariantQuerySet)):
    pass
