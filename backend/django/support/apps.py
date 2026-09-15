from django.apps import AppConfig


class SupportConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "support"
    verbose_name = "پشتیبانی چت"

    def ready(self) -> None:
        from support import signals  # noqa: F401
