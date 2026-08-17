from django.apps import AppConfig


class ContentConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "content"
    verbose_name = "استودیو محتوا و سئو"

    def ready(self):
        # ثبت مدل‌ها روی پنل استودیو
        import content.admin  # noqa: F401
        from content.admin_access import install_content_admin_guards

        install_content_admin_guards()
