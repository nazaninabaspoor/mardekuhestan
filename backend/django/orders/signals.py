"""سیگنال‌های دامنه سفارش — مرد کوهستان."""

from __future__ import annotations

from django.db import transaction
from django.db.models.signals import post_save

from orders.models import Order


def _notify_on_order_created(sender, instance: Order, created: bool, **kwargs) -> None:
    if not created:
        return
    order_id = instance.pk

    def _send() -> None:
        from orders.notify import notify_admins_new_order

        notify_admins_new_order(order_id)

    transaction.on_commit(_send)


def connect_order_signals() -> None:
    post_save.connect(
        _notify_on_order_created,
        sender=Order,
        dispatch_uid="orders_notify_admins_on_create",
    )
