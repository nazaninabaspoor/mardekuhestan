"""مدل‌های اعلان و لیست انتظار — مرد کوهستان."""

from __future__ import annotations

from django.conf import settings
from django.db import models


class WaitlistInterest(models.Model):
    """کلیک «خبرم کن» روی محصولات به‌زودی."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="waitlist_interests",
        verbose_name="کاربر",
        null=True,
        blank=True,
    )
    product_key = models.CharField("کلید محصول", max_length=80, db_index=True)
    product_name = models.CharField("نام محصول", max_length=200)
    source = models.CharField("منبع", max_length=80, default="product-unveil")
    email = models.EmailField("ایمیل", blank=True, default="")
    phone = models.CharField("موبایل", max_length=40, blank=True, default="")
    display_name = models.CharField("نام", max_length=120, blank=True, default="")
    notified_admin = models.BooleanField("ایمیل به ادمین ارسال شد", default=False)
    created_at = models.DateTimeField("ثبت", auto_now_add=True)

    class Meta:
        verbose_name = "علاقه به محصول به‌زودی"
        verbose_name_plural = "علاقه‌مندی‌های به‌زودی (خبرم کن)"
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "product_key"],
                name="uniq_waitlist_user_product",
            ),
        ]

    def __str__(self) -> str:
        who = self.display_name or self.email or (self.user_id and f"#{self.user_id}") or "مهمان"
        return f"{who} → {self.product_name}"


class AiCoachQuota(models.Model):
    """سهمیه سوالات راهیار تغذیه (رایگان + اشتراک پولی)."""

    FREE_LIMIT = 2
    PAID_PACK_QUESTIONS = 20
    # gpt-4o-mini ≈ ۰٫۰۰۰۵ دلار/جواب → ۲۰ جواب ≈ ۰٫۰۱ دلار + ۱٫۵ سود ≈ ۱٫۵۱ دلار
    # نرخ مبنا ۹۹٬۰۰۰ تومان/دلار → حدود ۱۵۰٬۰۰۰ تومان (نمایش به تومان)
    PACK_PRICE_TOMAN = 149_000
    PACK_COST_USD_ESTIMATE = 0.01
    PACK_PROFIT_USD_TARGET = 1.5

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="ai_coach_quota",
        verbose_name="کاربر",
    )
    free_used = models.PositiveSmallIntegerField("سوال رایگان مصرف‌شده", default=0)
    paid_remaining = models.PositiveIntegerField("سوال پولی باقی‌مانده", default=0)
    paid_total = models.PositiveIntegerField("کل سوال پولی خریداری‌شده", default=0)
    last_payment = models.ForeignKey(
        "payments.Payment",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="ai_coach_quotas",
        verbose_name="آخرین پرداخت اشتراک",
    )
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "سهمیه راهیار تغذیه"
        verbose_name_plural = "سهمیه‌های راهیار تغذیه"

    def __str__(self) -> str:
        return f"AI #{self.user_id} free={self.free_used}/{self.FREE_LIMIT} paid={self.paid_remaining}"

    @property
    def free_remaining(self) -> int:
        return max(0, self.FREE_LIMIT - int(self.free_used))

    @property
    def can_ask(self) -> bool:
        return self.free_remaining > 0 or int(self.paid_remaining) > 0
