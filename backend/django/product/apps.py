from django.apps import AppConfig


class ProductConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "product"
    verbose_name = "محصول و کاتالوگ"

    def ready(self) -> None:
        from product.signals import connect_product_signals

        connect_product_signals()
