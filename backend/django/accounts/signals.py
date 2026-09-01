from django.db.models.signals import post_save
from django.contrib.auth import get_user_model

from accounts.selectors import get_or_create_profile

User = get_user_model()


def _ensure_customer_profile(sender, instance, created, **kwargs):
    if created:
        get_or_create_profile(instance)


def connect_account_signals() -> None:
    post_save.connect(
        _ensure_customer_profile,
        sender=User,
        dispatch_uid="accounts_ensure_customer_profile",
    )
