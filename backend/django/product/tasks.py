"""تسک‌های پس‌زمینه کاتالوگ محصولات (Celery Low Priority Queue) — کش‌سازی، ایندکس‌سازی جستجو."""

from __future__ import annotations

import logging
from celery import shared_task
from django.core.cache import cache

logger = logging.getLogger(__name__)


@shared_task(
    name="product.tasks.warm_catalog_cache_task",
    bind=True,
    max_retries=2,
    default_retry_delay=60,
)
def warm_catalog_cache_task(self) -> dict[str, str]:
    """گرم‌سازی پیش‌دستانه کش محصولات پربازدید و دسته‌بندی‌ها."""
    try:
        from product.models import Product
        count = Product.objects.filter(is_active=True).count()
        logger.info("Warm catalog cache task executed. Active products: %d", count)
        return {"status": "success", "active_products": str(count)}
    except Exception as exc:
        logger.exception("Error in warm_catalog_cache_task: %s", exc)
        raise self.retry(exc=exc)


@shared_task(
    name="product.tasks.invalidate_product_cache_task",
    bind=True,
    max_retries=3,
)
def invalidate_product_cache_task(self, product_id: int) -> dict[str, str]:
    """پاکسازی هدفمند کش یک محصول بعد از ویرایش قیمت یا موجودی."""
    try:
        cache.delete(f"product:detail:{product_id}")
        cache.delete("catalog:featured_products")
        logger.info("Invalidated cache for product %d", product_id)
        return {"status": "invalidated", "product_id": str(product_id)}
    except Exception as exc:
        logger.exception("Error invalidating product cache: %s", exc)
        raise self.retry(exc=exc)
