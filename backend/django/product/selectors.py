"""Query helpers for catalog API — thin read layer over managers."""

from __future__ import annotations

from typing import TYPE_CHECKING

from django.db.models import Count, Prefetch, QuerySet

from product.constants import MAX_CATEGORY_DEPTH, SalesChannel
from product.models import Category, Product, ProductVariant
from product.utils import resolve_product_domain

if TYPE_CHECKING:
    from django.http import HttpRequest


def resolve_sales_channel(value: str | None) -> str:
    """Normalize ?channel= query param to a valid SalesChannel value."""
    raw = (value or SalesChannel.B2C).strip().lower()
    valid = {choice[0] for choice in SalesChannel.CHOICES}
    return raw if raw in valid else SalesChannel.B2C


def sales_channel_from_request(request: HttpRequest) -> str:
    return resolve_sales_channel(request.query_params.get("channel"))


def get_active_categories(*, domain: str | None = None) -> QuerySet[Category]:
    qs = Category.objects.active().catalog_order()
    if domain:
        qs = qs.for_domain(domain)
    return qs


def get_category_navigation_tree(*, domain: str | None = None) -> QuerySet[Category]:
    """Root navigation categories with prefetched children (up to MAX_CATEGORY_DEPTH)."""
    child_qs = (
        Category.objects.active()
        .catalog_order()
        .prefetch_related(
            Prefetch(
                "children",
                queryset=Category.objects.active()
                .catalog_order()
                .prefetch_related(
                    Prefetch(
                        "children",
                        queryset=Category.objects.active().catalog_order(),
                    )
                ),
            )
        )
    )
    qs = (
        Category.objects.active()
        .roots()
        .navigation()
        .catalog_order()
        .prefetch_related(Prefetch("children", queryset=child_qs))
    )
    if domain:
        qs = qs.for_domain(domain)
    return qs


def get_store_products(
    channel: str = SalesChannel.B2C,
    *,
    domain: str | None = None,
    category_slug: str | None = None,
) -> QuerySet[Product]:
    qs = (
        Product.objects.visible_in_store(channel)
        .for_sales_channel(channel)
        .with_catalog_related()
        .catalog_order()
    )
    if domain:
        qs = qs.for_domain(domain)
    if category_slug:
        qs = qs.for_category_slug(category_slug)
    return qs.distinct()


def get_store_product_by_slug(
    slug: str,
    channel: str = SalesChannel.B2C,
) -> Product | None:
    try:
        return get_store_products(channel).get(slug=slug)
    except Product.DoesNotExist:
        return None


def get_store_product_by_public_uuid(
    public_uuid: str,
    channel: str = SalesChannel.B2C,
) -> Product | None:
    try:
        return get_store_products(channel).by_public_uuid(public_uuid).get()
    except Product.DoesNotExist:
        return None


def search_store_products(
    query: str,
    channel: str = SalesChannel.B2C,
    *,
    domain: str | None = None,
    category_slug: str | None = None,
) -> QuerySet[Product]:
    from product import validators as product_validators

    product_validators.validate_catalog_search_query(query)
    qs = Product.objects.search_storefront(query, channel=channel)
    if domain:
        qs = qs.for_domain(domain)
    if category_slug:
        qs = qs.for_category_slug(category_slug)
    return qs.catalog_order()


def get_category_by_slug(slug: str) -> Category | None:
    try:
        return Category.objects.active().get(slug=slug)
    except Category.DoesNotExist:
        return None


def get_admin_products() -> QuerySet[Product]:
    return (
        Product.objects.not_archived()
        .with_catalog_related()
        .annotate(category_count=Count("categories", distinct=True))
        .catalog_order()
    )


def get_admin_product_by_pk(pk: int) -> Product | None:
    try:
        return get_admin_products().get(pk=pk)
    except Product.DoesNotExist:
        return None


def get_admin_categories() -> QuerySet[Category]:
    return Category.objects.catalog_order().select_related("parent")


def get_admin_variants(*, product_id: int | None = None) -> QuerySet[ProductVariant]:
    qs = ProductVariant.objects.select_related("product").catalog_order()
    if product_id is not None:
        qs = qs.for_product(product_id)
    return qs


def resolve_domain_filter(value: str | None) -> str | None:
    if not value:
        return None
    return resolve_product_domain(value) or value
