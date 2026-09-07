"""مدل پرداخت زرین‌پال و پارسیان — مرد کوهستان."""

from __future__ import annotations

import uuid

from django.conf import settings
from django.db import models


class Payment(models.Model):
    class Gateway(models.TextChoices):
        ZARINPAL = "zarinpal", "زرین‌پال"
        PARSIAN = "parsian", "پارسیان"

    class Status(models.TextChoices):
        PENDING = "pending", "در انتظار پرداخت"
        PAID = "paid", "پرداخت‌شده"
        FAILED = "failed", "ناموفق"
        CANCELED = "canceled", "انصراف"

    public_id = models.UUIDField("شناسه عمومی", default=uuid.uuid4, unique=True, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="payments",
        verbose_name="کاربر",
    )
    order = models.ForeignKey(
        "orders.Order",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="payments",
        verbose_name="سفارش",
    )
    gateway = models.CharField("درگاه", max_length=20, choices=Gateway.choices)
    status = models.CharField("وضعیت", max_length=20, choices=Status.choices, default=Status.PENDING)
    amount_toman = models.PositiveBigIntegerField("مبلغ (تومان)", default=0)
    authority = models.CharField("کد پیگیری درگاه", max_length=120, blank=True, default="")
    ref_id = models.CharField("شماره مرجع", max_length=120, blank=True, default="")
    sandbox = models.BooleanField("سندباکس", default=True)
    receiver_name = models.CharField("تحویل‌گیرنده", max_length=120, blank=True, default="")
    receiver_phone = models.CharField("تلفن", max_length=40, blank=True, default="")
    shipping_address = models.TextField("نشانی", blank=True, default="")
    created_at = models.DateTimeField("ایجاد", auto_now_add=True)
    updated_at = models.DateTimeField("بروزرسانی", auto_now=True)

    class Meta:
        verbose_name = "پرداخت"
        verbose_name_plural = "پرداخت‌ها"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.get_gateway_display()} {self.amount_toman} — {self.get_status_display()}"
