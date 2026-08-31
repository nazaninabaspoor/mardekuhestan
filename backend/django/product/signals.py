"""
سیگنال‌های دامنه محصول.

جریان هر تغییر:
  1) invalidate کش عمومی catalog:public:* (بدون لمس session/auth)
  2) پخش WebSocket برای فرانت real-time
  3) (فاز بعد) Kafka / OpenSearch از tasks
"""

from __future__ import annotations

import logging
from typing import Any

from django.db import transaction
from django.db.models.signals import m2m_changed, post_delete, post_save, pre_delete, pre_save
from django.dispatch import receiver

from product.catalog_cache import invalidate_category_cache, invalidate_product_cache
from product.constants import ProductEvent, ProductStatus, is_publishable_status
from product.consumers import broadcast_product_event

logger = logging.getLogger(__name__)

# جلوگیری از ثبت دوباره در autoreload
_SIGNALS_CONNECTED = False

_PUBLIC_WS_EVENTS = frozenset(
    {
        ProductEvent.PRODUCT_PUBLISHED,
        ProductEvent.PRODUCT_ARCHIVED,
        ProductEvent.PRICE_CHANGED,
        ProductEvent.AVAILABILITY_CHANGED,
        ProductEvent.VARIANT_CREATED,
        ProductEvent.VARIANT_UPDATED,
    }
)


# ---------------------------------------------------------------------------
# Payload builders
# ---------------------------------------------------------------------------


def _product_payload(product, *, extra: dict[str, Any] | None = None) -> dict[str, Any]:
    data: dict[str, Any] = {
        "id": product.pk,
        "public_uuid": str(product.public_uuid),
        "slug": product.slug,
        "name": product.name,
        "domain": product.domain,
        "status": product.status,
        "visibility": product.visibility,
        "unit_price_rial": product.unit_price_rial,
        "updated_at": product.updated_at.isoformat() if product.updated_at else None,
    }
    if extra:
        data.update(extra)
    return data


def _category_payload(category, *, extra: dict[str, Any] | None = None) -> dict[str, Any]:
    data: dict[str, Any] = {
        "id": category.pk,
        "public_uuid": str(category.public_uuid),
        "slug": category.slug,
        "name": category.name,
        "domain": category.domain,
        "kind": category.kind,
        "is_active": category.is_active,
    }
    if extra:
        data.update(extra)
    return data


def _variant_payload(variant) -> dict[str, Any]:
    return {
        "id": variant.pk,
        "public_uuid": str(variant.public_uuid),
        "product_id": variant.product_id,
        "product_public_uuid": str(variant.product.public_uuid),
        "sku": variant.sku,
        "label": variant.label,
        "unit_price_rial": variant.unit_price_rial,
        "is_active": variant.is_active,
    }


# ---------------------------------------------------------------------------
# Dispatch pipeline
# ---------------------------------------------------------------------------


def _should_broadcast_public(*, event: str, status: str | None) -> bool:
    if event in _PUBLIC_WS_EVENTS:
        return True
    return status is not None and is_publishable_status(status)


def dispatch_catalog_event(
    *,
    event: str,
    payload: dict[str, Any],
    domain: str | None = None,
    category_slugs: list[str] | None = None,
    product_id: int | None = None,
    status: str | None = None,
    invalidate_product: bool = False,
    invalidate_category_slug: str | None = None,
    product_slug: str | None = None,
) -> None:
    """
    invalidate کش + WebSocket — بعد از commit تراکنش DB.
    """

    def _run() -> None:
        if invalidate_product and product_id is not None:
            invalidate_product_cache(
                product_id=product_id,
                slug=product_slug,
                domain=domain,
                category_slugs=category_slugs,
            )
        if invalidate_category_slug:
            invalidate_category_cache(slug=invalidate_category_slug, domain=domain)

        to_public = _should_broadcast_public(event=event, status=status)

        broadcast_product_event(
            event,
            payload,
            domain=domain,
            product_id=product_id,
            to_public=to_public,
            to_admin=True,
        )

        for slug in category_slugs or []:
            if not slug:
                continue
            broadcast_product_event(
                event,
                payload,
                domain=domain,
                category_slug=slug,
                product_id=product_id,
                to_public=to_public,
                to_admin=False,
            )

    transaction.on_commit(_run)


# نگه‌داری برای تشخیص تغییر قیمت/وضعیت
_PRE_SAVE_SNAPSHOT: dict[int, dict[str, Any]] = {}


@receiver(pre_save, dispatch_uid="product.product.pre_save_snapshot")
def product_pre_save_snapshot(sender, instance, **kwargs) -> None:
    if not instance.pk:
        return
    from product.models import Product

    if sender is not Product:
        return
    try:
        previous = Product.objects.only("status", "unit_price_rial", "visibility").get(pk=instance.pk)
    except Product.DoesNotExist:
        return
    _PRE_SAVE_SNAPSHOT[instance.pk] = {
        "status": previous.status,
        "unit_price_rial": previous.unit_price_rial,
        "visibility": previous.visibility,
    }


@receiver(post_save, dispatch_uid="product.product.post_save")
def product_post_save(sender, instance, created: bool, **kwargs) -> None:
    from product.models import Product

    if sender is not Product:
        return

    category_slugs = instance.category_slugs()
    previous = _PRE_SAVE_SNAPSHOT.pop(instance.pk, None)

    if created:
        event = ProductEvent.PRODUCT_CREATED
    elif (
        previous
        and previous.get("status") != ProductStatus.ACTIVE
        and instance.status == ProductStatus.ACTIVE
    ):
        event = ProductEvent.PRODUCT_PUBLISHED
    elif instance.status == ProductStatus.ARCHIVED:
        event = ProductEvent.PRODUCT_ARCHIVED
    else:
        event = ProductEvent.PRODUCT_UPDATED

    extra: dict[str, Any] = {"created": created}
    if previous and previous.get("unit_price_rial") != instance.unit_price_rial:
        event = ProductEvent.PRICE_CHANGED
        extra["previous_price_rial"] = previous.get("unit_price_rial")

    if (
        previous
        and previous.get("status") != instance.status
        and instance.status == ProductStatus.OUT_OF_STOCK
    ):
        event = ProductEvent.AVAILABILITY_CHANGED
        extra["availability"] = "out_of_stock"

    dispatch_catalog_event(
        event=event,
        payload=_product_payload(instance, extra=extra),
        domain=instance.domain,
        category_slugs=category_slugs,
        product_id=instance.pk,
        status=instance.status,
        invalidate_product=True,
        product_slug=instance.slug,
    )


@receiver(pre_delete, dispatch_uid="product.product.pre_delete")
def product_pre_delete(sender, instance, **kwargs) -> None:
    from product.models import Product

    if sender is not Product:
        return
    instance._cached_category_slugs = list(  # noqa: SLF001
        instance.categories.values_list("slug", flat=True)
    )


@receiver(post_delete, dispatch_uid="product.product.post_delete")
def product_post_delete(sender, instance, **kwargs) -> None:
    from product.models import Product

    if sender is not Product:
        return

    category_slugs = getattr(instance, "_cached_category_slugs", [])

    dispatch_catalog_event(
        event=ProductEvent.PRODUCT_ARCHIVED,
        payload=_product_payload(instance, extra={"deleted": True}),
        domain=instance.domain,
        category_slugs=category_slugs,
        product_id=instance.pk,
        status=instance.status,
        invalidate_product=True,
        product_slug=instance.slug,
    )


@receiver(m2m_changed, dispatch_uid="product.product.categories_changed")
def product_categories_changed(sender, instance, action, reverse, model, pk_set, **kwargs) -> None:
    from product.models import Category, Product

    if sender is not Product.categories.through:
        return
    if action not in {"post_add", "post_remove", "post_clear"}:
        return
    if reverse or not isinstance(instance, Product):
        return
    if not instance.pk:
        return

    slugs: list[str] = []
    if pk_set:
        slugs = list(Category.objects.filter(pk__in=pk_set).values_list("slug", flat=True))
    slugs = slugs or instance.category_slugs()

    dispatch_catalog_event(
        event=ProductEvent.PRODUCT_UPDATED,
        payload=_product_payload(instance, extra={"categories_changed": action}),
        domain=instance.domain,
        category_slugs=slugs,
        product_id=instance.pk,
        status=instance.status,
        invalidate_product=True,
        product_slug=instance.slug,
    )


@receiver(post_save, dispatch_uid="product.category.post_save")
def category_post_save(sender, instance, created: bool, **kwargs) -> None:
    from product.models import Category

    if sender is not Category:
        return

    event = ProductEvent.CATEGORY_CREATED if created else ProductEvent.CATEGORY_UPDATED
    dispatch_catalog_event(
        event=event,
        payload=_category_payload(instance, extra={"created": created}),
        domain=instance.domain or None,
        invalidate_category_slug=instance.slug,
    )


@receiver(post_delete, dispatch_uid="product.category.post_delete")
def category_post_delete(sender, instance, **kwargs) -> None:
    from product.models import Category

    if sender is not Category:
        return

    dispatch_catalog_event(
        event=ProductEvent.CATEGORY_UPDATED,
        payload=_category_payload(instance, extra={"deleted": True}),
        domain=instance.domain or None,
        invalidate_category_slug=instance.slug,
    )


@receiver(post_save, dispatch_uid="product.variant.post_save")
def variant_post_save(sender, instance, created: bool, **kwargs) -> None:
    from product.models import ProductVariant

    if sender is not ProductVariant:
        return

    product = instance.product
    event = ProductEvent.VARIANT_CREATED if created else ProductEvent.VARIANT_UPDATED

    dispatch_catalog_event(
        event=event,
        payload=_variant_payload(instance),
        domain=product.domain,
        category_slugs=product.category_slugs(),
        product_id=product.pk,
        status=product.status,
        invalidate_product=True,
        product_slug=product.slug,
    )


@receiver(post_delete, dispatch_uid="product.variant.post_delete")
def variant_post_delete(sender, instance, **kwargs) -> None:
    from product.models import ProductVariant

    if sender is not ProductVariant:
        return

    product = instance.product
    dispatch_catalog_event(
        event=ProductEvent.VARIANT_UPDATED,
        payload=_variant_payload(instance) | {"deleted": True},
        domain=product.domain,
        category_slugs=product.category_slugs(),
        product_id=product.pk,
        status=product.status,
        invalidate_product=True,
        product_slug=product.slug,
    )


@receiver(post_save, dispatch_uid="product.image.post_save")
def product_image_post_save(sender, instance, created: bool, **kwargs) -> None:
    from product.models import ProductImage

    if sender is not ProductImage:
        return

    product = instance.product
    dispatch_catalog_event(
        event=ProductEvent.PRODUCT_UPDATED,
        payload=_product_payload(product, extra={"image_id": instance.pk, "role": instance.role}),
        domain=product.domain,
        category_slugs=product.category_slugs(),
        product_id=product.pk,
        status=product.status,
        invalidate_product=True,
        product_slug=product.slug,
    )


@receiver(post_delete, dispatch_uid="product.image.post_delete")
def product_image_post_delete(sender, instance, **kwargs) -> None:
    from product.models import ProductImage

    if sender is not ProductImage:
        return

    product = instance.product
    dispatch_catalog_event(
        event=ProductEvent.PRODUCT_UPDATED,
        payload=_product_payload(product, extra={"image_deleted": instance.pk}),
        domain=product.domain,
        category_slugs=product.category_slugs(),
        product_id=product.pk,
        status=product.status,
        invalidate_product=True,
        product_slug=product.slug,
    )


def connect_product_signals() -> None:
    """برای سازگاری با apps.ready — receivers با decorator ثبت شده‌اند."""
    global _SIGNALS_CONNECTED
    if _SIGNALS_CONNECTED:
        return
    _SIGNALS_CONNECTED = True
    logger.debug("Product signals connected.")


# API عمومی برای services/admin (بدون save مدل)
def notify_catalog_change(
    *,
    event: str,
    payload: dict[str, Any],
    domain: str | None = None,
    category_slugs: list[str] | None = None,
    product_id: int | None = None,
    status: str | None = None,
) -> None:
    dispatch_catalog_event(
        event=event,
        payload=payload,
        domain=domain,
        category_slugs=category_slugs,
        product_id=product_id,
        status=status,
        invalidate_product=product_id is not None,
    )
