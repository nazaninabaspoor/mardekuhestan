from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'
    verbose_name = "حساب‌ها"

    def ready(self) -> None:
        from accounts.signals import connect_account_signals

        connect_account_signals()
