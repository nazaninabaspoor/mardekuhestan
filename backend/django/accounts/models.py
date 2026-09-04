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


class CustomerAddress(models.Model):
    class AddressType(models.TextChoices):
        HOME = "home", "منزل"
        WORK = "work", "محل کار / دفتر"
        OTHER = "other", "سایر نشانی‌ها"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="addresses",
        verbose_name="کاربر",
    )
    title = models.CharField("عنوان نشانی", max_length=100, default="نشانی منزل")
    address_type = models.CharField(
        "نوع نشانی",
        max_length=20,
        choices=AddressType.choices,
        default=AddressType.HOME,
    )
    province = models.CharField("استان", max_length=100, default="تهران")
    city = models.CharField("شهر", max_length=100, default="تهران")
    district = models.CharField("منطقه / محله", max_length=120, blank=True, default="زعفرانیه")
    address_line = models.TextField("نشانی دقیق و پلاک", max_length=500)
    postal_code = models.CharField("کد پستی", max_length=30, blank=True, default="")
    receiver_name = models.CharField("نام تحویل‌گیرنده", max_length=120, blank=True, default="")
    receiver_phone = models.CharField("تلفن تحویل‌گیرنده", max_length=40, blank=True, default="")
    is_default = models.BooleanField("نشانی پیش‌فرض", default=False)
    created_at = models.DateTimeField("تاریخ ثبت", auto_now_add=True)
    updated_at = models.DateTimeField("آخرین ویرایش", auto_now=True)

    class Meta:
        verbose_name = "نشانی تحویل مشتری"
        verbose_name_plural = "نشانی‌های تحویل مشتریان"
        ordering = ["-is_default", "-created_at"]

    def __str__(self) -> str:
        return f"{self.title} ({self.city}) - {self.user.get_username()}"
