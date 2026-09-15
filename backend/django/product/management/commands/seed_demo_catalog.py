"""Seed موقت کاتالوگ — هم‌نام با UI فرانت (brand.ts)."""

from __future__ import annotations

import shutil
from pathlib import Path

from django.conf import settings
from django.core.files import File
from django.core.management.base import BaseCommand
from django.db import transaction

from product.catalog_cache import CatalogCacheKeys, _delete_pattern
from product.constants import (
    CategoryKind,
    PackagingType,
    PricingStrategy,
    ProductImageRole,
    ProductStatus,
    ProductVisibility,
    SalesChannel,
    StorageClass,
    UnitOfMeasure,
)
from product.demo_catalog_data import (
    DEMO_CATALOG,
    DEMO_CATEGORY_BY_DOMAIN,
    SKU_DOMAIN_CODE,
)
from product.models import Category, Product, ProductImage, ProductVariant


class Command(BaseCommand):
    help = "محصولات دمو UI را در DB می‌سازد (active + b2c) — برای تست API و سرچ."

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="حذف محصولات دمو (slugهای seed) قبل از ساخت مجدد",
        )

    def handle(self, *args, **options):
        repo_root = Path(settings.BASE_DIR).parent.parent
        frontend_public = repo_root / "frontend" / "public"
        if not frontend_public.is_dir():
            self.stderr.write(
                self.style.WARNING(
                    f"frontend/public not found at {frontend_public} — images may be skipped."
                )
            )

        demo_slugs = {
            item["id"] for products in DEMO_CATALOG.values() for item in products
        }

        with transaction.atomic():
            if options["clear"]:
                deleted, _ = Product.objects.filter(slug__in=demo_slugs).delete()
                self.stdout.write(f"Cleared {deleted} demo rows.")

            created_products = 0
            updated_products = 0

            for domain, products in DEMO_CATALOG.items():
                category = self._ensure_category(domain)
                sku_code = SKU_DOMAIN_CODE[domain]

                for index, item in enumerate(products, start=1):
                    product, created = Product.objects.update_or_create(
                        slug=item["id"],
                        defaults={
                            "name": item["name"],
                            "subtitle": item["note"],
                            "short_description": item["story"][:320],
                            "domain": domain,
                            "status": ProductStatus.ACTIVE,
                            "visibility": ProductVisibility.PUBLIC,
                            "sales_channel": SalesChannel.B2C,
                            "unit_price_rial": 450_000 + index * 25_000,
                            "pricing_strategy": PricingStrategy.FIXED,
                            "unit_of_measure": UnitOfMeasure.PIECE,
                            "net_weight_grams": 900,
                            "storage_class": StorageClass.CHILLED,
                            "packaging_type": PackagingType.OTHER,
                            "sort_order": index * 10,
                        },
                    )
                    product.categories.set([category])

                    sku = f"MK-{sku_code}-{index:05d}"
                    ProductVariant.objects.update_or_create(
                        product=product,
                        defaults={
                            "sku": sku,
                            "label": item["note"] or "استاندارد",
                            "unit_price_rial": product.unit_price_rial,
                            "net_weight_grams": product.net_weight_grams,
                            "is_active": True,
                            "sort_order": 10,
                        },
                    )

                    self._ensure_hero_image(
                        product=product,
                        item=item,
                        frontend_public=frontend_public,
                    )

                    if created:
                        created_products += 1
                    else:
                        updated_products += 1

        self._invalidate_catalog_cache()
        total = sum(len(v) for v in DEMO_CATALOG.values())
        self.stdout.write(
            self.style.SUCCESS(
                f"Demo catalog ready: {total} products "
                f"({created_products} new, {updated_products} updated)."
            )
        )

    def _ensure_category(self, domain: str) -> Category:
        name, slug = DEMO_CATEGORY_BY_DOMAIN[domain]
        category, _ = Category.objects.update_or_create(
            slug=slug,
            defaults={
                "name": name,
                "domain": domain,
                "kind": CategoryKind.NAVIGATION,
                "sort_order": 10,
                "is_active": True,
            },
        )
        return category

    def _ensure_hero_image(
        self,
        *,
        product: Product,
        item: dict,
        frontend_public: Path,
    ) -> None:
        rel = item["image"].lstrip("/")
        source = frontend_public / Path(rel)
        fallback = frontend_public / "brand" / "home-meat.png"
        if not source.is_file():
            source = fallback if fallback.is_file() else None

        hero = ProductImage.objects.filter(
            product=product,
            role=ProductImageRole.HERO,
        ).first()

        if source is None:
            return

        media_name = f"demo/{product.slug}.png"
        if hero is None:
            hero = ProductImage(product=product, role=ProductImageRole.HERO)

        hero.alt_text = item["alt"]
        hero.sort_order = 10
        with source.open("rb") as handle:
            hero.image.save(media_name, File(handle), save=True)

    def _invalidate_catalog_cache(self) -> None:
        _delete_pattern(CatalogCacheKeys.domains_index())
        for domain in DEMO_CATALOG:
            _delete_pattern(CatalogCacheKeys.domain_list_pattern(domain))
        _delete_pattern(CatalogCacheKeys.category_tree_pattern())
