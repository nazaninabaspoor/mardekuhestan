"""پروفایل مشتری فروشگاه — روی User جنگو سوار است."""

from __future__ import annotations

from django.conf import settings
from django.db import models

from accounts.constants import DISPLAY_NAME_MAX_LENGTH, PHONE_MAX_LENGTH


class CustomerProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="customer_profile",
        verbose_name="کاربر",
    )
    display_name = models.CharField("نام نمایشی", max_length=DISPLAY_NAME_MAX_LENGTH, blank=True)
    phone = models.CharField("موبایل", max_length=PHONE_MAX_LENGTH, blank=True)
    email_verified = models.BooleanField("ایمیل تأیید شده", default=False)
    created_at = models.DateTimeField("ایجاد", auto_now_add=True)
    updated_at = models.DateTimeField("بروزرسانی", auto_now=True)

    class Meta:
        verbose_name = "پروفایل مشتری"
        verbose_name_plural = "پروفایل مشتری‌ها"

    def __str__(self) -> str:
        return self.display_name or self.user.get_username()
