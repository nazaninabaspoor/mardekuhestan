"""مدل‌های دامنه سفارش و سبد خرید — مرد کوهستان."""

from __future__ import annotations

import random
import uuid
from django.conf import settings
from django.db import models


class Cart(models.Model):
    """سبد خرید فعال کاربر در راه سبز."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="cart",
        verbose_name="کاربر",
    )
    created_at = models.DateTimeField("تاریخ ایجاد", auto_now_add=True)
    updated_at = models.DateTimeField("آخرین بروزرسانی", auto_now=True)

    class Meta:
        verbose_name = "سبد خرید"
        verbose_name_plural = "سبدهای خرید"

    def __str__(self) -> str:
        return f"سبد خرید {self.user.get_username()}"

    @property
    def total_items_count(self) -> int:
        return sum(item.quantity for item in self.items.all())

    @property
    def total_price_toman(self) -> int:
        return sum(item.total_price_toman for item in self.items.all())


class CartItem(models.Model):
    """قلم کالا در سبد خرید."""

    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name="items",
        verbose_name="سبد خرید",
    )
    product_id = models.CharField("شناسه محصول", max_length=100, blank=True, default="")
    product_name = models.CharField("نام محصول", max_length=255)
    product_image = models.CharField("تصویر محصول", max_length=500, blank=True, default="/brand/home-meat.png")
    portion = models.CharField("وزن / سهمیه", max_length=100, blank=True, default="۱ کیلوگرم")
    cut_type = models.CharField("نوع برش", max_length=100, blank=True, default="برش استاندارد")
    unit_price_toman = models.PositiveBigIntegerField("قیمت واحد (تومان)", default=0)
    quantity = models.PositiveIntegerField("تعداد", default=1)
    created_at = models.DateTimeField("تاریخ افزودن", auto_now_add=True)
    updated_at = models.DateTimeField("بروزرسانی", auto_now=True)

    class Meta:
        verbose_name = "قلم سبد خرید"
        verbose_name_plural = "اقلام سبد خرید"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.product_name} ({self.quantity} عدد) - {self.cart.user.get_username()}"

    @property
    def total_price_toman(self) -> int:
        return self.unit_price_toman * self.quantity


class Order(models.Model):
    """سفارش و بارنامه شناسنامه اصالت مرتع."""

    class Status(models.TextChoices):
        PENDING = "pending", "در انتظار پرداخت"
        PROCESSING = "processing", "در حال آماده‌سازی در مرتع"
        SHIPPING = "shipping", "در مسیر تحویل (زنجیره سرد)"
        DELIVERED = "delivered", "تحویل‌شده با زنجیره سرد"
        CANCELLED = "cancelled", "لغو شده"

    order_number = models.CharField("شماره سفارش", max_length=50, unique=True, db_index=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="orders",
        verbose_name="کاربر خریدار",
    )
    status = models.CharField(
        "وضعیت سفارش",
        max_length=30,
        choices=Status.choices,
        default=Status.PENDING,
    )
    # مشخصات اصالت چراگاه و مرتع
    pasture_name = models.CharField("نام و موقعیت چراگاه", max_length=200, default="مرتع ییلاقی کلاردشت (دامنه مازیچال)")
    altitude = models.CharField("ارتفاع از سطح دریا", max_length=100, default="۲,۲۰۰ متر از سطح دریا")
    grazing_info = models.CharField("پوشش گیاهی و چرا", max_length=200, default="علوفه وحشی کوهپایه و آویشن ارگانیک")
    vet_code = models.CharField("کد بهداشت دامپزشکی", max_length=100, default="IR-88301 نظام دامپزشکی")
    pack_date = models.CharField("تاریخ و ساعت بسته‌بندی", max_length=100, default="۱۰ شهریور ۱۴۰۵ - ۰۶:۳۰")
    temperature_log = models.CharField("پایش دما", max_length=100, default="۲.۴°C (زنجیره سرد کنترل‌شده)")

    # اطلاعات تحویل
    receiver_name = models.CharField("نام تحویل‌گیرنده", max_length=120, blank=True, default="")
    receiver_phone = models.CharField("شماره همراه تحویل‌گیرنده", max_length=40, blank=True, default="")
    shipping_address = models.TextField("نشانی دقیق تحویل", blank=True, default="")
    delivery_notice = models.CharField(
        "تذکر هماهنگی",
        max_length=300,
        blank=True,
        default="تحویل ظرف ۲ الی ۳ روز کاری با هماهنگی تلفنی قبلی",
    )

    # مبالغ
    total_amount_toman = models.PositiveBigIntegerField("مبلغ کل (تومان)", default=0)
    discount_amount_toman = models.PositiveBigIntegerField("تخفیف سهمیه (تومان)", default=0)
    final_amount_toman = models.PositiveBigIntegerField("مبلغ نهایی پرداخت‌شده (تومان)", default=0)

    created_at = models.DateTimeField("تاریخ ثبت", auto_now_add=True)
    updated_at = models.DateTimeField("آخرین بروزرسانی", auto_now=True)

    class Meta:
        verbose_name = "سفارش و بارنامه"
        verbose_name_plural = "سفارش‌ها و بارنامه‌ها"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"سفارش #{self.order_number} — {self.user.get_username()}"

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = f"MK-{random.randint(10000, 99999)}"
        super().save(*args, **kwargs)


class OrderItem(models.Model):
    """اقلام موجود در یک سفارش/بسته مرتع."""

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items",
        verbose_name="سفارش",
    )
    product_name = models.CharField("نام بسته / برش", max_length=255)
    product_image = models.CharField("تصویر", max_length=500, blank=True, default="/brand/home-meat.png")
    cut_type = models.CharField("نوع برش", max_length=100, blank=True, default="برش استریل بدون چربی اضافی")
    portion = models.CharField("اندازه / وزن", max_length=100, blank=True, default="۱ کیلوگرم")
    unit_price_toman = models.PositiveBigIntegerField("قیمت واحد (تومان)", default=0)
    quantity = models.PositiveIntegerField("تعداد", default=1)
    total_price_toman = models.PositiveBigIntegerField("مبلغ کل (تومان)", default=0)

    class Meta:
        verbose_name = "قلم سفارش"
        verbose_name_plural = "اقلام سفارش‌ها"

    def __str__(self) -> str:
        return f"{self.product_name} ({self.quantity} عدد) در #{self.order.order_number}"

    def save(self, *args, **kwargs):
        if not self.total_price_toman:
            self.total_price_toman = self.unit_price_toman * self.quantity
        super().save(*args, **kwargs)
