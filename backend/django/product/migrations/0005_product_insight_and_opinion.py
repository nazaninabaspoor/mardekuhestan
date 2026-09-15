from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("product", "0004_alter_productvariant_options_alter_category_domain_and_more"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="ProductInsightEvent",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("visitor_id", models.CharField(db_index=True, max_length=64, verbose_name="شناسه بازدید")),
                (
                    "event_type",
                    models.CharField(
                        choices=[
                            ("add_to_cart", "افزودن به سبد"),
                            ("companion_open", "باز شدن پیشنهاد مسیر"),
                            ("related_click", "کلیک محصول مرتبط"),
                            ("related_add", "افزودن محصول مرتبط"),
                            ("companion_close", "بستن پیشنهاد مسیر"),
                            ("opinion_submit", "ثبت نظر محصول"),
                            ("product_focus", "تمرکز روی محصول"),
                        ],
                        db_index=True,
                        max_length=32,
                        verbose_name="نوع رفتار",
                    ),
                ),
                ("product_key", models.CharField(db_index=True, max_length=80, verbose_name="شناسه محصول")),
                ("product_name", models.CharField(max_length=160, verbose_name="نام محصول")),
                ("category_key", models.CharField(blank=True, db_index=True, max_length=64, verbose_name="دسته")),
                ("payload", models.JSONField(blank=True, default=dict, verbose_name="جزئیات")),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True, verbose_name="زمان")),
                (
                    "user",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="product_insight_events",
                        to=settings.AUTH_USER_MODEL,
                        verbose_name="کاربر",
                    ),
                ),
            ],
            options={
                "verbose_name": "رفتار کاربر روی محصول",
                "verbose_name_plural": "تحلیل رفتار کاربر",
                "ordering": ["-created_at"],
            },
        ),
        migrations.CreateModel(
            name="ProductOpinion",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("visitor_id", models.CharField(db_index=True, max_length=64, verbose_name="شناسه بازدید")),
                ("product_key", models.CharField(db_index=True, max_length=80, verbose_name="شناسه محصول")),
                ("product_name", models.CharField(max_length=160, verbose_name="نام محصول")),
                ("category_key", models.CharField(blank=True, db_index=True, max_length=64, verbose_name="دسته")),
                ("rating", models.PositiveSmallIntegerField(verbose_name="امتیاز")),
                (
                    "meal",
                    models.CharField(
                        blank=True,
                        choices=[
                            ("breakfast", "صبحانه"),
                            ("lunch", "ناهار"),
                            ("dinner", "شام"),
                            ("gathering", "مهمانی"),
                        ],
                        max_length=16,
                        verbose_name="وعده",
                    ),
                ),
                ("comment", models.TextField(blank=True, verbose_name="نظر")),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True, verbose_name="زمان")),
                (
                    "user",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="product_opinions",
                        to=settings.AUTH_USER_MODEL,
                        verbose_name="کاربر",
                    ),
                ),
            ],
            options={
                "verbose_name": "نظر محصول",
                "verbose_name_plural": "نظرهای محصول",
                "ordering": ["-created_at"],
            },
        ),
        migrations.AddIndex(
            model_name="productinsightevent",
            index=models.Index(fields=["event_type", "-created_at"], name="product_pro_event_t_4c8a1d_idx"),
        ),
        migrations.AddIndex(
            model_name="productinsightevent",
            index=models.Index(fields=["product_key", "-created_at"], name="product_pro_product_7e2b44_idx"),
        ),
        migrations.AddIndex(
            model_name="productopinion",
            index=models.Index(fields=["product_key", "-created_at"], name="product_pro_product_9a11c2_idx"),
        ),
        migrations.AddIndex(
            model_name="productopinion",
            index=models.Index(fields=["rating", "-created_at"], name="product_pro_rating_5d03aa_idx"),
        ),
    ]
