# Generated manually — public UUID + search indexes + SKU validator on model

from __future__ import annotations

import uuid

import django.core.validators
import django.db.models.deletion
from django.db import migrations, models

import product.validators


def populate_public_uuids(apps, schema_editor) -> None:
    for model_name in ("Category", "Product", "ProductVariant", "ProductImage"):
        model = apps.get_model("product", model_name)
        for row in model.objects.all().only("id"):
            model.objects.filter(pk=row.pk).update(public_uuid=uuid.uuid4())


class Migration(migrations.Migration):

    dependencies = [
        ("product", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="category",
            name="public_uuid",
            field=models.UUIDField(
                db_index=True,
                default=uuid.uuid4,
                editable=False,
                null=True,
                verbose_name="UUID عمومی",
            ),
        ),
        migrations.AddField(
            model_name="product",
            name="public_uuid",
            field=models.UUIDField(
                db_index=True,
                default=uuid.uuid4,
                editable=False,
                help_text="شناسه عمومی محصول — برای API و جستجو.",
                null=True,
                verbose_name="UUID مادر",
            ),
        ),
        migrations.AddField(
            model_name="productvariant",
            name="public_uuid",
            field=models.UUIDField(
                db_index=True,
                default=uuid.uuid4,
                editable=False,
                help_text="شناسه عمومی واریانت — به UUID مادر (محصول) متصل است.",
                null=True,
                verbose_name="UUID دختر",
            ),
        ),
        migrations.AddField(
            model_name="productimage",
            name="public_uuid",
            field=models.UUIDField(
                db_index=True,
                default=uuid.uuid4,
                editable=False,
                null=True,
                verbose_name="UUID عمومی",
            ),
        ),
        migrations.RunPython(populate_public_uuids, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="category",
            name="public_uuid",
            field=models.UUIDField(
                db_index=True,
                default=uuid.uuid4,
                editable=False,
                unique=True,
                verbose_name="UUID عمومی",
            ),
        ),
        migrations.AlterField(
            model_name="product",
            name="public_uuid",
            field=models.UUIDField(
                db_index=True,
                default=uuid.uuid4,
                editable=False,
                help_text="شناسه عمومی محصول — برای API و جستجو.",
                unique=True,
                verbose_name="UUID مادر",
            ),
        ),
        migrations.AlterField(
            model_name="productvariant",
            name="public_uuid",
            field=models.UUIDField(
                db_index=True,
                default=uuid.uuid4,
                editable=False,
                help_text="شناسه عمومی واریانت — به UUID مادر (محصول) متصل است.",
                unique=True,
                verbose_name="UUID دختر",
            ),
        ),
        migrations.AlterField(
            model_name="productimage",
            name="public_uuid",
            field=models.UUIDField(
                db_index=True,
                default=uuid.uuid4,
                editable=False,
                unique=True,
                verbose_name="UUID عمومی",
            ),
        ),
        migrations.AlterField(
            model_name="product",
            name="name",
            field=models.CharField(db_index=True, max_length=180, verbose_name="نام"),
        ),
        migrations.AlterField(
            model_name="productvariant",
            name="sku",
            field=models.CharField(
                db_index=True,
                max_length=64,
                unique=True,
                validators=[product.validators.validate_sku_format],
                verbose_name="SKU",
            ),
        ),
        migrations.AddIndex(
            model_name="category",
            index=models.Index(fields=["name"], name="product_cat_name_idx"),
        ),
        migrations.AddIndex(
            model_name="category",
            index=models.Index(
                fields=["is_active", "kind"], name="product_cat_active_kind_idx"
            ),
        ),
        migrations.AddIndex(
            model_name="product",
            index=models.Index(
                fields=["status", "domain"], name="product_prod_status_domain_idx"
            ),
        ),
        migrations.AddIndex(
            model_name="product",
            index=models.Index(
                fields=["sort_order", "name"], name="product_prod_sort_name_idx"
            ),
        ),
        migrations.AddIndex(
            model_name="productvariant",
            index=models.Index(
                fields=["product", "is_active"], name="product_var_product_active_idx"
            ),
        ),
    ]
